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

interface ServiceLog {
    requestId: string;
    executionStart: number;
    executionEnd: number;
}

interface ReturnerLog {
    logs: ServiceLog;
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
    userFunctionRequestId: string;
}

interface SchedulerLog {
    logs: ServiceLog;
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
    logs: ServiceLog;
}

interface LogObject {
    username: string;
    functionId: string;
    executionId: string;
    body: boolean;
    firstResponder: {
        logs: ServiceLog;
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

interface FunctionConfig {
    functionName: string;
    code: Buffer;
    handler: string;
    role: string;
    runtime: string;
    memorySize?: number;
    timeout?: number;
    env?: { [key in string]: string };
}
