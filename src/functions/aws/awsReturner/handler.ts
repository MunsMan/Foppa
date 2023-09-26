import { Context } from 'aws-lambda';
import axios from 'axios';
const SERVICE_URL = process.env.SERVICE_URL;

const awsReturner = async (event: any, context: Context) => {
    const { uFunctionId, executionStart, executionId, pregion, runnerRequestId } =
        event.requestPayload.metadata;
    const executionEnd = Date.now();
    await axios.post(`${SERVICE_URL}/return/${uFunctionId}`, {
        result: JSON.stringify(event.responsePayload),
        executionStart,
        executionEnd,
        executionId,
        pregion,
        runnerRequestId,
        returnerRequestId: context.awsRequestId,
        userFunctionRequestId: event.requestContext.requestId,
    });
};

export const main = awsReturner;
