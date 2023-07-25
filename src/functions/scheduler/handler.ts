import type { SNSEvent } from 'aws-lambda';
import { sendMessage } from '@libs/sns';

const TOPIC = process.env.TOPIC;

const scheduler = async (event: SNSEvent) => {
    const executionStart = Date.now();
    const input: OptimizationRequest = JSON.parse(event.Records[0].Sns.Message);
    const executionEnd = Date.now();
    const request: FunctionRunRequest = {
        ...input, deployment: {
            provider: 'aws',
            region: 'us-east-1'
        },
        logs: { executionStart, executionEnd }
    };
    await sendMessage(TOPIC, request)
    return request;
};

export const main = scheduler;
