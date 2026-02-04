const weatherClient = require('../../services/openweather.client');

exports.handler = async (event) => {
    try {
        const weatherData = await weatherClient.fetchWeather('Coimbatore');

        // Calculate Flood Proxy Index (Simple logic: High rain = high proxy)
        // 0-10 scale. > 5mm/hr is getting dangerous in bad infrastructure
        const rain = weatherData.normalized.rainfall_1h;
        const floodProxyIndex = Math.min(rain * 2, 10); // 5mm rain -> index 10

        const response = {
            ...weatherData.normalized,
            floodProxyIndex,
            city: "Coimbatore",
            timestamp: new Date().toISOString()
        };

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error("Error in Weather Ingest:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to ingest weather data" })
        };
    }
};
