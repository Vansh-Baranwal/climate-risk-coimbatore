const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.USERS_TABLE;

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { username, password } = body;

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

        // 2. Create new Citizen user
        // Force role to 'Citizen' as requested (Admin is singleton/pre-seeded)
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                username,
                password,
                role: 'Citizen'
            }
        }));

        return {
            statusCode: 201, // Created
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ success: true, username, role: 'Citizen' })
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
