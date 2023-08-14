import { S3Client, PutObjectCommand, PutObjectCommandInput, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3'
import { LogNotFound } from '@errors/aws';
import * as path from 'path'
import * as fs from 'fs'

type Bucket = 'foppa-logs'

const s3 = new S3Client({})

interface LogIdentifier {
    username: string;
    functionId: string;
    executionId: string;
}

export const LogEventTypes = ['firstResponder', 'functionRunner', 'executionTrigger', 'finished'] as const;

type LogEvents = typeof LogEventTypes[number];

export const appendLog = async (bucket: Bucket, logId: LogIdentifier, event: LogEvents, log: Log) => {
    const logfile = await getLog(bucket, logId);
    logfile[event] = log;
    return await putLog(bucket, logId, logfile)
}


export const getLog = async (bucket: Bucket, logId: LogIdentifier) => {
    const { username, functionId, executionId } = logId
    const key = `${username}/${functionId}/${executionId}.json`
    const file = await getFile(bucket, key)
    if (file) {
        const logfile: Log = JSON.parse(file)
        return logfile
    }
    LogNotFound(logId);
}


const getFile = async (bucket: Bucket, key: string): Promise<string | undefined> => {
    const input: GetObjectCommandInput = {
        Bucket: bucket,
        Key: key
    }
    try {
        const response = await s3.send(new GetObjectCommand(input))
        return response.Body.transformToString()
    } catch {
        return undefined
    }
}

export const getZipFile = async (s3Client: S3Client, bucket: string, key: string) => {
    const response = await s3Client.send(new GetObjectCommand({
        Bucket: bucket,
        Key: key
    }))
    return Buffer.from(await response.Body.transformToByteArray())
}

export const putLog = async (bucket: Bucket, logId: LogIdentifier, log: Log) => {
    const { username, functionId, executionId } = logId
    const key = `${username}/${functionId}/${executionId}.json`
    return await putFile(bucket, key, JSON.stringify(log))
}

const putFile = async (bucket: Bucket, key: string, file: string) => {
    const input: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        Body: file
    }
    const response = await s3.send(new PutObjectCommand(input))
    return response.ETag
}


export const localS3Upload = async (s3Client: S3Client, functionName: string, filepath: string, bucket: string, username: string) => {
    const file = path.resolve(filepath);
    const code = fs.readFileSync(file)
    return await uploadCodeS3(s3Client, functionName, code, bucket, username)

}

export const uploadCodeS3 = async (s3Client: S3Client, functionName: string, code: Buffer, bucket: string, username: string) => {
    console.log(`[DEBUG] - [uploadCodeS3] - functionName:${functionName}`)
    console.log(`[DEBUG] - [uploadCodeS3] - bucket:${bucket}`)
    console.log(`[DEBUG] - [uploadCodeS3] - username:${username}`)
    const response = await s3Client.send(new PutObjectCommand({
        Body: code,
        Key: `upload/${username}/${functionName}.zip`,
        Bucket: bucket
    }));
    return response;
}
