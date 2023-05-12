import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema'

const createFunction: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const username = event.pathParameters.username;
    const functionId = event.body.functionId;
    return formatJSONResponse({
        message: 'Function created',
    });
};

export const main = middyfy(createFunction);
