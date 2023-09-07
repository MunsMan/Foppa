interface OptimizationRequest extends GeneralRequest {
    logs: OptimizationRequestLog;
}

interface GeneralRequest {
    username: string;
    functionId: string;
    executionId: string;
    payload?: string;
}

interface OptimizationRequestLog extends ApplicationLog {
    body: boolean;
    user?: {
        requestId: string;
        accoundId: string;
        ip: string;
        method: string;
    };
}

interface FunctionRequestLog extends ApplicationLog {}

interface ApplicationLog extends Log {
    executionStart: number;
    executionEnd: number;
}

type CloudProvider = 'aws';

interface FunctionRunRequest extends GeneralRequest {
    deployment: {
        provider: CloudProvider;
        region: string;
    };
    logs: FunctionRequestLog;
}

interface LogIdentifier {
    username: string;
    functionId: string;
    executionId: string;
}

type Log = { [event in string]: Log | string | number | boolean };

interface FunctionExecutionCounterValue {
    username: string;
    functionId: string;
    executionCounter: number;
}

interface RegionRunnerUrlValue {
    uFunctionId: string;
    pregion: string;
    url: string;
    functionName: string;
}
