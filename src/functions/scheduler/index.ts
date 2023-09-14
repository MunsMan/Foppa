import { handlerPath } from '@libs/handler-resolver';
import variables from 'variables';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [{ sns: { arn: variables.OPTIMIZATION_REQUEST_TOPIC_ARN } }],
    environment: {
        TOPIC: variables.RUN_REQUEST_TOPIC_ARN,
    },
};
