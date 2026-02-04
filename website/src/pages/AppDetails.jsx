import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Download, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function AppDetails() {
    const features = [
        'Video evidence recording with tamper detection',
        'Complete order lifecycle management',
        'Inventory tracking and reconciliation',
        'Returns and RTO processing',
        'Multi-staff support with role-based access',
        'Analytics and reporting dashboard',
        'Automatic backups',
        'Evidence export and PDF generation',
    ];

    const systemRequirements = [
        'Windows 10 or Windows 11 (64-bit)',
        '4 GB RAM minimum (8 GB recommended)',
        '500 MB free disk space',
        'Webcam (for packing camera feature)',
        'Internet connection (for license activation)',
    ];

    return (
        <>
            <Helmet>
                <title>App Details - EvidEx</title>
                <meta name="description" content="Learn about EvidEx features, technology, and system requirements for Windows." />
            </Helmet>

            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <Badge variant="default" className="mb-4">
                        Desktop Application
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                        Professional Inventory Management
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        EvidEx is a powerful desktop application designed for e-commerce sellers,
                        warehouse managers, and logistics companies who need reliable evidence
                        of their packing and shipping processes.
                    </p>
                </div>

                {/* What it does */}
                <section className="mb-16">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">What EvidEx Does</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                EvidEx combines traditional inventory and order management with cutting-edge
                                video evidence technology. Record tamper-proof videos of your packing process,
                                track orders from creation to delivery, and protect your business from fraudulent
                                return claims.
                            </p>
                            <p className="text-muted-foreground">
                                Every video is cryptographically hashed using SHA-256, ensuring that any
                                modification to the file is immediately detected. This provides irrefutable
                                proof of your packing process in case of disputes.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                {/* Features */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Check className="h-4 w-4 text-primary" />
                                    </div>
                                </div>
                                <p className="text-muted-foreground">{feature}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Technology */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8">Technology</h2>
                    <Card>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Modern Technology</h3>
                                    <p className="text-muted-foreground mb-4">
                                        EvidEx is built with modern web technologies and best practices,
                                        ensuring high-quality code, reliability, and excellent performance.
                                    </p>
                                    <Badge variant="default">Modern Stack</Badge>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Windows Optimized</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Native Windows desktop application built with Electron, providing
                                        a smooth, responsive experience with full access to system resources.
                                    </p>
                                    <Badge variant="outline">Windows Only</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* System Requirements */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold mb-8">System Requirements</h2>
                    <Card>
                        <CardContent className="p-8">
                            <ul className="space-y-3">
                                {systemRequirements.map((req, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Check className="h-4 w-4 text-primary" />
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground">{req}</p>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                {/* CTA */}
                <div className="text-center">
                    <Link to="/download">
                        <Button size="lg">
                            <Download className="mr-2 h-5 w-5" />
                            Download for Windows
                        </Button>
                    </Link>
                </div>
            </div>
        </>
    );
}
