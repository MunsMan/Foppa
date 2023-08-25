import type { AWS } from '@serverless/typescript';

import firstResponder from '@functions/firstResponder';
import createFunction from '@functions/createFunction';
import scheduler from '@functions/scheduler';
import runner from '@functions/runner';
import returner from '@functions/returner';
import awsRunner from '@functions/aws/awsRunner';
import awsReturner from '@functions/aws/awsReturner';
import optimizationRequest from '@functions/logging/optimizationRequest';
import runRequest from '@functions/logging/runRequest';
import status from '@functions/status';
import functionService from '@functions/services/function';

const serverlessConfiguration: AWS = {
    service: 'foppa',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild'],
    provider: {
        name: 'aws',
        profile: 'foppa',
        runtime: 'nodejs18.x',
        stage: 'dev',
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
        },
        iam: {
            role: 'arn:aws:iam::807699729275:role/LabRole',
        },
        deploymentBucket: {
            name: '${self:service}-deployment-${self:provider.stage}',
        },
    },
    // import the function via paths
    functions: {
        firstResponder,
        createFunction,
        scheduler,
        runner,
        awsRunner,
        awsReturner,
        optimizationRequest,
        runRequest,
        returner,
        status,
        functionService,
    },
    package: { individually: true },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ['aws-sdk'],
            target: 'node18',
            define: { 'require.resolve': undefined },
            platform: 'node',
            concurrency: 10,
        },
    },
    resources: {
        Resources: {
            LogBucket: {
                Type: 'AWS::S3::Bucket',
                Properties: {
                    BucketName: 'foppa-logs',
                },
            },
            FunctionExecutionCounter: {
                Type: 'AWS::DynamoDB::Table',
                Properties: {
                    TableName: 'FunctionExecutionCounter',
                    AttributeDefinitions: [
                        { AttributeName: 'username', AttributeType: 'S' },
                        { AttributeName: 'functionId', AttributeType: 'S' },
                        // { AttributeName: 'executionCounter', AttributeType: 'N' },
                    ],
                    KeySchema: [
                        { AttributeName: 'username', KeyType: 'HASH' },
                        { AttributeName: 'functionId', KeyType: 'RANGE' },
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1,
                    },
                },
            },
            RegionExecutionCounter: {
                Type: 'AWS::DynamoDB::Table',
                Properties: {
                    TableName: 'RegionExecutionCounter',
                    AttributeDefinitions: [
                        { AttributeName: 'uFunctionId', AttributeType: 'S' },
                        { AttributeName: 'pregion', AttributeType: 'S' },
                        // { AttributeName: 'executionCounter', AttributeType: 'N' },
                    ],
                    KeySchema: [
                        { AttributeName: 'uFunctionId', KeyType: 'HASH' },
                        { AttributeName: 'pregion', KeyType: 'RANGE' },
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1,
                    },
                },
            },
            RegionRunnerURL: {
                Type: 'AWS::DynamoDB::Table',
                Properties: {
                    TableName: 'RegionRunnerURL',
                    AttributeDefinitions: [
                        { AttributeName: 'uFunctionId', AttributeType: 'S' },
                        { AttributeName: 'pregion', AttributeType: 'S' },
                        // { AttributeName: 'functionName', AttributeType: 'S' },
                        // { AttributeName: 'url', AttributeType: 'S' },
                    ],
                    KeySchema: [
                        { AttributeName: 'uFunctionId', KeyType: 'HASH' },
                        { AttributeName: 'pregion', KeyType: 'RANGE' },
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1,
                    },
                },
            },
            UserManager: {
                Type: 'AWS::DynamoDB::Table',
                Properties: {
                    TableName: 'UserManager',
                    AttributeDefinitions: [{ AttributeName: 'username', AttributeType: 'S' }],
                    KeySchema: [{ AttributeName: 'username', KeyType: 'HASH' }],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1,
                    },
                },
            },
        },
    },
};

module.exports = serverlessConfiguration;
