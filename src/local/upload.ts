import { LambdaClient } from '@aws-sdk/client-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { uploadLambda } from '@libs/lambda';
import { localS3Upload } from '@libs/s3';

const credentials = fromIni({ profile: 'foppa' });
const clientConfig = {
    credentials,
    region: 'eu-central-1',
};
const s3Client = new S3Client(clientConfig);
const lambdaClient = new LambdaClient(clientConfig);

const username = 'test';
const functionName = 'test';
const bucket = 'foppa';
const role = 'arn:aws:iam::807699729275:role/LabRole';

if (process.argv.length === 3) {
    const file = process.argv[2];
    localS3Upload(s3Client, functionName, file, bucket, username).then((response) => {
        console.log(response);
        uploadLambda(lambdaClient, functionName, username, 'handler.main', role);
    });
    console.log('lambda is uploaded!');
} else {
    console.log(process.argv);
}
