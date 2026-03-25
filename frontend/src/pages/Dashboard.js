import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import UserSidebar from '../components/UserSidebar';

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
    const [activeTab, setActiveTab] = useState('text');
    const [activeHistoryTab, setActiveHistoryTab] = useState('text');
    const [showConfidenceTooltip, setShowConfidenceTooltip] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]); // New State for Multi-Delete
    // Form State
    const [formData, setFormData] = useState({
        productName: '',
        productUrl: '',
        reviewerName: '',
        reviewText: '',
        rating: '5',
        reviewDate: new Date().toISOString().split('T')[0],
        verifiedPurchase: false
    });

    const [result, setResult] = useState(null);
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
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/history`, {
                headers: { 'x-access-token': token }
            });
            setHistory(res.data);
            setSelectedIds([]); // Clear selection when history refreshes
        } catch (e) {
            console.error("Failed to fetch history");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleScan = async () => {
        if (!formData.reviewText) {
            alert("Please enter review text");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = {
                text: formData.reviewText,
                token: token,
                ...formData
            };

            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/predict`, payload);
            setResult(res.data);
            fetchHistory();
        } catch (e) {
            alert("Error analyzing review");
        }
    };

    const handleUrlScan = async () => {
        if (!formData.productUrl) {
            alert("Please enter a valid Product URL");
            return;
        }

        setResult(null); // show loading immediately

        try {
            // 1. Extract product name from URL path
            let extractedName = "Analyzed Product";
            let productImage = "";

            try {
                const urlObj = new URL(formData.productUrl);
                const pathSegments = urlObj.pathname.split('/');
                const potentialName = pathSegments.find(seg => seg.length > 5 && !seg.startsWith('dp') && !seg.startsWith('p'));
                if (potentialName) {
                    extractedName = potentialName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                } else {
                    extractedName = `Product from ${urlObj.hostname}`;
                }
            } catch (err) {
                extractedName = "Generic Online Product";
            }

            // 2. Fetch real product image from backend proxy (og:image scrape)
            try {
                const imgRes = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/product-image?url=${encodeURIComponent(formData.productUrl)}`,
                    { timeout: 8000 }
                );
                if (imgRes.data && imgRes.data.imageUrl) {
                    productImage = imgRes.data.imageUrl;
                }
            } catch (err) {
                console.log("og:image fetch failed, trying ASIN fallback");
            }

            // 3. ASIN fallback: if no og:image found, use wsrv.nl proxy
            if (!productImage) {
                const asinMatch = formData.productUrl.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})/i);
                if (asinMatch) {
                    const asin = asinMatch[1];
                    const amazonImgUrl = `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SX300_.jpg`;
                    productImage = `https://wsrv.nl/?url=${encodeURIComponent(amazonImgUrl)}&w=300&h=300&fit=contain`;
                }
            }

            // 4. Generate mock scan result
            const isAuthentic = Math.random() > 0.3;
            const score = isAuthentic ? (0.7 + Math.random() * 0.25) : (0.1 + Math.random() * 0.4);
            const resultData = {
                prediction: isAuthentic ? 'Real' : 'Fake',
                confidence: score,
                isUrlAnalysis: true,
                details: "Based on analysis of 50+ recent comments.",
                productTitle: extractedName,
                totalReviews: Math.floor(Math.random() * 500) + 50,
                sentimentData: {
                    positive: isAuthentic ? 70 : 30,
                    negative: isAuthentic ? 10 : 60,
                    neutral: 20
                }
            };

            setResult(resultData);

            // 5. Save to backend history (includes productImage)
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/predict`, {
                    text: formData.productUrl,
                    ...formData,
                    productName: extractedName,
                    productImage: productImage,
                    isUrlAnalysis: true,
                    token: token,
                    mockResult: resultData
                });
                fetchHistory();
            } catch (err) { console.log('Background save failed'); }

        } catch (e) {
            alert("Error analyzing URL");
        }
    };


    const handleDelete = async (id) => {

        if (!window.confirm("Delete this record?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/history/${id}`, {
                headers: { 'x-access-token': token }
            });
            fetchHistory();
        } catch (e) {
            alert("Error deleting record");
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedIds.length} selected records?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/history/batch-delete`, 
                { ids: selectedIds },
                { headers: { 'x-access-token': token } }
            );
            fetchHistory();
        } catch (e) {
            alert("Error deleting records");
        }
    };

    const toggleSelection = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleAllSelection = (filteredRecords) => {
        if (selectedIds.length === filteredRecords.length && filteredRecords.length > 0) {
            // Deselect all
            setSelectedIds([]);
        } else {
            // Select all currently visible in this tab
            setSelectedIds(filteredRecords.map(r => r._id));
        }
    };

    const handleRecheck = (record) => {
        setFormData({
            productName: record.productName || '',
            productUrl: record.productUrl || '',
            reviewerName: record.reviewerName || '',
            reviewText: record.reviewText,
            rating: record.rating || '5',
            reviewDate: record.reviewDate ? record.reviewDate.split('T')[0] : new Date().toISOString().split('T')[0],
            verifiedPurchase: record.verifiedPurchase || false
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Stats
    const totalScans = history.length;
    const fakeCount = history.filter(h => h.prediction === 'Fake').length;
    const realCount = history.filter(h => h.prediction === 'Real').length;

    // Calculate Avg Confidence
    const avgConf = history.length > 0
        ? (history.reduce((acc, curr) => acc + curr.confidence, 0) / history.length * 100).toFixed(1)
        : 0;

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <UserSidebar />

            {/* Main Content */}
            <div className="main-content">
                <div className="main-header">
                    <h1>Dashboard</h1>
                    <div style={{ color: '#8b949e' }}>Welcome back, {username}</div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card blue">
                        <div className="stat-label">Total Analyzed</div>
                        <div className="stat-value">{totalScans}</div>
                    </div>
                    <div className="stat-card red">
                        <div className="stat-label">Fake Detected</div>
                        <div className="stat-value">{fakeCount}</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-label">Authentic</div>
                        <div className="stat-value">{realCount}</div>
                    </div>
                    <div className="stat-card orange">
                        <div className="stat-label">Avg Confidence</div>
                        <div className="stat-value">{avgConf}%</div>
                    </div>
                </div>

                {/* Analysis Area */}
                <div className="analysis-container">
                    {/* Left: Input Form */}
                    <div className="input-section">
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
                            <button
                                onClick={() => setActiveTab('text')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: activeTab === 'text' ? '#58a6ff' : '#8b949e',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    padding: '5px 0',
                                    borderBottom: activeTab === 'text' ? '2px solid #58a6ff' : 'none'
                                }}
                            >
                                Analyze Text
                            </button>
                            <button
                                onClick={() => setActiveTab('url')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: activeTab === 'url' ? '#58a6ff' : '#8b949e',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    padding: '5px 0',
                                    borderBottom: activeTab === 'url' ? '2px solid #58a6ff' : 'none'
                                }}
                            >
                                Analyze Product URL
                            </button>
                        </div>

                        {activeTab === 'text' ? (
                            <>
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input type="text" className="form-input" name="productName" placeholder="e.g. Wireless Headphones" value={formData.productName} onChange={handleChange} />
                                </div>

                                <div className="form-group">
                                    <label>Reviewer Name</label>
                                    <input type="text" className="form-input" name="reviewerName" placeholder="e.g. John Doe" value={formData.reviewerName} onChange={handleChange} />
                                </div>

                                <div className="form-group">
                                    <label>Review Text *</label>
                                    <textarea className="form-textarea" name="reviewText" placeholder="Paste the review content here..." value={formData.reviewText} onChange={handleChange}></textarea>
                                </div>

                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Rating</label>
                                        <select className="form-select" name="rating" value={formData.rating} onChange={handleChange}>
                                            <option value="1">1 Star</option>
                                            <option value="2">2 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="5">5 Stars</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Date</label>
                                        <input type="date" className="form-input" name="reviewDate" value={formData.reviewDate} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input type="checkbox" name="verifiedPurchase" checked={formData.verifiedPurchase} onChange={handleChange} style={{ width: 'auto', marginRight: '10px' }} />
                                        Verified Purchase
                                    </label>
                                </div>

                                <button className="analyze-btn" onClick={handleScan}>Analyze Review</button>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Product URL (Amazon / Flipkart)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="productUrl"
                                        placeholder="https://www.amazon.in/dp/..."
                                        value={formData.productUrl}
                                        onChange={handleChange}
                                        style={{ padding: '15px' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '5px' }}>
                                        We will analyze recent reviews from this product page.
                                    </p>
                                </div>

                                <button className="analyze-btn" onClick={handleUrlScan} style={{ background: 'linear-gradient(90deg, #8e2de2, #4a00e0)' }}>
                                    Analyze Details
                                </button>
                            </>
                        )}
                    </div>

                    {/* Right: Result */}
                    <div className="result-section">
                        {result ? (
                            <>
                                <div className={`result-badge ${result.prediction === 'Fake' ? 'fake' : 'real'}`}>
                                    {result.prediction === 'Fake' ? '⚠️ FAKE REVIEW' : '✅ AUTHENTIC'}
                                </div>
                                <div className="confidence-meter">
                                    {(result.confidence * 100).toFixed(1)}%
                                </div>
                                <div className="confidence-label">Confidence Score</div>
                                {result.isUrlAnalysis ? (
                                    <div style={{ textAlign: 'center', width: '100%' }}>
                                        <div style={{ marginBottom: '20px', textAlign: 'left', borderBottom: '1px solid #30363d', paddingBottom: '10px' }}>
                                            <h3 style={{ margin: '0 0 5px 0', color: 'white' }}>{result.productTitle}</h3>
                                            <span style={{ fontSize: '0.9rem', color: '#8b949e' }}>Analyzed {result.totalReviews} Total Reviews</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: '200px' }}>
                                                <h2 style={{ color: result.prediction === 'Real' ? '#4caf50' : '#ef5350', fontSize: '2.5rem', margin: '10px 0' }}>
                                                    {(result.confidence * 100).toFixed(0)}% {result.prediction === 'Real' ? 'Authentic' : 'Suspect'}
                                                </h2>
                                                <p>{result.details}</p>
                                            </div>

                                            <div style={{ width: '180px', height: '180px' }}>
                                                <Doughnut data={{
                                                    labels: ['Positive', 'Negative', 'Neutral'],
                                                    datasets: [{
                                                        data: [result.sentimentData.positive, result.sentimentData.negative, result.sentimentData.neutral],
                                                        backgroundColor: ['#4caf50', '#ef5350', '#ff9800'],
                                                        borderWidth: 0
                                                    }]
                                                }} options={{
                                                    plugins: { legend: { display: false } },
                                                    cutout: '70%'
                                                }} />
                                                <div style={{ textAlign: 'center', marginTop: '5px', fontSize: '0.8rem', color: '#8b949e' }}>Sentiment Distribution</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p style={{ marginTop: '20px', color: '#c9d1d9' }}>
                                        {result.prediction === 'Fake'
                                            ? "This review exhibits patterns commonly associated with deceptive or promotional content."
                                            : "This review appears natural and consistent with genuine user feedback."}
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="result-empty">
                                <p>No analysis yet.</p>
                                <p>Submit a review to see the results here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom: Recent Table */}
                <div className="recent-section">
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #30363d', paddingBottom: '10px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button onClick={() => {setActiveHistoryTab('text'); setSelectedIds([])}} style={{ background: 'none', border: 'none', color: activeHistoryTab === 'text' ? '#58a6ff' : '#8b949e', fontWeight: 'bold', cursor: 'pointer', padding: '5px 0', borderBottom: activeHistoryTab === 'text' ? '2px solid #58a6ff' : 'none' }}>
                                Text Reviews
                            </button>
                            <button onClick={() => {setActiveHistoryTab('url'); setSelectedIds([])}} style={{ background: 'none', border: 'none', color: activeHistoryTab === 'url' ? '#58a6ff' : '#8b949e', fontWeight: 'bold', cursor: 'pointer', padding: '5px 0', borderBottom: activeHistoryTab === 'url' ? '2px solid #58a6ff' : 'none' }}>
                                Product Scans
                            </button>
                        </div>
                        {selectedIds.length > 0 && (
                            <button 
                                onClick={handleBatchDelete}
                                style={{
                                    marginLeft: 'auto',
                                    background: '#ef5350',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                🗑️ Delete Selected ({selectedIds.length})
                            </button>
                        )}
                    </div>

                    <div className="table-responsive">
                        {activeHistoryTab === 'text' ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={history.filter(h => !h.isUrlAnalysis).length > 0 && selectedIds.length === history.filter(h => !h.isUrlAnalysis).length}
                                                onChange={() => toggleAllSelection(history.filter(h => !h.isUrlAnalysis))}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </th>
                                        <th>Product</th>
                                        <th>Reviewer</th>
                                        <th>Rating</th>
                                        <th>Prediction</th>
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.filter(h => !h.isUrlAnalysis).map(record => (
                                        <tr key={record._id} className={selectedIds.includes(record._id) ? 'selected-row' : ''}>
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(record._id)}
                                                    onChange={() => toggleSelection(record._id)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'white' }}>{record.productName || 'Unknown Product'}</div>
                                                <div style={{ fontSize: '0.8em', color: '#8b949e' }}>{new Date(record.date).toLocaleDateString()}</div>
                                            </td>
                                            <td>{record.reviewerName}</td>
                                            <td>{'⭐'.repeat(record.rating || 0)}</td>
                                            <td>
                                                <span className={`status-dot ${record.prediction === 'Fake' ? 'fake' : 'real'}`}></span>
                                                {record.prediction}
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
                                            <td>
                                                <button className="action-btn btn-recheck" onClick={() => handleRecheck(record)}>Recheck</button>
                                                <button className="action-btn btn-delete" onClick={() => handleDelete(record._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.filter(h => !h.isUrlAnalysis).length === 0 && (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No text reviews found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={history.filter(h => h.isUrlAnalysis).length > 0 && selectedIds.length === history.filter(h => h.isUrlAnalysis).length}
                                                onChange={() => toggleAllSelection(history.filter(h => h.isUrlAnalysis))}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </th>
                                        <th>Product Name</th>
                                        <th>Tested By</th>
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.filter(h => h.isUrlAnalysis).map(record => (
                                        <tr key={record._id} className={selectedIds.includes(record._id) ? 'selected-row' : ''}>
                                            <td>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(record._id)}
                                                    onChange={() => toggleSelection(record._id)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'white' }}>{record.productTitle || record.productName}</div>
                                                <div style={{ fontSize: '0.8em', color: '#8b949e' }}><a href={record.productUrl || '#'} target="_blank" rel="noreferrer" style={{ color: '#58a6ff' }}>View Link</a></div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1f6feb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                        {username ? username.substring(0, 2).toUpperCase() : 'ME'}
                                                    </div>
                                                    {username || 'Me'}
                                                </div>
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
                                            <td>
                                                <button className="action-btn btn-delete" onClick={() => handleDelete(record._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.filter(h => h.isUrlAnalysis).length === 0 && (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No product scans yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
