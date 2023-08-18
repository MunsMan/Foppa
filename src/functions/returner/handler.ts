import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import DynamoDB from '@libs/dynamodb';
import { appendLog } from '@libs/s3';
import { toUFunctionId } from '@libs/parser';

const returner: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { username, functionId } = event.pathParameters
    const { executionId, pregion, result, executionEnd, executionStart } = event.body;
    const db: DB = new DynamoDB()
    const uFunctionId = toUFunctionId(username, functionId)
    const log = {
        response: { result, type: 'json' },
        executionStart,
        executionEnd
    }
    const tasks = Promise.all([
        db.decrValue('RegionExecutionCounter', { uFunctionId, pregion }, 'executionCounter'),
        appendLog('foppa-logs', { username, functionId, executionId }, 'finished', log)])
    await tasks;
    return formatJSONResponse({});
};

export const main = middyfy(returner);
