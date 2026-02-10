import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import leafImage from '../assets/leaf.jpg';
import FloatingLines from '../components/FloatingLines';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!username || !password) {
            alert("Please fill in all fields");
            return;
        }
        try {
            await axios.post('http://localhost:5000/register', { username, password });
            alert("Registration Successful!");
            navigate('/');
        } catch (e) {
            alert("Registration failed. Try a different username.");
        }
    };

    return (
        <div className="leaf-auth-page">
            {/* Animated Floating Lines Background */}
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
                <FloatingLines
                    enabledWaves={["top", "middle", "bottom"]}
                    lineCount={5}
                    lineDistance={5}
                    bendRadius={5}
                    bendStrength={-0.5}
                    interactive={true}
                    parallax={true}
                />
            </div>

            <div className="auth-card">
                {/* Left Side: Form */}
                <div className="auth-card-form">
                    <h2>Get Started Now</h2>

                    <div className="input-group">
                        <label className="leaf-label">Name</label>
                        <input
                            type="text"
                            className="leaf-input"
                            placeholder="Enter your name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    {/* Note: User asked for ONLY username and password, but image shows Email. 
                        Adapting to user request: using 'Name' field for Username backend logic. */}

                    <div className="input-group">
                        <label className="leaf-label">Password</label>
                        <input
                            type="password"
                            className="leaf-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="leaf-checkbox">
                        <input type="checkbox" id="terms" />
                        <label htmlFor="terms">I agree to the terms & policy</label>
                    </div>

                    <button className="leaf-btn" onClick={handleRegister}>Signup</button>

                    <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                        Have an account? <Link to="/" className="leaf-link">Sign in</Link>
                    </div>
                </div>

                {/* Right Side: Image */}
                <div className="auth-card-image" style={{ backgroundImage: `url(${leafImage})` }}></div>
            </div>
        </div>
    );
}

export default Register;
