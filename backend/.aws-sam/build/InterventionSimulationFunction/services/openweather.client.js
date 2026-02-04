// backend/services/openweather.client.js
const https = require('https');

// Simple fetch implementation using native https to avoid dependencies if possible, 
// or we can assume fetch is available in Node 18+ Lambda runtime.
// For robustness, I'll use a helper wrapper around fetch.

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const fetchWeather = async (city = 'Coimbatore') => {
    if (!API_KEY) {
        console.warn("OPENWEATHER_API_KEY is missing. Using mock data.");
        return getMockWeather();
    }

    const url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Weather API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return normalizeWeatherData(data);
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        return getMockWeather(); // Fallback to mock on error
    }
};

const getMockWeather = () => {
    return {
        raw: {},
        normalized: {
            temp: 32,
            humidity: 65,
            rainfall_1h: 0, // mm
            description: "Mock Clear Sky"
        }
    };
};

const normalizeWeatherData = (data) => {
    return {
        raw: data,
        normalized: {
            temp: data.main.temp,
            humidity: data.main.humidity,
            rainfall_1h: data.rain ? (data.rain['1h'] || 0) : 0,
            description: data.weather[0].description
        }
    }
}

module.exports = {
    fetchWeather
};
