const variables = {
    REGION: 'us-east',
    REDIS_URL: 'redis://redis-cluster.b5z3ub.clustercfg.use1.cache.amazonaws.com:6379',
    TOPIC_ARN: 'arn:aws:sns:us-east-1:807699729275:OptimizationRequests'
} as const;

export default variables;
