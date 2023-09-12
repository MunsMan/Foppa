import { handlerPath } from '@libs/handler-resolver';
import variables from 'variables';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    timeout: 10,
    events: [
        {
            httpApi: {
                method: 'post',
                path: '/create/{username}',
            },
        },
    ],
    environment: {
        deploymentId: '${sls:instanceId}',
        CODE_BUCKET: variables.FOPPA_BUCKET_NAME,
    },
};
