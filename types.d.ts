interface OptimizationRequest {
    username: string;
    functionId: string;
    executionId: string;
    payload?: string;
    logs: OptimizationRequestLog;
}

interface OptimizationRequestLog extends ApplicationLog {
    body: boolean,
}

interface ApplicationLog extends Log {
    executionStart: number;
    executionEnd: number;
}

type CloudProvider = 'aws'

interface FunctionRunRequest extends OptimizationRequest {
    deployment: {
        provider: CloudProvider;
        region: string;
    }
}

interface LogIdentifier {
    username: string;
    functionId: string;
    executionId: string;
}

type Log = { [event in string]: Log | string | number | boolean }

interface FunctionExecutionCounterValue {
    username: string;
    functionId: string;
    executionCounter: number;
}

interface RegionRunnerUrlValue {
    username: string;
    pregion: string;
    url: string;
    functionName: string;
}
