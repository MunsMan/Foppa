import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { createClient } from 'redis';
import schema from './schema'

const REDIS_URL = process.env.REDIS_URL

const createFunction: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const redis = createClient({ url: REDIS_URL });
    const username = event.pathParameters.username;
    const functionId = event.body.functionId
    await redis.connect();
    let key = `eid:${username}/${functionId}`;
    if ((await redis.exists(key))) {
        await redis.disconnect();
        return formatJSONResponse({
            message: 'Function already exists',
        })
    }
    await redis.set(key, 0)
    await redis.disconnect();
    return formatJSONResponse({
        message: 'Function created',
    });
};

export const main = middyfy(createFunction);
