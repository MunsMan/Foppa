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
    destinations: {
        onSuccess: variables.TOPIC_ARN
    },
    environment:
    {
        REDIS_URL: variables.REDIS_URL,
    }
};
