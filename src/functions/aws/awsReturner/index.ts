import { handlerPath } from '@libs/handler-resolver';


export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    environment: {
        SERVICE_URL: { 'Fn::GetAtt': ['HttpApi', 'ApiEndpoint'] }
    }
};
