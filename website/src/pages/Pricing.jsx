import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Check, X, Download, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

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
        // Detect general ad-blockers
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
                console.log('Initializing Cashfree in mode:', mode);
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

            // If still not loaded after 5 seconds, it's likely blocked
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

            // Initiate Payment
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
            price: '₹999',
            description: 'For small sellers and single PC setups',
            icon: Zap,
            gradient: 'from-cyan-500 to-blue-500',
            features: [
                { name: '1 PC license', included: true },
                { name: 'Packing camera recording', included: true },
                { name: 'Packing checklist + photos', included: true },
                { name: 'Evidence viewer (video + photos)', included: true },
                { name: 'Basic Returns & RTO handling', included: true },
                { name: 'Activity logs (read-only)', included: true },
                { name: 'Local storage', included: true },
                { name: 'Manual backup', included: true },
            ],
        },
        {
            name: 'Pro',
            price: '₹2,499',
            description: 'For growing businesses',
            popular: true,
            icon: Crown,
            gradient: 'from-purple-500 to-pink-500',
            features: [
                { name: 'Everything in Starter', included: true },
                { name: 'Multiple staff accounts', included: true },
                { name: 'Inventory reconciliation', included: true },
                { name: 'Evidence export (ZIP/PDF)', included: true },
                { name: 'RTO & Return analytics', included: true },
                { name: 'Courier-wise RTO tracking', included: true },
                { name: 'Auto daily backups', included: true },
                { name: 'Priority support', included: true },
            ],
        },
    ];

    const faqs = [
        {
            question: 'Can I upgrade or downgrade?',
            answer: 'Yes, you can upgrade from Starter to Pro at any time. Contact support for assistance.',
        },
        {
            question: 'What happens after the trial?',
            answer: 'After 7 days, you\'ll need to activate a license code to continue using the app. Your data will be preserved.',
        },
        {
            question: 'Is there a refund policy?',
            answer: 'We offer a 7-day free trial so you can try before you buy. Contact support for refund requests.',
        },
        {
            question: 'Do you offer annual plans?',
            answer: 'Annual plans are coming soon. Contact our sales team for enterprise pricing.',
        },
    ];

    return (
        <>
            <Helmet>
                <title>Pricing - EvidEx</title>
                <meta name="description" content="EvidEx pricing plans. Start with a 7-day free trial. Starter plan at ₹999 and Pro plan at ₹2,499." />
            </Helmet>

            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center mb-16 animate-fade-in">
                    <Badge variant="success" className="mb-4 animate-pulse-glow">
                        <Sparkles className="mr-2 h-3 w-3" />
                        7-Day Free Trial
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                        Simple, <span className="gradient-text">Transparent Pricing</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground">
                        Choose the plan that's right for your business. All plans include a 7-day free trial.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-5xl mx-auto mb-16">
                    {plans.map((plan, index) => (
                        <Card
                            key={plan.name}
                            className={`${plan.popular ? 'border-primary shadow-2xl shadow-primary/30 scale-105' : 'card-hover'} card-glow relative overflow-hidden animate-fade-in`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {plan.popular && (
                                <div className="absolute inset-0 gradient-vibrant opacity-5" />
                            )}
                            {plan.popular && (
                                <div className="absolute top-0 right-0 px-6 py-2 bg-gradient-to-r from-primary to-primary/80 text-white text-sm font-semibold rounded-bl-2xl">
                                    Most Popular
                                </div>
                            )}
                            <CardHeader className="relative">
                                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient} shadow-lg`}>
                                    <plan.icon className="h-7 w-7 text-white" />
                                </div>
                                <CardTitle className="text-3xl">{plan.name}</CardTitle>
                                <CardDescription className="text-base">{plan.description}</CardDescription>
                                <div className="mt-6">
                                    <span className="text-5xl font-bold gradient-text">{plan.price}</span>
                                    <span className="text-muted-foreground text-lg">/month</span>
                                </div>
                            </CardHeader>
                            <CardContent className="relative">
                                {plan.name === 'Starter' || plan.name === 'Pro' ? (
                                    <Button
                                        className={`w-full mb-6 ${plan.popular ? 'btn-gradient btn-glow' : ''}`}
                                        variant={plan.popular ? 'default' : 'outline'}
                                        size="lg"
                                        onClick={() => setSelectedPlan(plan)}
                                    >
                                        Buy Now
                                    </Button>
                                ) : (
                                    <Link to="/download">
                                        <Button
                                            className={`w-full mb-6 ${plan.popular ? 'btn-gradient btn-glow' : ''}`}
                                            variant={plan.popular ? 'default' : 'outline'}
                                            size="lg"
                                        >
                                            Start Free Trial
                                        </Button>
                                    </Link>
                                )}
                                <ul className="space-y-4">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            {feature.included ? (
                                                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mt-0.5">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            ) : (
                                                <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                            )}
                                            <span className={`${feature.included ? 'text-foreground' : 'text-muted-foreground'} text-base`}>
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Trial Info */}
                <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <Card className="glass-strong card-glow relative overflow-hidden">
                        <div className="absolute inset-0 gradient-mesh opacity-20" />
                        <CardContent className="relative p-10 sm:p-12">
                            <Sparkles className="h-12 w-12 text-primary mx-auto mb-6 animate-pulse" />
                            <h2 className="text-3xl font-bold mb-4 text-center">7-Day Free Trial Included</h2>
                            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
                                Every plan comes with a 7-day free trial. No credit card required.
                                Try all Pro features during your trial period. Cancel anytime.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Payment Info */}
                <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle className="text-2xl">Payment & Activation</CardTitle>
                            <CardDescription className="text-base">How to activate your subscription</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                After your trial ends, you'll need to purchase a license code to continue using EvidEx.
                                License codes can be purchased through our payment gateway (coming soon) or by contacting
                                our sales team.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Once you have a license code, simply enter it in the app's Pricing page to activate
                                your subscription. Your subscription will be valid for one month from activation.
                            </p>
                            <div className="pt-4">
                                <Badge variant="outline" className="text-sm">Payment Gateway Coming Soon</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* FAQ */}
                <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <h2 className="text-3xl font-bold mb-8 text-center">
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqs.map((faq, index) => (
                            <Card key={index} className="card-hover">
                                <CardHeader>
                                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
                {/* Checkout Modal */}
                {selectedPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <Card className="w-full max-w-md card-glow relative">
                            <button
                                onClick={() => setSelectedPlan(null)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            <CardHeader>
                                <CardTitle>Checkout: {selectedPlan.name} Plan</CardTitle>
                                <CardDescription>Enter your details to proceed to payment</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCheckout} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            className="w-full p-2.5 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            value={customerDetails.customer_name}
                                            onChange={(e) => setCustomerDetails({ ...customerDetails, customer_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="john@example.com"
                                            className="w-full p-2.5 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            value={customerDetails.customer_email}
                                            onChange={(e) => setCustomerDetails({ ...customerDetails, customer_email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            pattern="[0-9]{10}"
                                            placeholder="9876543210"
                                            className="w-full p-2.5 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            value={customerDetails.customer_phone}
                                            onChange={(e) => setCustomerDetails({ ...customerDetails, customer_phone: e.target.value })}
                                        />
                                        <p className="text-[10px] text-muted-foreground">10-digit mobile number for payment updates</p>
                                    </div>

                                    {isSdkBlocked && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                                            <div className="flex items-center gap-2 mb-1 font-bold">
                                                <X className="h-4 w-4" />
                                                Payment System Blocked
                                            </div>
                                            Your browser is blocking the payment system. Please disable **Brave Shields** or **Ad-Blockers** for this site and refresh the page to proceed.
                                        </div>
                                    )}

                                    {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                                    <Button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="w-full btn-gradient py-6 text-lg"
                                    >
                                        {isProcessing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </div>
                                        ) : (
                                            `Pay ${selectedPlan.price}`
                                        )}
                                    </Button>
                                    <p className="text-[10px] text-center text-muted-foreground">
                                        Secure payment via Cashfree PG. License code will be sent to your email.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
