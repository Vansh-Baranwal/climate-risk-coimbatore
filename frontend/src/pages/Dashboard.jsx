import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWeather, fetchZones, calculateFireRisk, calculateDiseaseRisk, postAlert } from '../services/api';
import MultiplierCard from '../components/multipliers/MultiplierCard';
import RiskTimeline from '../components/timeline/RiskTimeline';
import InterventionSimulator from '../components/simulation/InterventionSimulator';
import ZoneMap from '../components/map/ZoneMap';
import './Dashboard.css';

const Dashboard = () => {
    const [weather, setWeather] = useState(null);
    const [zones, setZones] = useState([]);
    const [selectedZone, setSelectedZone] = useState(null);
    const [fireRisk, setFireRisk] = useState(null);
    const [diseaseRisk, setDiseaseRisk] = useState(null);
    const [mitigationFactor, setMitigationFactor] = useState(1.0);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const updateInfrastructure = (field, value) => {
        if (!selectedZone) return;
        const updatedZone = {
            ...selectedZone,
            infrastructure: {
                ...selectedZone.infrastructure,
                [field]: parseFloat(value)
            }
        };
        setSelectedZone(updatedZone);
        // Also update the zone in the main list so map reflects changes if needed
        setZones(zones.map(z => z.id === updatedZone.id ? updatedZone : z));
    };

    const updateWeather = (field, value) => {
        if (!weather) return;
        const newVal = parseFloat(value);
        const updatedWeather = {
            ...weather,
            normalized: {
                ...weather.normalized,
                [field]: newVal
            }
        };

        // Recalculate Flood Proxy locally if rain changes
        if (field === 'rainfall_1h') {
            updatedWeather.floodProxyIndex = Math.min(newVal * 2, 10);
        }

        setWeather(updatedWeather);
        setMitigationFactor(1.0); // Reset simulation
    };

    const triggerFlood = async () => {
        if (!weather || !selectedZone) return;

        // 1. Force High Rain Weather
        const updatedWeather = {
            ...weather,
            normalized: {
                ...weather.normalized,
                rainfall_1h: 50, // Severe rain
                description: "Simulated Flash Flood"
            },
            floodProxyIndex: 10
        };
        setWeather(updatedWeather);

        // 2. Degrade Infrastructure (Drainage Failure)
        const updatedZone = {
            ...selectedZone,
            infrastructure: {
                ...selectedZone.infrastructure,
                drainageQuality: 0.1 // Collapsed drainage
            }
        };
        setSelectedZone(updatedZone);
        setZones(zones.map(z => z.id === updatedZone.id ? updatedZone : z));

        setMitigationFactor(1.0); // Reset previous mitigations

        // 3. Broadcast Alert to Citizen App (Backend)
        await postAlert({
            type: "FLOOD",
            message: `CRITICAL FLOOD ALERT IN ZONE ${selectedZone.id} (${selectedZone.name}). EVACUATE LOW GROUND.`,
            zoneId: selectedZone.id,
            severe: true
        });
        alert("Flood Simulated & Alert Broadcasted to Network!");
    };

    useEffect(() => {
        // Initial Data Load
        const load = async () => {
            console.log("Loading Dashboard Data...");
            const wData = await fetchWeather();
            console.log("Weather Data:", wData);
            // Fix: Backend returns flat object, Frontend expects nested 'normalized'
            const processedWeather = wData.normalized ? wData : {
                normalized: wData,
                floodProxyIndex: wData.floodProxyIndex || 0
            };
            setWeather(processedWeather);
            const zData = await fetchZones();
            console.log("Zones Data:", zData);
            setZones(zData);
            if (zData.length > 0) setSelectedZone(zData[0]);
        };
        load();
    }, []);

    useEffect(() => {
        if (selectedZone && weather) {
            // Fetch risks for selected zone
            setFireRisk(null);
            setDiseaseRisk(null);
            setMitigationFactor(1.0); // Reset simulation effects

            calculateFireRisk(weather.normalized, selectedZone).then(setFireRisk);
            calculateDiseaseRisk(weather.normalized, selectedZone).then(setDiseaseRisk);
        }
    }, [selectedZone, weather]);

    if (!weather) return <div className="loading-screen">Loading Climate Intelligence...</div>;

    return (
        <div className="dashboard">
            <header>
                <div className="header-left">
                    <h1>Coimbatore Risk Intelligence</h1>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
                <div className="weather-bar">
                    <div className="weather-input-group">
                        <label>Temp (°C)</label>
                        <input
                            type="number"
                            value={weather.normalized.temp}
                            onChange={(e) => updateWeather('temp', e.target.value)}
                        />
                    </div>
                    <div className="weather-input-group">
                        <label>Rain (mm/h)</label>
                        <input
                            type="number"
                            value={weather.normalized.rainfall_1h}
                            onChange={(e) => updateWeather('rainfall_1h', e.target.value)}
                        />
                    </div>
                    <div className="weather-display">
                        <span>Flood Proxy: {weather.floodProxyIndex.toFixed(1)}/10</span>
                        <small>{weather.normalized.description}</small>
                    </div>
                    <button className="flood-trigger-btn" onClick={triggerFlood}>
                        🚨 TRIGGER FLOOD
                    </button>
                </div>
            </header>

            <main>
                <aside className="zones-list">
                    <h3>Micro-Zones</h3>
                    <ul>
                        {zones.map(z => (
                            <li key={z.id}
                                className={selectedZone?.id === z.id ? 'active' : ''}
                                onClick={() => setSelectedZone(z)}>
                                {z.name}
                            </li>
                        ))}
                    </ul>
                </aside>

                <section className="risk-display">
                    {/* Integrated Map */}
                    <ZoneMap zones={zones} selectedZone={selectedZone} onZoneSelect={setSelectedZone} />

                    {selectedZone && (
                        <>
                            <h2>Analysis for {selectedZone.name}</h2>
                            <div className="infrastructure-stats">
                                <div className="stat-control">
                                    <label>Drainage Quality (0=Bad, 1=Good): {selectedZone.infrastructure.drainageQuality}</label>
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        value={selectedZone.infrastructure.drainageQuality}
                                        onChange={(e) => updateInfrastructure('drainageQuality', e.target.value)}
                                        className={selectedZone.infrastructure.drainageQuality < 0.3 ? 'bad' : ''}
                                    />
                                </div>
                                <div className="stat-control">
                                    <label>Wiring Density (0=Safe, 1=Hazard): {selectedZone.infrastructure.wiringDensity}</label>
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        value={selectedZone.infrastructure.wiringDensity}
                                        onChange={(e) => updateInfrastructure('wiringDensity', e.target.value)}
                                        className={selectedZone.infrastructure.wiringDensity > 0.8 ? 'bad' : ''}
                                    />
                                </div>
                                <div className="stat-control">
                                    <label>Sanitation Score (0=Bad, 1=Good): {selectedZone.infrastructure.sanitationScore}</label>
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        value={selectedZone.infrastructure.sanitationScore}
                                        onChange={(e) => updateInfrastructure('sanitationScore', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="multipliers-grid">
                                <MultiplierCard title="FIRE" data={fireRisk} />
                                <MultiplierCard title="DISEASE" data={diseaseRisk} />
                            </div>

                            <div className="compound-alert">
                                <h3>Active Alerts</h3>
                                {weather.normalized.rainfall_1h > 2 && selectedZone.infrastructure.wiringDensity > 0.6 ?
                                    <div className="alert-box critical">
                                        ⚠️ CRITICAL: FLOOD + WIRING HAZARD DETECTED
                                    </div> :
                                    <div className="alert-box safe">No Compound Critical Errors</div>
                                }
                            </div>

                            <RiskTimeline stagnationDays={weather.normalized.rainfall_1h > 0 ? Math.ceil(weather.normalized.rainfall_1h * 2 * (1 - selectedZone.infrastructure.drainageQuality) * mitigationFactor) : 0} />

                            <InterventionSimulator zone={selectedZone} weather={weather.normalized} onSimulate={setMitigationFactor} />
                        </>

                    )}
                </section>
            </main>
        </div >
    );
};

export default Dashboard;
