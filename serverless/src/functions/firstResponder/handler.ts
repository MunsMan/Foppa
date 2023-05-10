import { SNSClient } from '@aws-sdk/client-sns';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { sendMessage } from '@libs/message-queue';
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL
const TOPIC = process.env.TOPIC
const REGION = process.env.REGION


const firstResponder: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
    const { username, functionId } = event.pathParameters
    const sns = new SNSClient({ region: REGION })
    const redis = createClient({ url: REDIS_URL });
    await redis.connect();

    let key = `eid:${username}/${functionId}`;
    let message: Record<string, unknown> = { error: "Something went wrong!" };

    let found_key = await redis.exists(key);
    if (found_key) {
        const executionId = await redis.incr(key)
        message = {
            username, functionId, executionId
        }
        console.log(message)
        const messageId = await sendMessage(sns, TOPIC, message)
        console.log(messageId)
    }

    await redis.disconnect();
    return formatJSONResponse(message);
};

export const main = firstResponder;
