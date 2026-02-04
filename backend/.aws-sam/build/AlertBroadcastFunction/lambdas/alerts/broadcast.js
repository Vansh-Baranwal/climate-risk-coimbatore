const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.ALERTS_TABLE;

exports.handler = async (event) => {
    const method = event.httpMethod;

    try {
        if (method === 'GET') {
            // Fetch recent alerts
            const command = new ScanCommand({
                TableName: TABLE_NAME,
                Limit: 10 // Just get last 10
            });
            const response = await docClient.send(command);

            // Sort by timestamp desc
            const alerts = response.Items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(alerts)
            };
        }
        else if (method === 'POST') {
            const body = JSON.parse(event.body);
            const { type, message, zoneId, severe } = body;

            const alert = {
                id: uuidv4(),
                timestamp: new Date().toISOString(),
                type,     // e.g., "FLOOD", "FIRE"
                message,
                zoneId,   // "Z01" or "ALL"
                severe: severe || false
            };

            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: alert
            }));

            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ success: true, alert })
            };
        }
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: e.message })
        };
    }
};
