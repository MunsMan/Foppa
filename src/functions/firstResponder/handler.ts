import type { APIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { getValue, incrValue } from '@libs/dynamodb';
import { sendMessage } from '@libs/sns';

const TOPIC = process.env.TOPIC

const firstResponder: APIGatewayProxyEvent = async (event) => {
    const executionStart = Date.now();
    const { username, functionId } = event.pathParameters

    const entry = await getValue<FunctionExecutionCounterValue>('FunctionExecutionCounter', { username, functionId })
    if (entry.executionCounter) {
        const executionId = await incrValue('FunctionExecutionCounter', { username, functionId }, 'executionCounter')
        const executionEnd = Date.now();
        const message: OptimizationRequest = {
            username, functionId, executionId, payload: event.body, logs: {
                executionStart, executionEnd, body: event.body ? true : false
            }
        }
        await sendMessage(TOPIC, message)
        return formatJSONResponse({ username, functionId, executionId });
    }
    return formatJSONResponse({ error: "Unkown User or Function" }, 400);
};

export const main = firstResponder;
