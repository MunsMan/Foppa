import middy from "@middy/core"
import middyJsonBodyParser from "@middy/http-json-body-parser"
import { CreateFunctionCommand, DeleteFunctionCommand, LambdaClient, ResourceConflictException } from '@aws-sdk/client-lambda';

const FOPPA_BUCKET_NAME = process.env.FOPPA_BUCKET_NAME

export const middyfy = (handler: any) => {
    return middy(handler).use(middyJsonBodyParser())
}


const deleteLambda = async (lambdaClient: LambdaClient, functionName: string) => {
    lambdaClient.send(new DeleteFunctionCommand({
        FunctionName: functionName
    }))
}

const createLambda = async (lambdaClient: LambdaClient, functionName: string, role: string, username: string, bucket_name?: string) => {
    await lambdaClient.send(new CreateFunctionCommand({
        FunctionName: functionName,
        Role: role,
        Code: {
            S3Bucket: bucket_name ? bucket_name : FOPPA_BUCKET_NAME,
            S3Key: `upload/${username}/${functionName}.zip`
        },
        Runtime: 'nodejs18.x',
        Handler: 'test.handler',
        PackageType: 'Zip'
    }))
}

export const uploadLambda = async (lambdaClient: LambdaClient, functionName: string, role: string, username: string) => {
    try {
        await createLambda(lambdaClient, functionName, role, username);
    } catch (error) {
        if (error instanceof ResourceConflictException) {
            await deleteLambda(lambdaClient, username);
            await createLambda(lambdaClient, functionName, role, username)
        }
    }
}

export const uploadLambdaWrapper = async (lambdaClient: LambdaClient, role: string) => {
    const username = 'foppa'
    return Promise.all([
        uploadLambda(lambdaClient, 'foppa-aws-runner', role, username),
        uploadLambda(lambdaClient, 'foppa-aws-returner', role, username)
    ])
}
