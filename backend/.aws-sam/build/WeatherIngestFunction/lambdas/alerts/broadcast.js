const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const snsClient = new SNSClient({});

const TABLE_NAME = process.env.ALERTS_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

exports.handler = async (event) => {
    try {
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            const { type, message, severe, zoneId, temp, rain } = body;
            const timestamp = new Date().toISOString();
            const id = uuidv4();

            const alert = { id, type, message, severe, zoneId, timestamp };

            // 1. Save to DynamoDB
            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: alert
            }));

            // 2. Broadcast via SNS (if Critical)
            if (severe && SNS_TOPIC_ARN) {
                const snsMessage = `🚨 EMERGENCY ALERT: ${type} in Zone ${zoneId}\n\n${message}\n\nConditions:\nTemp: ${temp || 'N/A'}°C\nRain: ${rain || 'N/A'} mm\n\nTake immediate action.`;

                await snsClient.send(new PublishCommand({
                    TopicArn: SNS_TOPIC_ARN,
                    Message: snsMessage,
                    Subject: `CRITICAL ${type} ALERT`
                }));
            }

            return {
                statusCode: 201,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(alert)
            };
        } else if (event.httpMethod === 'GET') {
            // Fetch recent alerts sorted by timestamp (simple scan for demo)
            const command = new ScanCommand({
                TableName: TABLE_NAME,
                Limit: 20
            });
            const response = await docClient.send(command);

            // Sort in memory for simple prototype
            const sortedItems = response.Items.sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );

            return {
                statusCode: 200,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify(sortedItems)
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
