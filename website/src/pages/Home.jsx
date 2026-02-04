import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Download, ArrowRight, Video, Shield, Package, BarChart3, FileCheck, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function Home() {
    const features = [
        {
            icon: Video,
            title: 'Video Evidence Recording',
            description: 'Record tamper-proof packing videos with automatic verification and SHA-256 hashing.',
        },
        {
            icon: Shield,
            title: 'Tamper Detection',
            description: 'Instant alerts if any video file is modified, ensuring evidence integrity.',
        },
        {
            icon: Package,
            title: 'Order Management',
            description: 'Complete order lifecycle from NEW to DELIVERED with status tracking.',
        },
        {
            icon: BarChart3,
            title: 'Analytics Dashboard',
            description: 'Real-time insights into inventory, orders, and business performance.',
        },
        {
            icon: FileCheck,
            title: 'Returns Processing',
            description: 'Streamlined RTO and return handling with evidence review.',
        },
        {
            icon: Clock,
            title: 'Auto Backup',
            description: 'Scheduled automatic backups to protect your critical business data.',
        },
    ];

    return (
        <>
            <Helmet>
                <title>EvidEx - Inventory & Order Management with Video Evidence</title>
                <meta name="description" content="Professional inventory and order management software with tamper-proof video evidence for Windows. Protect your business with verified packing videos." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
                <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="flex justify-center mb-12">
                            <img src="/logo.png" alt="EvidEx Logo" className="h-80 w-80 sm:h-96 sm:w-96 lg:h-[28rem] lg:w-[28rem] object-contain animate-fade-in drop-shadow-2xl" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 animate-fade-in">
                            Inventory Management with{' '}
                            <span className="text-primary">Tamper-Proof Evidence</span>
                        </h1>
                        <p className="text-lg leading-8 text-muted-foreground mb-8">
                            Professional inventory & order management software with video evidence recording,
                            tamper detection, and complete order lifecycle tracking for Windows.
                        </p>
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <Link to="/download">
                                <Button size="lg">
                                    <Download className="mr-2 h-5 w-5" />
                                    Download for Windows
                                </Button>
                            </Link>
                            <Link to="/pricing">
                                <Button variant="outline" size="lg">
                                    View Pricing
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            7-day free trial • No credit card required
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                            Everything you need to manage your inventory
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Powerful features designed for e-commerce sellers and warehouse managers
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <Card key={index} hover className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <CardHeader>
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <Card className="glass">
                        <CardContent className="p-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                                Ready to protect your business?
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Start your 7-day free trial today. No credit card required.
                            </p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <Link to="/download">
                                    <Button size="lg">
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Now
                                    </Button>
                                </Link>
                                <Link to="/app-details">
                                    <Button variant="outline" size="lg">
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </>
    );
}
