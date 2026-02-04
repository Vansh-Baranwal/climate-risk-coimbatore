exports.handler = async (event) => {
    // What-if actions
    // Input: baseMultiplier, action { type: 'pump', 'power_cut', 'tanker' }

    try {
        const body = JSON.parse(event.body);
        const { zone, weather, action } = body;

        let multiplierBefore = 2.5; // default mock
        // Ideally we call the engines here, but for simulation speed we can estimate

        let multiplierAfter = multiplierBefore;
        let tradeoffs = [];
        let description = "";

        switch (action) {
            case 'pump':
                // Reduces flood/disease risk, but might not help fire
                multiplierAfter = multiplierBefore * 0.6; // 40% reduction
                description = "Deployed heavy duty pumps to clear stagnation.";
                tradeoffs.push("Requires fuel/electricity availability.");
                break;
            case 'power_cut':
                // Reduces fire risk to near zero
                // INCREASES SAFETY significantly for 'Fire during Flood'
                multiplierAfter = multiplierBefore * 0.2;
                description = "Pre-emptive power shutdown.";
                tradeoffs.push("Loss of communication and lighting at night.");
                break;
            case 'tanker':
                // Supply clean water -> reduces disease risk from bad sanitation water usage
                multiplierAfter = multiplierBefore * 0.8;
                description = "Emergency water tankers supplied.";
                break;
            default:
                break;
        }

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                action,
                beforeMultiplier: multiplierBefore,
                afterMultiplier: BigDecimal(multiplierAfter),
                description,
                tradeoffs
            })
        };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};

function BigDecimal(num) {
    return parseFloat(num.toFixed(2));
}
