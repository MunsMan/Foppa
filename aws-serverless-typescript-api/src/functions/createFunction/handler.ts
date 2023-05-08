import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { createClient } from 'redis';
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";



const createFunction: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
    const sns = new SNSClient({ region: 'us-east-1' })
    const redis = createClient({ url: "rediss://redis-cluster-0001-001.redis-cluster.b5z3ub.use1.cache.amazonaws.com:6379" });
    console.log(event)
    await redis.connect();
    let key = `eid:${username}/${functionId}`;
    redis.set(key, 0)
    await redis.disconnect();
    return formatJSONResponse({
        message: `Hello, you did something wrong!`,
    });
};

export const main = middyfy(createFunction);
