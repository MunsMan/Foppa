import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { createClient } from 'redis';
import { SNSClient } from '@aws-sdk/client-sns';



const firstResponder: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
    const sns = new SNSClient({ region: 'us-east-1' })
    const redis = createClient({ url: 'rediss://redis-cluster-0001-001.redis-cluster.b5z3ub.use1.cache.amazonaws.com:6379' });
    console.log(event)
    const { username, functionId } = event.pathParameters
    await redis.connect();
    let key = `eid:${username}/${functionId}`;
    let found_key = await redis.exists(key);
    await redis.disconnect();
    console.log(`Found Key: ${found_key}`)
    if (found_key) {
        console.log('Found Id')
        return formatJSONResponse({
            executionId: '123'
        })
    }
    return formatJSONResponse({
        message: `Hello, you did something wrong!`,
    });
};

export const main = firstResponder;
