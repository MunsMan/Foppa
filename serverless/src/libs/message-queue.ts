import type { SNSClient, PublishCommandInput } from '@aws-sdk/client-sns'
import { PublishCommand } from '@aws-sdk/client-sns'

export const sendMessage = async (sns: SNSClient, topicArn: string, message: Object) => {
    const input: PublishCommandInput = {
        TopicArn: topicArn,
        Message: JSON.stringify(message)
    }
    const command = new PublishCommand(input)
    const response = await sns.send(command)
    return response.MessageId ?? ""
}
