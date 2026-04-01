import { Duration } from 'aws-cdk-lib';
import { SpecRestApi } from 'aws-cdk-lib/aws-apigateway';
import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { Dashboard, GraphWidget, MathExpression, Metric, TextWidget } from 'aws-cdk-lib/aws-cloudwatch';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Volume } from 'aws-cdk-lib/aws-ec2';
import { ApplicationTargetGroup } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface MonitoringConstructProps {
  readonly stage: string;
  readonly api: SpecRestApi;
  readonly asg: AutoScalingGroup;
  readonly userPool: UserPool;
  readonly postConfirmTriggerLogGroup: LogGroup;
  readonly serviceLogGroup: LogGroup;
  readonly dataVolume: Volume;
  readonly targetGroups: { [name: string]: ApplicationTargetGroup };
}

export class MonitoringConstruct extends Construct {
  constructor(scope: Construct, id: string, props: MonitoringConstructProps) {
    super(scope, id);
    const { stage, api, asg, postConfirmTriggerLogGroup, serviceLogGroup, dataVolume, targetGroups } = props;

    const dashboard = new Dashboard(this, `NexusDashboard-${stage}`, {
      dashboardName: `NexusServiceDashboard-${stage}`,
    });

    // Service Health
    dashboard.addWidgets(new TextWidget({ markdown: '# Service Health', width: 24 }));
    dashboard.addWidgets(
      new GraphWidget({
        title: 'API Requests',
        left: [
          api.metricCount(),
          api.metricClientError(),
          api.metricServerError(),
        ],
        width: 12,
      }),
      new GraphWidget({
        title: 'API Server Error Rate',
        left: [
          new MathExpression({
            expression: '100 * (errors / total)',
            usingMetrics: {
              errors: api.metricServerError(),
              total: api.metricCount(),
            },
            label: 'Server Error Rate (%)',
            color: '#ff0000',
            period: Duration.minutes(5),
          }),
        ],
        width: 6,
      }),
      new GraphWidget({
        title: 'API Latency',
        left: [
          api.metricLatency(),
          api.metricIntegrationLatency(),
        ],
        width: 6,
      }),
    );

    dashboard.addWidgets(
      ...Object.entries(targetGroups).map(
        ([name, targetGroup]) =>
          new GraphWidget({
            title: `${name} Healthy Hosts`,
            left: [
              targetGroup.metrics.healthyHostCount({
                color: '#2ca02c',
              }),
              targetGroup.metrics.unhealthyHostCount({
                color: '#ff0000',
              }),
            ],
            width: 6,
          }),
      ),
    );

    //     dashboard.addWidgets(new LogQueryWidget({
    //       title: 'API Gateway Access Logs (Errors)',
    //       logGroupNames: [api.accessLogGroup.logGroupName],
    //       queryString: `
    // fields @timestamp, @message
    // | filter status >= 400
    // | sort @timestamp desc
    // | limit 20
    //       `.trim(),
    //       width: 24,
    //     }));

    //     dashboard.addWidgets(new LogQueryWidget({
    //       title: 'API Gateway Execution Logs (Errors)',
    //       logGroupNames: [api.executionLogGroup.logGroupName],
    //       queryString: `
    // fields @timestamp, @message
    // | filter @message like /(?i)error/
    // | sort @timestamp desc
    // | limit 20
    //       `.trim(),
    //       width: 24,
    //     }));

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
