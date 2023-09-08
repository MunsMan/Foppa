import axios from 'axios';
const SERVICE_URL = process.env.SERVICE_URL;

const awsReturner = async (event: any) => {
    console.log(event);
    const { uFunctionId, executionStart, executionId, pregion } = event.requestPayload.metadata;
    const executionEnd = Date.now();
    const response = await axios.post(`${SERVICE_URL}/return/${uFunctionId}`, {
        result: event.responsePayload,
        executionStart,
        executionEnd,
        executionId,
        pregion,
    });
    console.log(response);
};

export const main = awsReturner;
