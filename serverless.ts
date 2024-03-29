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
import functionService from '@functions/user/function';
import loginService from '@functions/user/login';
import signInService from '@functions/user/signIn';
import logWatcher from '@functions/logWatcher';
import authorizer from '@functions/authorizer';
import deleteUser from '@functions/user/delete';

const serverlessConfiguration: AWS = {
    service: 'foppa',
    configValidationMode: 'error',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild'],
    provider: {
        name: 'aws',
        profile: 'foppa',
        region: 'eu-central-1',
        runtime: 'nodejs18.x',
        stage: 'dev',
        stackTags: {
            Project: 'Foppa',
            Deployment: 'Serverless',
            Author: 'Hendrik',
        },
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        httpApi: {
            authorizers: {
                authorizer: {
                    type: 'request',
                    functionName: 'authorizer',
                	identitySource: ['$request.header.Authorization'],
                    resultTtlInSeconds: 300,
                    enableSimpleResponse: true,
                }
            }
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
        },
        iam: {
            role: 'arn:aws:iam::717556240325:role/Foppa_full_lambda_role',
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
        loginService,
        signInService,
        logWatcher,
        authorizer,
        deleteUser
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
            DeploymentBucket: {
                Type: 'AWS::S3::Bucket',
                Properties: {
                    BucketName: 'foppa',
                },
            },
            // OptimizationRequestTopic: {
            //     Type: 'AWS::SNS::Topic',
            //     Properties: {
            //         DisplayName: 'Optimization Request Topic',
            //         TopicName: 'OptimizationRequestTopic',
            //     },
            // },
            // RunRequestTopic: {
            //     Type: 'AWS::SNS::Topic',
            //     Properties: {
            //         DisplayName: 'Run Request Topic',
            //         TopicName: 'RunRequestTopic',
            //     },
            // },
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
