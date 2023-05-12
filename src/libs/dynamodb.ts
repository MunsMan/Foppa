import { DynamoDBClient, GetItemCommand, PutItemCommand, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import type { GetItemCommandInput, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import variables from "variables";

type DBTables = 'FunctionExecutionCounter' | 'FunctionUrl'
type QueryParams = { [key in string]: string | number }

const db = new DynamoDBClient({ region: variables.REGION });

export const getValue = async <T>(table: DBTables, params: QueryParams): Promise<T | undefined> => {
    const input: GetItemCommandInput = {
        TableName: table,
        Key: marshall(params)

    };
    const command = new GetItemCommand(input)
    const response = await db.send(command)
    return unmarshall(response.Item) as T
}

export const putValue = async (table: DBTables, item: QueryParams) => {
    const input: PutItemCommandInput = {
        TableName: table,
        Item: marshall(item)

    };
    const command = new PutItemCommand(input)
    const response = await db.send(command)
    return response
}

export const incrValue = async (table: DBTables, item: QueryParams, key: string) => {
    const input: UpdateItemCommandInput = {
        TableName: table,
        Key: marshall(item),
        UpdateExpression: `SET ${key} = if_not_exists(${key}, :initial) + :num`,
        ExpressionAttributeValues: marshall({
            ':num': 1,
            ':initial': 0
        }),
        ReturnValues: "ALL_NEW",
    }
    const response = await db.send(new UpdateItemCommand(input))
    return unmarshall(response.Attributes)[key]
}
