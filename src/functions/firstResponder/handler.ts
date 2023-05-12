import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { getValue, incrValue } from '@libs/dynamodb';
import { sendMessage } from '@libs/message-queue';

const TOPIC = process.env.TOPIC

const firstResponder: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
    const { username, functionId } = event.pathParameters

    const entry = await getValue('FunctionExecutionCounter', { username, functionId })
    if (entry.Item) {
        const executionId = await incrValue('FunctionExecutionCounter', { username, functionId }, 'executionCounter')
        const message = {
            username, functionId, executionId
        }
        await sendMessage(TOPIC, message)
        return formatJSONResponse(message);
    }
    return formatJSONResponse({ error: "Unkown User or Function" }, 400);
};

export const main = firstResponder;
