import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';

const UserProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [profile, setProfile] = useState({
        username: 'senthil',
        role: 'Administrator',
        email: 'admin@detector.ai',
        bio: 'Lead Administrator looking after the review detection system.'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setIsEditing(false);
        // Show success animation
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="dashboard-container">
            <AdminSidebar />

            <div className="main-content">
                <div className="main-header">
                    <h1>User Profile</h1>
                    <div style={{ color: '#8b949e' }}>Manage your admin profile</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
                    {/* Main Profile Card */}
                    <div className="glass-card" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
                        {showSuccess && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0,
                                background: 'rgba(63, 185, 80, 0.9)', color: 'white', padding: '10px',
                                textAlign: 'center', fontWeight: 'bold', zIndex: 10,
                                animation: 'slideDown 0.5s ease-out'
                            }}>
                                ✅ Profile Updated Successfully!
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: '120px', height: '120px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ff9966, #ff5e62)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '3rem', fontWeight: 'bold', color: 'white',
                                    marginRight: '30px', boxShadow: '0 10px 30px rgba(255, 94, 98, 0.4)',
                                    border: '4px solid rgba(255,255,255,0.1)',
                                    animation: 'pulse 3s infinite'
                                }}>
                                    {profile.username.charAt(0).toUpperCase()}
                                </div>
                                <div style={{
                                    position: 'absolute', bottom: '10px', right: '35px',
                                    width: '20px', height: '20px', background: '#3fb950',
                                    borderRadius: '50%', border: '3px solid #0d1117',
                                    boxShadow: '0 0 10px #3fb950'
                                }} title="Online"></div>
                            </div>

                            <div>
                                <h2 style={{ margin: 0, color: '#e6edf3', fontSize: '2.5rem', letterSpacing: '-1px' }}>
                                    {profile.username}
                                    <span style={{ fontSize: '0.9rem', background: '#30363d', padding: '4px 10px', borderRadius: '20px', marginLeft: '15px', verticalAlign: 'middle', border: '1px solid #8b949e' }}>
                                        Verified Admin
                                    </span>
                                </h2>
                                <p style={{ margin: '10px 0 0 0', color: '#ff9900', fontWeight: '600' }}>{profile.role.toUpperCase()}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
                            <div className="form-group">
                                <label style={{ color: '#8b949e', marginBottom: '8px', display: 'block' }}>Display Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={profile.username}
                                    disabled
                                    style={{ opacity: 0.7, cursor: 'not-allowed', background: '#161b22', border: '1px solid #30363d' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#8b949e', marginBottom: '8px', display: 'block' }}>Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    style={{ transition: 'all 0.3s', borderColor: isEditing ? '#58a6ff' : '#30363d' }}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ color: '#8b949e', marginBottom: '8px', display: 'block' }}>Professional Bio</label>
                                <textarea
                                    className="form-textarea"
                                    name="bio"
                                    value={profile.bio}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    style={{ minHeight: '120px', lineHeight: '1.6', transition: 'all 0.3s', borderColor: isEditing ? '#58a6ff' : '#30363d' }}
                                ></textarea>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                                {isEditing ? (
                                    <>
                                        <button
                                            className="analyze-btn"
                                            onClick={handleSave}
                                            style={{ background: 'linear-gradient(90deg, #3fb950, #2ea043)', boxShadow: '0 4px 15px rgba(63, 185, 80, 0.3)' }}
                                        >
                                            💾 Save Changes
                                        </button>
                                        <button
                                            className="analyze-btn"
                                            onClick={() => setIsEditing(false)}
                                            style={{ background: '#30363d', border: '1px solid #8b949e' }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="analyze-btn"
                                        onClick={() => setIsEditing(true)}
                                        style={{ background: 'linear-gradient(90deg, #58a6ff, #1f6feb)', boxShadow: '0 4px 15px rgba(31, 111, 235, 0.3)' }}
                                    >
                                        ✏️ Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Side Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="glass-card" style={{ padding: '25px', background: 'linear-gradient(180deg, rgba(88, 166, 255, 0.1) 0%, rgba(13, 17, 23, 0) 100%)' }}>
                            <h3 style={{ marginTop: 0, color: '#58a6ff' }}>Stats</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                <span style={{ color: '#c9d1d9' }}>Total Scans</span>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>1,245</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                <span style={{ color: '#c9d1d9' }}>Actions Taken</span>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>89</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#c9d1d9' }}>Account Age</span>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>45 Days</span>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '25px', background: 'linear-gradient(180deg, rgba(210, 153, 34, 0.1) 0%, rgba(13, 17, 23, 0) 100%)' }}>
                            <h3 style={{ marginTop: 0, color: '#d29922' }}>Badges</h3>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <span title="Early Adopter" style={{ fontSize: '1.5rem', cursor: 'help' }}>🚀</span>
                                <span title="Power User" style={{ fontSize: '1.5rem', cursor: 'help' }}>⚡</span>
                                <span title="Bug Hunter" style={{ fontSize: '1.5rem', cursor: 'help' }}>🐛</span>
                                <span title="Verified" style={{ fontSize: '1.5rem', cursor: 'help' }}>🛡️</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(255, 94, 98, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(255, 94, 98, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 94, 98, 0); }
                }
                @keyframes slideDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default UserProfile;
