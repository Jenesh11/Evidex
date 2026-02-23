import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, User, Crown, Mail, Calendar, Shield, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { PLANS, PLAN_FEATURES } from '@/config/plans';

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const { user, profile, logout, effectivePlan, trialDaysRemaining, isLifetime, planExpiresAt } = useAuth();
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
        switch (effectivePlan || currentPlan) {
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

    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusText = () => {
        if (trialDaysRemaining > 0) {
            return {
                text: `${trialDaysRemaining} days remaining`,
                type: 'trial',
                color: 'text-blue-600 dark:text-blue-400'
            };
        }
        if (isLifetime) {
            return {
                text: 'Lifetime Access',
                type: 'lifetime',
                color: 'text-purple-600 dark:text-purple-400'
            };
        }
        if (planExpiresAt) {
            return {
                text: `Until ${formatDate(planExpiresAt)}`,
                type: 'paid',
                color: 'text-green-600 dark:text-green-400'
            };
        }
        return {
            text: 'No Active Plan',
            type: 'none',
            color: 'text-red-600 dark:text-red-400'
        };
    };

    const statusInfo = getStatusText();

    return (
        <header className="h-16 glass-floating px-6 flex items-center justify-between shadow-sm relative z-10">
            <div>
                <h2 className="text-lg font-bold font-display text-foreground dark:text-white">Welcome, {user?.email?.split('@')[0] || 'User'}</h2>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest">{profile?.role || 'Role'}</p>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white hover:bg-accent/50 dark:hover:bg-white/5 rounded-xl">
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                <div className="w-px h-4 bg-border/50 dark:bg-white/10" />

                {/* Plan Badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider shadow-inner ${getPlanBadgeStyle()}`}>
                    <Crown className="w-3 h-3" />
                    {PLAN_FEATURES[effectivePlan || currentPlan]?.name || 'Pro'}
                </div>

                {/* User Account Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent border-border/50 dark:border-white/10 text-foreground dark:text-white hover:bg-accent/50 dark:hover:bg-white/10 rounded-full px-4">
                            <User className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wider">{user?.email?.split('@')[0] || 'Account'}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0 glass border-white/10 rounded-3xl overflow-hidden shadow-3xl">
                        {/* Header Section */}
                        <div className="bg-gradient-to-br from-primary/20 to-blue-500/10 p-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{user?.email?.split('@')[0] || 'User'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Account Details Section */}
                        <div className="p-4 space-y-3">
                            {/* Role */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Role</span>
                                </div>
                                <span className="text-sm font-medium">{profile?.role || 'N/A'}</span>
                            </div>

                            {/* Plan */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Plan</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-xs font-semibold ${getPlanBadgeStyle()}`}>
                                    {effectivePlan || 'STARTER'}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Status</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {statusInfo.type === 'trial' && (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium">
                                            Trial
                                        </span>
                                    )}
                                    <span className={`text-sm font-medium ${statusInfo.color}`}>
                                        {statusInfo.text}
                                    </span>
                                </div>
                            </div>

                            {/* Workspace ID */}
                            {profile?.workspace_id && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Workspace</span>
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground">
                                        {profile.workspace_id.slice(0, 8)}...
                                    </span>
                                </div>
                            )}
                        </div>

                        <DropdownMenuSeparator className="my-0" />

                        {/* Logout Button */}
                        <div className="p-2">
                            <DropdownMenuItem
                                onClick={logout}
                                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                <span className="font-medium">Logout</span>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
