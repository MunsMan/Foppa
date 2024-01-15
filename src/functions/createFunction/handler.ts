import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import AwsApiGateway, { formatJSONResponse } from '@libs/api-gateway';
import {
    addInvokePermission,
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
import { Region } from '@consts/aws';
import { sleep } from '@libs/utils';

const CODE_BUCKET = process.env.CODE_BUCKET;

const error = () => {
    return formatJSONResponse({
        message: 'Something went wrong, please check your provided input!',
    });
};

const createFunction: ValidatedEventAPIGatewayProxyEvent<
    typeof schema
> = async (event, context) => {
    // Get Userdata for lambda client

    const functionName = event.body.functionName;
    const username = event.pathParameters.username;
    const role = event.body.role;
    const handler = event.body.handler;
    const regions = event.body.regions;
    const code = Buffer.from(
        event.body.zip_file.split(',')[1] ?? event.body.zip_file,
        'base64'
    );

    const db = new DynamoDB();

    const functionId = await db.incrValue(
        'UserManager',
        { username },
        'functionCounter'
    );
    const accountId = context.invokedFunctionArn.split(':')[4] ?? '';
    const functionConfig: FunctionConfig = {
        functionName,
        code,
        handler,
        role,
        runtime: event.body.runtime,
        memorySize: event.body.memorySize,
        timeout: event.body.timeout,
        env: event.body.env,
    };
    await Promise.all([
        ...regions.map((region) =>
            uploadFunction(
                region,
                db,
                username,
                functionId.toString(),
                accountId,
                functionConfig
            )
        ),
        await db.putValue('FunctionExecutionCounter', {
            username,
            functionId: functionId.toString(),
            executionCounter: 0,
            functionName,
        }),
    ]);
    return formatJSONResponse({
        message: 'Function created',
        functionId: functionId.toString(),
    });
};

const uploadFunction = async (
    region: Region,
    db: DB,
    username: string,
    functionId: string,
    accountId: string,
    functionConfig: FunctionConfig
) => {
    const api = new AwsApiGateway(region);
    const lambdaClient = new LambdaClient({ region });

    const [wrapperUploadResponse, lambdaResponse] = await Promise.all([
        uploadLambdaWrapper(lambdaClient, functionConfig.role, CODE_BUCKET),
        uploadLambda(lambdaClient, functionConfig),
    ]);

    const runnerResponse = wrapperUploadResponse[0];
    const returnerResponse = wrapperUploadResponse[1];
    if (runnerResponse.status === 'rejected') {
        console.log(
            `[ERROR] - unable to create AWS Runner:\n${runnerResponse.reason}`
        );
        return error();
    }
    if (returnerResponse.status === 'rejected') {
        console.log(
            `[ERROR] - unable to create AWS Returner:\n${returnerResponse.reason}`
        );
        return error();
    }

    let runnerARN = isCreateOutput(runnerResponse.value)
        ? runnerResponse.value.FunctionArn
        : runnerResponse.value.Configuration.FunctionArn;
    let returnerARN = isCreateOutput(returnerResponse.value)
        ? returnerResponse.value.FunctionArn
        : returnerResponse.value.Configuration.FunctionArn;

    console.log(runnerARN, returnerARN);

    const apiName = `foppa-${region}-api`;
    const { ApiEndpoint: runnerUrl, ApiId: apiId } = await api.setupApiGateway(
        apiName,
        runnerARN
    );
    const sourceArn = `arn:aws:execute-api:${region}:${accountId}:${apiId}/*/*/invoke`;

    const userLambdaARN = isCreateOutput(lambdaResponse)
        ? lambdaResponse.FunctionArn
        : lambdaResponse.Configuration.FunctionArn;
    await sleep(1000);
    await Promise.all([
        db.putValue('RegionExecutionCounter', {
            uFunctionId: toUFunctionId(username, functionId),
            pregion: toPRegion('aws', region),
            executionCounter: 0,
        }),
        db.putValue('RegionRunnerURL', {
            uFunctionId: toUFunctionId(username, functionId),
            pregion: toPRegion('aws', region),
            functionName: functionConfig.functionName,
            url: `${runnerUrl}/invoke`,
        }),
        addInvokePermission(lambdaClient, runnerARN, sourceArn),
        addLambdaReturnTrigger(lambdaClient, userLambdaARN, returnerARN),
    ]);
};

export const main = middyfy(createFunction, schema);
