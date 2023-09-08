import { handlerPath } from '@libs/handler-resolver';
import variables from 'variables';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    environment: {
        SERVICE_URL: variables.SERVICE_URL,
    },
};
