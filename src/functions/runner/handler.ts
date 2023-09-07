import DynamoDB from '@libs/dynamodb';
import { toPRegion, toUFunctionId } from '@libs/parser';
import { appendLog } from '@libs/s3';
import type { SNSEvent } from 'aws-lambda';
import fetch from 'node-fetch'

const runner = async (event: SNSEvent) => {
    const { username, deployment, functionId, payload, executionId
    }: FunctionRunRequest = JSON.parse(event.Records[0].Sns.Message)
    console.log(event.Records[0].Sns)
    const db: DB = new DynamoDB();
    const pregion = toPRegion(deployment.provider, deployment.region);
    const uFunctionId = toUFunctionId(username, functionId);
    const dbResponse = await db.getValue('RegionRunnerURL', { uFunctionId, pregion });
    const currentRegionLoad = await db.incrValue('RegionExecutionCounter', { uFunctionId, pregion }, 'executionCounter')
    const response = await fetch(dbResponse.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            payload,
            functionName: dbResponse.functionName,
            uFunctionId,
            pregion,
            executionId
        })
    console.log(response);
    await appendLog('foppa-logs', { username, functionId, executionId }, 'runner', {
        url: dbResponse.url,
        status: response.status,
        currentRegionLoad,
    });
    return event;
};

export const main = runner;
