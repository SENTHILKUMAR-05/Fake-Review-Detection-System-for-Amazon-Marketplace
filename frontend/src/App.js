import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalysis from './pages/AdminAnalysis';
import UserProfile from './pages/UserProfile';
import AdminPlaceholder from './pages/AdminPlaceholder';
import CursorEffect from './components/CursorEffect';
import './App.css';

function App() {
  return (
    <Router>
      <CursorEffect />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/test" element={<AdminAnalysis />} />
        <Route path="/admin/profile" element={<UserProfile />} />
        {/* Placeholder removed: Tables, Typography, Icons, Maps, Notifications */}
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;
