import { CloudWatchLogsClient, DescribeLogStreamsCommand, GetLogEventsCommand, OutputLogEvent } from '@aws-sdk/client-cloudwatch-logs';
import { sleep } from './utils';

const client = new CloudWatchLogsClient({})


export const getExecutionLog = async (functionName: string, requestId: string, executionStart: number, executionEnd: number) => {
    const logGroupName = `/aws/lambda/${functionName}`
    const logStream = await getLogStream(logGroupName)
    const logs = await getLogs(logGroupName, logStream.logStreamName, executionStart, executionEnd)
    return logs
}

const getLogStream = async (logGroupName: string) => {
    const response = await client.send(new DescribeLogStreamsCommand({
        logGroupName,
        orderBy: "LastEventTime",
        descending: true,
    }))
    return response.logStreams[0]
}

const getLogs = async (logGroupName: string, logStreamName: string, executionStart?: number, executionEnd?: number) => {
    const logs: OutputLogEvent[] = []
    console.log(executionStart, executionEnd)
    await sleep(1000)
    let { events, nextBackwardToken } = await client.send(new GetLogEventsCommand({
        logGroupName, logStreamName
    }))
    if (events) {
        logs.push(...events)
    }
    while (nextBackwardToken) {
        const { events: newEvents, nextBackwardToken: newNextBackwardToken } = await client.send(new GetLogEventsCommand({
            logGroupName, logStreamName, startTime: executionStart
        }))
        if (nextBackwardToken === newNextBackwardToken) break
        nextBackwardToken = newNextBackwardToken
        logs.push(...newEvents ?? [])
    }
    return logs
}
