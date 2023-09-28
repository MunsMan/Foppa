import { verifySession } from '@libs/auth';
import { APIGatewayAuthorizerEvent } from 'aws-lambda';

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const authorizer = async (event: APIGatewayAuthorizerEvent) => {
    console.log(event)
    if (event.type === 'REQUEST') {
        if (!event.headers.authorization) {
            return {
                isAuthorized: false,
            };
        }
        const token = event.headers.authorization;
        const result = verifySession(token, PRIVATE_KEY);
        return {
            isAuthorized: result.valid,
            context: result.valid ? { username: result.username, role: result.role } : undefined,
        };
    }
};
export const main = authorizer;
