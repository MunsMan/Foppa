import { getValue, incrValue } from '@libs/dynamodb';
import { toPRegion, toUFunctionId } from '@libs/parser';
import { appendLog } from '@libs/s3';
import type { SNSEvent } from 'aws-lambda';
import fetch from 'node-fetch'

const runner = async (event: SNSEvent) => {
    const { username, deployment, functionId, payload, executionId
    }: FunctionRunRequest = JSON.parse(event.Records[0].Sns.Message)
    console.log(event.Records[0].Sns)
    const pregion = toPRegion(deployment.provider, deployment.region);
    const uFunctionId = toUFunctionId(username, functionId);
    const dbResponse = await getValue<RegionRunnerUrlValue>('RegionRunnerURL', { uFunctionId, pregion });
    const currentRegionLoad = await incrValue('RegionExecutionCounter', { uFunctionId, pregion }, 'executionCounter')
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
    });
    console.log(response)
    await appendLog(
        'foppa-logs',
        { username, functionId, executionId },
        'executionTrigger',
        {
            url: response.url,
            status: response.status,
            currentRegionLoad
        }
    )
    return event;
};

export const main = runner;
