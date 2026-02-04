exports.handler = async (event) => {
    // Mock Micro-Zones for Coimbatore
    const zones = [
        {
            id: "Z01",
            name: "Ukkadam Settlement",
            coordinates: { lat: 10.998, lng: 76.961 },
            infrastructure: {
                drainageQuality: 0.2, // Very poor
                wiringDensity: 0.9, // Dangerous
                sanitationScore: 0.3,
                populationDensity: 12000,
                fuelDensity: 0.8 // High usage of firewood/waste
            },
            notes: "High risk of fire due to wiring + fuel density"
        },
        {
            id: "Z02",
            name: "Gandhipuram Central",
            coordinates: { lat: 11.016, lng: 76.955 },
            infrastructure: {
                drainageQuality: 0.6,
                wiringDensity: 0.5,
                sanitationScore: 0.7,
                populationDensity: 8000,
                fuelDensity: 0.2
            },
            notes: "Moderate risk, better drainage"
        },
        {
            id: "Z03",
            name: "Singanallur Fringe",
            coordinates: { lat: 10.999, lng: 77.021 },
            infrastructure: {
                drainageQuality: 0.4,
                wiringDensity: 0.6,
                sanitationScore: 0.4,
                populationDensity: 5000,
                fuelDensity: 0.5
            },
            notes: "Water stagnation prone areas"
        }
    ];

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(zones)
    };
};
