import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import DynamoDB from '@libs/dynamodb';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import * as bycrypt from 'bcryptjs';
import { createSessionId } from '@libs/auth';

const PRIVATE_KEY = process.env.PRIVATE_KEY

const db = new DynamoDB();

const signInService: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const username = event.body.username;
    const password = event.body.password;
    try {
        const user = await db.getValue('UserManager', { username });
        if (user.username === username) {
            return formatJSONResponse({ username, status: 'alreadyExists' }, 400);
        }
    } catch (error) {
        const hash = await bycrypt.hash(password, bycrypt.genSaltSync());
        await db.putValue('UserManager', { username, password: hash, functionCounter: 0, role: 'user' });
        const token = createSessionId(username, 'user', PRIVATE_KEY)
        return formatJSONResponse({ username, status: 'created', token }, 200);
    }
};

export const main = middyfy(signInService, schema);
