const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { SNSClient, SubscribeCommand } = require("@aws-sdk/client-sns");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const snsClient = new SNSClient({});

const TABLE_NAME = process.env.USERS_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { username, password, email, mobile } = body;

        if (!username || !password) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Username and password required" })
            };
        }

        // 1. Check if user already exists
        const checkCommand = new GetCommand({
            TableName: TABLE_NAME,
            Key: { username }
        });
        const existing = await docClient.send(checkCommand);

        if (existing.Item) {
            return {
                statusCode: 409,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Username already taken" })
            };
        }

        // 2. Format Mobile (Prepend +91 if missing)
        let formattedMobile = mobile ? mobile.trim() : "";
        if (formattedMobile && !formattedMobile.startsWith("+")) {
            formattedMobile = "+91" + formattedMobile;
        }

        // 3. Create new Citizen user
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                username,
                password,
                email: email || "N/A",
                mobile: formattedMobile || "N/A",
                role: 'Citizen'
            }
        }));

        // 4. Subscribe to SNS Topic (if contact provided)
        if (SNS_TOPIC_ARN) {
            if (email) {
                await snsClient.send(new SubscribeCommand({
                    TopicArn: SNS_TOPIC_ARN,
                    Protocol: "email",
                    Endpoint: email
                }));
            }
            if (formattedMobile) {
                await snsClient.send(new SubscribeCommand({
                    TopicArn: SNS_TOPIC_ARN,
                    Protocol: "sms",
                    Endpoint: formattedMobile
                }));
            }
        }

        return {
            statusCode: 201, // Created
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                success: true,
                username,
                role: 'Citizen',
                msg: "Account created. Please check email/SMS to confirm alerts."
            })
        };

    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: e.message })
        };
    }
};
