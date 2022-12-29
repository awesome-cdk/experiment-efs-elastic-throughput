#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {ExperimentEfsElasticThroughputStack} from '../lib/experiment-efs-elastic-throughput-stack';

const app = new cdk.App();
new ExperimentEfsElasticThroughputStack(app, 'ExperimentEfsElasticThroughputStack', {
    env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});
