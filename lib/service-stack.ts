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

    const service = new ServiceConstruct(this, 'Service', { stage: props.stage });
    const api = new ApiConstruct(this, 'Api', { 
      stage: props.stage, 
      vpc: service.vpc, 
      asg: service.asg 
    });
    new MonitoringConstruct(this, 'Monitoring', { 
      stage: props.stage, 
      api: api.api, 
      asg: service.asg, 
      userPool: api.userPool, 
      postConfirmTriggerLogGroup: api.postConfirmTriggerLogGroup,
      serviceLogGroup: service.logGroup, 
      dataVolume: service.dataVolume,
    });
  }
}
