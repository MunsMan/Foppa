import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import DynamoDB from '@libs/dynamodb';
import { middyfy } from '@libs/lambda';
import { parsePRegion, toUFunctionId } from '@libs/parser';

const db = new DynamoDB();

const functionService: ValidatedEventAPIGatewayProxyEvent<typeof undefined> = async (event) => {
    const username = event.pathParameters.username;
    const functionId = event.pathParameters.functionId;

    if (functionId) {
        const regions = (
            await db.getValues('RegionExecutionCounter', {
                uFunctionId: toUFunctionId(username, functionId),
            })
        ).map((value) => {
            const [provider, region] = parsePRegion(value.pregion);
            return { region, provider, regionExecutionCount: value.executionCounter };
        });
        const functionCounter = await db.getValue('FunctionExecutionCounter', {
            username,
            functionId,
        });
        const executionCounter = functionCounter.executionCounter;
        const functionName = functionCounter.functionName;
        return formatJSONResponse({
            username,
            functionId,
            regions,
            functionName,
            executionCounter,
        });
    }

    const response = await db.getValues('FunctionExecutionCounter', { username });

    return formatJSONResponse({
        username,
        functions: response.map((item) => ({
            functionId: item.functionId,
            functionName: item.functionName,
            executionCounter: item.executionCounter,
        })),
    });
};

export const main = middyfy(functionService);
