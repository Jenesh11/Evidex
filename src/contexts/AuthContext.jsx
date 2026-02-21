import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    // Removed local license state - using Supabase profile as single source of truth

    useEffect(() => {
        // Handle deep links for OAuth
        if (window.electronAPI?.auth?.onDeepLink) {
            window.electronAPI.auth.onDeepLink(async (url) => {
                console.log('Received deep link:', url);
                // Parse the URL to get the hash or query params
                try {
                    // Supabase redirects with access_token in the hash
                    const hashIndex = url.indexOf('#');
                    if (hashIndex !== -1) {
                        const hash = url.substring(hashIndex + 1);
                        const params = new URLSearchParams(hash);
                        const accessToken = params.get('access_token');
                        const refreshToken = params.get('refresh_token');

                        if (accessToken && refreshToken) {
                            const { data, error } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            });
                            if (error) console.error('Error setting session:', error);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing deep link:', e);
                }
            });
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Removed fetchLicense - using Supabase profile as single source of truth

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Profile not found - trigger should have created it
                // Wait a moment and retry once
                if (error.code === 'PGRST116') {
                    console.warn('Profile not found, retrying in 500ms (trigger may be running)...');
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const { data: retryData, error: retryError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();

                    if (retryError) {
                        console.error('Profile still not found after retry:', retryError);
                        // Use fallback - don't crash
                        setProfile({ id: userId, plan: 'STARTER', role: 'ADMIN' });
                        setLoading(false);
                        return;
                    }

                    // Success on retry
                    await handleProfileData(retryData, userId);
                    return;
                }

                console.error('Error fetching profile:', error);
                setProfile({ id: userId, plan: 'STARTER', role: 'ADMIN' });
                setLoading(false);
                return;
            }

            await handleProfileData(data, userId);
        } catch (error) {
            console.error('Error fetching profile:', error);

            // Fallback with persistent workspace
            let fallbackWorkspaceId = localStorage.getItem(`workspace_${userId}`);
            if (!fallbackWorkspaceId) {
                fallbackWorkspaceId = crypto.randomUUID();
                localStorage.setItem(`workspace_${userId}`, fallbackWorkspaceId);
            }

            const fallbackProfile = {
                id: userId,
                plan: 'STARTER',
                role: 'ADMIN',
                workspace_id: fallbackWorkspaceId
            };

            setProfile(fallbackProfile);

            // IMPORTANT: Set workspace in Electron even on partial failure
            if (window.electronAPI?.auth?.setWorkspace) {
                await window.electronAPI.auth.setWorkspace(fallbackWorkspaceId);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProfileData = async (data, userId) => {
        // Handle Workspace ID - Prioritize Data, then LocalStorage, then New
        let workspaceId = data?.workspace_id || localStorage.getItem(`workspace_${userId}`);
        let needsUpdate = !data?.workspace_id;

        if (!workspaceId) {
            // Generate a new workspace ID
            workspaceId = crypto.randomUUID();
            needsUpdate = true;
        }

        // Always persist to local storage for offline/fallback reliance
        localStorage.setItem(`workspace_${userId}`, workspaceId);

        if (needsUpdate) {

            // Update profile with new workspace_id
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    workspace_id: workspaceId,
                    // Maintain existing fields if upserting
                    plan: data?.plan || 'STARTER'
                });

            if (updateError) {
                console.error('Error assigning workspace:', updateError);
            } else {
                data.workspace_id = workspaceId;
            }
        }

        // Self-heal: Ensure role exists for older accounts
        if (!data.role) {
            const { error: roleError } = await supabase
                .from('profiles')
                .update({ role: 'ADMIN' })
                .eq('id', userId);

            if (!roleError) {
                data.role = 'ADMIN';
            }
        }

        // Set active workspace in Electron Main Process
        if (window.electronAPI?.auth?.setWorkspace) {
            await window.electronAPI.auth.setWorkspace(workspaceId);
        }

        // Profile is the single source of truth for plan state
        // No need to fetch license separately

        setProfile(data);
    };

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    };

    const signup = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (data?.user) {
                // Create profile row immediately
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        { id: data.user.id, plan: 'starter', role: 'ADMIN', created_at: new Date() }
                    ]);

                if (profileError) {
                    // If trigger exists, this might be duplicate, but we try as requested
                    console.warn('Profile creation warning:', profileError);
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: error.message };
        }
    };

    const loginStaff = async (username, password) => {
        try {
            const result = await window.electronAPI.auth.staffLogin({ username, password });
            if (result.success) {
                setUser(result.user);
                setSession({ user: result.user });
                // IMPORTANT: Set profile with role information for staff
                setProfile(result.user);

                // Fetch license after successful staff login (workspace logic handled in backend)
                // Wait a tick or assume backend set it
                // await fetchLicense(); // Removed: License logic moved to profile

                return { success: true };
            }
            return { success: false, message: result.message };
        } catch (error) {
            console.error('Staff login error:', error);
            return { success: false, message: error.message };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'evidex://auth/callback',
                    skipBrowserRedirect: true, // We will handle opening the URL
                },
            });

            if (error) throw error;

            if (data?.url) {
                // Open in system browser
                await window.electronAPI.system.openExternal(data.url);
            }

            return { success: true };
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const hasPermission = (permission) => {
        if (!user) return false;

        // Admin always has access
        const role = profile?.role || user?.role;
        if (role === 'ADMIN') return true;

        // STAFF Role: Strict allowlist
        if (role === 'STAFF') {
            const allowed = [
                'view_orders',
                'record_video',
                'view_inventory',
                'view_returns' // Basic view
            ];

            // Specific Deny List (Double Safety)
            const denied = [
                'manage_staff',
                'manage_settings',
                'manage_billing',
                'view_analytics',
                'view_logs',
                'manage_inventory', // Staff usually can't reconcile/delete
                'export_data'
            ];

            if (denied.includes(permission)) return false;
            return allowed.includes(permission);
        }

        return false;
    };

    // ===== PLAN CALCULATION (SINGLE SOURCE OF TRUTH) =====
    const getEffectivePlan = (profile) => {
        if (!profile) return 'STARTER';

        const now = new Date();

        // 1. Check lifetime access
        if (profile.is_lifetime && profile.plan === 'PRO') {
            return 'PRO';
        }

        // 2. Check plan expiry
        if (profile.plan_expires_at) {
            const expiry = new Date(profile.plan_expires_at);
            if (now < expiry) return profile.plan || 'STARTER';
        }

        // 3. Check trial (trial gives STARTER access, not PRO)
        if (profile.trial_expires_at) {
            const trialExpiry = new Date(profile.trial_expires_at);
            if (now < trialExpiry) return 'STARTER'; // Trial = STARTER features
        }

        // 4. Default to STARTER
        return 'STARTER';
    };

    const getTrialDaysRemaining = (profile) => {
        if (!profile?.trial_expires_at) return 0;
        const now = new Date();
        const expiry = new Date(profile.trial_expires_at);
        const diff = expiry - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    // Computed values
    const now = new Date();
    const isTrialExpired = profile?.trial_expires_at &&
        new Date(profile.trial_expires_at) < now &&
        !profile?.plan_expires_at &&
        !profile?.is_lifetime;

    const effectivePlan = getEffectivePlan(profile);
    const trialDaysRemaining = getTrialDaysRemaining(profile);
    const isLifetime = profile?.is_lifetime || false;
    const planExpiresAt = profile?.plan_expires_at;

    // ===== LICENSE CLAIM FUNCTION =====
    const claimLicense = async (code) => {
        if (!user?.id) {
            return { success: false, message: 'Not logged in' };
        }

        try {
            // Call Supabase function to claim license
            const { data, error } = await supabase.rpc('claim_license_code', {
                p_code: code.toUpperCase(),
                p_user_id: user.id
            });

            if (error) {
                console.error('License claim error:', error);
                return { success: false, message: error.message };
            }

            if (!data.success) {
                return data;
            }

            // Refresh profile to get updated plan
            await fetchProfile(user.id);

            return data;
        } catch (error) {
            console.error('Claim license error:', error);
            return { success: false, message: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            profile,
            isTrialExpired, // NEW: Trial expired flag
            effectivePlan, // NEW: Computed plan (STARTER or PRO)
            trialDaysRemaining, // NEW: Days left in trial
            isLifetime, // NEW: Lifetime access flag
            planExpiresAt, // NEW: Plan expiry date
            login,
            signup,
            loginStaff,
            loginWithGoogle,
            logout,
            hasPermission,
            claimLicense,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
