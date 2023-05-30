import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { InvokeCommand, InvokeCommandInput, LambdaClient } from '@aws-sdk/client-lambda';
import schema from './schema';
import { middyfy } from '@libs/lambda';


const client = new LambdaClient({})

const awsRunner: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const encoder = new TextEncoder()
    const payload = {
        body: event.body.payload,
        headers: {},
        metadata: {
            uFunctionId: event.body.uFunctionId,
            executionId: event.body.executionId,
            pregion: event.body.pregion
        }
    }
    const input: InvokeCommandInput = {
        FunctionName: event.body.functionName,
        Payload: encoder.encode(JSON.stringify(payload)),
        InvocationType: 'Event',
    }
    const response = await client.send(new InvokeCommand(input));
    return formatJSONResponse(response)
};

export const main = middyfy(awsRunner);
