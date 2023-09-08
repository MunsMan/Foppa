import { getExecutionLog } from '@libs/cloudwatch';
import axios from 'axios';
const SERVICE_URL = process.env.SERVICE_URL;

const awsReturner = async (event: any) => {
    const { uFunctionId, executionStart, executionId, pregion, functionName } =
        event.requestPayload.metadata;
    const executionEnd = Date.now();
    const userFunctionLogs = await getExecutionLog(
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
    });
};

export const main = awsReturner;
