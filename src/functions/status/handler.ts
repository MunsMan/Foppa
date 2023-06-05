import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { getLog, LogEventTypes } from "@libs/s3";

const status: ValidatedEventAPIGatewayProxyEvent<null> = async (event) => {
    const { username, functionId, executionId } = event.pathParameters;
    const log = await getLog('foppa-logs', { username, functionId, executionId });
    console.log(log)
    if (!log) {
        return formatJSONResponse({ status: 'unknown' }, 400)
    }
    let done = 0;
    console.log(Object.keys(log))
    for (let event in LogEventTypes) {
        if (!Object.keys(log).includes(event)) break
        done++;
    }
    console.log(log)
    return formatJSONResponse({ status: LogEventTypes[done], steps: { done, from: LogEventTypes.length }, message: '' })
};

export const main = status;
