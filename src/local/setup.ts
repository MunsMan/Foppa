import { S3Client } from '@aws-sdk/client-s3'
import { uploadCodeS3 } from '@libs/s3'
import { exec } from 'child_process'
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { createSpinner } from 'nanospinner';



const shell = async (command: string) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stdin) => {
            if (error) {
                reject(error)
            }
            if (stdout) {
                resolve([stdin, stdout])
            }
        })
    })
}

const credentials = fromIni({ profile: 'foppa' });

const clientConfig = {
    credentials,
    region: 'us-east-1',
}

// Uploading the to AWS Lambda Wrapper Functions
const main = async () => {
    const s3 = new S3Client(clientConfig);
    const bucket = 'foppa'
    const username = 'foppa'


    await shell('yarn sls package');

    const uploadSpinner = createSpinner('uploading code...')

    uploadSpinner.start();
    Promise.all([
        uploadCodeS3(s3, 'foppa-aws-runner', '.serverless/awsRunner.zip', bucket, username),
        uploadCodeS3(s3, 'foppa-aws-returner', '.serverless/awsReturner.zip', bucket, username)
    ])
        .then(() => { uploadSpinner.success() })
        .catch((error) => { uploadSpinner.error({ text: error }) })
}

main()
