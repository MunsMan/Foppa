import { handlerPath } from '@libs/handler-resolver';
import variables from 'variables';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    timeout: 10,
    environment: {
        PRIVATE_KEY: variables.PRIVATE_KEY,
    },
};
