import { AzureFunction, Context, HttpRequest } from "@azure/functions"
const { EventHubProducerClient } = require("@azure/event-hubs");
import * as dotenv from "dotenv";

// Load the .env file if it exists
dotenv.config();

// Define connection string and related Event Hubs entity name here
const connectionString = process.env["EVENTHUB_CONNECTION_STRING"] || "";
const eventHubName = process.env["EVENTHUB_NAME"] || "";
// console.log({ connectionString, eventHubName })
async function sendToEventHub(payload) {

    // Create a producer client to send messages to the event hub.
    const producer = new EventHubProducerClient(connectionString, eventHubName);

    // Prepare a batch of three events.
    const batch = await producer.createBatch();
    batch.tryAdd({ payload });

    // Send the batch to the event hub.
    await producer.sendBatch(batch);

    // Close the producer client.
    await producer.close();

    console.log("A batch of three events have been sent to the event hub");
    return;
}


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: { success: true, data: req?.body || '' }
    };
    try {
        // TODO process the data here 
        await sendToEventHub(req.body)
    } catch (err) {
        context.res = {
            status: 500, /* Defaults to 200 */
            body: JSON.stringify(err)
        };
        return console.log("Error occurred: ", err);
    };
    console.log("SUCCESS")

};

export default httpTrigger;