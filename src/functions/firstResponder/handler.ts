import type { APIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import DynamoDB from '@libs/dynamodb';
import { sendMessage } from '@libs/sns';

const TOPIC = process.env.TOPIC;

const firstResponder: APIGatewayProxyEvent = async (event) => {
    console.log(event);
    const executionStart = Date.now();
    const db: DB = new DynamoDB();
    const { username, functionId } = event.pathParameters;

    const entry = await db.getValue('FunctionExecutionCounter', { username, functionId });
    if ('executionCounter' in entry) {
        const executionId = await db.incrValue(
            'FunctionExecutionCounter',
            { username, functionId },
            'executionCounter'
        );
        const executionEnd = Date.now();
        const message: OptimizationRequest = {
            username,
            functionId,
            executionId: executionId.toString(),
            payload: event.body,
            logs: {
                user: {
                    requestId: event.requestContext?.requestId,
                    accoundId: event.requestContext?.accountId,
                    ip: (event.requestContext as any)?.http.sourceIp,
                    method: (event.requestContext as any)?.http.method,
                },
                executionStart,
                executionEnd,
                body: event.body ? true : false,
            },
        };
        await sendMessage(TOPIC, message);
        return formatJSONResponse({ username, functionId, executionId });
    }
    return formatJSONResponse({ error: 'Unkown User or Function' }, 400);
};

export const main = firstResponder;
