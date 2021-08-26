import "reflect-metadata";
import {handler} from "./lambda";
import { SQSClient, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import {SqsEventPayload} from "@pristine-ts/aws";

const main = async () => {
    console.log("Starting the polling of the SQS Queue.")

    const client = new SQSClient({
        endpoint: "http://localhost:9324",
        region: "default",
    })

    const command = new ReceiveMessageCommand({
        QueueUrl: "http://localhost:9324/queue/default",
        WaitTimeSeconds: 20,
        MaxNumberOfMessages: 10,
    });

    while(true) {
        console.log("Looping")

        try {
            const response = await client.send(command);

            const event: {
                Records: SqsEventPayload[]
            } = {
                Records: []
            }

            response.Messages?.forEach(message => {
                const eventPayload: SqsEventPayload =  {
                    eventSource: "aws:sqs",
                    messageId: message.MessageId!,
                    body: message.Body!,
                    receiptHandle: message.ReceiptHandle!,
                    md5OfBody: message.MD5OfBody!,
                    awsRegion: "default",
                }

                event.Records.push(eventPayload);
            })

            // @ts-ignore
            await handler(event, {});

            console.log(response);
        }catch (e) {
            console.log(e);
        }
    }
}


main().then(value => {
    console.log("Process completed.");
});