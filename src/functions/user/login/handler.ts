import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import DynamoDB from '@libs/dynamodb';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import * as bcrypt from 'bcryptjs';
import { createSessionId } from '@libs/auth';

const PRIVATE_KEY = process.env.PRIVATE_KEY

const db = new DynamoDB();

const loginService: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const username = event.body.username;
    const password = event.body.password;
    console.log(username, password);
    try {
        const user = await db.getValue('UserManager', { username });
        console.log(user)
        if (bcrypt.compareSync(password, user.password)) {
            const token = createSessionId(username, user.role, PRIVATE_KEY)
            return formatJSONResponse({ status: 'valid', username, token });
        }
        return formatJSONResponse({ status: 'wrong', username }, 404);
    } catch (error) {
        console.error(error);
        return formatJSONResponse({ username, status: 'notFound' }, 404);
    }
};

export const main = middyfy(loginService, schema);
