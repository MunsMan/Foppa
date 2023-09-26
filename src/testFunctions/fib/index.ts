import { APIGatewayProxyResult, Context } from 'aws-lambda';

const fib = (n: number) => {
    if (n === 0) return 0;
    if (n === 1) return 1;
    return fib(n - 1) + fib(n - 2);
};

export const handler = async (event: any, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(event);
    const n = JSON.parse(event?.body ?? '').n;
    const fibStart = Date.now();
    const result = fib(n);
    const fibEnd = Date.now();
    return {
        statusCode: 200,
        body: JSON.stringify({
            requestId: context.awsRequestId,
            result,
            fibStart,
            fibEnd,
        }),
    };
};
