import { Region } from '@consts/aws';
import { sleep, resolveObject } from '@libs/utils';
import axios from 'axios';
import { writeFile } from 'fs/promises';
import variables from 'variables';

interface FirstResponse {
    username: string;
    functionId: string;
    executionId: number;
}

const BACKEND_URL = variables.SERVICE_URL;
const CONCURRENT_REQUESTS = 3;
const USERNAME = 'munsman';
const FUNCTION_ID = '1';

const triggerFunction = async (payload?: object) => {
    const url = `${BACKEND_URL}/run/${USERNAME}/${FUNCTION_ID}`;
    console.log(url);
    return await axios.post<FirstResponse>(url, payload, {
        headers: { 'Content-Type': 'application/json' },
    });
};

const pullLogs = async (executionId: string) => {
    const url = `${BACKEND_URL}/status/${USERNAME}/${FUNCTION_ID}/${executionId}`;
    return await axios.get(url);
};

const triggerWorkflow = async (requestAmount: number) => {
    const requests = Array(requestAmount).fill(1);
    const responses = await Promise.allSettled(
        requests.map((_, index) => triggerFunction({ message: 'just a test', id: index }))
    );
    const status = responses.reduce<{ success: number; failed: number; data: FirstResponse[] }>(
        (prev, cur) => {
            if (cur.status === 'fulfilled') {
                prev.success++;
                prev.data.push(cur.value.data);
            } else {
                prev.failed++;
            }
            return prev;
        },
        { success: 0, failed: 0, data: [] }
    );
    return status;
};

const pullRuntimeStatus = async (executionIds: number[]) => {
    const statusLogs = await Promise.allSettled(
        executionIds.map((executionId) => pullLogs(executionId.toString()))
    );
    const outputData = statusLogs.reduce<StatusResponse[]>((res, value) => {
        if (value.status === 'fulfilled') {
            res.push(value.value.data);
        }
        return res;
    }, []);
    return outputData;
};

// @ts-ignore
const saveData = async (outputData: any) => {
    await writeFile('executionTimes.json', JSON.stringify(outputData));
};

interface CloudWatchRequest {
    functionName: string;
    executionStart: number;
    region: Region;
    requestId: string;
}
type CloudWatchResponse = { requests: CloudWatchRequest[]; response: LogWatcherResponse };

const pullLog = (
    functionName: string,
    requestIds: string[],
    region: Region,
    executionStart: number
) =>
    axios.post<LogWatcherResponse>(`${BACKEND_URL}/logs`, {
        functionName,
        requestIds,
        region,
        executionStart,
    });

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
    const batches = requests.reduce<Map<string, CloudWatchRequest[]>>((res, value) => {
        let batch: CloudWatchRequest[] = [];
        if (res.has(value.functionName)) {
            batch = res.get(value.functionName);
        }
        batch.push(value);
        res.set(value.functionName, batch);
        return res;
    }, new Map());
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
        const regionPromise: { [R in string]: Promise<CloudWatchResponse> } = {};
        regionRequests.forEach((request) => {
            const promise = new Promise<CloudWatchResponse>((resolve) => {
                pullLog(
                    mapFunctionNames[request.functionName] ?? request.functionName,
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
    const status = await triggerWorkflow(CONCURRENT_REQUESTS);
    await sleep(30000);
    const executionIds = status.data.map((value) => value.executionId);
    const outputData = await pullRuntimeStatus(executionIds);
    const requests = outputData.map<CloudWatchRequest[]>((item) => [
        {
            functionName: 'firstResponder',
            region: variables.REGION,
            requestId: item.logs.firstResponder.logs.requestId,
            executionStart: item.logs.firstResponder.logs.executionStart,
        },
        {
            functionName: 'scheduler',
            region: variables.REGION,
            requestId: item.logs.scheduler.logs.requestId,
            executionStart: item.logs.scheduler.logs.executionStart,
        },
        {
            functionName: 'runner',
            region: variables.REGION,
            requestId: item.logs.runner.logs.requestId,
            executionStart: item.logs.runner.logs.executionStart,
        },
        {
            functionName: 'returner',
            region: variables.REGION,
            requestId: item.logs.returner.logs.requestId,
            executionStart: item.logs.returner.logs.executionStart,
        },
        {
            functionName: 'awsReturner',
            region: item.logs.scheduler.deployment.region as Region,
            requestId: item.logs.returner.awsWrapper.returnerRequestId,
            executionStart: item.logs.returner.awsWrapper.awsExecutionStart,
        },
        {
            functionName: 'awsRunner',
            region: item.logs.scheduler.deployment.region as Region,
            requestId: item.logs.returner.awsWrapper.runnerRequestId,
            executionStart: item.logs.returner.awsWrapper.awsExecutionStart,
        },
        {
            functionName: item.logs.scheduler.decisionLogs.filter(
                (log) => log.pregion === item.logs.returner.awsWrapper.pregion
            )[0].functionName,
            region: item.logs.scheduler.deployment.region as Region,
            requestId: item.logs.returner.userFunctionRequestId,
            executionStart: item.logs.returner.awsWrapper.awsExecutionStart,
        },
    ]);
    console.dir(requests, { depth: null });
    const cloudwatchlogs = await pullFoppaRuntimeLogs(requests.flat());
    const logData = Object.entries(cloudwatchlogs).map(([key, regionObjects]) => {
        const regions = Object.entries(regionObjects).map<{
            region: string;
            durations: number[];
            averageDuration: number;
        }>(([region, value]) => {
            const reports = value.response.logs.filter((log) => log.message.includes('REPORT'));
            const starts = value.response.logs.filter((log) => log.message.includes('START'));
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
                    durations.reduce((res, value) => res + value, 0) / durations.length,
                executionStarts,
            };
        });
        const durations = regions.map((region) => region.durations).flat();
        return {
            functionName: key,
            durations,
            averageDuration: durations.reduce((res, value) => res + value, 0) / durations.length,
            regions,
        };
    });
    console.dir(logData, { depth: null });
    await saveData(logData);
};

main();
