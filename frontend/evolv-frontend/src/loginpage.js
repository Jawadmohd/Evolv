import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './elogo.png';
import './loginpage.css'; // Make sure to create this CSS file

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

             const result = await response.json();
        if(result.status === 'verified') {
// store both username & profession
               localStorage.setItem('username', username);
            localStorage.setItem('profession', result.profession);
                navigate('/home');
            } else {
                setMessage('Invalid credentials');
            }
        } catch (err) {
            setMessage('Login failed. Try again later.');
        }
    };

    return (
        <div className="login-container">
            <div className="auth-card">
                <div className="auth-header">
                    <img src={logo} className="auth-logo" alt="Evolv Logo" />
                    <h1 className="auth-title">Welcome To Evolv</h1>
                    <p className="auth-subtitle">Sign in to continue to Evolv</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="input-group">
                        <label className="input-label">Username</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {message && <div className="error-message">{message}</div>}

                    <button type="submit" className="submit-btn">
                        Sign In
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <span className="auth-link" onClick={() => navigate('/signup')}>
                        Create account
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;