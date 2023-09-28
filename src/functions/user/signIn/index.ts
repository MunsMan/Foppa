import { handlerPath } from '@libs/handler-resolver';
import variables from 'variables';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            httpApi: {
                method: 'post',
                path: '/signin',
            },
        },
    ],
    environment: {
        PRIVATE_KEY: variables.PRIVATE_KEY
    },
};
