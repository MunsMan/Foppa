import { putLog } from '@libs/s3';
import type { SNSEvent } from 'aws-lambda';

const optimizationRequest = async (event: SNSEvent) => {
    const { username, functionId, executionId, logs } = JSON.parse(
        event.Records[0].Sns.Message
    ) as OptimizationRequest;
    const { executionStart, executionEnd, body } = logs;
    const log = {
        username,
        functionId,
        executionId,
        body,
        firstResponder: {
            logs: {
                executionStart,
                executionEnd,
            },
            user: logs.user,
        },
    };
    return await putLog('foppa-logs', { username, functionId, executionId }, log);
};

export const main = optimizationRequest;
