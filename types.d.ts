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
    executionStart: number;
    executionEnd: number;
}

interface ReturnerLog {
    logs: ServiceLogs;
    awsWrapper: {
        awsExecutionStart: number;
        awsExecutionEnd: number;
        runnerRequestId: string;
        returnerRequestId: string;
        pregion: string;
    };
    response: {
        result: string;
        type: 'json';
    };
    userFunctionLogs: string[];
    userFunctionRequestId: string;
}

interface SchedulerLog {
    logs: ServiceLogs;
    deployment: {
        provider: string;
        region: string;
    };
    decisionLogs: DecisionLog[];
}

interface RunnerLog {
    url: string;
    status: number;
    currentRegionLoad: number;
    logs: ServiceLogs;
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
    scheduler?: SchedulerLog;
    runner?: RunnerLog;
    returner?: ReturnerLog;
}

interface StatusResponse {
    status: 'unknown' | 'firstResponder' | 'scheduler' | 'runner' | 'returner';
    steps: { done: number; from: number };
    logs: LogObject;
    payload?: string;
}

interface LogWatcherResponse {
    requestIds: string[];
    functionName: string;
    logs: {
        timestamp?: number;
        message?: string;
        ingestionTime?: number;
    }[];
}
