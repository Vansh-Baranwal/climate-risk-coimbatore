// Use the VITE_ env var directly if config file doesn't exist, or standard approach

// Use the VITE_ env var directly if config file doesn't exist, or standard approach
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/';

export const fetchWeather = async () => {
    try {
        const res = await fetch(`${BASE_URL}weather`);
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const fetchZones = async () => {
    try {
        const res = await fetch(`${BASE_URL}zones`);
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const calculateFireRisk = async (weather, zone) => {
    try {
        const res = await fetch(`${BASE_URL}risk/fire`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weather, zone })
        });
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const calculateDiseaseRisk = async (weather, zone) => {
    try {
        const res = await fetch(`${BASE_URL}risk/disease`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weather, zone })
        });
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
};

// --- AUTH & ALERTS ---

export const loginUser = async (username, password) => {
    try {
        const res = await fetch(`${BASE_URL}auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.status === 200) return { success: true, ...data };
        return { success: false, error: data.error };
    } catch (e) {
        console.error("Login Error:", e);
        return { error: "Network Error" };
    }
};

export const signupUser = async (username, password, email, mobile) => {
    try {
        const res = await fetch(`${BASE_URL}auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, mobile })
        });
        const data = await res.json();
        return data; // { success: true, role, msg }
    } catch (e) {
        console.error("Signup Error:", e);
        return { error: "Network Error" };
    }
};

export const fetchAlerts = async () => {
    try {
        const res = await fetch(`${BASE_URL}alerts`);
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const postAlert = async (alertData) => {
    try {
        // alertData = { type, message, severe, zoneId, temp, rain }
        await fetch(`${BASE_URL}alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
        });
    } catch (e) {
        console.error("Post Alert Error:", e);
    }
};
