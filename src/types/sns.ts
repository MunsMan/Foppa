export interface OptimizationRequest {
    username: string;
    functionId: string;
    executionId: string;
    body?: string;
}

type CloudProvider = 'aws'

export interface FunctionRunRequest extends OptimizationRequest {
    deployment: {
        provider: CloudProvider;
        region: string;
    }
}
