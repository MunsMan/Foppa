const variables = {
    REGION: 'us-east-1',
    OPTIMIZATION_REQUEST_TOPIC_ARN: 'arn:aws:sns:us-east-1:807699729275:OptimizationRequests',
    RUN_REQUEST_TOPIC_ARN: 'arn:aws:sns:us-east-1:807699729275:RunRequest',
    FUNCTION_EXECUTION_COUNTER_ARN: 'arn:aws:dynamodb:us-east-1:807699729275:table/FunctionExecutionCounter',
    LOGGING_BUCKET_NAME: 'foppa-logs',
    FOPPA_BUCKET_NAME: 'foppa'
} as const;

export default variables;
