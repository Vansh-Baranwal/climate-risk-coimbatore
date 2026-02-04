exports.handler = async (event) => {
    // Evaluates immediate stagnation vs long term outbreak
    // Simple logic for prototype: 
    // If rain > X today, predict Stagnation Days based on drainage.
    try {
        const body = JSON.parse(event.body);
        const { weather, zone } = body;

        const drainageQuality = zone.infrastructure.drainageQuality; // 0.2
        const rain = weather.rainfall_1h; // 5mm

        // Estimate Stagnation
        // Bad drainage + High rain = Long Stagnation
        let daysStagnant = 0;
        if (rain > 0) {
            daysStagnant = Math.ceil((rain * 2) * (1 - drainageQuality));
            // e.g. 5mm * 2 = 10. * 0.8 (bad drain) = 8 days stagnation
        }

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                zoneId: zone.id,
                stagnationDays: daysStagnant,
                riskWindow: {
                    start: 5, // typical incubation
                    end: 5 + daysStagnant + 7 // duration
                }
            })
        };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};
