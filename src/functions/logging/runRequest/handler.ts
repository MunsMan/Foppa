import { putLog } from '@libs/s3';
import type { SNSEvent } from 'aws-lambda';

const runRequest = async (event: SNSEvent) => {
    const { username, functionId, executionId, deployment, logs } = JSON.parse(
        event.Records[0].Sns.Message
    ) as FunctionRunRequest;
    const log = {
        deployment,
        logs: {
            executionStart: logs.executionStart,
            executionEnd: logs.executionEnd,
            requestId: logs.requestId,
        },
        decisionLogs: logs.decisionLogs,
    };
    return await putLog(
        'foppa-logs',
        { username, functionId, executionId, event: 'scheduler' },
        log
    );
};

export const main = runRequest;
