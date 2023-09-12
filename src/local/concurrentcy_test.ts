import { sleep } from '@libs/utils';
import axios from 'axios';
import { writeFile } from 'fs/promises';
import variables from 'variables';

interface FirstResponse {
    username: string;
    functionId: string;
    executionId: number;
}

const BACKEND_URL = variables.SERVICE_URL;
const CONCURRENT_REQUESTS = 1;
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
    const outputData = statusLogs.reduce((res, value) => {
        if (value.status === 'fulfilled') {
            res.push(value.value.data);
        }
        return [];
    }, []);
    return outputData;
};

// @ts-ignore
const main = async () => {
    const status = await triggerWorkflow(CONCURRENT_REQUESTS);
    await sleep(30000);
    const executionIds = status.data.map((value) => value.executionId);
    const outputData = await pullRuntimeStatus(executionIds);
    console.dir(outputData, { depth: null });
    const plotData = outputData.reduce((res, value) => {
        if (value === 'rejected') {
            return res;
        }
        res.push({
            firstResponderStart: value.logs.firstResponder.logs.executionStart,
            firstResponderEnd: value.logs.firstResponder.logs.executionEnd,
            schedulerStart: value.logs.scheduler.logs.executionStart,
            schedulerEnd: value.logs.scheduler.logs.executionEnd,
            runnerStart: value.logs.runner.logs.executionStart,
            runnerEnd: value.logs.runner.logs.executionEnd,
            returnerStart: value.logs.returner.logs.executionStart,
            returnerEnd: value.logs.returner.logs.executionEnd,
            userExectutionStart: Number(value.logs.returner.awsWrapper.awsExecutionStart),
            userExectutionEnd: Number(value.logs.returner.awsWrapper.awsExecutionEnd),
        });
        return res;
    }, []);
    await writeFile('executionTimes.json', JSON.stringify(plotData));
};

main();
