const variables = {
    REGION: 'us-east-1',
    REDIS_URL: 'redis://redis-cluster.b5z3ub.clustercfg.use1.cache.amazonaws.com:6379',
    OPTIMIZATION_REQUEST_TOPIC_ARN: 'arn:aws:sns:us-east-1:807699729275:OptimizationRequests',
    RUN_REQUEST_TOPIC_ARN: 'arn:aws:sns:us-east-1:807699729275:RunRequest',
    FUNCTION_EXECUTION_COUNTER_ARN: 'arn:aws:dynamodb:us-east-1:807699729275:table/FunctionExecutionCounter'
} as const;

export default variables;
