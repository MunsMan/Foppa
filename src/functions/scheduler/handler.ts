import type { SNSEvent } from 'aws-lambda';
import { sendMessage } from '@libs/sns';
import { queryValues } from '@libs/dynamodb';
import { parsePRegion, toUFunctionId } from '@libs/parser';

const TOPIC = process.env.TOPIC;

const scheduler = async (event: SNSEvent) => {
    const executionStart = Date.now();
    const input: OptimizationRequest = JSON.parse(event.Records[0].Sns.Message);
    const executionEnd = Date.now();
    const uFunctionId = toUFunctionId(input.username, input.functionId)
    const response = await queryValues<RegionRunnerUrlValue>('RegionRunnerURL', { uFunctionId })
    const pRegions = response.map((item) => (parsePRegion(item.pregion)))
    const [provider, region] = pRegions[Math.floor(Math.random() * pRegions.length)]
    const request: FunctionRunRequest = {
        ...input, deployment: {
            provider: provider,
            region: region
        },
        logs: { executionStart, executionEnd }
    };
    await sendMessage(TOPIC, request)
    return request;
};

export const main = scheduler;
