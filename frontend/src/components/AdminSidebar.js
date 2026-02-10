import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        {
            path: '/admin', label: 'Dashboard', icon:
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        },
        {
            path: '/admin/profile', label: 'User Profile', icon:
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        },
        {
            path: '/admin/test', label: 'Test Review', icon:
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        },
        {
            path: '/analytics', label: 'Analytics', icon:
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" y2="10"></line><line x1="12" y1="20" y2="4"></line><line x1="6" y1="20" y2="14"></line></svg>
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="new-sidebar-container">
            <div className="sidebar-brand">
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>SENTHIL ADMIN</span>
            </div>

            <div className="sidebar-divider"></div>

            <div className="sidebar-menu">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="sidebar-footer">
                <button className="sidebar-item logout logout-sheen" onClick={handleLogout}>
                    <span className="sidebar-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </span>
                    <span className="sidebar-label">Log Out</span>
                </button>
            </div>

            <div className="sidebar-background"></div>
        </div>
    );
};

export default AdminSidebar;
