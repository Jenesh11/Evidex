import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Video, Shield, Package, BarChart3, RotateCcw, HardDrive, Sparkles, Download, FileCheck, Clock, Zap } from 'lucide-react';
import Logo from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function Home() {
    const features = [
        {
            icon: Video,
            title: 'Video Evidence Recording',
            description: 'Record tamper-proof packing videos with automatic verification and SHA-256 hashing.',
            gradient: 'from-purple-500 to-pink-500',
        },
        {
            icon: Shield,
            title: 'Tamper Detection',
            description: 'Instant alerts if any video file is modified, ensuring evidence integrity.',
            gradient: 'from-cyan-500 to-blue-500',
        },
        {
            icon: Package,
            title: 'Order Management',
            description: 'Complete order lifecycle from NEW to DELIVERED with status tracking.',
            gradient: 'from-orange-500 to-red-500',
        },
        {
            icon: BarChart3,
            title: 'Analytics Dashboard',
            description: 'Real-time insights into inventory, orders, and business performance.',
            gradient: 'from-green-500 to-emerald-500',
        },
        {
            icon: FileCheck,
            title: 'Returns Processing',
            description: 'Streamlined RTO and return handling with evidence review.',
            gradient: 'from-indigo-500 to-purple-500',
        },
        {
            icon: Clock,
            title: 'Auto Backup',
            description: 'Scheduled automatic backups to protect your critical business data.',
            gradient: 'from-pink-500 to-rose-500',
        },
    ];

    const stats = [
        { value: '99.9%', label: 'Uptime' },
        { value: '10K+', label: 'Videos Secured' },
        { value: '24/7', label: 'Support' },
        { value: '< 1min', label: 'Setup Time' },
    ];

    return (
        <>
            <Helmet>
                <title>EvidEx - Inventory & Order Management with Video Evidence</title>
                <meta name="description" content="Professional inventory and order management software with tamper-proof video evidence for Windows. Protect your business with verified packing videos." />
            </Helmet>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 gradient-mesh animate-gradient" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
                <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center mb-16 animate-fade-in">
                        <div className="mb-8 flex justify-center">
                            <Logo className="h-32 w-32 animate-float drop-shadow-2xl" />
                        </div>
                        <Badge variant="default" className="mb-6 animate-pulse-glow">
                            <Sparkles className="mr-2 h-3 w-3" />
                            Trusted by 500+ Businesses
                        </Badge>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6 animate-fade-in">
                            Inventory Management with{' '}
                            <span className="gradient-text">Tamper-Proof Evidence</span>
                        </h1>
                        <p className="text-lg sm:text-xl leading-8 text-muted-foreground mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            Professional inventory & order management software with video evidence recording,
                            tamper detection, and complete order lifecycle tracking for Windows.
                        </p>
                        <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <Link to="/download">
                                <Button size="lg" className="btn-gradient btn-glow text-lg px-8 py-6 h-auto">
                                    <Download className="mr-2 h-5 w-5" />
                                    Download for Windows
                                </Button>
                            </Link>
                            <Link to="/pricing">
                                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto hover:bg-primary/10">
                                    View Pricing
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            7-day free trial • No credit card required
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 sm:py-32 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <Badge variant="outline" className="mb-4">
                            Features
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4">
                            Everything you need to{' '}
                            <span className="gradient-text">manage your inventory</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Powerful features designed for e-commerce sellers and warehouse managers
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="card-hover card-glow group animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardHeader>
                                    <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="h-7 w-7 text-white" />
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <Card className="glass-strong card-glow relative overflow-hidden">
                        <div className="absolute inset-0 gradient-vibrant opacity-10" />
                        <CardContent className="relative p-12 sm:p-16 text-center">
                            <Sparkles className="h-12 w-12 text-primary mx-auto mb-6 animate-pulse" />
                            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4">
                                Ready to protect your business?
                            </h2>
                            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                                Start your 7-day free trial today. No credit card required.
                                Experience the power of tamper-proof evidence.
                            </p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <Link to="/download">
                                    <Button size="lg" className="btn-gradient btn-glow text-lg px-8 py-6 h-auto">
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Now
                                    </Button>
                                </Link>
                                <Link to="/app-details">
                                    <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto hover:bg-primary/10">
                                        Learn More
                                        <ArrowRight className="ml-2 h-5 w-5" />
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
