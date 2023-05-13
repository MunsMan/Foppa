import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { InvokeCommand, InvokeCommandInput, LambdaClient } from '@aws-sdk/client-lambda';
import schema from './schema';
import { middyfy } from '@libs/lambda';

const client = new LambdaClient({})

const awsRunner: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const encoder = new TextEncoder()
    const input: InvokeCommandInput = {
        FunctionName: event.body.functionName,
        Payload: encoder.encode(event.body.payload),
        InvocationType: 'Event'
    }
    const response = await client.send(new InvokeCommand(input));
    console.log(response)
    return formatJSONResponse(response)
};

export const main = middyfy(awsRunner);
