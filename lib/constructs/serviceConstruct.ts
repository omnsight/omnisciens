import * as fs from 'fs';
import { Duration, RemovalPolicy, Size, Stack } from 'aws-cdk-lib';
import { AutoScalingGroup, EbsDeviceVolumeType, HealthCheck, Schedule, Signals } from 'aws-cdk-lib/aws-autoscaling';
import { AmazonLinuxCpuType, CloudFormationInit, InitCommand, InitConfig, InitFile, InitPackage, InstanceClass, InstanceSize, InstanceType, MachineImage, SubnetType, Volume, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { SERVICE_CONFIG, toEnvFormat } from '../config';

interface ServiceConstructProps {
  readonly stage: string;
}

export class ServiceConstruct extends Construct {
  public readonly vpc: Vpc;
  public readonly asg: AutoScalingGroup;
  public readonly logGroup: LogGroup;
  public readonly dataVolume: Volume;

  constructor(scope: Construct, id: string, props: ServiceConstructProps) {
    super(scope, id);

    const { stage } = props;
    const stack = Stack.of(this);

    this.vpc = new Vpc(this, `NexusVpc-${stage}`, { maxAzs: 2, natGateways: 0 });

    this.logGroup = new LogGroup(this, `NexusLogs-${stage}`, {
      logGroupName: `/aws/ec2/nexus-osint-${stage}`,
      retention: stage === "prod" ? RetentionDays.THREE_MONTHS : RetentionDays.ONE_DAY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const patSecret = new Secret(this, `GithubPat-${stage}`, {
      secretName: `nexus-github-pat-${stage}`,
      description: 'Maintained manually via AWS Console',
    });
    const embeddingSecret = new Secret(this, `EmbeddingSecret-${stage}`, {
      secretName: `nexus-embedding-${stage}`,
      description: 'Maintained manually via AWS Console',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          API_KEY: 'placeholder_api_key',
          BASE_URL: 'placeholder_base_url',
          DYNAMIC: 'DYNAMIC',
        }),
        generateStringKey: 'API_KEY',
        passwordLength: 32,
        excludePunctuation: true,
      },
    });
    const redisSecret = new Secret(this, `RedisPassword-${stage}`, {
      secretName: `nexus-redis-${stage}`,
      generateSecretString: {
        passwordLength: 32,
        excludePunctuation: true,
      },
    });
    const arangoSecret = new Secret(this, `ArangoDBPassword-${stage}`, {
      secretName: `nexus-arangodb-${stage}`,
      generateSecretString: {
        passwordLength: 32,
        excludePunctuation: true,
      },
    });

    this.dataVolume = new Volume(this, `NexusDataBaseVolume-${stage}`, {
      availabilityZone: this.vpc.availabilityZones[0],
      size: Size.gibibytes(50),
      volumeType: EbsDeviceVolumeType.GP3,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.asg = new AutoScalingGroup(this, `NexusASG-${stage}`, {
      vpc: this.vpc,
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE),
      machineImage: MachineImage.latestAmazonLinux2023({ cpuType: AmazonLinuxCpuType.ARM_64 }),
      vpcSubnets: {
        availabilityZones: [this.vpc.availabilityZones[0]],
        subnetType: SubnetType.PUBLIC,
      },
      associatePublicIpAddress: true,
      minCapacity: 0,
      maxCapacity: 1,
      healthCheck: HealthCheck.elb({
        grace: Duration.minutes(5),
      }),
      signals: Signals.waitForAll({
        timeout: Duration.minutes(5),
      }),
      init: CloudFormationInit.fromConfigSets({
        configSets: {
          default: ['installDocker', 'setUpData', 'prepareEnv', 'setupApp'],
        },
        configs: {
          installDocker: new InitConfig([
            InitCommand.shellCommand('echo "---------------Installing Docker and dependencies---------------"'),
            InitPackage.yum('docker'),
            InitCommand.shellCommand('systemctl start docker && systemctl enable docker'),
            InitCommand.shellCommand(
              'mkdir -p /usr/libexec/docker/cli-plugins/ && ' +
              'curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64 -o /usr/libexec/docker/cli-plugins/docker-compose && ' +
              'chmod +x /usr/libexec/docker/cli-plugins/docker-compose'
            ),
          ]),

          setUpData: new InitConfig([
            InitCommand.shellCommand('echo "---------------Setting up data volume---------------"'),
            InitCommand.shellCommand(`
              TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
              INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/instance-id)
              aws ec2 attach-volume --volume-id ${this.dataVolume.volumeId} --instance-id $INSTANCE_ID --device /dev/sdf --region ${stack.region}

              while [ ! -b /dev/nvme1n1 ]; do sleep 2; done 

              blkid /dev/nvme1n1 || mkfs -t xfs /dev/nvme1n1
              mkdir -p /mnt/data
              mount /dev/nvme1n1 /mnt/data
              mkdir -p /mnt/data/arangodb
              chmod -R 777 /mnt/data
            `),
          ]),

          prepareEnv: new InitConfig([
            InitCommand.shellCommand('echo "---------------Setting up environment variables---------------"'),
            InitFile.fromString('/home/ec2-user/.env', toEnvFormat(SERVICE_CONFIG)),
            InitCommand.shellCommand(`
              GH_TOKEN=$(aws secretsmanager get-secret-value --secret-id ${patSecret.secretArn} --query SecretString --output text) 
              echo $GH_TOKEN | docker login ghcr.io -u bouncingmaxt --password-stdin

              echo "Set up ArangoDB and Redis passwords."
            `),
          ]),

          setupApp: new InitConfig([
            InitCommand.shellCommand('echo "---------------Starting Up Services---------------"'),
            InitFile.fromString(
              '/home/ec2-user/docker-compose.yml',
              fs.readFileSync('lib/scripts/docker-compose.yml', 'utf8'),
            ),
            InitCommand.shellCommand(`
              AI_KEYS=$(aws secretsmanager get-secret-value --secret-id ${embeddingSecret.secretArn} --query SecretString --output text)
              ARANGO_PWD=$(aws secretsmanager get-secret-value --secret-id ${arangoSecret.secretArn} --query SecretString --output text)

              export AWS_REGION=${stack.region}
              export AWS_LOG_GROUP=${this.logGroup.logGroupName}
              export CURRENT_DATE=$(date +%Y-%m-%d)

              EMBEDDING_AI_API_KEY=$(echo $AI_KEYS | jq -r .API_KEY) \
              EMBEDDING_AI_API_BASE_URL=$(echo $AI_KEYS | jq -r .BASE_URL) \
              REDIS_PASSWORD=$(aws secretsmanager get-secret-value --secret-id ${redisSecret.secretArn} --query SecretString --output text) \
              ARANGODB_PASSWORD=$ARANGO_PWD \
              ARANGO_ROOT_PASSWORD=$ARANGO_PWD \
              docker compose -f /home/ec2-user/docker-compose.yml up -d
            `),
          ]),
        },
      }),
    });

    this.dataVolume.grantAttachVolume(this.asg.role);

    this.asg.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'));
    this.asg.role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    );
    this.asg.addToRolePolicy(new PolicyStatement({
      actions: ['logs:CreateLogStream', 'logs:PutLogEvents', 'logs:DescribeLogStreams'],
      resources: [`${this.logGroup.logGroupArn}:*`],
    }));

    this.asg.scaleOnSchedule(`WakeUpForWork-${stage}`, {
      schedule: Schedule.cron({ hour: '2', minute: '0' }), // UTC - 7 = PDT 7 PM
      desiredCapacity: 1,
      minCapacity: 1,
      maxCapacity: 1,
    });
    this.asg.scaleOnSchedule(`PreserveBudgetNightly-${stage}`, {
      schedule: Schedule.cron({ hour: '7', minute: '0' }), // UTC - 7 = PDT 12 AM
      desiredCapacity: 0,
      minCapacity: 0,
      maxCapacity: 0,
    });
    this.asg.addToRolePolicy(new PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['*'],
    }));
  }
}
