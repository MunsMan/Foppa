import {
    S3Client,
    PutObjectCommand,
    PutObjectCommandInput,
    GetObjectCommand,
    GetObjectCommandInput,
} from '@aws-sdk/client-s3';
import { LogNotFound } from '@errors/aws';
import * as path from 'path';
import * as fs from 'fs';

type Bucket = 'foppa-logs';

const s3 = new S3Client({});

export const LogEventTypes = ['firstResponder', 'scheduler', 'runner', 'returner'] as const;

type LogEvent = (typeof LogEventTypes)[number];

interface LogIdentifier<T extends LogEvent> {
    username: string;
    functionId: string;
    executionId: string;
    event?: T;
}

type Log<T extends LogEvent> = T extends 'firstResponder'
    ? LogObject
    : T extends 'scheduler'
    ? SchedulerLog
    : T extends 'runner'
    ? RunnerLog
    : T extends 'returner'
    ? ReturnerLog
    : never;

type LogResponse<T extends LogEvent> = Log<T>;

export const getLog = async <T extends LogEvent = 'firstResponder'>(
    bucket: Bucket,
    logId: LogIdentifier<T>
): Promise<LogResponse<T>> => {
    const { username, functionId, executionId, event } = logId;
    if (event) {
        const key = `${username}/${functionId}/${executionId}/${event}.json`;
        const file = await getFile(bucket, key);
        if (file) {
            const logfile: Log<T> = JSON.parse(file);
            return logfile;
        }
        return LogNotFound(logId);
    }
    const [firstResponderLogs, schedulerLogs, runnerLogs, returnerLogs] = await Promise.allSettled([
        getLog(bucket, { ...logId, event: 'firstResponder' }),
        getLog(bucket, { ...logId, event: 'scheduler' }),
        getLog(bucket, { ...logId, event: 'runner' }),
        getLog(bucket, { ...logId, event: 'returner' }),
    ]);
    if (firstResponderLogs.status !== 'fulfilled') {
        return LogNotFound(logId);
    }
    const logObject = firstResponderLogs.value;
    if (schedulerLogs.status === 'fulfilled') {
        logObject.scheduler = schedulerLogs.value;
    }
    if (runnerLogs.status === 'fulfilled') {
        logObject.runner = runnerLogs.value;
    }
    if (returnerLogs.status === 'fulfilled') {
        logObject.returner = returnerLogs.value;
    }
    return logObject as Log<T>;
};

const getFile = async (bucket: Bucket, key: string): Promise<string | undefined> => {
    const input: GetObjectCommandInput = {
        Bucket: bucket,
        Key: key,
    };
    try {
        const response = await s3.send(new GetObjectCommand(input));
        return response.Body.transformToString();
    } catch {
        return undefined;
    }
};

export const getFileS3 = async (s3Client: S3Client, bucket: string, key: string) => {
    const response = await s3Client.send(
        new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        })
    );
    return Buffer.from(await response.Body.transformToByteArray());
};

export const putLog = async <T extends LogEvent>(
    bucket: Bucket,
    logId: Required<LogIdentifier<T>>,
    log: Log<T>
) => {
    const { username, functionId, executionId, event } = logId;
    const key = `${username}/${functionId}/${executionId}/${event}.json`;
    return await putFile(bucket, key, JSON.stringify(log));
};

const putFile = async (bucket: Bucket, key: string, file: string) => {
    const input: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        Body: file,
    };
    const response = await s3.send(new PutObjectCommand(input));
    return response.ETag;
};

export const localS3Upload = async (
    s3Client: S3Client,
    functionName: string,
    filepath: string,
    bucket: string,
    username: string,
    type: string = 'zip'
) => {
    const file = path.resolve(filepath);
    const code = fs.readFileSync(file);
    return await uploadCodeS3(s3Client, functionName, code, bucket, username, type);
};

export const uploadCodeS3 = async (
    s3Client: S3Client,
    functionName: string,
    code: Buffer,
    bucket: string,
    username: string,
    type: string = 'zip'
) => {
    console.log(`[DEBUG] - [uploadCodeS3] - functionName:${functionName}`);
    console.log(`[DEBUG] - [uploadCodeS3] - bucket:${bucket}`);
    console.log(`[DEBUG] - [uploadCodeS3] - username:${username}`);
    const response = await s3Client.send(
        new PutObjectCommand({
            Body: code,
            Key: `upload/${username}/${functionName}.${type}`,
            Bucket: bucket,
        })
    );
    return response;
};
