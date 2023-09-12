import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { getOldExecutionLog } from '@libs/cloudwatch';
import { middyfy } from '@libs/lambda';
import schema from './schema';

const logWatcher: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { region, functionName, requestIds } = event.body;
    let executionStart = event.body.executionStart;
    if (!executionStart) {
        const date = new Date();
        date.setHours(new Date().getHours() - 1);
        executionStart = date.getTime();
    }
    const logs = await getOldExecutionLog(
        new CloudWatchLogsClient({ region }),
        `foppa-dev-${functionName}`,
        requestIds,
        executionStart
    );
    return formatJSONResponse({
        requestIds,
        functionName,
        logs,
    });
};

export const main = middyfy(logWatcher, schema);
