import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Check, X, ShieldCheck, Sparkles, Zap, Crown, Mail, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Pricing() {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [cashfree, setCashfree] = useState(null);
    const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
    const [isSdkBlocked, setIsSdkBlocked] = useState(false);

    useEffect(() => {
        const detectAdBlocker = async () => {
            try {
                const url = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
                await fetch(url, { mode: 'no-cors' });
            } catch (err) {
                console.warn('Ad-blocker detected');
                setIsAdBlockerActive(true);
            }
        };
        detectAdBlocker();

        const initCashfree = () => {
            if (window.Cashfree) {
                const mode = import.meta.env.VITE_CASHFREE_MODE || "sandbox";
                setCashfree(window.Cashfree({ mode }));
                setIsSdkBlocked(false);
                return true;
            }
            return false;
        };

        if (!initCashfree()) {
            const interval = setInterval(() => {
                if (initCashfree()) {
                    clearInterval(interval);
                }
            }, 500);

            const timeout = setTimeout(() => {
                if (!window.Cashfree) {
                    setIsSdkBlocked(true);
                    clearInterval(interval);
                }
            }, 5000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, []);

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!selectedPlan) return;
        if (!cashfree) {
            setError("Payment system still loading. Please wait a moment.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan_type: selectedPlan.name.toUpperCase(),
                    customer_details: customerDetails
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.details
                    ? `${errorData.error}: ${errorData.details}`
                    : (errorData.error || `Server error: ${response.status}`);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            await cashfree.checkout({
                paymentSessionId: data.payment_session_id,
                redirectTarget: "_self"
            });

        } catch (err) {
            console.error('Checkout failed:', err);
            setError(err.message || 'Payment initiation failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const plans = [
        {
            name: 'Starter',
            price: '₹1',
            rawPrice: 1,
            description: 'For small operators needing essential protection.',
            icon: Zap,
            features: [
                '1 PC License Activation',
                'Packing Evidence Recording',
                'Checksum Integrity Verification',
                'Checklist & Photo Evidence',
                'Basic Order History',
                'Local Storage Only',
            ],
            cta: 'Secure Starter Plan',
            accent: 'primary'
        },
        {
            name: 'Pro',
            price: '₹1,999',
            rawPrice: 1999,
            description: 'For growing warehouses and high-volume sellers.',
            popular: true,
            icon: Crown,
            features: [
                'Everything in Starter',
                'Multiple Staff Accounts',
                'Advanced Inventory Intel',
                'ZIP/PDF Evidence Export',
                'Return & RTO Analytics',
                'Auto Daily Backups',
                'Priority Support Channel',
            ],
            cta: 'Unlock Pro Power',
            accent: 'primary'
        },
    ];

    return (
        <div className="bg-brand-mesh min-h-screen pt-32 pb-24">
            <Helmet>
                <title>Pricing | Clear and Honest Protection for Your Business</title>
                <meta name="description" content="Choose the EvidEx plan that fits your volume. Starter at ₹1 and Pro at ₹1,999. No hidden fees, just reliable protection." />
            </Helmet>

            <div className="container-wide">
                <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                        <Sparkles className="w-3 h-3" />
                        <span>7-Day Free Trial Included on All Plans</span>
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold mb-6">Straightforward <span className="highlight-blue">Pricing</span></h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        No complex tiers. No hidden charges. Just the protection you need to scale your business safely.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`card-pro flex flex-col justify-between relative group ${plan.popular ? 'border-primary ring-1 ring-primary/20' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                                    Best for Growth
                                </div>
                            )}

                            <div>
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`p-4 rounded-2xl ${plan.popular ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground/40'}`}>
                                        <plan.icon className="w-8 h-8" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold tracking-tighter">{plan.price}</div>
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">per month</div>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
                                <p className="text-muted-foreground mb-8 leading-relaxed italic border-l-2 border-primary/20 pl-4">
                                    {plan.description}
                                </p>
                                <ul className="space-y-4 mb-12">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                            <ShieldCheck className="w-4 h-4 text-primary" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                onClick={() => setSelectedPlan(plan)}
                                className={`w-full h-16 text-lg ${plan.popular ? 'btn-pro-primary' : 'btn-pro-outline'}`}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Support/Custom Quote */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-brand-deep/60 backdrop-blur-xl rounded-[2.5rem] p-12 lg:p-16 border border-white/10 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-white">Need a custom enterprise solution?</h2>
                        <p className="text-white/60 mb-8 leading-relaxed">
                            High volume operations needing site-wide licenses, API access, or custom security audits.
                        </p>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-sm font-bold text-white/80">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>sales@evidex.in</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-bold text-white/80">
                                <MessageCircle className="w-4 h-4 text-emerald-500" />
                                <span>Priority WhatsApp Support</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 shadow-inner">
                        <blockquote className="text-lg italic leading-relaxed mb-6 text-white/70">
                            "The Pro plan's RTO analytics saved us over ₹40,000 in just the first two months of implementation."
                        </blockquote>
                        <div className="font-bold text-primary">Nitin K. — Warehouse Head</div>
                    </div>
                </div>
            </div>

            {/* MODAL - Checkout */}
            {selectedPlan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-brand-deep/80 backdrop-blur-sm" onClick={() => setSelectedPlan(null)} />
                    <div className="relative bg-brand-deep w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-fade-in overflow-hidden border border-white/10">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                        <button
                            onClick={() => setSelectedPlan(null)}
                            className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold mb-2 text-white">Checkout: {selectedPlan.name}</h3>
                            <p className="text-white/40 text-sm font-medium">Activate your license for <span className="text-primary">{selectedPlan.price}</span></p>
                        </div>

                        <form onSubmit={handleCheckout} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/5 focus:ring-2 focus:ring-primary focus:bg-white/10 text-white transition-all outline-none font-medium"
                                    value={customerDetails.customer_name}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, customer_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Business Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="rahul@business.com"
                                    className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/5 focus:ring-2 focus:ring-primary focus:bg-white/10 text-white transition-all outline-none font-medium"
                                    value={customerDetails.customer_email}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, customer_email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    pattern="[0-9]{10}"
                                    placeholder="9876543210"
                                    className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/5 focus:ring-2 focus:ring-primary focus:bg-white/10 text-white transition-all outline-none font-medium"
                                    value={customerDetails.customer_phone}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, customer_phone: e.target.value })}
                                />
                                <p className="text-[10px] text-white/40 italic px-2">Cashfree updates will be sent to this number.</p>
                            </div>

                            {isSdkBlocked && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium space-y-2">
                                    <div className="flex items-center gap-2 font-bold uppercase tracking-widest">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>Payment System Blocked</span>
                                    </div>
                                    <p>Your browser is blocking the secure payment gateway. Please disable **Brave Shields** or **Ad-Blockers** to continue.</p>
                                </div>
                            )}

                            {error && <p className="text-sm text-red-500 font-bold text-center">{error}</p>}

                            <Button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full h-16 text-lg btn-pro-primary"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing securely...</span>
                                    </div>
                                ) : (
                                    `Initiate Secure Payment (${selectedPlan.price})`
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
