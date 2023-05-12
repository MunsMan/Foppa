import type { SNSEvent } from 'aws-lambda';
import { sendMessage } from '@libs/message-queue';

const TOPIC = process.env.TOPIC;

const scheduler = async (event: SNSEvent) => {
    const request = JSON.parse(event.Records[0].Sns.Message)
    request.deployment = {
        provider: 'aws',
        region: 'us-east-1'
    }
    await sendMessage(TOPIC, request)
    return request;
};

export const main = scheduler;
