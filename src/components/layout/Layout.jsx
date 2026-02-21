import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import TitleBar from './TitleBar';
import TrialWelcomeDialog from '../dialogs/TrialWelcomeDialog';
import TrialExpiredOverlay from '../ui/TrialExpiredOverlay';
import { useAuth } from '@/contexts/AuthContext';

export default function Layout() {
    const { user, profile, trialDaysRemaining, isTrialExpired } = useAuth();
    const [showTrialWelcome, setShowTrialWelcome] = useState(false);
    const location = useLocation();

    // Define allowed paths during trial expiry
    const allowedPaths = ['/', '/pricing', '/settings'];
    const isRestrictedPath = !allowedPaths.includes(location.pathname);
    const shouldBlock = isTrialExpired && isRestrictedPath;

    // Show trial welcome dialog for new users with active trial
    useEffect(() => {
        if (user && profile && trialDaysRemaining > 0) {
            const welcomeKey = `trial_welcome_shown_${user.id}`;
            const hasSeenWelcome = localStorage.getItem(welcomeKey);

            if (!hasSeenWelcome) {
                setShowTrialWelcome(true);
            }
        }
    }, [user, profile, trialDaysRemaining]);

    const handleCloseWelcome = () => {
        if (user) {
            localStorage.setItem(`trial_welcome_shown_${user.id}`, 'true');
        }
        setShowTrialWelcome(false);
    };

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden relative">
            <TitleBar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6 relative">
                        {shouldBlock ? (
                            <TrialExpiredOverlay />
                        ) : (
                            <Outlet />
                        )}
                    </main>
                </div>
            </div>

            {/* Trial Welcome Dialog */}
            <TrialWelcomeDialog
                open={showTrialWelcome}
                onClose={handleCloseWelcome}
                trialDays={trialDaysRemaining}
            />
        </div>
    );
}
