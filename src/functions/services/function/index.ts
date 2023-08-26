import { handlerPath } from '@libs/handler-resolver';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            httpApi: {
                method: 'get',
                path: '/function/{username}/{functionId}',
            },
        },
        {
            httpApi: {
                method: 'get',
                path: '/function/{username}',
            },
        },
    ],
    environment: {},
};
