import {
    CloudWatchLogsClient,
    DescribeLogStreamsCommand,
    GetLogEventsCommand,
    OutputLogEvent,
} from '@aws-sdk/client-cloudwatch-logs';
import { sleep } from './utils';

const client = new CloudWatchLogsClient({});

export const getExecutionLog = async (
    functionName: string,
    requestId: string,
    executionStart?: number
) => {
    const logGroupName = `/aws/lambda/${functionName}`;
    const logStream = await getLogStream(logGroupName);
    while (true) {
        const logs = await getLogs(logGroupName, logStream.logStreamName, executionStart);
        const functionLogs = logs.filter((log) => log.message.includes(requestId));
        if (functionLogs) {
            return functionLogs;
        }
        await sleep(300);
    }
};

const getLogStream = async (logGroupName: string) => {
    const response = await client.send(
        new DescribeLogStreamsCommand({
            logGroupName,
            orderBy: 'LastEventTime',
            descending: true,
        })
    );
    return response.logStreams[0];
};

const getLogs = async (
    logGroupName: string,
    logStreamName: string,
    startTime?: number,
    all = false
) => {
    const logs: OutputLogEvent[] = [];
    let { events, nextBackwardToken } = await client.send(
        new GetLogEventsCommand({
            logGroupName,
            logStreamName,
        })
    );
    if (events) {
        logs.push(...events);
    }
    while (all && nextBackwardToken) {
        const { events: newEvents, nextBackwardToken: newNextBackwardToken } = await client.send(
            new GetLogEventsCommand({
                logGroupName,
                logStreamName,
                startTime,
            })
        );
        if (nextBackwardToken === newNextBackwardToken) break;
        nextBackwardToken = newNextBackwardToken;
        logs.push(...(newEvents ?? []));
    }
    return logs;
};
