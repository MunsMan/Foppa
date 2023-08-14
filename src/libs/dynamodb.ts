import { DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand, QueryCommandInput, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"
import type { GetItemCommandInput, PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import variables from "variables";

type DBTables = 'FunctionExecutionCounter' | 'FunctionUrl' | 'RegionRunnerURL' | 'RegionExecutionCounter' | 'UserManager'
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

export const queryValues = async<T>(table: DBTables, params: QueryParams): Promise<T[]> => {
    const variables = {}
    Object.values(params).map((value, index) => {
        const res = {};
        res[typeof value === 'string' ? 'S' : 'N'] = value
        variables[`:v${index + 1}`] = res
    })
    const query = Object.keys(params).map((key, index) => (`${key} = :v${index + 1} `)).join(' AND ');
    console.log(variables)
    const input: QueryCommandInput = {
        TableName: table,
        KeyConditionExpression: query,
        ExpressionAttributeValues: variables
    }
    const response = await db.send(new QueryCommand(input))
    return (response.Items ?? []).map((item) => (unmarshall(item) as T))
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


type ItemQueryParams<T extends DBTables> =
    T extends 'RegionExecutionCounter' ? { uFunctionId: string, pregion: string } :
    T extends 'FunctionExecutionCounter' ? { username: string, functionId: string } :
    T extends 'RegionRunnerURL' ? { uFunctionId: string, pregion: string } :
    T extends 'UserManager' ? { username: string } :
    never;

type ValueKey<T extends DBTables> =
    T extends 'RegionExecutionCounter' ? 'executionCounter' :
    T extends 'FunctionExecutionCounter' ? 'executionCounter' :
    T extends 'UserManager' ? 'functionCounter' :
    never;

export const incrValue = async<T extends DBTables>(table: T, item: ItemQueryParams<T>, key: ValueKey<T>) => {
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

export const decrValue = async<T extends DBTables>(table: T, item: ItemQueryParams<T>, key: ValueKey<T>) => {
    const input: UpdateItemCommandInput = {
        TableName: table,
        Key: marshall(item),
        UpdateExpression: `SET ${key} = if_not_exists(${key}, :initial) - :num`,
        ExpressionAttributeValues: marshall({
            ':num': 1,
            ':initial': 0
        }),
        ReturnValues: "ALL_NEW",
    }
    const response = await db.send(new UpdateItemCommand(input))
    return unmarshall(response.Attributes)[key]
}
