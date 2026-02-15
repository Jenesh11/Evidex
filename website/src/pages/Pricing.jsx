import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Check, X, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function Pricing() {
    const plans = [
        {
            name: 'Starter',
            price: '₹999',
            description: 'For small sellers and single PC setups',
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

    return (
        <>
            <Helmet>
                <title>Pricing - EvidEx</title>
                <meta name="description" content="EvidEx pricing plans. Start with a 7-day free trial. Starter plan at ₹999 and Pro plan at ₹2,499." />
            </Helmet>

            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <Badge variant="success" className="mb-4">
                        7-Day Free Trial
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Choose the plan that's right for your business. All plans include a 7-day free trial.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-5xl mx-auto mb-16">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''}
                        >
                            {plan.popular && (
                                <div className="px-6 pt-6">
                                    <Badge variant="default">Most Popular</Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Link to="/download">
                                    <Button className="w-full mb-6" variant={plan.popular ? 'default' : 'outline'}>
                                        Start Free Trial
                                    </Button>
                                </Link>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            {feature.included ? (
                                                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                            )}
                                            <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
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
                <section className="mb-16">
                    <Card className="glass">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4 text-center">7-Day Free Trial Included</h2>
                            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
                                Every plan comes with a 7-day free trial. No credit card required.
                                Try all Pro features during your trial period. Cancel anytime.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Payment Info */}
                <section className="mb-16">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment & Activation</CardTitle>
                            <CardDescription>How to activate your subscription</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                After your trial ends, you'll need to purchase a license code to continue using EvidEx.
                                License codes can be purchased through our payment gateway (coming soon) or by contacting
                                our sales team.
                            </p>
                            <p className="text-muted-foreground">
                                Once you have a license code, simply enter it in the app's Pricing page to activate
                                your subscription. Your subscription will be valid for one month from activation.
                            </p>
                            <div className="pt-4">
                                <Badge variant="outline">Payment Gateway Coming Soon</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Can I upgrade or downgrade?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Yes, you can upgrade from Starter to Pro at any time. Contact support for assistance.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">What happens after the trial?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    After 7 days, you'll need to activate a license code to continue using the app.
                                    Your data will be preserved.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Is there a refund policy?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    We offer a 7-day free trial so you can try before you buy. Contact support for
                                    refund requests.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Do you offer annual plans?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Annual plans are coming soon. Contact our sales team for enterprise pricing.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </div>
        </>
    );
}
