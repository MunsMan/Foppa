import { parsePRegion } from '@libs/parser';
import { isFulfilled, sleep } from '@libs/utils';
import type { AxiosHeaders } from 'axios';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { pullCloudLogs, pullFoppaLogs, triggerFunction } from '../api';

const USERNAME = 'munsman';
const FUNCTION_ID = '4';
const TEST_ID = randomUUID();
const FIB_N = 40;

const workflow = async (username: string, functionId: string) => {
    const payload = await triggerFunction(username, functionId, { n: FIB_N });
    await sleep(20000);
    const foppaLogs = await pullTillFinished(
        username,
        functionId,
        payload.data.executionId.toString()
    );
    if (!foppaLogs) {
        return;
    }
    const functionName = foppaLogs.logs.scheduler.decisionLogs.filter(
        (log) => log.pregion === foppaLogs.logs.returner.awsWrapper.pregion
    )[0].functionName;
    const requestIds = {
        'foppa-dev-firstResponder': {
            requestId: foppaLogs.logs.firstResponder.logs.requestId,
            region: 'eu-central-1',
        },
        'foppa-dev-scheduler': {
            requestId: foppaLogs.logs.scheduler.logs.requestId,
            region: 'eu-central-1',
        },
        'foppa-dev-runner': {
            requestId: foppaLogs.logs.runner.logs.requestId,
            region: 'eu-central-1',
        },
        'foppa-dev-returner': {
            requestId: foppaLogs.logs.returner.logs.requestId,
            region: 'eu-central-1',
        },
        'foppa-aws-runner': {
            requestId: foppaLogs.logs.returner.awsWrapper.runnerRequestId,
            region: parsePRegion(foppaLogs.logs.returner.awsWrapper.pregion)[1],
        },
        'foppa-aws-returner': {
            requestId: foppaLogs.logs.returner.awsWrapper.returnerRequestId,
            region: parsePRegion(foppaLogs.logs.returner.awsWrapper.pregion)[1],
        },
        [functionName]: {
            requestId: foppaLogs.logs.returner.userFunctionRequestId,
            region: parsePRegion(foppaLogs.logs.returner.awsWrapper.pregion)[1],
        },
    };
    return requestIds;
};

const pullTillFinished = async (
    username: string,
    functionId: string,
    executionId: string,
    headers?: AxiosHeaders
): Promise<StatusResponse | undefined> => {
    for (let i = 0; i < 30; i++) {
        const response = await pullFoppaLogs(
            username,
            functionId,
            executionId,
            headers
        );
        await sleep(400);
        if (response.data.status === 'returner') {
            return response.data;
        }
    }
    return undefined;
};

const concurrentWorkflows = async (
    username: string,
    functionId: string,
    n: number
) => {
    const buffer = Array(n).fill(1);
    const executionStart = Date.now();
    const settledRequests = await Promise.allSettled(
        buffer.map(() => workflow(username, functionId))
    );
    const requests = settledRequests
        .filter(isFulfilled)
        .map((x) => x.value)
        .filter((x) => x)
        .reduce<{
            [key: string]: { [key: string]: string[] };
        }>((res, value) => {
            Object.entries(value).map(([key, value]) => {
                if (!res[key]) {
                    res[key] = {};
                }
                if (res[key][value.region]) {
                    res[key][value.region].push(value.requestId);
                } else {
                    res[key][value.region] = [value.requestId];
                }
            });
            return res;
        }, {});

    const cloudLogs: {
        functionName: string;
        region: string;
        logs: LogWatcherResponse;
    }[] = (
        await Promise.all(
            Object.entries(requests).map(async ([functionName, value]) => {
                return Promise.all(
                    Object.entries(value).map(async ([region, requestIds]) => {
                        return {
                            functionName,
                            region,
                            logs: await pullCloudLogs(
                                functionName,
                                requestIds,
                                region,
                                executionStart
                            ),
                        };
                    })
                );
            })
        )
    ).flat();
    type Result = {
        functionName: string;
        durations: number[];
        averageDuration: number;
        regions: {
            region: string;
            durations: number[];
            averageDuration: number;
            executionStarts: number[];
        }[];
    }[];

    sleep(60000);

    const result: Result = cloudLogs.reduce<Result>((result, value) => {
        value.logs.logs;
        const item = result.find((x) => {
            x.functionName === value.functionName;
        });
        const reports = value.logs.logs.filter((log) =>
            log.message.includes('REPORT')
        );
        const starts = value.logs.logs.filter((log) =>
            log.message.includes('START')
        );
        const durations = reports.map((report) =>
            Number(
                report.message
                    .split('\t')
                    .filter((text) => text.includes('Duration'))[0]
                    .split(' ')[1]
            )
        );
        const executionStarts = starts.map((start) => start.timestamp);
        if (item) {
            item.durations.concat(durations);
            item.regions.push({
                region: value.region,
                durations,
                averageDuration:
                    durations.reduce((res, value) => res + value, 0) /
                    durations.length,
                executionStarts,
            });
        } else {
            result.push({
                functionName: value.functionName,
                durations: durations,
                averageDuration: 0,
                regions: [
                    {
                        region: value.region,
                        durations,
                        averageDuration:
                            durations.reduce((res, value) => res + value, 0) /
                            durations.length,
                        executionStarts,
                    },
                ],
            });
        }
        return result;
    }, []);

    result.forEach((x) => {
        x.averageDuration =
            x.durations.reduce((res, value) => res + value, 0) /
            x.durations.length;
    });
    return result;
};

const saveData = async (outputData: any, name: string) => {
    const dir = `test/executionPipeline/${TEST_ID}`;
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    await writeFile(
        `test/executionPipeline/${TEST_ID}/${name}.json`,
        JSON.stringify(outputData)
    );
};

const main = async () => {
    console.log('Cold Start 🧊');
    const results = await concurrentWorkflows(USERNAME, FUNCTION_ID, 1);
    await saveData(results, 'coldStart');
    const steps = [1, 5, 10, 50, 100, 200, 300, 500];
    for (let i = 0; i < steps.length; i++) {
        console.log(`Warm Start - ${steps[i]} started 🚀`);
        const results = await concurrentWorkflows(
            USERNAME,
            FUNCTION_ID,
            steps[i]
        );
        await saveData(results, `warmStart-${steps[i]}`);
        console.log(`Warm Start - ${steps[i]} saved 💾`);
        sleep(30000);
    }
};

main();
