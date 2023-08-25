type DBTables =
    | 'FunctionExecutionCounter'
    | 'RegionRunnerURL'
    | 'RegionExecutionCounter'
    | 'UserManager';

interface FunctionExecutionCounter {
    username: string;
    functionId: string;
    executionCounter?: number;
    functionName?: string;
}

interface RegionRunnerUrl {
    uFunctionId: string;
    pregion: string;
    functionName?: string;
    url?: string;
}

interface RegionExecutionCounter {
    uFunctionId: string;
    pregion: string;
    executionCounter?: number;
}

interface UserManager {
    username: string;
    password?: string;
    functionCounter?: number;
}

type QueryParams<T extends DBTables> = T extends 'RegionExecutionCounter'
    ? { uFunctionId: string; pregion: string }
    : T extends 'FunctionExecutionCounter'
    ? { username: string; functionId: string }
    : T extends 'RegionRunnerURL'
    ? { uFunctionId: string; pregion: string }
    : T extends 'UserManager'
    ? { username: string }
    : never;

type DBValueReturn<T extends DBTables> = T extends 'FunctionExecutionCounter'
    ? FunctionExecutionCounter
    : T extends 'RegionRunnerURL'
    ? RegionRunnerUrl
    : T extends 'RegionExecutionCounter'
    ? RegionExecutionCounter
    : T extends 'UserManager'
    ? UserManager
    : never;

type DBNumberKey<T extends DBTables> = T extends 'RegionExecutionCounter'
    ? 'executionCounter'
    : T extends 'FunctionExecutionCounter'
    ? 'executionCounter'
    : T extends 'UserManager'
    ? 'functionCounter'
    : never;

interface DB {
    getValue<T extends DBTables>(table: T, params: QueryParams<T>): Promise<DBValueReturn<T>>;
    getValues<T extends DBTables>(
        table: T,
        params: Partial<QueryParams<T>>
    ): Promise<DBValueReturn<T>[]>;
    putValue<T extends DBTables>(
        table: T,
        item: Required<DBValueReturn<T>>
    ): Promise<DBValueReturn<T>>;
    incrValue<T extends DBTables>(
        table: T,
        params: QueryParams<T>,
        key: DBNumberKey<T>
    ): Promise<number>;
    decrValue<T extends DBTables>(
        table: T,
        params: QueryParams<T>,
        key: DBNumberKey<T>
    ): Promise<number>;
}
