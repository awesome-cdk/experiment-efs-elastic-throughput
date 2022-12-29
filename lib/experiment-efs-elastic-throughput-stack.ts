import * as cdk from 'aws-cdk-lib';
import {Duration, RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {FileSystem, PerformanceMode, ThroughputMode} from "aws-cdk-lib/aws-efs";
import {Vpc} from "aws-cdk-lib/aws-ec2";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {FileSystem as LambdaFileSystem} from "aws-cdk-lib/aws-lambda";
import * as path from "path";

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
            description: 'Test EFS bursting mode',
            memorySize: 1024 * 10,
            entry: path.resolve(__dirname, 'lambda/benchmark.ts'),
            timeout: Duration.seconds(600),
            vpc,
            allowPublicSubnet: true,
            filesystem: LambdaFileSystem.fromEfsAccessPoint(fsBursting.addAccessPoint('AccessPoint', {
                // set /export/lambda as the root of the access point
                path: '/export/lambda',
                // as /export/lambda does not exist in a new efs filesystem, the efs will create the directory with the following createAcl
                createAcl: {
                    ownerUid: '1001',
                    ownerGid: '1001',
                    permissions: '750',
                },
                // enforce the POSIX identity so lambda function will access with this identity
                posixUser: {
                    uid: '1001',
                    gid: '1001',
                },
            }), '/mnt/efs'),
        })

        new NodejsFunction(this, 'fn-benchmark-elastic', {
            description: 'Test EFS elastic mode',
            memorySize: 1024 * 10,
            entry: path.resolve(__dirname, 'lambda/benchmark.ts'),
            timeout: Duration.seconds(600),
            vpc,
            allowPublicSubnet: true,
            filesystem: LambdaFileSystem.fromEfsAccessPoint(fsElastic.addAccessPoint('AccessPoint', {
                // set /export/lambda as the root of the access point
                path: '/export/lambda',
                // as /export/lambda does not exist in a new efs filesystem, the efs will create the directory with the following createAcl
                createAcl: {
                    ownerUid: '1001',
                    ownerGid: '1001',
                    permissions: '750',
                },
                // enforce the POSIX identity so lambda function will access with this identity
                posixUser: {
                    uid: '1001',
                    gid: '1001',
                },
            }), '/mnt/efs'),
        })
    }
}
