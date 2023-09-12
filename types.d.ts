interface OptimizationRequest {
    username: string;
    functionId: string;
    executionId: string;
    payload?: string;
    logs: OptimizationRequestLog;
}

interface GeneralRequest {
    username: string;
    functionId: string;
    executionId: string;
    payload?: string;
}

interface UserRequestLog {
    requestId: string;
    accoundId: string;
    ip: string;
    method: string;
}

interface OptimizationRequestLog {
    body: boolean;
    user?: UserRequestLog;
    executionStart: number;
    executionEnd: number;
    requestId: string;
}

interface DecisionLog {
    regionExecutionCounter: number;
    regionCost: number;
    uFunctionId: string;
    pregion: string;
    functionName?: string;
    url?: string;
}

interface FunctionRequestLog {
    decisionLogs: DecisionLog[];
    executionStart: number;
    executionEnd: number;
    requestId: string;
}

type CloudProvider = 'aws';

interface FunctionRunRequest {
    username: string;
    functionId: string;
    executionId: string;
    payload?: string;
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

interface ServiceLogs {
    requestId: string;
    executionStart: string;
    executionEnd: string;
}

interface LogObject {
    username: string;
    functionId: string;
    executionId: string;
    body: boolean;
    firstResponder: {
        logs: ServiceLogs;
        user?: UserRequestLog;
    };
    scheduler?: {
        logs: ServiceLogs;
        deployment: {
            provider: string;
            region: string;
        };
        decisionLogs: DecisionLog[];
    };
    runner?: {
        url: string;
        status: number;
        currentRegionLoad: number;
        logs: ServiceLogs;
    };
}

interface StatusObject {}
