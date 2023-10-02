import { Region } from '@consts/aws';
import { sleep, resolveObject } from '@libs/utils';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import variables from 'variables';

const BACKEND_URL = variables.SERVICE_URL;
const FUNCTION_URL =
    'https://kjhymqxiap7esobe6ukrwzbfby0qgixo.lambda-url.eu-central-1.on.aws/';
const FUNCTION_NAME = 'not-foppa-fib-test';
const REGION = 'eu-central-1';
const LOG_PREFIX = 'singleRegion';
let TEST_ID = randomUUID();
// @ts-ignore
let CONCURRENT_REQUESTS = 300;
const FIB_N = 40;

const triggerFunction = async (
    payload?: object
): Promise<CloudWatchRequest> => {
    const executionStart = Date.now();
    const response = await axios.post(FUNCTION_URL, payload, {
        headers: { 'Content-Type': 'application/json' },
    });
    return {
        functionName: FUNCTION_NAME,
        executionStart,
        region: REGION,
        requestId: response.data.requestId,
    };
};

// @ts-ignore
const triggerWorkflow = async (requestAmount: number) => {
    const requests = Array(requestAmount).fill(1);
    const responses = await Promise.allSettled(
        requests.map(() => triggerFunction({ n: FIB_N }))
    );
    const status = responses.reduce<{
        success: number;
        failed: number;
        data: CloudWatchRequest[];
    }>(
        (prev, cur) => {
            if (cur.status === 'fulfilled') {
                prev.success++;
                prev.data.push(cur.value);
            } else {
                console.log(cur.reason);
                prev.failed++;
            }
            return prev;
        },
        { success: 0, failed: 0, data: [] }
    );
    return status;
};

// @ts-ignore
const saveData = async (outputData: any, name: string) => {
    const dir = `test/${TEST_ID}`;
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    await writeFile(
        `${dir}/${LOG_PREFIX}-${name}.json`,
        JSON.stringify(outputData),
        {
            flag: 'wx',
        }
    );
};

interface CloudWatchRequest {
    functionName: string;
    executionStart: number;
    region: Region;
    requestId: string;
}
type CloudWatchResponse = {
    requests: CloudWatchRequest[];
    response: LogWatcherResponse;
};

const pullLog = async (
    functionName: string,
    requestIds: string[],
    region: Region,
    executionStart: number
) => {
    await sleep(Math.random() * 10000);
    return axios.post<LogWatcherResponse>(`${BACKEND_URL}/logs`, {
        functionName,
        requestIds,
        region,
        executionStart,
    });
};

const mapFunctionNames = {
    firstResponder: 'foppa-dev-firstResponder',
    scheduler: 'foppa-dev-scheduler',
    runner: 'foppa-dev-runner',
    returner: 'foppa-dev-returner',
    awsRunner: 'foppa-aws-runner',
    awsReturner: 'foppa-aws-returner',
};

type PromiseObject = {
    [K in string]: Promise<{
        [R in string]: CloudWatchResponse;
    }>;
};

const pullFoppaRuntimeLogs = async (requests: CloudWatchRequest[]) => {
    const batches = requests.reduce<Map<string, CloudWatchRequest[]>>(
        (res, value) => {
            let batch: CloudWatchRequest[] = [];
            if (res.has(value.functionName)) {
                batch = res.get(value.functionName);
            }
            batch.push(value);
            res.set(value.functionName, batch);
            return res;
        },
        new Map()
    );
    const promises: PromiseObject = {};
    for (const [key, batch] of batches.entries()) {
        interface ReduceSet {
            region: Region;
            functionName: string;
            executionStart: number;
            requestIds: string[];
        }
        const regionRequests = batch
            .reduce<ReduceSet[]>((res, value) => {
                const entry = res.find((a) => a.region === value.region);
                if (entry) {
                    entry.requestIds.push(value.requestId);
                    if (entry.executionStart > value.executionStart) {
                        entry.executionStart = value.executionStart;
                    }
                    return res;
                }
                res.push({
                    region: value.region,
                    functionName: value.functionName,
                    executionStart: value.executionStart,
                    requestIds: [value.requestId],
                });
                return res;
            }, [])
            .map((request) => {
                const startTime = new Date(request.executionStart);
                startTime.setMinutes(startTime.getMinutes() - 3);
                request.executionStart = startTime.getTime();
                return request;
            });
        const regionPromise: { [R in string]: Promise<CloudWatchResponse> } =
            {};
        regionRequests.forEach((request) => {
            const promise = new Promise<CloudWatchResponse>((resolve) => {
                pullLog(
                    mapFunctionNames[request.functionName] ??
                        request.functionName,
                    request.requestIds,
                    request.region,
                    request.executionStart
                ).then((res) => {
                    resolve({
                        requests: batch,
                        response: res.data,
                    });
                });
            });
            regionPromise[request.region] = promise;
            promises[key] = resolveObject(regionPromise);
        });
    }
    return resolveObject(promises);
};

// @ts-ignore
const main = async () => {
    const startTime = Date.now();
    const status = await triggerWorkflow(CONCURRENT_REQUESTS);
    console.log(`${CONCURRENT_REQUESTS} Requests are triggered 🚀`);
    console.log(
        `Successrate: ${status.success / CONCURRENT_REQUESTS} with ${
            status.success
        } ✅ and ${status.failed} ❌`
    );
    saveData({ startTime, c: CONCURRENT_REQUESTS, n: FIB_N }, 'notes');
    saveData(status, 'statusLogs');
    await sleep(60000);
    const outputData: CloudWatchRequest[] = status.data.map((value) => value);
    // const outputData: StatusResponse[] = JSON.parse((await readFile('foppaLogs.json')).toString());
    const cloudwatchlogs = await pullFoppaRuntimeLogs(outputData);
    const logData = Object.entries(cloudwatchlogs).map(
        ([key, regionObjects]) => {
            const regions = Object.entries(regionObjects).map<{
                region: string;
                durations: number[];
                averageDuration: number;
            }>(([region, value]) => {
                const reports = value.response.logs.filter((log) =>
                    log.message.includes('REPORT')
                );
                const starts = value.response.logs.filter((log) =>
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
                return {
                    region,
                    durations,
                    averageDuration:
                        durations.reduce((res, value) => res + value, 0) /
                        durations.length,
                    executionStarts,
                };
            });
            const durations = regions.map((region) => region.durations).flat();
            return {
                functionName: key,
                durations,
                averageDuration:
                    durations.reduce((res, value) => res + value, 0) /
                    durations.length,
                regions,
            };
        }
    );
    await saveData(logData, 'executionLogs');
    console.log('Done 🥳🎉\nLogs are saved to disk 💾');
};

const task = async () => {
    const range = [1, 5, 10, 50, 100, 200, 300, 500];
    for (let i = 0; i < range.length; i++) {
        TEST_ID = randomUUID();
        CONCURRENT_REQUESTS = range[i];
        await main();
    }
};

task();
