import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { CreateFunctionCommand, CreateFunctionCommandInput, CreateFunctionUrlConfigCommand, FunctionCode, GetFunctionUrlConfigCommand, LambdaClient, ListFunctionsCommand, Runtime } from '@aws-sdk/client-lambda'
import schema from './schema'
import { incrValue, putValue } from '@libs/dynamodb';
import { toPRegion } from '@libs/parser';


const createFunction: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    console.log(event.body)
    const username = event.pathParameters.username;
    const functionId = await getFunctionId(username);
    const code: FunctionCode = { ZipFile: event.body.zip_file, S3Bucket: event.body.code.bucket, S3Key: event.body.code.key }
    const aws_client = new LambdaClient({ region: event.body.region });
    await uploadAWSWrapper(aws_client, event.body.role)
    const runnerUrl = await getWrapperUrl(aws_client)

    await Promise.all([
        await uploadLambda({ client: aws_client, functionName: event.body.functionName, role: event.body.role, runtime: event.body.runtime as Runtime, code }),
        await putValue('FunctionExecutionCounter', { username, functionId, executionId: 0 }),
        await putValue('RegionExecutionCounter', { username, functionId, executionCounter: 0 }),
        await putValue('RegionRunnerURL', { username, pregion: toPRegion('aws', event.body.region), functionName: event.body.functionName, url: runnerUrl }),
    ]);


    return formatJSONResponse({
        message: 'Function created',
        functionId: functionId
    });
};

const getFunctionId = async (username: string) => (
    await incrValue('UserManager', { username }, 'functionCounter')
)

const existFunction = async (aws_client: LambdaClient, functionName: string) => {
    let marker = undefined;
    while (true) {
        const response = await aws_client.send(new ListFunctionsCommand({
            MaxItems: 50, Marker: marker
        }));
        if (response.Functions) {
            for (const func of response.Functions) {
                if (func.FunctionName === functionName) {
                    return func.FunctionArn;
                }
            }
        }
        if (!response.NextMarker) {
            return undefined
        }
        marker = response.NextMarker
    }
}

const getFunctionUrl = async (aws_client: LambdaClient, functionName: string) => {
    return aws_client.send(new GetFunctionUrlConfigCommand({ FunctionName: functionName }))
}

const createFunctionUrl = async (aws_client: LambdaClient, functionName: string) => {
    return aws_client.send(new CreateFunctionUrlConfigCommand({ FunctionName: functionName, AuthType: 'NONE' }))
}

const getWrapperUrl = async (aws_client: LambdaClient) => {
    const functionName = 'foppa-aws-runner'
    try {
        return (await getFunctionUrl(aws_client, functionName)).FunctionUrl
    }
    catch (ResourceNotFoundException) {
        return (await createFunctionUrl(aws_client, functionName)).FunctionUrl
    }
}

const uploadAWSWrapper = async (aws_client: LambdaClient, role: string) => {
    const runtime = 'nodejs18.x';
    const bucket = 'foppa-deployment-dev'
    const requestWrapper = async (functionName: string, bucket: string, key: string, runtime: Runtime) => {
        const exists = await existFunction(aws_client, functionName)
        if (exists) return exists
        const response = await uploadLambda({
            functionName, client: aws_client, role, runtime, code: {
                S3Bucket: bucket,
                S3Key: key
            }
        })
        return response
    }
    return Promise.all([
        requestWrapper('foppa-aws-runner', bucket, 'serverless/foppa/dev/1686654784726-2023-06-13T11%3A13%3A04.726Z/awsRunner.zip', runtime),
        requestWrapper('foppa-aws-returner', bucket, 'serverless/foppa/dev/1686654784726-2023-06-13T11%3A13%3A04.726Z/awsReturner.zip', runtime)])
}

interface UploadLambda {
    functionName: string,
    role: string,
    runtime: Runtime,
    code: FunctionCode,
    client: LambdaClient
}

const uploadLambda = async ({ functionName, role, runtime, code, client }: UploadLambda) => {
    const create_input: CreateFunctionCommandInput = {
        FunctionName: functionName,
        Role: role,
        Runtime: runtime,
        Code: code
    };
    return client.send(new CreateFunctionCommand(create_input))
}


export const main = middyfy(createFunction);
