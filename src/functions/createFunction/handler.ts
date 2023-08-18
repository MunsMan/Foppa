import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import AwsApiGateway, { formatJSONResponse } from '@libs/api-gateway';
import {
    addLambdaReturnTrigger,
    isCreateOutput,
    middyfy,
    uploadLambda,
    uploadLambdaWrapper,
} from '@libs/lambda';
import { LambdaClient } from '@aws-sdk/client-lambda';
import schema from './schema';
import DynamoDB from '@libs/dynamodb';
import { toPRegion, toUFunctionId } from '@libs/parser';

const CODE_BUCKET = process.env.CODE_BUCKET;

const error = () => {
    return formatJSONResponse({
        message: 'Something went wrong, please check your provided input!',
    });
};

const createFunction: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    // Get Userdata for lambda client

    const functionName = event.body.functionName;
    const username = event.pathParameters.username;
    const role = event.body.role;
    const handler = event.body.handler;
    const region = event.body.region;
    const code = Buffer.from(event.body.zip_file.split(',')[1], 'base64');
    const apiName = `foppa-${region}-api`;

    const db = new DynamoDB();
    const api = new AwsApiGateway(region);
    const lambdaClient = new LambdaClient({ region });

    const [functionId, wrapperUploadResponse, lambdaResponse] = await Promise.all([
        db.incrValue('UserManager', { username }, 'functionCounter'),
        uploadLambdaWrapper(lambdaClient, role, CODE_BUCKET),
        uploadLambda(lambdaClient, functionName, role, handler, code),
    ]);

    const runnerResponse = wrapperUploadResponse[0];
    const returnerResponse = wrapperUploadResponse[1];
    if (runnerResponse.status === 'rejected') {
        console.log(`[ERROR] - unable to create AWS Runner:\n${runnerResponse.reason}`);
        return error();
    }
    if (returnerResponse.status === 'rejected') {
        console.log(`[ERROR] - unable to create AWS Returner:\n${returnerResponse.reason}`);
        return error();
    }

    let runnerARN = isCreateOutput(runnerResponse.value)
        ? runnerResponse.value.FunctionArn
        : runnerResponse.value.Configuration.FunctionArn;
    let returnerARN = isCreateOutput(returnerResponse.value)
        ? returnerResponse.value.FunctionArn
        : returnerResponse.value.Configuration.FunctionArn;

    console.log(runnerARN, returnerARN);

    let runnerUrl = (await api.setupApiGateway(apiName, runnerARN)).ApiEndpoint;

    const userLambdaARN = isCreateOutput(lambdaResponse)
        ? lambdaResponse.FunctionArn
        : lambdaResponse.Configuration.FunctionArn;

    await Promise.all([
        await addLambdaReturnTrigger(lambdaClient, userLambdaARN, returnerARN),
        await db.putValue('FunctionExecutionCounter', {
            username,
            functionId: functionId.toString(),
            executionCounter: 0,
        }),
        await db.putValue('RegionExecutionCounter', {
            uFunctionId: toUFunctionId(username, functionId),
            pregion: toPRegion('aws', region),
            executionCounter: 0,
        }),
        await db.putValue('RegionRunnerURL', {
            uFunctionId: toUFunctionId(username, functionId),
            pregion: toPRegion('aws', event.body.region),
            functionName: event.body.functionName,
            url: runnerUrl,
        }),
    ]);

    return formatJSONResponse({
        message: 'Function created',
        functionId: functionId,
    });
};

export const main = middyfy(createFunction, schema);
