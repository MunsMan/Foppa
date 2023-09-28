import { authorizedButNotAllowed } from '@errors/foppa';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import DynamoDB from '@libs/dynamodb';
import { middyfy } from '@libs/lambda';

const db: DB = new DynamoDB()

const deleteUser: ValidatedEventAPIGatewayProxyEvent<undefined> = async (event) => {
    console.log(event)
    const username = event.pathParameters.username
    if(!(username === event.requestContext.authorizer.lambda.username || event.requestContext.authorizer.lambda.role === 'admin')){
        return authorizedButNotAllowed()
    }
    const status = await db.deleteValue('UserManager', {username})
    return formatJSONResponse({status: status?'success':'failed'},200);
};

export const main = middyfy(deleteUser);
