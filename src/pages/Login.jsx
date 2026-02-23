import React, { useState } from 'react';
import Logo from '@/components/ui/Logo';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup, loginWithGoogle, loginStaff } = useAuth();

    const [loginType, setLoginType] = useState('admin'); // 'admin' or 'staff'
    const [username, setUsername] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let result;
        if (loginType === 'staff') {
            // Staff login uses local SQLite database
            result = await loginStaff(username, password);
        } else {
            if (isSignUp) {
                result = await signup(email, password);
            } else {
                result = await login(email, password);
            }
        }

        if (!result.success) {
            setError(result.message || (isSignUp ? 'Sign up failed' : 'Login failed'));
        } else if (isSignUp) {
            setError('');
        }

        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        const result = await loginWithGoogle();
        if (!result.success) {
            setError(result.message || 'Google login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-mesh p-4 relative overflow-hidden">
            <div className="noise-overlay" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center justify-center mb-6"
                    >
                        <Logo className="w-24 h-24 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
                    </motion.div>
                    <h1 className="text-5xl font-black mb-3 tracking-tighter text-white font-display">EvidEx</h1>
                    <p className="text-primary/80 font-bold uppercase tracking-[0.3em] text-[10px]">Shield Protection System</p>
                </div>

                <div className="glass border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl">
                    <div className="p-8 md:p-10">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2 font-display">
                                {isSignUp ? 'Create Account' : 'Welcome Back'}
                            </h2>
                            <p className="text-white/60 text-sm">
                                {isSignUp ? 'Start your protection journey' : 'Securely sign in to your dashboard'}
                            </p>
                        </div>

                        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
                            <button
                                type="button"
                                onClick={() => setLoginType('admin')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${loginType === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-white/40 hover:text-white'}`}
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginType('staff')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${loginType === 'staff' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-white/40 hover:text-white'}`}
                            >
                                Staff
                            </button>
                        </div>

                        {loginType === 'admin' ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-full h-14 mb-8 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl gap-3 font-semibold transition-all duration-300 active:scale-95"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Google Account
                                </Button>

                                <div className="relative mb-8">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                                    <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold"><span className="bg-[#0c1015] px-3 text-white/30">Secure Mail</span></div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-14 bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 rounded-2xl px-5"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-14 bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 rounded-2xl px-5"
                                        />
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-red-400 text-xs font-medium ml-1 flex items-center gap-2"
                                        >
                                            <div className="w-1 h-1 rounded-full bg-red-400" /> {error}
                                        </motion.p>
                                    )}

                                    <Button type="submit" className="w-full h-14 text-sm font-bold uppercase tracking-widest btn-pro-primary" disabled={loading}>
                                        {loading ? 'Processing...' : (isSignUp ? 'Initialize' : 'Authorize')}
                                    </Button>

                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsSignUp(!isSignUp)}
                                            className="text-xs font-bold text-white/40 hover:text-white transition-colors"
                                        >
                                            {isSignUp ? 'ALREADY REGISTERED? AUTHORIZE' : "NEED AN ACCOUNT? INITIALIZE"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Username</label>
                                    <Input
                                        placeholder="Staff Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="h-14 bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 rounded-2xl px-5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Pin Code</label>
                                    <Input
                                        type="password"
                                        placeholder="••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-14 bg-white/5 border-white/10 text-white focus:border-primary/50 focus:ring-primary/20 rounded-2xl px-5"
                                    />
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-red-400 text-xs font-medium ml-1 flex items-center gap-2"
                                    >
                                        <div className="w-1 h-1 rounded-full bg-red-400" /> {error}
                                    </motion.p>
                                )}

                                <Button type="submit" className="w-full h-14 text-sm font-bold uppercase tracking-widest btn-pro-primary" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Staff Authorize'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                <p className="mt-10 text-center text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">
                    Enterprise Shield Encryption Active
                </p>
            </motion.div>
        </div>
    );
}
