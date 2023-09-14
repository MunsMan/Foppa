import type { Context, SNSEvent } from 'aws-lambda';
import { sendMessage } from '@libs/sns';
import DynamoDB from '@libs/dynamodb';
import { parsePRegion, toUFunctionId } from '@libs/parser';

const TOPIC = process.env.TOPIC;

const scheduler = async (event: SNSEvent, context: Context) => {
    const db: DB = new DynamoDB();
    const executionStart = Date.now();
    const input: OptimizationRequest = JSON.parse(event.Records[0].Sns.Message);
    const executionEnd = Date.now();
    const uFunctionId = toUFunctionId(input.username, input.functionId);

    const response = await Promise.all([
        db.getValues('RegionRunnerURL', { uFunctionId }),
        db.getValues('RegionExecutionCounter', { uFunctionId }),
    ]);
    const data = response[0]
        .map((value) => {
            const regionExecutionCounter = response[1].find(
                (a) => a.pregion === value.pregion
            ).executionCounter;
            return {
                ...value,
                regionExecutionCounter,
                regionCost: regionCost(regionExecutionCounter),
            };
        })
        .sort((a, b) => a.regionCost - b.regionCost);
    const [provider, region] = parsePRegion(data[0].pregion);
    const request: FunctionRunRequest = {
        ...input,
        deployment: {
            provider,
            region,
        },
        logs: { executionStart, executionEnd, requestId: context.awsRequestId, decisionLogs: data },
    };
    await sendMessage(TOPIC, request);
    return request;
};

const CONCURRENCY_PENELTY = 5;
const CONCURRENCY_LIMIT = 100;

const concurrencyCost = (x: number) =>
    (1 / Math.pow(CONCURRENCY_LIMIT, CONCURRENCY_PENELTY)) * Math.pow(x, CONCURRENCY_PENELTY);

const regionCost = (regionExecutionCouter: number) =>
    Math.random() * Math.pow(concurrencyCost(regionExecutionCouter), 5);

export const main = scheduler;
