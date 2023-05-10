import type { SNSEvent } from 'aws-lambda';
import { formatJSONResponse } from '@libs/api-gateway';

const scheduler = async (event: SNSEvent) => {
    console.log(event.Records)
    const request = event.Records[0]
    console.log(request)
    return formatJSONResponse(request);
};

export const main = scheduler;
