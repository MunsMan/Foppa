import { S3Client, PutObjectCommand, PutObjectCommandInput, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3'

type Bucket = 'foppa-logs'

const s3 = new S3Client({})

interface LogIdentifier {
    username: string;
    functionId: string;
    executionId: string;
}

export const appendLog = async (bucket: Bucket, logId: LogIdentifier, event: string, log: Log) => {
    const logfile = await getLog(bucket, logId);
    logfile[event] = log;
    return await putLog(bucket, logId, logfile)
}
'foppa-logs'
const getLog = async (bucket: Bucket, logId: LogIdentifier) => {
    const { username, functionId, executionId } = logId
    const key = `${username}/${functionId}/${executionId}.json`
    const file = await getFile(bucket, key)
    const logfile: Log = JSON.parse(file)
    return logfile
}


const getFile = async (bucket: Bucket, key: string) => {
    const input: GetObjectCommandInput = {
        Bucket: bucket,
        Key: key
    }
    const response = await s3.send(new GetObjectCommand(input))
    return response.Body.transformToString()
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
