import {
    CloudWatchLogsClient,
    DescribeLogStreamsCommand,
    GetLogEventsCommand,
    LogStream,
    OutputLogEvent,
} from '@aws-sdk/client-cloudwatch-logs';
import { sleep } from './utils';

const client = new CloudWatchLogsClient({});

export const getExecutionLog = async (
    cloudwatchClient: CloudWatchLogsClient,
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

const getLogStreams = async (
    cloudwatchClient: CloudWatchLogsClient,
    logGroupName: string,
    executionStart: number
) => {
    const response = await cloudwatchClient.send(
        new DescribeLogStreamsCommand({
            logGroupName,
            orderBy: 'LastEventTime',
            descending: true,
        })
    );
    return response.logStreams.reduce<LogStream[]>((res, value, index) => {
        if (index === 0) {
            res.push(value);
            return res;
        }
        if (value.lastEventTimestamp >= executionStart) {
            res.push(value);
        }
        return res;
    }, []);
};

const getLogs = async (
    cloudwatchClient: CloudWatchLogsClient,
    logGroupName: string,
    logStreamName: string,
    startTime?: number,
    all = false
) => {
    const logs: OutputLogEvent[] = [];
    let { events, nextBackwardToken } = await cloudwatchClient.send(
        new GetLogEventsCommand({
            logGroupName,
            logStreamName,
        })
    );
    if (events) {
        logs.push(...events);
    }
    while (all && nextBackwardToken) {
        const { events: newEvents, nextBackwardToken: newNextBackwardToken } =
            await cloudwatchClient.send(
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
