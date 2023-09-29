import { AuthToken } from '@libs/auth';
import { sleep } from '@libs/utils';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import variables from 'variables';

const SERVICE_URL = variables.SERVICE_URL;
const TEST_ID = randomUUID();
const PASSWORD = 'test';

export const createUser = async (username: string, password: string) => {
    return axios.post<SignUpResponse>(`${SERVICE_URL}/signin`, { username, password });
};

export const login = async (username: string, password: string) => {
    return axios.post<LoginResponse>(`${SERVICE_URL}/login`, { username, password });
};

export const getFunctions = async (token: AuthToken) => {
    return axios.get<UserFunctionsResponse>(`${SERVICE_URL}/function/${token.username}`, {
        headers: { Authorization: token.token },
    });
};

export const deleteUser = async (token: AuthToken) => {
    return axios.delete(`${SERVICE_URL}/user/${token.username}`, {
        headers: { Authorization: token.token },
    });
};

const iteration = async (username: string) => {
    const data = {};
    data['createUser'] = { startTime: Date.now() };
    const createUserResponse = await createUser(username, PASSWORD);
    data['createUser']['endTime'] = Date.now();
    if (createUserResponse.data.status !== 'created') {
        return data;
    }

    data['login'] = { startTime: Date.now() };
    const loginResponse = await login(username, PASSWORD);
    data['login']['endTime'] = Date.now();
    if (loginResponse.data.status !== 'valid') {
        return data;
    }

    const token = new AuthToken(loginResponse.data.token);
    data['getFunctions'] = { startTime: Date.now() };
    await getFunctions(token);
    data['getFunctions']['endTime'] = Date.now();

    data['deleteUser'] = { startTime: Date.now() };
    await deleteUser(token);
    data['deleteUser']['endTime'] = Date.now();

    return data;
};

const saveData = async (data: any, name: string) => {
    const dir = 'test/user/' + TEST_ID;
    const path = dir + '/' + name + '.json';
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    await writeFile(path, JSON.stringify(data));
};

const main = async () => {
    for (let i = 0; i < 5; i++) {
        console.log('Test Iteration ' + i);
        console.log('\tRunning Cold Start Test 🧪');
        const coldStart = await iteration('coldStart');
        console.log('\tCold Start Test finished 🎉');
        await saveData(coldStart, 'coldStart-' + i);
        console.log('\tCold Start Test saved 💾');
        console.log('\tRunning Warm Start Test 🧪');
        const warmStart = await Promise.all(
            Array(10)
                .fill(1)
                .map((_, index) => iteration(`warmStart-${index}`))
        );
        console.log('\tWarm Start Test finished 🎉');
        await saveData(warmStart, 'warmStart-' + i);
        console.log('\tWarm Start Test saved 💾');
        await sleep(30 * 1000 * 60);
    }
};
main();
