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
