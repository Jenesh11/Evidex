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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center mb-4"
                    >
                        <Logo className="w-20 h-20" />
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-2">Evidex</h1>
                    <p className="text-muted-foreground">Proof-first packing & returns protection system</p>
                </div>

                <Card className="shadow-2xl border-border/50">
                    <CardHeader>
                        <CardTitle>{isSignUp ? 'Create Account' : 'Welcome Back'}</CardTitle>
                        <CardDescription>
                            {isSignUp ? 'Sign up to get started' : 'Sign in to access your dashboard'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-6">
                            <button
                                type="button"
                                onClick={() => setLoginType('admin')}
                                className={`flex-1 pb-2 font-medium border-b-2 transition-colors ${loginType === 'admin' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                            >
                                Admin Login
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginType('staff')}
                                className={`flex-1 pb-2 font-medium border-b-2 transition-colors ${loginType === 'staff' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                            >
                                Staff Login
                            </button>
                        </div>

                        {loginType === 'admin' ? (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 mb-6 gap-2"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </Button>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with email</span></div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Password</label>
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="h-12"
                                        />
                                    </div>

                                    {error && <p className="text-destructive text-sm">{error}</p>}

                                    <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                                    </Button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => setIsSignUp(!isSignUp)}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Username</label>
                                    <Input
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Password</label>
                                    <Input
                                        type="password"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12"
                                    />
                                </div>

                                {error && <p className="text-destructive text-sm">{error}</p>}

                                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Login as Staff'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
