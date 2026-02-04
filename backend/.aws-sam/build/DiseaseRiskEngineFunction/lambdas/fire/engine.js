exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { weather, zone } = body;
        // Logic: FIRE AMPLIFICATION
        // Base multiplier: 1.0
        // + Wiring Density (if > 0.7) -> significant boost
        // + Fuel Density -> boost
        // + Temp -> slight boost if high
        // + Flood Proxy -> CAN REDUCE fire risk?? Or increase "Electrical Short Circuit Risk"?
        // Specs: "Fire during flood" is a compound risk. Here we focus on Fire Amplification.

        // Let's assume this engine focuses on "Dry/Electrical Fire Risk" primarily, 
        // but maybe the user wants the specific "Flood+Wiring" check here?
        // User spec for DelayedRiskExecutor mentions "compound reasoning (fire-during-flood)".
        // So this engine can focus on the infrastructure amplification.

        let multiplier = 1.0;
        const causes = [];

        // Check Wiring
        if (zone.infrastructure.wiringDensity > 0.7) {
            const boost = zone.infrastructure.wiringDensity * 2.0;
            multiplier += boost;
            causes.push({
                factor: "Exposed Wiring Density",
                weight: boost,
                explanation: `High density of informal wiring (${zone.infrastructure.wiringDensity}) creates ignition points.`
            });
        }

        // Check Temperature
        if (weather.temp > 35) {
            const boost = 0.5;
            multiplier += boost;
            causes.push({
                factor: "High Ambient Temperature",
                weight: boost,
                explanation: ">35°C heat increases material flammability."
            });
        }

        // Check Fuel Density
        if (zone.infrastructure.fuelDensity > 0.5) {
            const boost = zone.infrastructure.fuelDensity * 1.5;
            multiplier += boost;
            causes.push({
                factor: "Stored Fuel/Waste",
                weight: boost,
                explanation: "Accumulation of dry flammable waste allows rapid spread."
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
        console.error("Fire Risk Calc Error", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
