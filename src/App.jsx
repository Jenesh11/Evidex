import React, { useState, useEffect } from 'react';
import { createHashRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
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
import ToastProvider from './components/providers/ToastProvider';
import UpdateNotification from './components/UpdateNotification';

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

// Wrapper for Auth context access within router
const AuthWrapper = () => {
    return (
        <AuthProvider>
            <Outlet />
        </AuthProvider>
    );
};

const router = createHashRouter([
    {
        element: <AuthWrapper />,
        children: [
            {
                path: "/login",
                element: <LoginWrapper />
            },
            {
                path: "/",
                element: <PrivateRoute><Layout /></PrivateRoute>,
                children: [
                    { index: true, element: <Dashboard /> },
                    { path: "inventory", element: <Inventory /> },
                    { path: "inventory/reconciliation", element: <InventoryReconciliation /> },
                    { path: "orders", element: <Orders /> },
                    { path: "packing", element: <PackingCamera /> },
                    { path: "returns", element: <Returns /> },
                    { path: "staff", element: <Staff /> },
                    { path: "settings", element: <Settings /> },
                    { path: "activity-logs", element: <ActivityLogs /> },
                    { path: "analytics", element: <Analytics /> },
                    { path: "pricing", element: <Pricing /> }
                ]
            }
        ]
    }
]);

// Special wrapper for Login to handle redirect logic
function LoginWrapper() {
    const { user } = useAuth();
    if (user) return <Navigate to="/" />;
    return <Login />;
}

function App() {
    return (
        <ThemeProvider>
            <RouterProvider router={router} />
            <Toaster />
            <ToastProvider />
            <UpdateNotification />
        </ThemeProvider>
    );
}

export default App;
