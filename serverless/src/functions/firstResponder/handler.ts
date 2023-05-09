import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL

const firstResponder: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
    const { username, functionId } = event.pathParameters
    const redis = createClient({ url: REDIS_URL });
    await redis.connect();
    let key = `eid:${username}/${functionId}`;
    let found_key = await redis.exists(key);
    let message: Record<string, unknown> = { error: "Something went wrong!" };
    if (found_key) {
        const executionId = await redis.incr(key)
        message = {
            username, functionId, executionId
        }
        console.log(message)
    }

    await redis.disconnect();
    return formatJSONResponse(message);
};

export const main = firstResponder;
