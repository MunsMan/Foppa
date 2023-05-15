import type { APIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { getValue, incrValue } from '@libs/dynamodb';
import { sendMessage } from '@libs/message-queue';
import type { OptimizationRequest } from '@ptypes/sns';

const TOPIC = process.env.TOPIC

const firstResponder: APIGatewayProxyEvent = async (event) => {
    const { username, functionId } = event.pathParameters

    const entry = await getValue<FunctionExecutionCounterValue>('FunctionExecutionCounter', { username, functionId })
    if (entry.executionCounter) {
        const executionId = await incrValue('FunctionExecutionCounter', { username, functionId }, 'executionCounter')
        const message: OptimizationRequest = {
            username, functionId, executionId, payload: event.body
        }
        await sendMessage(TOPIC, message)
        return formatJSONResponse(message);
    }
    return formatJSONResponse({ error: "Unkown User or Function" }, 400);
};

export const main = firstResponder;
