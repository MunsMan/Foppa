import { appendLog } from '@libs/s3';
import type { SNSEvent } from 'aws-lambda';

const runRequest = async (event: SNSEvent) => {
    const { username, functionId, executionId, deployment, logs } = JSON.parse(
        event.Records[0].Sns.Message
    ) as FunctionRunRequest;
    const log = {
        deployment,
        logs,
    };
    return await appendLog('foppa-logs', { username, functionId, executionId }, 'scheduler', log);
};

export const main = runRequest;
