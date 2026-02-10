import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS Components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function AdminDashboard() {
    const [history, setHistory] = useState([]);
    const [filterUser, setFilterUser] = useState('');
    const [activeHistoryTab, setActiveHistoryTab] = useState('text');
    const [showConfidenceTooltip, setShowConfidenceTooltip] = useState(false); // New State
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    // Stats & Badges
    const [stats, setStats] = useState({
        total: 0,
        fake: 0,
        real: 0,
        avgConf: 0
    });
    const [adminStats, setAdminStats] = useState({
        actionsTaken: 0,
        accountAge: '45 Days' // Mocked start date
    });
    const [badges, setBadges] = useState([
        { id: 1, icon: '🚀', name: 'Getting Started', desc: 'Analyzed 10+ reviews', unlocked: false },
        { id: 2, icon: '⚡', name: 'Power User', desc: 'Analyzed 50+ reviews', unlocked: false },
        { id: 3, icon: '🛡️', name: 'Guardian', desc: 'Detected 20+ fake reviews', unlocked: false },
        { id: 4, icon: '🐛', name: 'Bug Hunter', desc: 'Reported 5+ issues', unlocked: false } // Mock
    ]);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
        }
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/admin/history', {
                headers: { 'x-access-token': token }
            });
            const data = res.data;
            setHistory(data);
            calculateStats(data);
        } catch (e) {
            console.error("Failed to fetch history");
            navigate('/');
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        const fake = data.filter(item => item.prediction === 'Fake').length;
        const real = data.filter(item => item.prediction === 'Real').length;
        const avgConf = total > 0
            ? (data.reduce((acc, curr) => acc + curr.confidence, 0) / total * 100).toFixed(1)
            : 0;
        setStats({ total, fake, real, avgConf });

        // Calculate Admin Stats (Mock Logic)
        setAdminStats(prev => ({
            ...prev,
            actionsTaken: Math.floor(total * 0.15) // Assume 15% resulted in action
        }));

        // Calculate Badges
        const newBadges = [
            { id: 1, icon: '🚀', name: 'Getting Started', desc: 'Analyzed 10+ reviews', unlocked: total >= 10 },
            { id: 2, icon: '⚡', name: 'Power User', desc: 'Analyzed 50+ reviews', unlocked: total >= 50 },
            { id: 3, icon: '🛡️', name: 'Guardian', desc: 'Detected 20+ fake reviews', unlocked: fake >= 20 },
            { id: 4, icon: '🐛', name: 'Bug Hunter', desc: 'Reported 5+ issues', unlocked: true } // Always unlocked for demo
        ];
        setBadges(newBadges);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this record permanently?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/history/${id}`, {
                headers: { 'x-access-token': token }
            });
            fetchHistory();
        } catch (e) {
            alert("Error deleting record");
        }
    };

    const getInitials = (name) => {
        return name ? name.substring(0, 2).toUpperCase() : '??';
    };

    const displayUsername = (username) => {
        if (username === 'senthil') return 'senthil (Admin)';
        return username || 'Unknown';
    };

    // --- CHART DATA GENERATION ---

    // 1. Authenticity Split (Doughnut)
    const doughnutData = {
        labels: ['Fake Reviews', 'Authentic Reviews'],
        datasets: [
            {
                data: [stats.fake, stats.real],
                backgroundColor: ['#ff7b72', '#3fb950'],
                borderColor: ['rgba(255, 123, 114, 0.2)', 'rgba(63, 185, 80, 0.2)'],
                borderWidth: 1,
            },
        ],
    };

    // 2. Activity Trend (Line - Last 7 Days)
    const getLast7DaysData = () => {
        const days = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days[d.toISOString().split('T')[0]] = 0;
        }

        history.forEach(item => {
            const date = item.date ? item.date.split('T')[0] : '';
            if (days[date] !== undefined) {
                days[date]++;
            }
        });

        return {
            labels: Object.keys(days).map(d => d.slice(5)), // MM-DD
            datasets: [
                {
                    label: 'Daily Scans',
                    data: Object.values(days),
                    borderColor: '#58a6ff',
                    backgroundColor: 'rgba(88, 166, 255, 0.5)',
                    tension: 0.4
                }
            ]
        };
    };

    // 3. Top Users (Bar)
    const getTopUsersData = () => {
        const userCounts = {};
        history.forEach(item => {
            const u = item.userId ? item.userId.username : 'Unknown';
            userCounts[u] = (userCounts[u] || 0) + 1;
        });

        // Sort and take top 5
        const sortedUsers = Object.entries(userCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            labels: sortedUsers.map(u => u[0]),
            datasets: [
                {
                    label: 'Scans Performed',
                    data: sortedUsers.map(u => u[1]),
                    backgroundColor: ['#d2a8ff', '#ffa657', '#58a6ff', '#3fb950', '#ff7b72'],
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#8b949e' } },
            title: { display: true, color: '#c9d1d9' }
        },
        scales: {
            y: { grid: { color: '#30363d' }, ticks: { color: '#8b949e' } },
            x: { grid: { display: false }, ticks: { color: '#8b949e' } }
        }
    };

    // Filter Logic
    const filteredHistory = filterUser
        ? history.filter(h => (h.userId?.username || '').includes(filterUser))
        : history;


    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="main-content">
                <div className="main-header">
                    <h1 style={{ fontSize: '2.5rem' }}>Mission Control</h1>
                    <div style={{ color: '#8b949e' }}>Welcome back, <span style={{ color: '#ff9900' }}>{username}</span></div>
                </div>

                {/* KPI Cards */}
                {/* SPLIT LAYOUT: Global Stats (Left) + Admin Profile (Right) */}
                <div className="dashboard-split-container">
                    {/* LEFT COLUMN: Global KPIs */}
                    <div className="stats-grid" style={{ alignContent: 'start' }}>
                        <div className="stat-card glass-card blue">
                            <div className="stat-label">Total Traffic</div>
                            <div className="stat-value">{stats.total}</div>
                        </div>
                        <div className="stat-card glass-card red">
                            <div className="stat-label">Total Fakes</div>
                            <div className="stat-value">{stats.fake}</div>
                        </div>
                        <div className="stat-card glass-card green">
                            <div className="stat-label">Verified Real</div>
                            <div className="stat-value">{stats.real}</div>
                        </div>
                        <div className="stat-card glass-card orange">
                            <div className="stat-label">AI Confidence</div>
                            <div className="stat-value">{stats.avgConf}%</div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Admin Profile (Stats & Badges) */}
                    <div className="admin-profile-section">
                        {/* 1. Admin Stats Card */}
                        <div className="profile-card">
                            <h3>Stats</h3>
                            <div className="profile-stat-row">
                                <span className="profile-stat-label">Total Scans</span>
                                <span className="profile-stat-value">{stats.total}</span>
                            </div>
                            <div className="profile-stat-row">
                                <span className="profile-stat-label">Actions Taken</span>
                                <span className="profile-stat-value">{adminStats.actionsTaken}</span>
                            </div>
                            <div className="profile-stat-row">
                                <span className="profile-stat-label">Account Age</span>
                                <span className="profile-stat-value">{adminStats.accountAge}</span>
                            </div>
                        </div>

                        {/* 2. Badges Card */}
                        <div className="profile-card">
                            <h3>Badges</h3>
                            <div className="badges-container">
                                {badges.map(badge => (
                                    <div
                                        key={badge.id}
                                        className={`badge-item ${badge.unlocked ? '' : 'locked'}`}
                                        title={`${badge.name}: ${badge.desc}`}
                                    >
                                        {badge.icon}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHARTS SECTION */}
                <div className="section-title">Live Analytics</div>
                <div className="charts-row">
                    <div className="perspective-container">
                        <div className="chart-container glass-card admin-3d-card">
                            <h3 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#c9d1d9' }}>Review Authenticity</h3>
                            <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                                <Doughnut data={doughnutData} options={{ ...chartOptions, scales: { x: { display: false }, y: { display: false } } }} />
                            </div>
                        </div>
                    </div>
                    <div className="perspective-container">
                        <div className="chart-container glass-card admin-3d-card">
                            <h3 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#c9d1d9' }}>Top Active Users</h3>
                            <Bar data={getTopUsersData()} options={chartOptions} />
                        </div>
                    </div>
                    <div className="perspective-container full-width-chart">
                        <div className="chart-container glass-card admin-3d-card">
                            <h3 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#c9d1d9' }}>Activity Trend (Last 7 Days)</h3>
                            <Line data={getLast7DaysData()} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* USER LOGS SECTION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div className="section-title" style={{ margin: 0 }}>Global User Logs</div>
                    <input
                        type="text"
                        placeholder="Filter by username..."
                        className="form-input"
                        style={{ width: '250px', padding: '8px' }}
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                    />
                </div>

                <div className="recent-section glass-card">
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
                        <button onClick={() => setActiveHistoryTab('text')} style={{ background: 'none', border: 'none', color: activeHistoryTab === 'text' ? '#58a6ff' : '#8b949e', fontWeight: 'bold', cursor: 'pointer', padding: '5px 0', borderBottom: activeHistoryTab === 'text' ? '2px solid #58a6ff' : 'none' }}>
                            Text Reviews
                        </button>
                        <button onClick={() => setActiveHistoryTab('url')} style={{ background: 'none', border: 'none', color: activeHistoryTab === 'url' ? '#58a6ff' : '#8b949e', fontWeight: 'bold', cursor: 'pointer', padding: '5px 0', borderBottom: activeHistoryTab === 'url' ? '2px solid #58a6ff' : 'none' }}>
                            Product Scans
                        </button>
                    </div>

                    <div className="table-responsive">
                        {activeHistoryTab === 'text' ? (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Product</th>
                                        <th>Rating</th>
                                        <th>Prediction</th>
                                        <th>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                Confidence
                                                <span
                                                    style={{
                                                        marginLeft: '0',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '18px',
                                                        height: '18px',
                                                        border: '1px solid #8b949e',
                                                        borderRadius: '50%',
                                                        color: '#8b949e',
                                                        transition: 'all 0.2s',
                                                        position: 'relative',
                                                        flexShrink: 0
                                                    }}
                                                    onClick={(e) => { e.stopPropagation(); setShowConfidenceTooltip(!showConfidenceTooltip); }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#58a6ff'; e.currentTarget.style.borderColor = '#58a6ff'; }}
                                                    onMouseLeave={(e) => {
                                                        if (!showConfidenceTooltip) {
                                                            e.currentTarget.style.color = '#8b949e';
                                                            e.currentTarget.style.borderColor = '#8b949e';
                                                        }
                                                    }}
                                                >
                                                    i
                                                    {showConfidenceTooltip && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '125%',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            background: 'rgba(22, 27, 34, 0.95)',
                                                            backdropFilter: 'blur(8px)',
                                                            border: '1px solid #30363d',
                                                            padding: '12px',
                                                            borderRadius: '8px',
                                                            width: '220px',
                                                            color: '#c9d1d9',
                                                            fontSize: '0.8rem',
                                                            lineHeight: '1.4',
                                                            fontWeight: 'normal',
                                                            zIndex: 1000,
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                                            textAlign: 'center',
                                                            cursor: 'default'
                                                        }} onClick={(e) => e.stopPropagation()}>
                                                            <div style={{ marginBottom: '5px', color: '#58a6ff', fontWeight: 'bold' }}>Confidence Score</div>
                                                            Indicates the model's certainty based on learned patterns from the training data.
                                                            <div style={{ marginTop: '5px', fontSize: '0.7em', color: '#8b949e', cursor: 'pointer' }} onClick={() => setShowConfidenceTooltip(false)}>(Click to close)</div>
                                                        </div>
                                                    )}
                                                </span>
                                            </div>
                                        </th>
                                        <th>Detection Reasons</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.filter(h => !h.isUrlAnalysis).map(record => (
                                        <tr key={record._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div className="user-avatar">
                                                        {getInitials(record.userId ? record.userId.username : '??')}
                                                    </div>
                                                    <span style={{ fontWeight: '600', color: '#e6edf3' }}>
                                                        {displayUsername(record.userId ? record.userId.username : 'Unknown')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ color: '#8b949e' }}>{record.productName || 'N/A'}</td>
                                            <td>
                                                <span style={{ color: '#e3b341', fontWeight: 'bold' }}>
                                                    {record.rating} ★
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`result-badge ${record.prediction === 'Fake' ? 'fake' : 'real'}`}
                                                    style={{ padding: '5px 10px', fontSize: '0.8rem', margin: 0 }}>
                                                    {record.prediction}
                                                </span>
                                            </td>
                                            <td>{(record.confidence * 100).toFixed(1)}%</td>
                                            <td>
                                                {record.detectionReasons && record.detectionReasons.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {record.detectionReasons.map((reason, idx) => (
                                                            <span key={idx} style={{
                                                                fontSize: '0.75rem',
                                                                background: 'rgba(255,255,255,0.1)',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                color: '#c9d1d9',
                                                                borderLeft: '2px solid #ff7b72'
                                                            }}>
                                                                {reason}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <button className="action-btn btn-delete" onClick={() => handleDelete(record._id)}>
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredHistory.filter(h => !h.isUrlAnalysis).length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No text logs found.</td></tr>}
                                </tbody>
                            </table>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Product Name</th>
                                        <th>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                Confidence
                                                <span
                                                    style={{
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '18px',
                                                        height: '18px',
                                                        border: '1px solid #8b949e',
                                                        borderRadius: '50%',
                                                        color: '#8b949e',
                                                        transition: 'all 0.2s',
                                                        position: 'relative',
                                                        flexShrink: 0
                                                    }}
                                                    onClick={(e) => { e.stopPropagation(); setShowConfidenceTooltip(!showConfidenceTooltip); }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#58a6ff'; e.currentTarget.style.borderColor = '#58a6ff'; }}
                                                    onMouseLeave={(e) => {
                                                        if (!showConfidenceTooltip) {
                                                            e.currentTarget.style.color = '#8b949e';
                                                            e.currentTarget.style.borderColor = '#8b949e';
                                                        }
                                                    }}
                                                >
                                                    i
                                                    {showConfidenceTooltip && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '125%',
                                                            left: '50%',
                                                            transform: 'translateX(-50%)',
                                                            background: 'rgba(22, 27, 34, 0.95)',
                                                            backdropFilter: 'blur(8px)',
                                                            border: '1px solid #30363d',
                                                            padding: '12px',
                                                            borderRadius: '8px',
                                                            width: '220px',
                                                            color: '#c9d1d9',
                                                            fontSize: '0.8rem',
                                                            lineHeight: '1.4',
                                                            fontWeight: 'normal',
                                                            zIndex: 1000,
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                                                            textAlign: 'center',
                                                            cursor: 'default'
                                                        }} onClick={(e) => e.stopPropagation()}>
                                                            <div style={{ marginBottom: '5px', color: '#58a6ff', fontWeight: 'bold' }}>Confidence Score</div>
                                                            Indicates the model's certainty based on learned patterns from the training data.
                                                            <div style={{ marginTop: '5px', fontSize: '0.7em', color: '#8b949e', cursor: 'pointer' }} onClick={() => setShowConfidenceTooltip(false)}>(Click to close)</div>
                                                        </div>
                                                    )}
                                                </span>
                                            </div>
                                        </th>
                                        <th>Detection Reasons</th>
                                        <th>Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.filter(h => h.isUrlAnalysis).map(record => (
                                        <tr key={record._id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <div className="user-avatar" style={{ background: '#8e2de2' }}>
                                                        {getInitials(record.userId ? record.userId.username : '??')}
                                                    </div>
                                                    <span style={{ fontWeight: '600', color: '#e6edf3' }}>
                                                        {displayUsername(record.userId ? record.userId.username : 'Unknown')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'white' }}>{record.productTitle || record.productName}</div>
                                                <div style={{ fontSize: '0.8em' }}><a href={record.productUrl || '#'} target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>View Link</a></div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{(record.confidence * 100).toFixed(1)}%</span>
                                                    <span style={{ fontSize: '0.8em', color: record.prediction === 'Real' ? '#4caf50' : '#ef5350' }}>{record.prediction === 'Real' ? 'Authentic' : 'Suspect'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {record.detectionReasons && record.detectionReasons.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {record.detectionReasons.map((reason, idx) => (
                                                            <span key={idx} style={{
                                                                fontSize: '0.75rem',
                                                                background: 'rgba(255,255,255,0.1)',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                color: '#c9d1d9',
                                                                borderLeft: '2px solid #ff7b72'
                                                            }}>
                                                                {reason}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <button className="action-btn btn-delete" onClick={() => handleDelete(record._id)}>
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredHistory.filter(h => h.isUrlAnalysis).length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No product scans found.</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;
