// Native fetch in Node 18+

// API URL from .env or override here
const BASE_URL = 'https://m43xqfbhfb.execute-api.ap-south-1.amazonaws.com/dev/';

async function debugAlerts() {
    console.log("1. Fetching existing alerts...");
    try {
        const res = await fetch(`${BASE_URL}alerts`);
        const data = await res.json();
        if (data.length !== undefined) {
            console.log("Current Alerts:", data.length);
            if (data.length > 0) console.log(data[0]);
        } else {
            console.log("Response IS NOT ARRAY:", data);
        }
    } catch (e) {
        console.log("Fetch Error:", e);
    }

    console.log("\n2. Posting test alert...");
    try {
        const testAlert = {
            type: "DEBUG_TEST",
            message: "This is a debug alert",
            severe: true,
            zoneId: "zone-1",
            temp: 25,
            rain: 0
        };
        const res = await fetch(`${BASE_URL}alerts`, {
            method: 'POST',
            body: JSON.stringify(testAlert),
            headers: { 'Content-Type': 'application/json' }
        });
        const json = await res.json();
        console.log("Post Result:", res.status, json);
    } catch (e) {
        console.log("Post Error:", e);
    }

    console.log("\n3. Fetching alerts again...");
    try {
        const res = await fetch(`${BASE_URL}alerts`);
        const data = await res.json();
        console.log("Updated Alerts:", data.length);
        const found = data.find(a => a.type === "DEBUG_TEST");
        console.log("Found Test Alert?", !!found);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

debugAlerts();
