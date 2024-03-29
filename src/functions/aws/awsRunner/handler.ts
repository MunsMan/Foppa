import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { InvokeCommand, InvokeCommandInput, LambdaClient } from '@aws-sdk/client-lambda';
import schema from './schema';
import { middyfy } from '@libs/lambda';

const client = new LambdaClient({});

const awsRunner: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event, context) => {
    const encoder = new TextEncoder();
    const payload = {
        body: event.body.payload,
        headers: {},
        metadata: {
            functionName: event.body.functionName,
            uFunctionId: event.body.uFunctionId,
            executionId: event.body.executionId,
            pregion: event.body.pregion,
            executionStart: Date.now(),
            runnerRequestId: context.awsRequestId,
        },
    };
    const input: InvokeCommandInput = {
        FunctionName: event.body.functionName,
        Payload: encoder.encode(JSON.stringify(payload)),
        InvocationType: 'Event',
    };
    await client.send(new InvokeCommand(input));
    return formatJSONResponse({});
};

export const main = middyfy(awsRunner, schema);
