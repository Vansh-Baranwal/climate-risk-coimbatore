import React, { useEffect, useState } from 'react';
import { fetchAlerts } from '../services/api';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [status, setStatus] = useState('SAFE');

    const loadAlerts = async () => {
        const data = await fetchAlerts();
        setAlerts(data);

        // Determine status based on recent severe alerts
        const hasSevere = data.some(a => a.severe);
        setStatus(hasSevere ? 'DANGER' : 'SAFE');
    };

    useEffect(() => {
        loadAlerts();
        const interval = setInterval(loadAlerts, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`citizen-dashboard ${status.toLowerCase()}`}>
            <header>
                <h1>Coimbatore Citizen Alert System</h1>
                <div className="status-badge">{status}</div>
            </header>

            <main>
                <div className="alert-feed">
                    <h2>Active Alerts</h2>
                    {alerts.length === 0 ? (
                        <p className="no-alerts">No active alerts in your area.</p>
                    ) : (
                        <ul>
                            {alerts.map(alert => (
                                <li key={alert.id} className={alert.severe ? 'severe' : 'info'}>
                                    <strong>{alert.type}</strong>
                                    <p>{alert.message}</p>
                                    <small>{new Date(alert.timestamp).toLocaleString()}</small>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CitizenDashboard;
