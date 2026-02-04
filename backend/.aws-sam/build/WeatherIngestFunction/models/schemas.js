// backend/models/schemas.js

const Schemas = {
  Zone: {
    id: "string", // zone-001
    name: "string", // "Gandhipuram Slum"
    coordinates: "object", // { lat, lng }
    infrastructure: {
      drainageQuality: "number", // 0-1 (0 = bad)
      wiringDensity: "number", // 0-1 (1 = heavy tangle)
      sanitationScore: "number", // 0-1 (0 = open sewage)
      populationDensity: "number", // people per sq km
      fuelDensity: "number" // 0-1 (accumulation of flammable waste)
    }
  },
  WeatherContext: {
    temp: "number",
    humidity: "number",
    rainfall_1h: "number",
    rainfall_24h: "number", // estimated
    floodProxyIndex: "number" // calculated from rainfall + drainage
  },
  RiskResponse: {
    requestId: "string",
    zoneId: "string",
    multiplier: "number", // > 1.0 means amplification
    causes: [
      {
        factor: "string", // "Exposed Wiring"
        weight: "number",
        explanation: "string"
      }
    ],
    context: "object", // WeatherContext
    disclaimer: "Not prediction – infrastructure amplification"
  }
};

module.exports = Schemas;
