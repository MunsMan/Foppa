import AwsApiGateway from '@libs/api-gateway';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import axios from 'axios';

const credentials = fromIni({ profile: 'foppa' });

const region = 'us-west-2';
const apiName = `foppa-${region}-api-entry`;
// const stage = 'test';
// const route = 'foppa-aws-runner';
const lambdaARN = 'arn:aws:lambda:us-west-2:807699729275:function:foppa-aws-runner';
const role = 'arn:aws:iam::396912327770:role/LabRole';

const setup_api = async () => {
    const api = new AwsApiGateway(region, credentials);
    const apiInfos = await api.setupApiGateway(apiName, role, lambdaARN);
    // await api.addStage(stage);
    // const integrationId = await api.addIntegration(lambdaARN);
    // await api.addRoute(route, integrationId);
    // await api.deploy(stage, 'This is just a test deployment');
    // console.log(api);
    return apiInfos.ApiEndpoint;
};

const main = async () => {
    let url: string = 'https://qmz774n7l5.execute-api.us-west-2.amazonaws.com';
    if (!url) {
        url = await setup_api();
    }
    url = `${url}/invoke`;
    const response = await axios.post(
        url,
        { functionName: 'test123', payload: JSON.stringify({ test: 123 }) },
        { headers: { 'Content-Type': 'application/json' } }
    );
    console.log(response.statusText);
    console.log(response.status);
    console.log(response.data);
};

main();
