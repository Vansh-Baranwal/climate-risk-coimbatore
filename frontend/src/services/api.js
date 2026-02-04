const API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

export const fetchWeather = async () => {
    try {
        const res = await fetch(`${API_URL}/weather`);
        if (!res.ok) throw new Error("Failed to fetch weather");
        return res.json();
    } catch (error) {
        console.error(error);
        // Return mock if failed (for purely frontend dev without backend running)
        return {
            normalized: { temp: 30, humidity: 60, rainfall_1h: 5, description: "Mock Rain" },
            floodProxyIndex: 8
        };
    }
};

export const fetchZones = async () => {
    try {
        const res = await fetch(`${API_URL}/zones`);
        if (!res.ok) throw new Error("Failed to fetch zones");
        return res.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const calculateFireRisk = async (weather, zone) => {
    try {
        const res = await fetch(`${API_URL}/risk/fire`, {
            method: "POST",
            body: JSON.stringify({ weather, zone })
        });
        return res.json();
    } catch (e) { console.error(e); return null; }
};

export const calculateDiseaseRisk = async (weather, zone) => {
    try {
        const res = await fetch(`${API_URL}/risk/disease`, {
            method: "POST",
            body: JSON.stringify({ weather, zone })
        });
        return res.json();
    } catch (e) { console.error(e); return null; }
};

export const fetchTimeline = async (stagnationDays) => {
    try {
        const res = await fetch(`${API_URL}/risk/delayed/schedule`, {
            method: "POST",
            body: JSON.stringify({ stagnationDays })
        });
        return res.json();
    } catch (e) { console.error(e); return null; }
};

export const runSimulation = async (zone, weather, action) => {
    try {
        const res = await fetch(`${API_URL}/simulation`, {
            method: "POST",
            body: JSON.stringify({ zone, weather, action })
        });
        return res.json();
    } catch (e) { console.error(e); return null; }
}


export const loginUser = async (username, password) => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) throw new Error("Login failed");
        return res.json();
    } catch (e) { console.error(e); return { error: e.message }; }
};

export const fetchAlerts = async () => {
    try {
        const res = await fetch(`${API_URL}/alerts`);
        if (!res.ok) throw new Error("Failed to fetch alerts");
        return res.json();
    } catch (e) { console.error(e); return []; }
};

export const postAlert = async (alertData) => {
    try {
        const res = await fetch(`${API_URL}/alerts`, {
            method: "POST",
            body: JSON.stringify(alertData)
        });
        return res.json();
    } catch (e) { console.error(e); return null; }
};
