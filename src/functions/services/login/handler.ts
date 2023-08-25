import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import DynamoDB from '@libs/dynamodb';
import { middyfy } from '@libs/lambda';
import schema from './schema';

const db = new DynamoDB();

const loginService: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const username = event.body.username;
    const password = event.body.password;
    try {
        const user = await db.getValue('UserManager', { username });
        if (password === user.password) {
            return formatJSONResponse({ valid: true });
        }
    } catch (error) {
        console.error(error);
        return formatJSONResponse({ valid: false }, 404);
    }
};

export const main = middyfy(loginService, schema);
