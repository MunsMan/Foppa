import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import DynamoDB from '@libs/dynamodb';
import { appendLog } from '@libs/s3';
import { toUFunctionId } from '@libs/parser';

const returner: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event, context) => {
    const executionStart = Date.now();
    const { username, functionId } = event.pathParameters;
    const {
        executionId,
        pregion,
        result,
        executionEnd: awsExecutionEnd,
        executionStart: awsExecutionStart,
        runnerRequestId,
        returnerRequestId,
        userFunctionRequestId,
    } = event.body;
    const db: DB = new DynamoDB();
    const uFunctionId = toUFunctionId(username, functionId);

    await db.decrValue('RegionExecutionCounter', { uFunctionId, pregion }, 'executionCounter');
    const log: ReturnerLog = {
        response: { result, type: 'json' },
        awsWrapper: {
            awsExecutionStart,
            awsExecutionEnd,
            runnerRequestId,
            returnerRequestId,
            pregion,
        },
        userFunctionRequestId,
        logs: {
            executionStart,
            executionEnd: Date.now(),
            requestId: context.awsRequestId,
        },
    };
    await appendLog('foppa-logs', { username, functionId, executionId }, 'returner', log);
    return formatJSONResponse({});
};

export const main = middyfy(returner, schema);
