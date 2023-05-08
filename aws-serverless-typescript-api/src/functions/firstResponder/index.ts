import { handlerPath } from '@libs/handler-resolver';

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
};
