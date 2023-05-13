import { getValue } from '@libs/dynamodb';
import type { FunctionRunRequest } from '@ptypes/sns';
import type { SNSEvent } from 'aws-lambda';
import fetch from 'node-fetch'

const runner = async (event: SNSEvent) => {
    const input: FunctionRunRequest = JSON.parse(event.Records[0].Sns.Message)
    const dbResponse = await getValue<RegionRunnerUrlValue>('RegionRunnerURL', { username: `${input.username}`, pregion: `${input.deployment.provider}-${input.deployment.region}` })
    console.log(input)
    const response = await fetch(dbResponse.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            payload: input.payload,
            functionName: dbResponse.functionName
        })
    })
    console.log(response)
    return input;
};

export const main = runner;
