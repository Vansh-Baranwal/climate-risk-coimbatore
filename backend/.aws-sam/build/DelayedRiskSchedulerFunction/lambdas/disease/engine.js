exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { weather, zone } = body;

        // Logic: DISEASE AMPLIFICATION
        // Driven by: Sanitation Quality + Water Stagnation (Rainfall / Drainage)

        let multiplier = 1.0;
        const causes = [];

        const drainage = zone.infrastructure.drainageQuality; // 0 (bad) to 1 (good)
        const sanitation = zone.infrastructure.sanitationScore; // 0 (bad)
        const rain = weather.rainfall_1h;

        // Drain failure effect
        let drainageFactor = (1 - drainage); // 0.8 means BAD drainage
        if (rain > 2) {
            // Rain amplifies bad drainage
            const boost = drainageFactor * (rain / 2); // simplistic mapping
            multiplier += boost;
            causes.push({
                factor: "Drainage Failure",
                weight: parseFloat(boost.toFixed(2)),
                explanation: `Poor drainage (${drainage}) under rainfall load causes immediate stagnation.`
            });
        }

        // Sanitation amplification
        let sanitationFactor = (1 - sanitation); // 0.7 means BAD sanitation
        if (sanitationFactor > 0.5) {
            const boost = sanitationFactor * 1.5;
            multiplier += boost;
            causes.push({
                factor: "Open Sanitation Exposure",
                weight: parseFloat(boost.toFixed(2)),
                explanation: "Low sanitation score indicates presence of vectors (mosquitoes/bacteria)."
            });
        }

        const response = {
            requestId: new Date().getTime().toString(),
            zoneId: zone.id,
            multiplier: parseFloat(multiplier.toFixed(2)),
            causes,
            context: { weather },
            disclaimer: "Not prediction – infrastructure amplification"
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
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
