import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import InventoryReconciliation from './pages/InventoryReconciliation';
import Orders from './pages/Orders';
import PackingCamera from './pages/PackingCamera';
import Returns from './pages/Returns';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import ActivityLogs from './pages/ActivityLogs';
import Analytics from './pages/Analytics';
import Pricing from './pages/Pricing';
import { Toaster } from '@/components/ui/toaster';

import OnboardingModal from './components/onboarding/OnboardingModal';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;

    return (
        <>
            {children}
            <OnboardingModal isOpen={showOnboarding} onClose={() => {
                setShowOnboarding(false);
                localStorage.setItem('hasSeenOnboarding', 'true');
            }} />
        </>
    );
}

function AppRoutes() {
    const { user, loading } = useAuth();
    console.log('[AppRoutes] Rendering. User:', user, 'Loading:', loading);

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventory/reconciliation" element={<InventoryReconciliation />} />
                <Route path="orders" element={<Orders />} />
                <Route path="packing" element={<PackingCamera />} />
                <Route path="returns" element={<Returns />} />
                <Route path="staff" element={<Staff />} />
                <Route path="settings" element={<Settings />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="pricing" element={<Pricing />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                    <Toaster />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
