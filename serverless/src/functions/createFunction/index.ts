import { handlerPath } from '@libs/handler-resolver';
import variables from './../../../variables';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            httpApi: {
                method: 'post',
                path: '/create/{username}',
            },
        },
    ],
    environment:
    {
        REDIS_URL: variables.REDIS_URL,
    }
};
