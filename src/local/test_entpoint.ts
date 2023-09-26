import axios from 'axios';

const URL = 'https://dh53itqxp4.execute-api.eu-west-1.amazonaws.com/invoke';
const BODY = {
    uFunctionId: 'munsman/4',
    pregion: 'aws/eu-west-1',
    executionId: 0,
    functionName: 'foppa-test-fib',
    payload: JSON.stringify({ n: 2 }),
};

axios.post(URL, BODY).then((res) => console.log(res));
