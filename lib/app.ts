import { App } from "aws-cdk-lib";
import { NexuIntelStack } from "./service-stack";

const app = new App();

const account = '860272298483';
const region = 'us-west-2';
const stages = ['alpha', 'prod'];

stages.forEach((stage) => {
  new NexuIntelStack(app, `NexuIntelStack-${stage}`, {
    stage,
    env: { account, region },
  });
});
