import type { SNSEvent } from 'aws-lambda';
import { formatJSONResponse } from '@libs/api-gateway';

const scheduler = async (event: SNSEvent) => {
    const request = JSON.parse(event.Records[0].Sns.Message)
    return formatJSONResponse(request);
};

export const main = scheduler;
