import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { PLANS, PLAN_FEATURES } from '@/config/plans';

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const [currentPlan, setCurrentPlan] = useState(PLANS.PRO);

    useEffect(() => {
        loadCurrentPlan();
    }, []);

    const loadCurrentPlan = async () => {
        try {
            const plan = await window.electronAPI.settings.get('current_plan');
            if (plan) {
                setCurrentPlan(plan);
            }
        } catch (error) {
            console.error('Error loading plan:', error);
            // Default to PRO if settings not available
            setCurrentPlan(PLANS.PRO);
        }
    };

    const getPlanBadgeStyle = () => {
        switch (currentPlan) {
            case PLANS.STARTER:
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case PLANS.PRO:
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case PLANS.ENTERPRISE:
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default:
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    return (
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold">Welcome back, {user?.fullName || 'User'}</h2>
                <p className="text-sm text-muted-foreground">{user?.role || 'Role'}</p>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>

                <div className="w-px h-6 bg-border" />

                {/* Plan Badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-semibold ${getPlanBadgeStyle()}`}>
                    <Crown className="w-3.5 h-3.5" />
                    {PLAN_FEATURES[currentPlan]?.name || 'Pro'}
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user?.username}</span>
                </div>

                <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </header>
    );
}
