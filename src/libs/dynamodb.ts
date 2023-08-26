import {
    DynamoDBClient,
    GetItemCommand,
    PutItemCommand,
    QueryCommand,
    QueryCommandInput,
    UpdateItemCommand,
    UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import type { GetItemCommandInput, PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import variables from 'variables';

class DynamoDB implements DB {
    private db = new DynamoDBClient({ region: variables.REGION });

    getValue = async <T extends DBTables>(
        table: T,
        params: QueryParams<T>
    ): Promise<DBValueReturn<T>> => {
        const input: GetItemCommandInput = {
            TableName: table,
            Key: marshall(params),
        };
        const command = new GetItemCommand(input);
        const response = await this.db.send(command);
        return unmarshall(response.Item) as DBValueReturn<T>;
    };

    getValues = async <T extends DBTables>(
        table: T,
        params: Partial<QueryParams<T>>
    ): Promise<DBValueReturn<T>[]> => {
        const variables = {};
        Object.values(params).map((value, index) => {
            const res = {};
            res[typeof value === 'string' ? 'S' : 'N'] = value;
            variables[`:v${index + 1}`] = res;
        });
        const query = Object.keys(params)
            .map((key, index) => `${key} = :v${index + 1} `)
            .join(' AND ');
        const input: QueryCommandInput = {
            TableName: table,
            KeyConditionExpression: query,
            ExpressionAttributeValues: variables,
        };
        const response = await this.db.send(new QueryCommand(input));
        return (response.Items ?? []).map((item) => unmarshall(item) as DBValueReturn<T>);
    };

    putValue = async <T extends DBTables>(table: T, item: Required<DBValueReturn<T>>) => {
        const input: PutItemCommandInput = {
            TableName: table,
            Item: marshall(item),
        };
        const command = new PutItemCommand(input);
        const response = await this.db.send(command);
        if (response.$metadata.httpStatusCode !== 200) {
            console.log(response);
        }
        return item as undefined as DBValueReturn<T>;
    };

    incrValue = async <T extends DBTables>(table: T, item: QueryParams<T>, key: DBNumberKey<T>) => {
        const input: UpdateItemCommandInput = {
            TableName: table,
            Key: marshall(item),
            UpdateExpression: `SET ${key} = if_not_exists(${key}, :initial) + :num`,
            ExpressionAttributeValues: marshall({
                ':num': 1,
                ':initial': 0,
            }),
            ReturnValues: 'ALL_NEW',
        };
        const response = await this.db.send(new UpdateItemCommand(input));
        return unmarshall(response.Attributes)[key];
    };

    decrValue = async <T extends DBTables>(table: T, item: QueryParams<T>, key: DBNumberKey<T>) => {
        const input: UpdateItemCommandInput = {
            TableName: table,
            Key: marshall(item),
            UpdateExpression: `SET ${key} = if_not_exists(${key}, :initial) - :num`,
            ExpressionAttributeValues: marshall({
                ':num': 1,
                ':initial': 0,
            }),
            ReturnValues: 'ALL_NEW',
        };
        const response = await this.db.send(new UpdateItemCommand(input));
        return unmarshall(response.Attributes)[key];
    };
}

export default DynamoDB;
