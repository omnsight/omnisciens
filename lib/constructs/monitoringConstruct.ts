import { Duration } from 'aws-cdk-lib';
import { SpecRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { Dashboard, GraphWidget, LogQueryWidget, MathExpression, Metric, TextWidget } from 'aws-cdk-lib/aws-cloudwatch';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Volume } from 'aws-cdk-lib/aws-ec2';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface MonitoringConstructProps {
  readonly stage: string;
  readonly api: SpecRestApi;
  readonly asg: AutoScalingGroup;
  readonly userPool: UserPool;
  readonly postConfirmTriggerLogGroup: LogGroup;
  readonly serviceLogGroup: LogGroup;
  readonly dataVolume: Volume;
}

export class MonitoringConstruct extends Construct {
  constructor(scope: Construct, id: string, props: MonitoringConstructProps) {
    super(scope, id);
    const { stage, api, asg, postConfirmTriggerLogGroup, serviceLogGroup, dataVolume } = props;

    const dashboard = new Dashboard(this, `NexusDashboard-${stage}`, {
      dashboardName: `NexusServiceDashboard-${stage}`,
    });

    // Service Health
    dashboard.addWidgets(new TextWidget({ markdown: '# Service Health', width: 24 }));
    // dashboard.addWidgets(new GraphWidget({
    //   title: 'API Requests',
    //   left: [
    //     api.metricCount({
    //       period: Duration.minutes(5),
    //       statistic: 'sum',
    //       color: '#0011ffff',
    //       label: 'Total Requests',
    //     }),
    //     api.metricClientError({
    //       period: Duration.minutes(5),
    //       statistic: 'sum',
    //       color: '#ffbf00ff',
    //       label: 'Client Errors',
    //     }),
    //     api.metricServerError({
    //       period: Duration.minutes(5),
    //       statistic: 'sum',
    //       color: '#ff0000ff',
    //       label: 'Server Errors',
    //     }),
    //   ],
    //   width: 12,
    // }));
    dashboard.addWidgets(new GraphWidget({
      title: 'API Server Error Rate',
      left: [
        new MathExpression({
          expression: '100 * (errors / total)',
          usingMetrics: {
            errors: api.metricServerError({ period: Duration.minutes(5), statistic: 'sum' }),
            total: api.metricCount({ period: Duration.minutes(5), statistic: 'sum' }),
          },
          label: 'Server Error Rate (%)',
          color: '#ff0000',
          period: Duration.minutes(5),
        }),
      ],
      width: 6,
    }));
    // dashboard.addWidgets(new GraphWidget({
    //   title: 'API Latency',
    //   left: [
    //     api.metricLatency({
    //       period: Duration.minutes(5),
    //       statistic: 'max',
    //       color: '#ff0000ff',
    //       label: 'API Latency',
    //     }),
    //     api.metricIntegrationLatency({
    //       period: Duration.minutes(5),
    //       statistic: 'max',
    //       color: '#ffbf00ff',
    //       label: 'Integration Latency',
    //     }),
    //   ],
    //   width: 6,
    // }));
    // TODO: Add logs later on when query strings are determined
    // dashboard.addWidgets(new LogQueryWidget({
    //   title: 'Service Logs',
    //   logGroupNames: [serviceLogGroup.logGroupName],
    //   width: 24,
    // }));
    // dashboard.addWidgets(new LogQueryWidget({
    //   title: 'User Pool Logs',
    //   logGroupNames: [postConfirmTriggerLogGroup.logGroupName],
    //   width: 24,
    // }));

    // Server Health
    dashboard.addWidgets(new TextWidget({ markdown: '# Server Health', width: 24 }));
    dashboard.addWidgets(new GraphWidget({
      title: 'Instance Health',
      left: [
        new Metric({
          namespace: 'AWS/EC2',
          metricName: 'CPUUtilization',
          dimensionsMap: { AutoScalingGroupName: asg.autoScalingGroupName },
          period: Duration.minutes(5),
          statistic: 'avg',
        }),
      ],
      width: 6,
    }));
    // TODO: Needs CW agent on EC2 instances
    // dashboard.addWidgets(new GraphWidget({
    //   title: 'Instance Health',
    //   left: [
    //     new Metric({
    //       namespace: 'CWAgent',
    //       metricName: 'mem_used_percent',
    //       dimensionsMap: { AutoScalingGroupName: asg.autoScalingGroupName },
    //       period: Duration.minutes(5),
    //       statistic: 'avg',
    //     })
    //   ],
    //   width: 12,
    // }));

    // Data Dashboard
    dashboard.addWidgets(new TextWidget({ markdown: '# Data Dashboard', width: 24 }));
    dashboard.addWidgets(new GraphWidget({
      title: 'Data Storage',
      left: [
        new Metric({
          namespace: 'AWS/EBS',
          metricName: 'VolumeReadBytes',
          dimensionsMap: { VolumeId: dataVolume.volumeId },
          period: Duration.days(1),
          statistic: 'Average',
        })
      ],
      width: 6,
    }));
  }
}
