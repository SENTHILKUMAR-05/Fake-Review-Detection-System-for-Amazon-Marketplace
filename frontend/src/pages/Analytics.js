import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import 'chart.js/auto'; // Automatically register all components
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import UserSidebar from '../components/UserSidebar';

function Analytics() {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
        }
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');
            const username = localStorage.getItem('username');

            // Check role OR specific usernames for fallback
            const isAdmin = role === 'admin' || username === 'Admin' || username === 'senthil';

            const endpoint = isAdmin
                ? 'http://localhost:5000/admin/history'
                : 'http://localhost:5000/history';

            const res = await axios.get(endpoint, {
                headers: { 'x-access-token': token }
            });
            // Safety check: ensure response is an array
            if (Array.isArray(res.data)) {
                setHistory(res.data);
            } else {
                console.error("History data is not an array:", res.data);
                setHistory([]);
            }
        } catch (e) {
            console.error("Failed to fetch history");
            setHistory([]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // --- Data Processing for Charts ---

    // Ensure history is an array to prevent crashes
    const safeHistory = Array.isArray(history) ? history : [];

    // 1. Fake vs Real (for Doughnut)
    const fakeCount = safeHistory.filter(h => h.prediction === 'Fake').length;
    const realCount = safeHistory.filter(h => h.prediction === 'Real').length;

    const dataDoughnut = {
        labels: ['Fake', 'Real'],
        datasets: [
            {
                data: [fakeCount, realCount],
                backgroundColor: ['rgba(239, 83, 80, 0.7)', 'rgba(102, 187, 106, 0.7)'],
                borderColor: ['rgba(239, 83, 80, 1)', 'rgba(102, 187, 106, 1)'],
                borderWidth: 1,
            },
        ],
    };

    // 2. Rating Distribution (for Bar)
    const ratings = [0, 0, 0, 0, 0]; // 1 to 5 stars
    safeHistory.forEach(h => {
        if (h.rating >= 1 && h.rating <= 5) {
            ratings[h.rating - 1]++;
        }
    });

    const dataBar = {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [
            {
                label: 'Number of Reviews',
                data: ratings,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
        ],
    };

    // 3. Confidence Trend (for Line) - Last 20 reviews reversed to show timeline left-to-right
    const recentHistory = [...safeHistory].reverse().slice(-20);
    const dataLine = {
        labels: recentHistory.map((_, i) => `Review ${i + 1}`),
        datasets: [
            {
                label: 'Confidence (%)',
                data: recentHistory.map(h => h.confidence * 100),
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                tension: 0.3, // smooth curve
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: 'white' // Legend text color
                }
            },
            title: {
                display: false,
            }
        },
        scales: {
            x: {
                ticks: { color: 'white' },
                grid: { color: '#30363d' }
            },
            y: {
                ticks: { color: 'white' },
                grid: { color: '#30363d' }
            }
        }
    };

    const doughnutOptions = {
        plugins: {
            legend: {
                labels: { color: 'white' }
            }
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            {localStorage.getItem('role') === 'admin' || localStorage.getItem('username') === 'senthil' || localStorage.getItem('username') === 'Admin' ? (
                <AdminSidebar />
            ) : (
                <UserSidebar />
            )}

            {/* Main Content */}
            <div className="main-content">
                <div className="main-header">
                    <h1>Analytics Overview</h1>
                    <div style={{ color: '#8b949e' }}>Insights from your analyzed reviews</div>
                </div>

                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '30px' }}>

                    {/* Fake vs Real */}
                    <div className="stat-card" style={{ gridRow: 'span 2', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3>Authenticity Split</h3>
                        <div style={{ flex: 1, width: '100%', position: 'relative', maxWidth: '300px' }}>
                            <Doughnut data={dataDoughnut} options={doughnutOptions} />
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="stat-card" style={{ height: '400px' }}>
                        <h3>Rating Distribution</h3>
                        <Bar data={dataBar} options={options} />
                    </div>

                    {/* Confidence Trend */}
                    <div className="stat-card" style={{ gridColumn: 'span 2', height: '400px' }}>
                        <h3>Confidence Trend (Last 20)</h3>
                        <div style={{ height: '320px' }}>
                            <Line data={dataLine} options={{ ...options, maintainAspectRatio: false }} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Analytics;
