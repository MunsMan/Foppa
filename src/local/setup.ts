import { S3Client } from '@aws-sdk/client-s3';
import { localS3Upload } from '@libs/s3';
import { exec } from 'child_process';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { createSpinner } from 'nanospinner';
import * as fs from 'fs/promises';
import { chdir } from 'process';

const shell = async (command: string) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stdin) => {
            if (error) {
                console.error(error);
                reject(error);
            }
            console.log(stdin, stdout);
            resolve([stdin, stdout]);
        });
    });
};

const credentials = fromIni({ profile: 'foppa' });

const clientConfig = {
    credentials,
    region: 'us-east-1',
};

const transformPackage = async (filename: string, outputName: string) => {
    await shell(`unzip -o tmp/${filename}.zip -d tmp/${filename}`);
    await shell(`mkdir -p dist/${outputName}`);
    console.log('reading files');
    let files = await fs.readdir(`tmp/${filename}`, { withFileTypes: true, recursive: true });
    files = files.filter((file) => file.isFile());
    for (let file of files) {
        shell(`mv ${file.path}/${file.name} dist/${outputName}/${file.name}`);
    }
    chdir(`dist/${outputName}`);
    await shell(`zip ${outputName}.zip ${files.map((file) => file.name).join(' ')}`);
    chdir(`../..`);
    await shell(`mv dist/${outputName}/${outputName}.zip dist/${outputName}.zip`);
    console.log(files);
};

const getEnvVariables = async (filename: string, outputName: string) => {
    const file = await fs.readFile('.serverless/cloudformation-template-update-stack.json');
    const cloudFormation = JSON.parse(file.toString());
    const resourceName = filename.slice(0, 1).toUpperCase() + filename.slice(1) + 'LambdaFunction';
    try {
        const enviromnt =
            cloudFormation['Resources'][resourceName]['Properties']['Environment']['Variables'];
        fs.writeFile(`dist/${outputName}.json`, JSON.stringify(enviromnt));
    } catch {
        fs.writeFile(`dist/${outputName}.json`, JSON.stringify({}));
    }
};

// Uploading the to AWS Lambda Wrapper Functions
const main = async () => {
    const s3 = new S3Client(clientConfig);
    const bucket = 'foppa';
    const username = 'foppa';

    await shell('yarn sls package');

    await shell('cp .serverless/awsRunner.zip tmp/awsRunner.zip');
    await shell('cp .serverless/awsReturner.zip tmp/awsReturner.zip');
    await Promise.allSettled([
        transformPackage('awsRunner', 'foppa-aws-runner'),
        transformPackage('awsReturner', 'foppa-aws-returner'),
        getEnvVariables('awsRunner', 'foppa-aws-runner'),
        getEnvVariables('awsReturner', 'foppa-aws-returner'),
    ]);

    const uploadSpinner = createSpinner('uploading code...');

    uploadSpinner.start();
    Promise.all([
        localS3Upload(s3, 'foppa-aws-runner', 'dist/foppa-aws-runner.zip', bucket, username),
        localS3Upload(s3, 'foppa-aws-returner', 'dist/foppa-aws-returner.zip', bucket, username),
        localS3Upload(
            s3,
            'foppa-aws-runner',
            'dist/foppa-aws-runner.json',
            bucket,
            username,
            'json'
        ),
        localS3Upload(
            s3,
            'foppa-aws-returner',
            'dist/foppa-aws-returner.json',
            bucket,
            username,
            'json'
        ),
    ])
        .then(() => {
            uploadSpinner.success();
        })
        .catch((error) => {
            uploadSpinner.error({ text: error });
        });
};

main();
