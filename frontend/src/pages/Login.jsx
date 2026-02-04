import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from '../services/api';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (isLogin) {
            // LOGIN FLOW
            if (username === 'test' && password === 'test') { // Fallback
                localStorage.setItem('userRole', 'CommandCenter');
                navigate('/dashboard');
                return;
            }

            const res = await loginUser(username, password);
            if (res && res.success) {
                localStorage.setItem('userRole', res.role);
                localStorage.setItem('username', res.username);
                navigate(res.role === 'Citizen' ? '/citizen' : '/dashboard');
            } else {
                setError(res.error || 'Login Failed');
            }
        } else {
            // SIGNUP FLOW (Citizen Only)
            const res = await signupUser(username, password);
            if (res && res.success) {
                // Auto-login after signup
                localStorage.setItem('userRole', res.role);
                localStorage.setItem('username', res.username);
                navigate('/citizen');
            } else {
                setError(res.error || 'Signup Failed');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Climate Intelligence</h1>
                <p>{isLogin ? "Secure Login" : "Citizen Registration"}</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="username"
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

                    <button type="submit" className="login-btn">
                        {isLogin ? "Login" : "Sign Up"}
                    </button>

                    <div className="toggle-mode">
                        {isLogin ? (
                            <p>New here? <span onClick={() => setIsLogin(false)}>Create Citizen Account</span></p>
                        ) : (
                            <p>Already have an account? <span onClick={() => setIsLogin(true)}>Login</span></p>
                        )}
                    </div>

                    <div className="demo-notes">
                        <small>Admin: admin / admin123</small>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
