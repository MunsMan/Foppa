import fetch from 'node-fetch';
const SERVICE_URL = process.env.SERVICE_URL;

const awsReturner = async (event: any) => {
    const { uFunctionId, executionStart, executionId, pregion } = event.requestPayload.metadata;
    const executionEnd = Date.now();
    const response = await fetch(`${SERVICE_URL}/return/${uFunctionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            result: event.responsePayload,
            executionStart,
            executionEnd,
            executionId,
            pregion,
        })
    })
    console.log(response)
};

export const main = awsReturner;
