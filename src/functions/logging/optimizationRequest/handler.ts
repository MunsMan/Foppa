import { putLog } from "@libs/s3";
import type { SNSEvent } from "aws-lambda";

const optimizationRequest = async (event: SNSEvent) => {
    const { username, functionId, executionId, logs } = JSON.parse(event.Records[0].Sns.Message) as OptimizationRequest;
    const log = {
        username,
        functionId,
        executionId,
        firstResponder: {
            ...logs
        }
    }
    console.log(log)
    return await putLog('foppa-logs', { username, functionId, executionId }, log)

}

export const main = optimizationRequest;
