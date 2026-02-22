import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, XCircle, Loader2, Copy, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';

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
        <>
            <Helmet>
                <title>Payment Success - EvidEx</title>
            </Helmet>

            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 flex flex-col items-center justify-center min-h-[70vh]">
                <Card className="w-full max-w-2xl card-glow overflow-hidden relative">
                    {status === 'success' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
                    )}

                    <CardContent className="pt-12 pb-12 px-8 text-center relative">
                        {status === 'verifying' && (
                            <div className="space-y-6">
                                <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
                                <h1 className="text-3xl font-bold">Verifying Payment...</h1>
                                <p className="text-muted-foreground text-lg">
                                    Please wait while we confirm your payment and generate your license code.
                                </p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="animate-fade-in">
                                <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
                                <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
                                <p className="text-lg text-muted-foreground mb-10">
                                    Thank you for your purchase. Your <strong>{licenseData.plan}</strong> license code is ready below.
                                </p>

                                <div className="bg-secondary/50 border-2 border-dashed border-primary/30 rounded-2xl p-8 mb-10 relative group">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Your License Code</p>
                                    <div className="text-2xl sm:text-4xl font-mono font-bold tracking-wider gradient-text mb-4">
                                        {licenseData.code}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyToClipboard}
                                        className="gap-2"
                                    >
                                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied!' : 'Copy Code'}
                                    </Button>
                                </div>

                                <div className="space-y-6 text-left bg-primary/5 rounded-xl p-6 border border-primary/20 mb-10">
                                    <h3 className="flex items-center gap-2 font-bold text-lg">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                        How to activate:
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                                        <li>Open the <strong>Evidex Desktop App</strong> on your PC.</li>
                                        <li>Go to the <strong>Pricing</strong> section in the sidebar.</li>
                                        <li>Click on <strong>"I have a license code"</strong>.</li>
                                        <li>Paste your code and click <strong>Activate</strong>.</li>
                                    </ol>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link to="/download">
                                        <Button className="w-full sm:w-auto gap-2">
                                            <Download className="h-4 w-4" /> Download App
                                        </Button>
                                    </Link>
                                    <Link to="/">
                                        <Button variant="outline" className="w-full sm:w-auto">
                                            Return Home
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="animate-fade-in">
                                <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
                                <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
                                <p className="text-lg text-muted-foreground mb-8">
                                    {error}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button onClick={() => window.location.reload()} className="gap-2">
                                        Try Again
                                    </Button>
                                    <Link to="/support">
                                        <Button variant="outline">Contact Support</Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
