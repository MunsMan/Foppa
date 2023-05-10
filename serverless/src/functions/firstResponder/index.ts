import { handlerPath } from '@libs/handler-resolver';
import variables from 'variables';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            httpApi: {
                method: 'post',
                path: '/run/{username}/{functionId}',
            },
        },
        {
            httpApi: {
                method: 'get',
                path: '/run/{username}/{functionId}',
            },
        },
    ],
    environment:
    {
        REDIS_URL: variables.REDIS_URL,
        REGION: variables.REGION,
        TOPIC: variables.OPTIMIZATION_REQUEST_TOPIC_ARN
    }
};
