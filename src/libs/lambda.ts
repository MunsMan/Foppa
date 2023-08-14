import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"
import httpErrorHandler from '@middy/http-error-handler'
import validator from '@middy/validator'
import { transpileSchema } from '@middy/validator/transpile'
import { CreateFunctionCommand, CreateFunctionUrlConfigCommand, DeleteFunctionCommand, GetFunctionUrlConfigCommand, LambdaClient, ResourceConflictException, ResourceNotFoundException } from '@aws-sdk/client-lambda';
import { S3Client } from "@aws-sdk/client-s3"
import { getZipFile } from "./s3"

export const AWS_RUNNER = 'foppa-aws-runner'
export const AWS_RETURNER = 'foppa-aws-returner'

export const middyfy = (handler: any, schema?: any) => {
    console.log({
        type: 'object',
        properties: {
            body: schema
        },
        required: ['body']
    })
    const lambda = middy(handler);
    lambda.use(jsonBodyParser())
    if (schema) {
        lambda.use(validator({
            eventSchema: transpileSchema({
                type: 'object',
                properties: {
                    body: schema
                },
                required: ['body']
            }
            )
        }))
    }
    lambda.use(httpErrorHandler())
    return lambda
}


const deleteLambda = async (lambdaClient: LambdaClient, functionName: string) => {
    lambdaClient.send(new DeleteFunctionCommand({
        FunctionName: functionName
    }))
}

const createLambda = async (lambdaClient: LambdaClient, functionName: string, role: string, handler: string, code: Buffer) => {
    return await lambdaClient.send(new CreateFunctionCommand({
        FunctionName: functionName,
        Role: role,
        Code: {
            ZipFile: code
        },
        Runtime: 'nodejs18.x',
        Handler: handler,
        PackageType: 'Zip'
    }))
}

export const uploadLambda = async (
    lambdaClient: LambdaClient,
    functionName: string,
    role: string,
    handler: string,
    code: Buffer
) => {
    try {
        return await createLambda(lambdaClient, functionName, role, handler, code);
    } catch (error) {
        console.error('[ERROR] - createLambda: ' + error)
        if (error instanceof ResourceConflictException) {
            await deleteLambda(lambdaClient, functionName);
            return await createLambda(lambdaClient, functionName, role, handler, code)
        }
        return error
    }
}

export const uploadLambdaWrapper = async (lambdaClient: LambdaClient, role: string, bucket: string) => {
    const handler = 'handler.main'
    const username = 'foppa'
    const s3Client = new S3Client({ region: 'us-east-1' })
    const code_runner = await getZipFile(s3Client, bucket, `upload/${username}/${AWS_RUNNER}.zip`)
    const code_returner = await getZipFile(s3Client, bucket, `upload/${username}/${AWS_RETURNER}.zip`)
    return Promise.all([
        uploadLambda(lambdaClient, AWS_RUNNER, role, handler, code_runner),
        uploadLambda(lambdaClient, AWS_RETURNER, role, handler, code_returner)
    ])
}

const createLambdaUrl = async (lambdaClient: LambdaClient, functionName: string) => {
    return lambdaClient.send(new CreateFunctionUrlConfigCommand({
        FunctionName: functionName,
        AuthType: 'NONE'
    }))
}

export const getLambdaUrl = async (lambdaClient: LambdaClient, functionName: string) => {
    try {

        const response = await lambdaClient.send(new GetFunctionUrlConfigCommand({
            FunctionName: functionName
        }))
        return response.FunctionUrl

    } catch (error) {
        if (error instanceof ResourceNotFoundException) {
            return (await createLambdaUrl(lambdaClient, functionName)).FunctionUrl
        }
    }
}
