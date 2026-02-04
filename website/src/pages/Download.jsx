import { Helmet } from 'react-helmet-async';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function DownloadPage() {
    const version = '1.0.0';
    const releaseDate = 'February 2026';

    const installationSteps = [
        'Download the EvidEx installer (.exe file)',
        'Run the installer and follow the setup wizard',
        'Launch EvidEx from your desktop or Start menu',
        'Sign up for a new account or log in',
        'Activate your 7-day free trial',
        'Start managing your inventory!',
    ];

    return (
        <>
            <Helmet>
                <title>Download - EvidEx for Windows</title>
                <meta name="description" content="Download EvidEx for Windows. Free 7-day trial included. Professional inventory management with video evidence." />
            </Helmet>

            <div className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <Badge variant="success" className="mb-4">
                        Windows Only
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                        Download EvidEx
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Get started with your 7-day free trial. No credit card required.
                    </p>
                </div>

                {/* Download Card */}
                <Card className="mb-12">
                    <CardContent className="p-12 text-center">
                        <div className="mb-6">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary mb-4">
                                <Download className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">EvidEx for Windows</h2>
                            <p className="text-muted-foreground">
                                Version {version} • Released {releaseDate}
                            </p>
                        </div>

                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 h-auto" onClick={() => window.location.href = '/EvidEx-Windows-Full.zip'}>
                            <Download className="mr-3 h-6 w-6" />
                            Download EvidEx for Windows
                        </Button>

                        <p className="mt-4 text-sm text-muted-foreground">
                            File size: ~180 MB • Full Version • Windows 10/11
                        </p>
                    </CardContent>
                </Card>

                {/* Installation Steps */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Installation Steps</h2>
                    <Card>
                        <CardContent className="p-8">
                            <ol className="space-y-4">
                                {installationSteps.map((step, index) => (
                                    <li key={index} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                            {index + 1}
                                        </div>
                                        <p className="text-muted-foreground pt-1">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                </section>

                {/* Security Note */}
                <section className="mb-12">
                    <Card className="border-green-500/20 bg-green-500/5">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Safe & Secure</h3>
                                    <p className="text-sm text-muted-foreground">
                                        EvidEx is digitally signed and verified. Your download is safe and secure.
                                        All data is stored locally on your computer, and we never access your files
                                        without your permission.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* System Requirements */}
                <section>
                    <Card>
                        <CardHeader>
                            <CardTitle>System Requirements</CardTitle>
                            <CardDescription>
                                Make sure your system meets these requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    Windows 10 or Windows 11 (64-bit)
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    4 GB RAM minimum (8 GB recommended)
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    500 MB free disk space
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    Webcam (for packing camera feature)
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}
