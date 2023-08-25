import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import DynamoDB from '@libs/dynamodb';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import * as bycrypt from 'bcryptjs';

const db = new DynamoDB();

const signInService: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const username = event.body.username;
    const password = event.body.password;
    try {
        const user = await db.getValue('UserManager', { username });
        if (user.username === username) {
            return formatJSONResponse({ created: false, message: 'User already exists!' });
        }
    } catch (error) {
        const hash = await bycrypt.hash(password, bycrypt.genSaltSync());
        await db.putValue('UserManager', { username, password: hash, functionCounter: 0 });
        return formatJSONResponse({ created: true, message: 'User successfully created!' });
    }
};

export const main = middyfy(signInService, schema);
