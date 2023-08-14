import { ApiGatewayV2Client, CreateApiCommand, ProtocolType } from "@aws-sdk/client-apigatewayv2";
import type { APIGatewayProxyEvent as AWSAPIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<AWSAPIGatewayProxyEvent, 'body'> & { body: FromSchema<S> }
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<ValidatedAPIGatewayProxyEvent<S>, APIGatewayProxyResult>
export type APIGatewayProxyEvent = Handler<AWSAPIGatewayProxyEvent, APIGatewayProxyResult>

export const formatJSONResponse = (response: { [key in string]: any }, statusCode: number = 200) => {
    return {
        statusCode,
        body: JSON.stringify(response)
    }
}


// Create and conntect API Gateway
//
// 1. Create Api Gateway
// 2. Create Api Route
// 3. Connetct to Lambda
// 4. (Optional) Add Auth 

export const setupApiGateway = async (apiClient: ApiGatewayV2Client, apiName: string) => {
    const api = await createApiGateway(apiClient, apiName)
}

const createApiGateway = async (apiClient: ApiGatewayV2Client, name: string, protocol: ProtocolType = 'HTTP') => {
    const response = await apiClient.send(new CreateApiCommand({ Name: name, ProtocolType: protocol }));
    console.log(response)
    return response
}

