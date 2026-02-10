import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import LightPillar from '../components/LightPillar';
import './Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:5000/login', { username, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.username);
            localStorage.setItem('role', res.data.isAdmin ? 'admin' : 'user');

            if (res.data.isAdmin) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (e) {
            alert("Login failed. Check your credentials.");
        }
    };

    return (
        <div className="login-page-container">
            {/* Animated Light Pillar Background */}
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
                <LightPillar
                    topColor="#5227FF"
                    bottomColor="#FF9FFC"
                    intensity={1}
                    rotationSpeed={0.3}
                    glowAmount={0.002}
                    pillarWidth={3}
                    pillarHeight={0.4}
                    noiseIntensity={0.5}
                    pillarRotation={25}
                    interactive={false}
                    mixBlendMode="screen"
                    quality="high"
                />
            </div>

            <div className="glass-login-card" style={{ zIndex: 1, position: 'relative' }}>
                <h2>Welcome Back</h2>
                <p className="sub-text">Enter your credentials to access the dashboard</p>

                <div className="input-group">
                    <label className="input-label">Username</label>
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Password</label>
                    <input
                        type="password"
                        className="glass-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button className="glow-btn" onClick={handleLogin}>Log In</button>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
