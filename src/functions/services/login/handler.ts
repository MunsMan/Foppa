import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import DynamoDB from '@libs/dynamodb';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import * as bcrypt from 'bcrypt';

const db = new DynamoDB();

const loginService: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const username = event.body.username;
    const password = event.body.password;
    console.log(username, password);
    try {
        const user = await db.getValue('UserManager', { username });
        if (bcrypt.compareSync(password, user.password)) {
            return formatJSONResponse({ status: 'valid', username });
        }
        return formatJSONResponse({ status: 'wrong', username }, 404);
    } catch (error) {
        console.error(error);
        return formatJSONResponse({ username, status: 'notFound' }, 404);
    }
};

export const main = middyfy(loginService, schema);
