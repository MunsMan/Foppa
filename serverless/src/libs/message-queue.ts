import type { SNSClient, PublishCommandInput } from '@aws-sdk/client-sns'
import { PublishCommand } from '@aws-sdk/client-sns'


export const sendMessage = async (client: SNSClient, topicArn: string, message: Object) => {
    const input: PublishCommandInput = {
        TopicArn: topicArn,
        Message: JSON.stringify(message)
    }
    const command = new PublishCommand(input)
    const response = await client.send(command)
    return response.MessageId ?? ""
}
