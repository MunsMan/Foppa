export interface OptimizationRequest {
    username: string;
    functionId: string;
    executionId: string;
    payload?: string;
}

type CloudProvider = 'aws'

export interface FunctionRunRequest extends OptimizationRequest {
    deployment: {
        provider: CloudProvider;
        region: string;
    }
}
