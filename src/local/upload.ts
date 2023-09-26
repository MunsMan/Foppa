import axios from 'axios';
import { readFileSync } from 'node:fs';
import variables from 'variables';

const username = 'munsman';
const functionName = 'foppa-test-fib';
const role = 'arn:aws:iam::717556240325:role/Foppa_default_lambda_role';

if (process.argv.length === 3) {
    const file = process.argv[2];
    const code = readFileSync(file).toString('base64');
    axios.post(`${variables.SERVICE_URL}/create/${username}`, {
        zip_file: code,
        role,
        functionName,
        regions: ['eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1'],
        handler: 'index.handler',
        runtime: 'nodejs18.x',
        memorySize: 128,
        timeout: 128,
        env: {},
    });
    console.log('lambda is uploaded!');
} else {
    console.log(process.argv);
}
