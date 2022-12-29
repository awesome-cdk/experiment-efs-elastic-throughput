import * as cdk from 'aws-cdk-lib';
import {Duration, RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {FileSystem, PerformanceMode, ThroughputMode} from "aws-cdk-lib/aws-efs";
import {Vpc} from "aws-cdk-lib/aws-ec2";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ExperimentEfsElasticThroughputStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = Vpc.fromLookup(this, 'VPC', {
            isDefault: true,
        });

        const fsBursting = new FileSystem(this, 'fs-BURSTING', {
            throughputMode: ThroughputMode.BURSTING,
            performanceMode: PerformanceMode.GENERAL_PURPOSE,
            vpc,
            removalPolicy: RemovalPolicy.DESTROY,
        })
        const fsElastic = new FileSystem(this, 'fs-ELASTIC', {
            throughputMode: ThroughputMode.ELASTIC,
            performanceMode: PerformanceMode.GENERAL_PURPOSE,
            vpc,
            removalPolicy: RemovalPolicy.DESTROY,
        })

        new NodejsFunction(this, 'fn-benchmark-bursting', {
            entry: path.resolve(__dirname, 'lambda/benchmark/bursting.ts'),
            timeout: Duration.seconds(60),
        })
    }
}
