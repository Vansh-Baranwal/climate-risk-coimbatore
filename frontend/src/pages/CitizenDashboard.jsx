import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAlerts } from '../services/api';
import './CitizenDashboard.css';

const CitizenDashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [status, setStatus] = useState('SAFE');
    const [username, setUsername] = useState('Resident');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const loadAlerts = async () => {
        try {
            const data = await fetchAlerts();
            setAlerts(data);

            // Determine status based on recent severe alerts
            const hasSevere = data.some(a => a.severe);
            setStatus(hasSevere ? 'DANGER' : 'SAFE');
        } catch (error) {
            console.error("Failed to load alerts", error);
        }
    };

    useEffect(() => {
        // Load User
        const storedUser = localStorage.getItem('username');
        if (storedUser) setUsername(storedUser);

        loadAlerts();
        const interval = setInterval(loadAlerts, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`citizen-dashboard-container ${status.toLowerCase()}`}>
            <div className="citizen-glass-panel">
                <header className="citizen-header">
                    <div className="brand">
                        <h1>🛡️ Coimbatore <span className="light">Connect</span></h1>
                    </div>
                    <div className="user-controls">
                        <span className="welcome-text">Welcome, <strong>{username}</strong></span>
                        <button onClick={handleLogout} className="logout-btn-smart">
                            Logout
                        </button>
                    </div>
                </header>

                <main className="citizen-content">
                    {/* Hero Status Section */}
                    <div className="status-hero">
                        <div className={`status-ring ${status.toLowerCase()}-pulse`}>
                            <div className="status-icon">
                                {status === 'SAFE' ? '✅' : '🚨'}
                            </div>
                        </div>
                        <h2>You are currently <span className={`status-text ${status.toLowerCase()}`}>{status}</span></h2>
                        <p>{status === 'SAFE' ? 'No immediate threats in your zone.' : 'Critical alerts active. Please follow instructions below.'}</p>
                    </div>

                    {/* Alert Feed */}
                    <div className="smart-feed">
                        <h3>Live Safety Updates</h3>
                        {alerts.length === 0 ? (
                            <div className="empty-state">
                                <div className="calm-icon">🕊️</div>
                                <p>All clear. Enjoy your day!</p>
                            </div>
                        ) : (
                            <div className="alert-grid">
                                {alerts.map(alert => (
                                    <div key={alert.id} className={`smart-card ${alert.severe ? 'severe' : 'info'}`}>
                                        <div className="card-header">
                                            <span className="alert-type">{alert.type}</span>
                                            <span className="alert-time">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="alert-msg">{alert.message}</p>
                                        {alert.severe && <div className="severe-badge">CRITICAL</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CitizenDashboard;
