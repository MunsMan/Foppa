import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { AWS_RUNNER, getLambdaUrl, middyfy, uploadLambda, uploadLambdaWrapper } from '@libs/lambda';
import { LambdaClient } from '@aws-sdk/client-lambda'
import schema from './schema'
import DynamoDB from '@libs/dynamodb';
import { toPRegion, toUFunctionId } from '@libs/parser';

const CODE_BUCKET = process.env.CODE_BUCKET;

const createFunction: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    // Get Userdata for lambda client

    const functionName = event.body.functionName;
    const username = event.pathParameters.username;
    const role = event.body.role;
    const handler = event.body.handler;
    const region = event.body.region;
    const code = Buffer.from(event.body.zip_file.split(',')[1], 'base64')

    const db = new DynamoDB()

    const functionId = await db.incrValue('UserManager', { username }, 'functionCounter')


    const lambdaClient = new LambdaClient({ region });
    let response: any;
    response = await uploadLambdaWrapper(lambdaClient, role, CODE_BUCKET)
    console.log(`[INFO] - return uploadLambdaWrapper - response:${response}`)
    let runnerUrl = await getLambdaUrl(lambdaClient, AWS_RUNNER)
    await Promise.all([
        await uploadLambda(lambdaClient, functionName, role, handler, code),
        await db.putValue('FunctionExecutionCounter', { username, functionId: functionId.toString(), executionCounter: 0 }),
        await db.putValue('RegionExecutionCounter', { uFunctionId: toUFunctionId(username, functionId), pregion: toPRegion('aws', region), executionCounter: 0 }),
        await db.putValue('RegionRunnerURL', { uFunctionId: toUFunctionId(username, functionId), pregion: toPRegion('aws', event.body.region), functionName: event.body.functionName, url: runnerUrl }),
    ]);


    return formatJSONResponse({
        message: 'Function created',
        functionId: functionId
    });
};

export const main = middyfy(createFunction, schema);
