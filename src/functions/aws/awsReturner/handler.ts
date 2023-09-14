import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { getExecutionLog } from '@libs/cloudwatch';
import { Context } from 'aws-lambda';
import axios from 'axios';
const SERVICE_URL = process.env.SERVICE_URL;

const awsReturner = async (event: any, context: Context) => {
    const { uFunctionId, executionStart, executionId, pregion, functionName, runnerRequestId } =
        event.requestPayload.metadata;
    const executionEnd = Date.now();
    const userFunctionLogs = await getExecutionLog(
        new CloudWatchLogsClient({}),
        functionName,
        event.requestContext.requestId,
        executionStart
    );
    await axios.post(`${SERVICE_URL}/return/${uFunctionId}`, {
        result: event.responsePayload,
        executionStart,
        executionEnd,
        executionId,
        pregion,
        userFunctionLogs,
        runnerRequestId,
        returnerRequestId: context.awsRequestId,
        userFunctionRequestId: event.requestContext.requestId,
    });
};

export const main = awsReturner;
