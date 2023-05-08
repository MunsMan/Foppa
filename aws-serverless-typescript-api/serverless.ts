import type { AWS } from '@serverless/typescript';

import firstResponder from '@functions/firstResponder';

const serverlessConfiguration: AWS = {
    service: 'foppa',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild'],
    provider: {
        name: 'aws',
        runtime: 'nodejs14.x',
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
        vpc: {
            securityGroupIds: ["sg-05bfc8f4b1874318d"],
            subnetIds: [
                "subnet-005bf572305e89cb5",
                "subnet-03fdbbe61d5b5302b"
            ]
        }
    },
    // import the function via paths
    functions: { firstResponder },
    package: { individually: true },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ['aws-sdk'],
            target: 'node14',
            define: { 'require.resolve': undefined },
            platform: 'node',
            concurrency: 10,
        },
    },
};

module.exports = serverlessConfiguration;
