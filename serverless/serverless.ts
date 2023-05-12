import type { AWS } from '@serverless/typescript';

import firstResponder from '@functions/firstResponder';
import createFunction from '@functions/createFunction';
import scheduler from '@functions/scheduler';

const serverlessConfiguration: AWS = {
    service: 'foppa',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild'],
    provider: {
        name: 'aws',
        profile: 'foppa',
        runtime: 'nodejs18.x',
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
        },
        iam: {
            role: "arn:aws:iam::807699729275:role/LabRole",
        },
    },
    // import the function via paths
    functions: { firstResponder, createFunction, scheduler },
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
        'serverless-offline-sns': {

        }
    },
};

module.exports = serverlessConfiguration;
