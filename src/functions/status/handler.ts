import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { getLog, LogEventTypes } from "@libs/s3";

const status: ValidatedEventAPIGatewayProxyEvent<null> = async (event) => {
    const { username, functionId, executionId } = event.pathParameters;
    const log = await getLog('foppa-logs', { username, functionId, executionId });
    const status = {
        status: 'unknown',
        steps: { done: -1, from: LogEventTypes.length - 1 }
    }
    if (!log) {
        return formatJSONResponse({ status: 'unknown' }, 400)
    }
    for (const event of LogEventTypes) {
        console.log(event)
        if (!Object.keys(log).includes(event)) break
        status.steps.done++;
        status.status = LogEventTypes[status.steps.done]
    }
    if (status.status === 'finished') {
        status.payload = log.finished.response.result
    }
    return formatJSONResponse(status)
};

export const main = status;
