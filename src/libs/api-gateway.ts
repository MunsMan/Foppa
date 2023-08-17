import {
    ApiGatewayV2Client,
    CreateApiCommand,
    CreateDeploymentCommand,
    CreateIntegrationCommand,
    CreateRouteCommand,
    CreateStageCommand,
    ProtocolType,
} from '@aws-sdk/client-apigatewayv2';
import type {
    APIGatewayProxyEvent as AWSAPIGatewayProxyEvent,
    APIGatewayProxyResult,
    Handler,
} from 'aws-lambda';
import type { FromSchema } from 'json-schema-to-ts';
import type { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import type { Region } from '@consts/aws';

type ValidatedAPIGatewayProxyEvent<S> = Omit<AWSAPIGatewayProxyEvent, 'body'> & {
    body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
    ValidatedAPIGatewayProxyEvent<S>,
    APIGatewayProxyResult
>;
export type APIGatewayProxyEvent = Handler<AWSAPIGatewayProxyEvent, APIGatewayProxyResult>;

export const formatJSONResponse = (
    response: { [key in string]: any },
    statusCode: number = 200
) => {
    return {
        statusCode,
        body: JSON.stringify(response),
    };
};

// Create and conntect API Gateway
//
// 1. Create Api Gateway
// 2. Create Api Route
// 3. Connetct to Lambda
// 4. (Optional) Add Auth

interface ApiGateway {}

class AwsApiGateway implements ApiGateway {
    private apiClient: ApiGatewayV2Client;
    private apiId: string;

    constructor(region: Region, credentials?: AwsCredentialIdentityProvider) {
        this.apiClient = new ApiGatewayV2Client({ region, credentials });
    }

    static fromApiId = (apiId: string, region: Region) => {
        const api = new AwsApiGateway(region);
        api.apiId = apiId;
        return api;
    };

    setupApiGateway = async (apiName: string, lambda?: string) => {
        const api = await this.createApiGateway(apiName, 'HTTP', lambda);
        this.apiId = api.ApiId;
        return api;
    };

    createApiGateway = async (
        name: string,
        protocol: ProtocolType = 'HTTP',
        lambda?: string | undefined
    ) => {
        const response = await this.apiClient.send(
            new CreateApiCommand({
                Name: name,
                ProtocolType: protocol,
                Target: lambda,
                RouteKey: 'POST /invoke',
                CredentialsArn: 'arn:aws:iam::807699729275:role/LabRole',
            })
        );
        console.log('[INFO] - createApiGateway');
        console.log(response);
        return response;
    };

    addStage = async (stageName: string) => {
        const response = await this.apiClient.send(
            new CreateStageCommand({ ApiId: this.apiId, StageName: stageName })
        );
        console.log('[INFO] - addStage');
        console.log(response);
        return response;
    };

    addRoute = async (routeName: string, target: string, method = 'POST') => {
        const response = await this.apiClient.send(
            new CreateRouteCommand({
                ApiId: this.apiId,
                RouteKey: `${method} /${routeName}`,
                AuthorizationType: 'NONE',
                Target: `integrations/${target}`,
            })
        );
        console.log('[INFO] - addRoute');
        console.log(response);
        return response;
    };

    addIntegration = async (lambdaUri: string) => {
        const response = await this.apiClient.send(
            new CreateIntegrationCommand({
                ApiId: this.apiId,
                IntegrationType: 'AWS_PROXY',
                IntegrationUri: lambdaUri,
                IntegrationMethod: 'POST',
                PayloadFormatVersion: '2.0',
            })
        );
        console.log('[INFO] - addIntegration');
        console.log(response);
        return response.IntegrationId;
    };

    deploy = async (stage?: string, description?: string) => {
        const response = await this.apiClient.send(
            new CreateDeploymentCommand({
                ApiId: this.apiId,
                StageName: stage,
                Description: description,
            })
        );
        console.log(response);
        return response;
    };
}

export default AwsApiGateway;
