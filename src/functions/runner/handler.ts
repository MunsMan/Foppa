import { getValue } from '@libs/dynamodb';
import type { FunctionRunRequest } from '@ptypes/sns';
import type { SNSEvent } from 'aws-lambda';
import fetch from 'node-fetch'

const runner = async (event: SNSEvent) => {
    const input: FunctionRunRequest = JSON.parse(event.Records[0].Sns.Message)
    const dbResponse = await getValue<RegionRunnerUrlValue>('RegionRunnerURL', { uFunctionId: `${input.username}`, pregion: `${input.deployment.provider}-${input.deployment.region}` })
    if (input.body) {
        await fetch(dbResponse.url, {
            method: 'POST',
            body: input.body
        })
    } else {
        await fetch(dbResponse.url)
    }
    return input;
};

export const main = runner;
