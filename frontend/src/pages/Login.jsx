import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from '../services/api';
import './Login.css';

const Login = () => {
    const [view, setView] = useState('SELECT_ROLE'); // SELECT_ROLE, ADMIN_LOGIN, CITIZEN_LOGIN, SIGNUP
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setError(null);
        setLoading(false);
    };

    const handleBack = () => {
        resetForm();
        if (view === 'SIGNUP') setView('CITIZEN_LOGIN');
        else setView('SELECT_ROLE');
    };

    const handleLogin = async (e, roleTarget) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Demo Fallback
            if (username === 'test' && password === 'test') {
                localStorage.setItem('userRole', roleTarget === 'ADMIN' ? 'CommandCenter' : 'Citizen');
                navigate(roleTarget === 'ADMIN' ? '/dashboard' : '/citizen');
                return;
            }

            const res = await loginUser(username, password);

            if (res && res.success) {
                // Role Enforcement
                if (roleTarget === 'ADMIN' && res.role !== 'CommandCenter' && res.role !== 'Admin') {
                    throw new Error("Access Denied: Not an Admin Account");
                }

                // Allow Admin to login as Citizen for testing, but mostly Citizens for Citizen View
                if (roleTarget === 'CITIZEN' && res.role !== 'Citizen' && res.role !== 'CommandCenter') {
                    throw new Error("Invalid Role for this portal");
                }

                localStorage.setItem('userRole', res.role);
                localStorage.setItem('username', res.username);
                navigate(roleTarget === 'ADMIN' ? '/dashboard' : '/citizen');
            } else {
                throw new Error(res.error || "Login Failed");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await signupUser(username, password);
            if (res && res.success) {
                // Auto-login
                localStorage.setItem('userRole', res.role);
                localStorage.setItem('username', res.username);
                navigate('/citizen');
            } else {
                throw new Error(res.error || "Signup Failed");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER HELPERS ---

    const renderRoleSelection = () => (
        <div className="role-selection">
            <h2>Select Portal</h2>
            <div className="card-row">
                <div className="role-card admin" onClick={() => { resetForm(); setView('ADMIN_LOGIN'); }}>
                    <div className="icon">🛡️</div>
                    <h3>Command Center</h3>
                    <p>Admins & Response Teams</p>
                </div>
                <div className="role-card citizen" onClick={() => { resetForm(); setView('CITIZEN_LOGIN'); }}>
                    <div className="icon">🏙️</div>
                    <h3>Citizen Portal</h3>
                    <p>Residents & Public Alerting</p>
                </div>
            </div>
        </div>
    );

    const renderLoginForm = (targetRole) => (
        <div className="login-form">
            <button className="back-btn" onClick={handleBack}>← Back</button>
            <h2>{targetRole === 'ADMIN' ? 'Command Center Login' : 'Citizen Login'}</h2>

            <form onSubmit={(e) => handleLogin(e, targetRole)}>
                <div className="input-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="error-msg">{error}</div>}

                <button type="submit" className="action-btn" disabled={loading}>
                    {loading ? 'Verifying...' : 'Secure Login'}
                </button>
            </form>

            {targetRole === 'CITIZEN' && (
                <div className="signup-link">
                    <p>New Resident?</p>
                    <button className="signup-icon-btn" onClick={() => { resetForm(); setView('SIGNUP'); }}>
                        📝 Create Account
                    </button>
                </div>
            )}
        </div>
    );

    const renderSignupForm = () => (
        <div className="login-form">
            <button className="back-btn" onClick={handleBack}>← Back</button>
            <h2>Create Citizen Account</h2>
            <p className="subtext">Join the Coimbitore Early Warning Network</p>

            <form onSubmit={handleSignup}>
                <div className="input-group">
                    <label>Choose Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Set Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="error-msg">{error}</div>}

                <button type="submit" className="action-btn citizen-btn" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );

    return (
        <div className="login-container">
            <div className="glass-panel">
                <header>
                    <h1>Climate Risk Intelligence</h1>
                </header>

                <div className="panel-content">
                    {view === 'SELECT_ROLE' && renderRoleSelection()}
                    {view === 'ADMIN_LOGIN' && renderLoginForm('ADMIN')}
                    {view === 'CITIZEN_LOGIN' && renderLoginForm('CITIZEN')}
                    {view === 'SIGNUP' && renderSignupForm()}
                </div>
            </div>
        </div>
    );
};

export default Login;
