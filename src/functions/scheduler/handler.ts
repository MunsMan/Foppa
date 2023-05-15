import type { SNSEvent } from 'aws-lambda';
import { sendMessage } from '@libs/message-queue';
import type { FunctionRunRequest, OptimizationRequest } from '@ptypes/sns';

const TOPIC = process.env.TOPIC;

const scheduler = async (event: SNSEvent) => {
    const input: OptimizationRequest = JSON.parse(event.Records[0].Sns.Message)
    const request: FunctionRunRequest = {
        ...input, deployment: {
            provider: 'aws',
            region: 'us-east-1'
        }
    }
    await sendMessage(TOPIC, request)
    return request;
};

export const main = scheduler;
