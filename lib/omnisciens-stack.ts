import { App, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { ApiDefinition, SpecRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AutoScalingGroup, BlockDeviceVolume, EbsDeviceVolumeType, Schedule, Signals } from 'aws-cdk-lib/aws-autoscaling';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { AmazonLinuxCpuType, CloudFormationInit, InitCommand, InitConfig, InitFile, InitPackage, InstanceClass, InstanceSize, InstanceType, MachineImage, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SERVICE_CONFIG, toEnvFormat } from './config';
import * as fs from 'fs';

interface NexusrIntelStackProps extends StackProps {

}

export class NexuIntelStack extends Stack {
  constructor(scope: App, id: string, props: NexusrIntelStackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'NexusVpc', { maxAzs: 2 });
    const asg = this.createComputeResources(vpc);
    this.createGateway(vpc, asg);
  }

  private createComputeResources(vpc: Vpc) {
    const asg = new AutoScalingGroup(this, 'NexusASG', {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.LARGE),
      machineImage: MachineImage.latestAmazonLinux2023({ cpuType: AmazonLinuxCpuType.ARM_64 }),
      minCapacity: 0,
      maxCapacity: 1,
      blockDevices: [{
        deviceName: '/dev/xvda',
        volume: BlockDeviceVolume.ebs(50, { volumeType: EbsDeviceVolumeType.GP3 }),
      }],
      // Signals: Wait for the EC2 to say "I am finished" before completing deployment
      signals: Signals.waitForAll({
        timeout: Duration.minutes(10),
      }),
      // Declarative Init Configuration
      init: CloudFormationInit.fromConfigSets({
        configSets: {
          default: ['installDeps', 'setupApp'],
        },
        configs: {
          installDocker: new InitConfig([
            InitPackage.yum('docker'),
            InitPackage.yum('jq'), // Required for parsing secrets
            InitCommand.shellCommand('systemctl start docker && systemctl enable docker'),
            // Install Docker Compose Plugin
            InitCommand.shellCommand(
              'mkdir -p /usr/libexec/docker/cli-plugins/ && ' +
              'curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64 -o /usr/libexec/docker/cli-plugins/docker compose && ' +
              'chmod +x /usr/libexec/docker/cli-plugins/docker compose'
            ),
          ]),
          setupApp: new InitConfig([
            InitFile.fromString('/home/ec2-user/.env', toEnvFormat(SERVICE_CONFIG)),
            InitCommand.shellCommand(`
              # 1. Generate Random Database Password
              RAND_PASS=$(< /dev/urandom tr -dc 'A-Za-z0-9' | head -c 24)
              echo "ARANGODB_PASSWORD=$RAND_PASS" >> /home/ec2-user/.env

              # 2. Get GitHub Token & Login to GHCR
              GH_TOKEN=$(aws secretsmanager get-secret-value --secret-id GH_PAT --query SecretString --output text)
              echo $GH_TOKEN | docker login ghcr.io -u bouncingmaxt --password-stdin

              # 3. Get AI Keys and append to .env
              AI_KEYS=$(aws secretsmanager get-secret-value --secret-id EMBEDDING_AI_KEYS --query SecretString --output text)
              echo "EMBEDDING_AI_API_KEY=$(echo $AI_KEYS | jq -r .API_KEY)" >> /home/ec2-user/.env
              echo "EMBEDDING_AI_API_BASE_URL=$(echo $AI_KEYS | jq -r .BASE_URL)" >> /home/ec2-user/.env
            `),
            InitFile.fromString('/home/ec2-user/docker-compose.yml', JSON.stringify({
              version: '3.8',
              services: {
                arangodb: {
                  image: 'arangodb:latest',
                  ports: ['8529:8529'],
                  env_file: ['.env'],
                  volumes: ['arangodata:/var/lib/arangodb3'],
                },
                redis: {
                  image: 'redis:latest',
                  ports: ['6379:6379'],
                },
                crud: {
                  image: 'ghcr.io/omnsight/omni-osint-crud:latest',
                  ports: ['8080:8080'],
                  depends_on: ['arangodb', 'redis'],
                  env_file: ['.env'],
                },
                query: {
                  image: 'ghcr.io/omnsight/omni-osint-query:latest',
                  ports: ['8081:8080'],
                  depends_on: ['arangodb', 'redis'],
                  env_file: ['.env'],
                },
                monitoring: {
                  image: 'ghcr.io/omnsight/omni-monitoring:latest',
                  ports: ['8082:8080'],
                  depends_on: ['arangodb', 'redis'],
                  env_file: ['.env'],
                },
              }
            })),
            // Start the application
            InitCommand.shellCommand('docker compose -f /home/ec2-user/docker-compose.yml up -d'),
          ]),
        },
      }),
    });

    asg.scaleOnSchedule('PreserveBudgetNightly', {
      schedule: Schedule.cron({ hour: '0', minute: '0' }),
      minCapacity: 0,
      maxCapacity: 0,
    });
    asg.scaleOnSchedule('WakeUpForWork', {
      schedule: Schedule.cron({ hour: '', minute: '0' }),
      minCapacity: 1,
      maxCapacity: 1, 
    });
    asg.addToRolePolicy(new PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: ['*'],
    }));
    return asg;
  }

  private createGateway(vpc: Vpc, asg: AutoScalingGroup) {
    const userPool = new UserPool(this, 'NexusUserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true }
    });

    const alb = new ApplicationLoadBalancer(this, 'OmniALB', { vpc, internetFacing: true });
    const listener = alb.addListener('Listener', { port: 80 });
    listener.addTargets('Target', { port: 8080, targets: [asg] });

    // 4. Unified API Gateway
    const rawSpec = fs.readFileSync('./combined-spec.json', 'utf8');
    const finalSpec = rawSpec
      .replace(/\${COGNITO_USER_POOL_ARN}/g, userPool.userPoolArn)
      .replace(/\${ALB_DNS}/g, alb.loadBalancerDnsName);

    new SpecRestApi(this, 'OmniApi', {
      apiDefinition: ApiDefinition.fromInline(JSON.parse(finalSpec)),
      deployOptions: { stageName: 'prod' },
      disableExecuteApiEndpoint: true,
    });
  }
}
