const variables = {
    REGION: 'eu-central-1',
    OPTIMIZATION_REQUEST_TOPIC_ARN:
        'arn:aws:sns:eu-central-1:717556240325:OptimizationRequestTopic',
    RUN_REQUEST_TOPIC_ARN: 'arn:aws:sns:eu-central-1:717556240325:ExecutionRequestTopic',
    LOGGING_BUCKET_NAME: 'foppa-logs',
    FOPPA_BUCKET_NAME: 'foppa',
    SERVICE_URL: 'https://bffa3z498i.execute-api.eu-central-1.amazonaws.com',
    PRIVATE_KEY: process.env.PRIVATE_KEY,
} as const;

export default variables;
