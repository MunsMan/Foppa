import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { getLog, LogEventTypes } from '@libs/s3';

const status: ValidatedEventAPIGatewayProxyEvent<null> = async (event) => {
    const { username, functionId, executionId } = event.pathParameters;
    try {
        const log = await getLog('foppa-logs', { username, functionId, executionId });
        const status: StatusResponse = {
            status: 'unknown',
            steps: { done: 0, from: LogEventTypes.length },
            logs: log,
        };
        for (const event of LogEventTypes) {
            console.log(event);
            if (!Object.keys(log).includes(event)) break;
            status.steps.done++;
            status.status = LogEventTypes[status.steps.done - 1];
        }
        if (status.status === 'returner') {
            status.payload = log.returner.response.result;
        }
        return formatJSONResponse(status);
    } catch {
        return formatJSONResponse({ status: 'unknown' }, 400);
    }
};

export const main = status;
