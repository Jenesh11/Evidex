import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    CheckCircle2,
    XCircle,
    Loader2,
    Copy,
    Download,
    ArrowRight,
    ShieldCheck,
    PartyPopper,
    MonitorIcon,
    TerminalSquare
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function OrderSuccess() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');
    const [status, setStatus] = useState('verifying');
    const [licenseData, setLicenseData] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!orderId) {
            setStatus('error');
            setError('Missing Order ID. If you have paid, please contact support.');
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: orderId })
                });

                const data = await response.json();
                if (data.error) throw new Error(data.error);

                setLicenseData(data);
                setStatus('success');
            } catch (err) {
                console.error('Verification failed:', err);
                setError(err.message || 'Failed to verify payment. Don\'t worry, your payment is safe. Please contact support.');
                setStatus('error');
            }
        };

        verifyPayment();
    }, [orderId]);

    const copyToClipboard = () => {
        if (!licenseData?.code) return;
        navigator.clipboard.writeText(licenseData.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-brand-mesh min-h-screen pt-32 pb-24 flex items-center justify-center">
            <Helmet>
                <title>Success | Welcome to the EvidEx Protection Pack</title>
            </Helmet>

            <div className="container-wide max-w-3xl">
                {status === 'verifying' && (
                    <div className="text-center animate-pulse">
                        <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin mb-8" />
                        <h1 className="text-3xl font-bold mb-4">Verifying Secure Payment</h1>
                        <p className="text-muted-foreground italic">Momentarily matching records with the payment gateway...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="animate-fade-in">
                        <div className="card-pro p-12 lg:p-20 relative overflow-hidden text-center">
                            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-10" />

                            <div className="mb-12">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto mb-8 shadow-inner">
                                    <PartyPopper className="w-10 h-10" />
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-bold mb-4">You're Protected.</h1>
                                <p className="text-lg text-muted-foreground italic max-w-sm mx-auto">
                                    Payment verified. Your {licenseData?.plan} license has been provisioned.
                                </p>
                            </div>

                            {/* License Code View */}
                            <div className="bg-secondary rounded-[2.5rem] p-10 mb-12 border border-border/40 relative group">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Your Production License Code</div>
                                <div className="text-3xl sm:text-5xl font-mono font-bold tracking-tighter text-primary mb-8 select-all">
                                    {licenseData?.code}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={copyToClipboard}
                                    className="btn-pro-outline px-8 h-12 gap-2"
                                >
                                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied ? 'Copied to Clipboard' : 'Copy Code'}
                                </Button>
                            </div>

                            {/* Quick Activation Guide */}
                            <div className="text-left bg-brand-deep rounded-[2rem] p-10 text-white mb-12 relative overflow-hidden">
                                <TerminalSquare className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5" />
                                <h3 className="flex items-center gap-3 font-bold text-xl mb-6">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                    Activation Steps
                                </h3>
                                <div className="space-y-4 text-sm font-medium text-white/60">
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">1</div>
                                        <p>Launch the <span className="text-white">EvidEx Windows Client</span></p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">2</div>
                                        <p>Navigate to <span className="text-white">Settings &rarr; License Management</span></p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">3</div>
                                        <p>Paste your code and click <span className="text-white font-bold uppercase tracking-widest">Verify License</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link to="/download">
                                    <Button className="btn-pro-primary h-16 px-10 text-lg">
                                        <Download className="mr-2 w-5 h-5" /> Download App
                                    </Button>
                                </Link>
                                <Link to="/">
                                    <Button variant="ghost" className="btn-pro h-16 px-10 text-muted-foreground hover:text-foreground">
                                        Return Home
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="animate-fade-in max-w-md mx-auto">
                        <div className="card-pro p-12 text-center border-red-500/20">
                            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                            <h1 className="text-3xl font-bold mb-4">Verification Error</h1>
                            <p className="text-muted-foreground italic mb-10 leading-relaxed">
                                {error}
                            </p>
                            <div className="space-y-4">
                                <Button onClick={() => window.location.reload()} className="w-full h-14 btn-pro-primary">
                                    Re-verify Status
                                </Button>
                                <Link to="/support" className="block">
                                    <Button variant="outline" className="w-full h-14 btn-pro-outline">Contact Specialist</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
