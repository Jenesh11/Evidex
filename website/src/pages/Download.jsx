import { Helmet } from 'react-helmet-async';
import { Download, CheckCircle, AlertCircle, Monitor, HardDrive, Cpu, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export default function DownloadPage() {
    const version = '1.0.23';
    const releaseDate = 'February 2026';

    const installationSteps = [
        'Download the EvidEx installer (.exe file)',
        'Run the installer and follow the setup wizard',
        'Launch EvidEx from your desktop or Start menu',
        'Sign up for a new account or log in',
        'Activate your 7-day free trial',
        'Start managing your inventory!',
    ];

    const systemRequirements = [
        { icon: Monitor, label: 'Windows 10 or Windows 11 (64-bit)' },
        { icon: Cpu, label: '4 GB RAM minimum (8 GB recommended)' },
        { icon: HardDrive, label: '500 MB free disk space' },
        { icon: Camera, label: 'Webcam (for packing camera feature)' },
    ];

    return (
        <>
            <Helmet>
                <title>Download - EvidEx for Windows</title>
                <meta name="description" content="Download EvidEx for Windows. Free 7-day trial included. Professional inventory management with video evidence." />
            </Helmet>

            <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <Badge variant="success" className="mb-4">
                        Windows Only
                    </Badge>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                        Download <span className="gradient-text">EvidEx</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Get started with your 7-day free trial. No credit card required.
                    </p>
                </div>

                {/* Download Card */}
                <Card className="mb-12 card-glow animate-fade-in relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute inset-0 gradient-vibrant opacity-5" />
                    <CardContent className="relative p-12 sm:p-16 text-center">
                        <div className="mb-8">
                            <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-2xl shadow-primary/50 animate-pulse-glow">
                                <Download className="h-12 w-12 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">EvidEx for Windows</h2>
                            <p className="text-muted-foreground text-lg">
                                Version {version} • Released {releaseDate}
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className="btn-gradient btn-glow w-full sm:w-auto text-xl px-12 py-8 h-auto mb-6"
                            onClick={() => window.location.href = 'https://github.com/Jenesh11/Evidex/releases/download/v1.0.23/Evidex-Setup-1.0.23.exe'}
                        >
                            <Download className="mr-3 h-6 w-6" />
                            Download EvidEx for Windows
                        </Button>

                        <p className="text-sm text-muted-foreground">
                            File size: ~180 MB • Full Version • Windows 10/11
                        </p>
                    </CardContent>
                </Card>

                {/* Installation Steps */}
                <section className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-3xl font-bold mb-6 text-center">
                        Installation <span className="gradient-text">Steps</span>
                    </h2>
                    <Card className="card-hover">
                        <CardContent className="p-8 sm:p-10">
                            <ol className="space-y-6">
                                {installationSteps.map((step, index) => (
                                    <li key={index} className="flex items-start gap-4 group">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            {index + 1}
                                        </div>
                                        <p className="text-muted-foreground pt-2 text-lg">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                </section>

                {/* Security Note */}
                <section className="mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5 card-hover">
                        <CardContent className="p-8">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                    <CheckCircle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3">Safe & Secure</h3>
                                    <p className="text-muted-foreground leading-relaxed">
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
                <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <Card className="card-hover">
                        <CardHeader>
                            <CardTitle className="text-2xl">System Requirements</CardTitle>
                            <CardDescription className="text-base">
                                Make sure your system meets these requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {systemRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                            <req.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-sm text-foreground">{req.label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </>
    );
}
