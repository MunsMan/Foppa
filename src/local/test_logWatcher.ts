import axios from 'axios';

const url = 'https://bffa3z498i.execute-api.eu-central-1.amazonaws.com/logs';

const pullLogs = async (functionName: string, requestId: string[]) => {
    let now = new Date(Date.now());
    let executionStart = now.setHours(now.getHours() - 1);
    const request = await axios.post(url, {
        functionName,
        requestId,
        region: 'eu-central-1',
        executionStart,
    });
    console.dir(request.data, { depth: null });
};

const requestId = ['50c4564b-f02d-417f-91f8-4f552fb62c59'];
const functionName = 'firstResponder';

pullLogs(functionName, requestId);
