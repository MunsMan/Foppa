import { SNSClient, PublishCommandInput } from '@aws-sdk/client-sns'
import { PublishCommand } from '@aws-sdk/client-sns'

const REGION = process.env.REGION


const sns = new SNSClient({ region: REGION })

export const sendMessage = async (topicArn: string, message: Object) => {
    const input: PublishCommandInput = {
        TopicArn: topicArn,
        Message: JSON.stringify(message)
    }
    const command = new PublishCommand(input)
    const response = await sns.send(command)
    return response.MessageId ?? ""
}
