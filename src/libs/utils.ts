import { regions, Region } from '@consts/aws';

export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export function isRegion(region: string): region is Region {
    return regions.includes(region as Region);
}
