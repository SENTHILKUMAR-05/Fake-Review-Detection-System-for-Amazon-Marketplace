import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import '../components/Sidebar.css';

const AdminPlaceholder = ({ title }) => {
    return (
        <div className="dashboard-container">
            <AdminSidebar />
            <div className="main-content">
                <div className="main-header">
                    <h1>{title}</h1>
                    <div style={{ color: '#8b949e' }}>Manage your {title.toLowerCase()} settings here.</div>
                </div>

                <div className="glass-card" style={{ padding: '50px', textAlign: 'center', marginTop: '50px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚧</div>
                    <h2>Feature Coming Soon</h2>
                    <p style={{ color: '#8b949e' }}>The <strong>{title}</strong> module is currently under development.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminPlaceholder;
