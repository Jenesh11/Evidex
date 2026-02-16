import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Download, Check, Video, Shield, Package, BarChart3, Users, FileCheck, HardDrive, Zap, Monitor, Cpu, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function AppDetails() {
    const features = [
        { icon: Video, text: 'Video evidence recording with tamper detection', gradient: 'from-purple-500 to-pink-500' },
        { icon: Package, text: 'Complete order lifecycle management', gradient: 'from-orange-500 to-red-500' },
        { icon: BarChart3, text: 'Inventory tracking and reconciliation', gradient: 'from-green-500 to-emerald-500' },
        { icon: FileCheck, text: 'Returns and RTO processing', gradient: 'from-indigo-500 to-purple-500' },
        { icon: Users, text: 'Multi-staff support with role-based access', gradient: 'from-cyan-500 to-blue-500' },
        { icon: BarChart3, text: 'Analytics and reporting dashboard', gradient: 'from-pink-500 to-rose-500' },
        { icon: HardDrive, text: 'Automatic backups', gradient: 'from-blue-500 to-indigo-500' },
        { icon: FileCheck, text: 'Evidence export and PDF generation', gradient: 'from-emerald-500 to-green-500' },
    ];

    const systemRequirements = [
        { icon: Monitor, text: 'Windows 10 or Windows 11 (64-bit)' },
        { icon: Cpu, text: '4 GB RAM minimum (8 GB recommended)' },
        { icon: HardDrive, text: '500 MB free disk space' },
        { icon: Camera, text: 'Webcam (for packing camera feature)' },
        { icon: Zap, text: 'Internet connection (for license activation)' },
    ];

    const techHighlights = [
        {
            title: 'Modern Technology',
            description: 'Built with modern web technologies and best practices, ensuring high-quality code, reliability, and excellent performance.',
            badge: 'Modern Stack',
            gradient: 'from-cyan-500 to-blue-500',
        },
        {
            title: 'Windows Optimized',
            description: 'Native Windows desktop application built with Electron, providing a smooth, responsive experience with full access to system resources.',
            badge: 'Windows Only',
            gradient: 'from-purple-500 to-pink-500',
        },
    ];

    return (
        <>
            <Helmet>
                <title>App Details - EvidEx</title>
                <meta name="description" content="Learn about EvidEx features, technology, and system requirements for Windows." />
            </Helmet>

            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-3xl text-center mb-16 animate-fade-in">
                    <Badge variant="default" className="mb-4 animate-pulse-glow">
                        Desktop Application
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                        Professional <span className="gradient-text">Inventory Management</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                        EvidEx is a powerful desktop application designed for e-commerce sellers,
                        warehouse managers, and logistics companies who need reliable evidence
                        of their packing and shipping processes.
                    </p>
                </div>

                {/* What it does */}
                <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <Card className="card-hover card-glow relative overflow-hidden">
                        <div className="absolute inset-0 gradient-mesh opacity-5" />
                        <CardHeader className="relative">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 mb-4 shadow-lg">
                                <Shield className="h-7 w-7 text-white" />
                            </div>
                            <CardTitle className="text-3xl">What EvidEx Does</CardTitle>
                        </CardHeader>
                        <CardContent className="relative space-y-4">
                            <p className="text-muted-foreground leading-relaxed text-base">
                                EvidEx combines traditional inventory and order management with cutting-edge
                                video evidence technology. Record tamper-proof videos of your packing process,
                                track orders from creation to delivery, and protect your business from fraudulent
                                return claims.
                            </p>
                            <p className="text-muted-foreground leading-relaxed text-base">
                                Every video is cryptographically hashed using SHA-256, ensuring that any
                                modification to the file is immediately detected. This provides irrefutable
                                proof of your packing process in case of disputes.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Features */}
                <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Key <span className="gradient-text">Features</span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Everything you need to manage your inventory and protect your business
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-primary/5 transition-colors group">
                                <div className={`flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <p className="text-muted-foreground pt-2 text-base leading-relaxed">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Technology */}
                <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Built with <span className="gradient-text">Modern Technology</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {techHighlights.map((tech, index) => (
                            <Card key={index} className="card-hover card-glow relative overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${tech.gradient} opacity-5`} />
                                <CardContent className="relative p-8">
                                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tech.gradient} mb-4 shadow-lg`}>
                                        <Zap className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{tech.title}</h3>
                                    <p className="text-muted-foreground mb-4 leading-relaxed">
                                        {tech.description}
                                    </p>
                                    <Badge variant={index === 0 ? 'default' : 'outline'}>{tech.badge}</Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* System Requirements */}
                <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            System <span className="gradient-text">Requirements</span>
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Make sure your system meets these requirements
                        </p>
                    </div>
                    <Card className="card-hover">
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {systemRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                            <req.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-sm text-foreground">{req.text}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* CTA */}
                <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <Card className="glass-strong card-glow relative overflow-hidden inline-block">
                        <div className="absolute inset-0 gradient-vibrant opacity-10" />
                        <CardContent className="relative p-10">
                            <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                Download EvidEx for Windows and start your 7-day free trial today
                            </p>
                            <Link to="/download">
                                <Button size="lg" className="btn-gradient btn-glow">
                                    <Download className="mr-2 h-5 w-5" />
                                    Download for Windows
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
