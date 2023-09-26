import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import {
    AddPermissionCommand,
    CreateFunctionCommand,
    CreateFunctionCommandOutput,
    CreateFunctionUrlConfigCommand,
    DeleteFunctionCommand,
    GetFunctionCommand,
    GetFunctionCommandOutput,
    GetFunctionUrlConfigCommand,
    LambdaClient,
    PutFunctionEventInvokeConfigCommand,
    ResourceConflictException,
    ResourceNotFoundException,
} from '@aws-sdk/client-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import { getFileS3 } from './s3';
import { createHash } from 'crypto';
import { runtimes } from '@consts/aws';

export const AWS_RUNNER = 'foppa-aws-runner';
export const AWS_RETURNER = 'foppa-aws-returner';

export const middyfy = (handler: any, schema?: any) => {
    const lambda = middy(handler);
    if (schema) {
        lambda.use(jsonBodyParser());
        lambda.use(
            validator({
                eventSchema: transpileSchema({
                    type: 'object',
                    properties: {
                        body: schema,
                    },
                    required: ['body'],
                }),
            })
        );
    }
    lambda.use(httpErrorHandler());
    return lambda;
};

const deleteLambda = async (lambdaClient: LambdaClient, functionName: string) =>
    lambdaClient.send(
        new DeleteFunctionCommand({
            FunctionName: functionName,
        })
    );
const getLambda = async (lambdaClient: LambdaClient, functionName: string) =>
    lambdaClient.send(
        new GetFunctionCommand({
            FunctionName: functionName,
        })
    );

const createLambda = async (lambdaClient: LambdaClient, functionConfig: FunctionConfig) => {
    return await lambdaClient.send(
        new CreateFunctionCommand({
            FunctionName: functionConfig.functionName,
            Role: functionConfig.role,
            Code: {
                ZipFile: functionConfig.code,
            },
            Runtime: 'nodejs18.x',
            Handler: functionConfig.handler,
            PackageType: 'Zip',
            Environment: { Variables: functionConfig.env },
            Timeout: functionConfig.timeout ?? 10,
            MemorySize: functionConfig.memorySize ?? 128,
        })
    );
};

export const isCreateOutput = (
    response: CreateFunctionCommandOutput | GetFunctionCommandOutput
): response is CreateFunctionCommandOutput =>
    (response as CreateFunctionCommandOutput).FunctionArn !== undefined;

const hashCode = (code: Buffer) => {
    let hash = createHash('sha256').update(code).digest('base64url');
    hash = hash.replace('_', '/');
    hash += '=';
    return hash;
};

export const uploadLambda = async (lambdaClient: LambdaClient, functionConfig: FunctionConfig) => {
    const promise = new Promise<CreateFunctionCommandOutput | GetFunctionCommandOutput>(
        async (resolve, rejects) => {
            try {
                resolve(await createLambda(lambdaClient, functionConfig));
            } catch (error) {
                console.error('[ERROR] - createLambda: ' + error);
                if (error instanceof ResourceConflictException) {
                    const response = await getLambda(lambdaClient, functionConfig.functionName);
                    if (response.Configuration.CodeSha256 !== hashCode(functionConfig.code)) {
                        await deleteLambda(lambdaClient, functionConfig.functionName);
                        resolve(await createLambda(lambdaClient, functionConfig));
                    }
                    resolve(response);
                }
                rejects(error);
            }
        }
    );
    return promise;
};

export const uploadLambdaWrapper = async (
    lambdaClient: LambdaClient,
    role: string,
    bucket: string
) => {
    const handler = 'handler.main';
    const username = 'foppa';
    const s3Client = new S3Client({});
    const runtime: (typeof runtimes)[number] = 'nodejs18.x';
    const [code_runner, code_returner, env_runner, env_returner] = await Promise.all([
        getFileS3(s3Client, bucket, `upload/${username}/${AWS_RUNNER}.zip`),
        getFileS3(s3Client, bucket, `upload/${username}/${AWS_RETURNER}.zip`),
        getFileS3(s3Client, bucket, `upload/${username}/${AWS_RUNNER}.json`),
        getFileS3(s3Client, bucket, `upload/${username}/${AWS_RETURNER}.json`),
    ]);
    return Promise.allSettled([
        uploadLambda(lambdaClient, {
            functionName: AWS_RUNNER,
            role,
            handler,
            code: code_runner,
            env: JSON.parse(env_runner.toString()),
            runtime,
        }),
        uploadLambda(lambdaClient, {
            functionName: AWS_RETURNER,
            role,
            handler,
            code: code_returner,
            env: JSON.parse(env_returner.toString()),
            runtime,
        }),
    ]);
};

const createLambdaUrl = async (lambdaClient: LambdaClient, functionName: string) => {
    return lambdaClient.send(
        new CreateFunctionUrlConfigCommand({
            FunctionName: functionName,
            AuthType: 'NONE',
        })
    );
};

export const addLambdaReturnTrigger = async (
    lambdaClient: LambdaClient,
    functionArn: string,
    targetArn: string
) => {
    const destination = { Destination: targetArn };
    return lambdaClient.send(
        new PutFunctionEventInvokeConfigCommand({
            FunctionName: functionArn,
            DestinationConfig: {
                OnFailure: destination,
                OnSuccess: destination,
            },
        })
    );
};

export const getLambdaUrl = async (lambdaClient: LambdaClient, functionName: string) => {
    try {
        const response = await lambdaClient.send(
            new GetFunctionUrlConfigCommand({
                FunctionName: functionName,
            })
        );
        return response.FunctionUrl;
    } catch (error) {
        if (error instanceof ResourceNotFoundException) {
            return (await createLambdaUrl(lambdaClient, functionName)).FunctionUrl;
        }
    }
};

type PermissionPrincipal = 'apigateway.amazonaws.com';

export const addInvokePermission = async (
    lambdaClient: LambdaClient,
    lambdaArn: string,
    sourceArn: string,
    priciple: PermissionPrincipal = 'apigateway.amazonaws.com'
) => {
    lambdaClient.send(
        new AddPermissionCommand({
            Action: 'lambda:InvokeFunction',
            FunctionName: lambdaArn,
            Principal: priciple,
            SourceArn: sourceArn,
            StatementId: `Foppa-lambdaPermission-${Math.round(Math.random() * 1000)}`,
        })
    );
};
