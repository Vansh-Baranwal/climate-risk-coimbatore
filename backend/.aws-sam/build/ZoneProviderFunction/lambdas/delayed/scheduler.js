exports.handler = async (event) => {
    // Builds the timeline of disaster phases
    // Input: result from evaluator (stagnation days) + weather forecast (optional)

    // For prototype, we generate a timeline based on current context
    try {
        const body = JSON.parse(event.body);
        const { stagnationDays } = body; // from evaluator

        const timeline = [];
        const today = new Date();

        // Phase 1: Immediate Impact (Day 0-1)
        timeline.push({
            phase: "Immediate Impact",
            days: "0-2",
            riskType: "Structural/Electrical",
            description: "Risk of wall collapse and electrical shocks due to dampness."
        });

        // Phase 2: Water Stagnation (Day 2 - X)
        if (stagnationDays > 2) {
            timeline.push({
                phase: "Stagnation",
                days: `2-${stagnationDays}`,
                riskType: "Mobility/Livelihood",
                description: "Roads blocked, loss of daily wages, water intrusion."
            });
        }

        // Phase 3: Outbreak (Day 5 - 14)
        timeline.push({
            phase: "Vector-borne Disease",
            days: "5-14",
            riskType: "Health",
            description: "Dengue/Malaria incubation period active if water remains."
        });

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                timeline
            })
        };

    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    }
};
