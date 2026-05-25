import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Deployments from './pages/Deployments';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Guest Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Secure Workspace Platform routes wrapping MainLayout */}
        <Route 
          path="/dashboard" 
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <MainLayout>
              <Projects />
            </MainLayout>
          } 
        />
        <Route 
          path="/deployments" 
          element={
            <MainLayout>
              <Deployments />
            </MainLayout>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <MainLayout>
              <Analytics />
            </MainLayout>
          } 
        />

        {/* Dynamic catch-alls */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
