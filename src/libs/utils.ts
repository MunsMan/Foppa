import { regions, Region } from '@consts/aws';
import { randomInt } from 'node:crypto';

export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const avoidThrottling = async <T>(
    f: () => T,
    range = 50
): Promise<T> => {
    await sleep(randomInt(range));
    return await f();
};

export function isRegion(region: string): region is Region {
    return regions.includes(region as Region);
}

export const resolveObject = async <T extends Record<keyof T, any>>(
    obj: T
): Promise<{ [K in keyof T]: Awaited<T[K]> }> => {
    return Promise.all(
        Object.entries(obj).map(async ([k, v]) => [k, await v])
    ).then(Object.fromEntries);
};

export const isFulfilled = <T>(
    p: PromiseSettledResult<T>
): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';
export const isRejected = <T>(
    p: PromiseSettledResult<T>
): p is PromiseRejectedResult => p.status === 'rejected';
