import { putLog } from '@libs/s3';
import type { SNSEvent } from 'aws-lambda';

const optimizationRequest = async (event: SNSEvent) => {
    const { username, functionId, executionId, logs } = JSON.parse(
        event.Records[0].Sns.Message
    ) as OptimizationRequest;
    const { executionStart, executionEnd, body, requestId } = logs;
    const log: LogObject = {
        username,
        functionId,
        executionId,
        body,
        firstResponder: {
            logs: {
                requestId,
                executionStart,
                executionEnd,
            },
            user: logs.user,
        },
    };
    return await putLog(
        'foppa-logs',
        { username, functionId, executionId, event: 'firstResponder' },
        log
    );
};

export const main = optimizationRequest;
