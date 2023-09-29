import { sleep } from '@libs/utils';
import axios, { AxiosHeaders } from 'axios';
import variables from 'variables';

const BACKEND_URL = variables.SERVICE_URL;

export const triggerFunction = async (
    username: string,
    functionId: string,
    payload?: object,
    headers?: AxiosHeaders
) => {
    const url = `${BACKEND_URL}/run/${username}/${functionId}`;
    return await axios.post<FirstResponse>(url, payload, {
        headers: headers,
    });
};

export const pullFoppaLogs = async (
    username: string,
    functionId: string,
    executionId: string,
    headers?: AxiosHeaders
) => {
    await sleep(Math.random() * 10000);
    const url = `${BACKEND_URL}/status/${username}/${functionId}/${executionId}`;
    return await axios.get<StatusResponse>(url, { headers });
};

export const pullCloudLogs = async (
    functionName: string,
    requestIds: string[],
    region: string,
    executionStart: number
) => {
    await sleep(Math.random() * 10000);
    return (
        await axios.post<LogWatcherResponse>(`${BACKEND_URL}/logs`, {
            functionName,
            requestIds,
            region,
            executionStart,
        })
    ).data;
};
