import { AzureFunction, Context, HttpRequest } from "@azure/functions"
const { EventHubProducerClient } = require("@azure/event-hubs");
import * as dotenv from "dotenv";

// Load the .env file if it exists
dotenv.config();

// Define connection string and related Event Hubs entity name here
const connectionString = process.env["EVENTHUB_CONNECTION_STRING"] || "";
const eventHubName = process.env["EVENTHUB_NAME"] || "";
// console.log({ connectionString, eventHubName })
async function main(payload) {

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
}


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
    // console.log(JSON.stringify(req.body))

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: { success: true, responseMessage }
    };
    try {
        await main(req.body)
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