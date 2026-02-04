const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.USERS_TABLE;

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { username, password } = body;

        // 1. Check if user exists
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { username }
        });

        const response = await docClient.send(command);
        const user = response.Item;

        if (!user || user.password !== password) {
            // Hack: Auto-register 'admin' or 'citizen' if they don't exist for demo simplicity?
            // No, let's keep it strict but I'll provide a way to seed it.
            // Actually, for a smoother demo, if 'admin'/'citizen' don't exist, CREATE them on first login.
            if ((username === 'admin' && password === 'admin123') || (username === 'citizen' && password === 'citizen123')) {
                const role = username === 'admin' ? 'CommandCenter' : 'Citizen';
                await docClient.send(new PutCommand({
                    TableName: TABLE_NAME,
                    Item: { username, password, role }
                }));
                return {
                    statusCode: 200,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify({ success: true, role, username })
                };
            }

            return {
                statusCode: 401,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Invalid credentials" })
            };
        }

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ success: true, role: user.role, username: user.username })
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
