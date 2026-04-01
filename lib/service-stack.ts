import { App, Stack, StackProps } from 'aws-cdk-lib';
import { ApiConstruct } from './constructs/apiConstruct';
import { MonitoringConstruct } from './constructs/monitoringConstruct';
import { ServiceConstruct } from './constructs/serviceConstruct';

interface NexusrIntelStackProps extends StackProps {
  readonly stage: string;
}

export class NexuIntelStack extends Stack {
  constructor(scope: App, id: string, props: NexusrIntelStackProps) {
    super(scope, id, props);

    const serviceConstruct = new ServiceConstruct(this, 'Service', { stage: props.stage });
    const apiConstruct = new ApiConstruct(this, 'Api', { 
      stage: props.stage, 
      vpc: serviceConstruct.vpc, 
      asg: serviceConstruct.asg 
    });
    new MonitoringConstruct(this, 'Monitoring', { 
      stage: props.stage, 
      api: apiConstruct.api, 
      asg: serviceConstruct.asg, 
      userPool: apiConstruct.userPool, 
      postConfirmTriggerLogGroup: apiConstruct.postConfirmTriggerLogGroup,
      serviceLogGroup: serviceConstruct.logGroup, 
      dataVolume: serviceConstruct.dataVolume,
      targetGroups: apiConstruct.targetGroups,
    });
  }
}
