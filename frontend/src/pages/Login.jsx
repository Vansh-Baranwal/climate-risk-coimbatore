import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        // Mock fallback for testing if backend not ready
        if (username === 'test' && password === 'test') {
            localStorage.setItem('userRole', 'CommandCenter');
            navigate('/dashboard');
            return;
        }

        const res = await loginUser(username, password);

        if (res && res.success) {
            localStorage.setItem('userRole', res.role);
            localStorage.setItem('username', res.username);

            if (res.role === 'Citizen') {
                navigate('/citizen');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(res.error || 'Login Failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Climate Intelligence</h1>
                <p>Coimbatore Command Center</p>
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. admin or citizen"
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password"
                        />
                    </div>
                    {error && <div className="error-msg">{error}</div>}
                    <button type="submit" className="login-btn">Secure Login</button>

                    <div className="demo-notes">
                        <small>Demo Creds:<br />admin / admin123<br />citizen / citizen123</small>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
