import { Duration, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { ApiDefinition, BasePathMapping, DomainName, EndpointType, SecurityPolicy, SpecRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { CfnUserPoolGroup, UserPool } from 'aws-cdk-lib/aws-cognito';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { Port, Vpc } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer, ApplicationProtocol, Protocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { AnyPrincipal, Effect, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as fs from 'fs';
import { SERVICES } from '../config';

interface ApiConstructProps {
  readonly stage: string;
  readonly vpc: Vpc;
  readonly asg: AutoScalingGroup;
}

export class ApiConstruct extends Construct {
  public readonly api: SpecRestApi;
  public readonly userPool: UserPool;
  public readonly postConfirmTriggerLogGroup: LogGroup;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    const { stage, vpc, asg } = props;
    const stack = Stack.of(this);

    const certificate = Certificate.fromCertificateArn(this, `NexusCertificate-${stage}`, 'arn:aws:acm:us-west-2:860272298483:certificate/43d2b819-7886-4695-b04f-0f4139b24a18');
    const customDomain = new DomainName(this, `NexusCustomDomain-${stage}`, {
      domainName: stage === 'prod' ? 'api.nexusintelligences.com' : `api.${stage}.nexusintelligences.com`,
      certificate,
      securityPolicy: SecurityPolicy.TLS_1_2,
      endpointType: EndpointType.REGIONAL,
    });

    const logGroup = new LogGroup(this, `NexusUserRegisterLambdaLogs-${stage}`, {
      logGroupName: `/aws/lambda/nexus-user-register-${stage}`,
      retention: RetentionDays.THREE_MONTHS,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const postConfirmTrigger = new Function(this, 'PostConfirmLambda', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      logGroup: logGroup,
      code: Code.fromInline(`
        const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } = require("@aws-sdk/client-cognito-identity-provider");
        const client = new CognitoIdentityProviderClient({});

        exports.handler = async (event) => {
          const command = new AdminAddUserToGroupCommand({
            GroupName: 'user',
            UserPoolId: event.userPoolId,
            Username: event.userName,
          });
          await client.send(command);
          return event;
        };
      `),
    });
    this.postConfirmTriggerLogGroup = logGroup;

    this.userPool = new UserPool(this, `NexusUserPool-${stage}`, {
      selfSignUpEnabled: stage === 'prod',
      signInAliases: { email: true },
      lambdaTriggers: {
        postConfirmation: postConfirmTrigger,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new CfnUserPoolGroup(this, `AdminGroup-${stage}`, { userPoolId: this.userPool.userPoolId, groupName: 'admin' });
    new CfnUserPoolGroup(this, `PaidGroup-${stage}`, { userPoolId: this.userPool.userPoolId, groupName: 'paid' });
    new CfnUserPoolGroup(this, `UserGroup-${stage}`, { userPoolId: this.userPool.userPoolId, groupName: 'user' });

    postConfirmTrigger.addToRolePolicy(new PolicyStatement({
      actions: ['cognito-idp:AdminAddUserToGroup'],
      resources: [`arn:aws:cognito-idp:${stack.region}:${stack.account}:userpool/*`],
    }));

    const alb = new ApplicationLoadBalancer(this, `NexusALB-${stage}`, { vpc, internetFacing: true });
    SERVICES.forEach(svc => {
      const listener = alb.addListener(`Listener-${svc.name}-${stage}`, {
        port: svc.port,
        protocol: ApplicationProtocol.HTTP,
      });
      listener.addTargets(`Target-${svc.name}-${stage}`, {
        port: svc.port,
        protocol: ApplicationProtocol.HTTP,
        targets: [asg],
        healthCheck: {
          path: '/',
          port: '8888',
          protocol: Protocol.HTTP,
          interval: Duration.seconds(30),
          timeout: Duration.seconds(5),
        },
      });
      asg.connections.allowFrom(alb, Port.tcp(svc.port));
    });
    asg.connections.allowFrom(alb, Port.tcp(8888));

    const rawSpec = fs.readFileSync('./combined-spec.json', 'utf8');
    const finalSpec = rawSpec
      .replace(/\${COGNITO_USER_POOL_ARN}/g, this.userPool.userPoolArn)
      .replace(/\${ALB_DNS}/g, alb.loadBalancerDnsName);

    const apiPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: ['execute-api:Invoke'],
          resources: ['execute-api:/*/*/*'],
          principals: [new AnyPrincipal()],
        }),
        new PolicyStatement({
          effect: Effect.DENY,
          principals: [new AnyPrincipal()],
          actions: ['execute-api:Invoke'],
          resources: ['execute-api:/*/GET/health', 'execute-api:/*/GET/*/health'],
          conditions: {
            StringNotEquals: {
              'aws:SourceVpc': vpc.vpcId
            }
          }
        })
      ]
    });

    this.api = new SpecRestApi(this, 'NexusApiGateway', {
      restApiName: 'nexus-api',
      apiDefinition: ApiDefinition.fromInline(JSON.parse(finalSpec)),
      deployOptions: { stageName: stage },
      disableExecuteApiEndpoint: true,
      policy: apiPolicy,
    });

    new BasePathMapping(this, `NexusMapping-${stage}`, {
      domainName: customDomain,
      restApi: this.api,
    });
  }
}
