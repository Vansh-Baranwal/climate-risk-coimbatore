exports.handler = async (event) => {
    // Compound Reasoning: "Fire during Flood"
    // Checks for intersection of high water stagnation AND high wiring density

    try {
        const body = JSON.parse(event.body);
        const { zone, weather } = body;

        const results = [];

        // Logic 1: Fire during Flood
        // If rain is high (>5) AND wiring is bad (>0.7), risk is EXTREME
        // because water conducts electricity -> short circuits -> fire in cramped spaces
        if (weather.rainfall_1h > 2 && zone.infrastructure.wiringDensity > 0.6) {
            results.push({
                id: "COMP-001",
                title: "Electrocution & Short-Circuit Fire",
                severity: "EXTREME",
                amplification: "3.5x",
                reason: "Combination of water logging and exposed wiring creates deadly shock/fire hazards."
            });
        }

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                compoundRisks: results
            })
        };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};
