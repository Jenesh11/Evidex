import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    Download,
    CheckCircle2,
    Monitor,
    HardDrive,
    Cpu,
    Camera,
    ShieldCheck,
    ArrowRight,
    Terminal,
    Cloud
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function DownloadPage() {
    const version = '1.0.25';
    const releaseDate = 'February 2026';

    const installationSteps = [
        { title: 'Download Installer', description: 'Get the latest EvidEx .exe for Windows 10/11.' },
        { title: 'Run Setup', description: 'Open the installer and follow the professional setup wizard.' },
        { title: 'Secure Launch', description: 'Start EvidEx and pair your camera to begin recording.' },
    ];

    const systemRequirements = [
        { icon: Monitor, label: 'Operating System', value: 'Windows 10/11 (64-bit)' },
        { icon: Cpu, label: 'Processor', value: 'Intel i5 / AMD Ryzen 5+' },
        { icon: HardDrive, label: 'Memory', value: '8GB RAM Recommended' },
        { icon: Camera, label: 'Imaging', value: 'USB 3.0 / 4K Webcam Support' },
    ];

    return (
        <div className="bg-brand-mesh min-h-screen pt-32 pb-24">
            <Helmet>
                <title>Download | Secure Your Inventory Protection Today</title>
                <meta name="description" content="Download EvidEx for Windows. Start your 7-day free trial. Professional-grade video evidence software for high-volume sellers." />
            </Helmet>

            <div className="container-wide">
                <div className="max-w-4xl mx-auto">
                    {/* --- HEADER --- */}
                    <div className="text-center mb-20 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Signed & Verified for Windows</span>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6">Ready to <span className="highlight-blue">Start Protecting?</span></h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Download the specialized Windows client designed for speed, security, and offline reliability.
                        </p>
                    </div>

                    {/* --- MAIN DOWNLOAD CARD --- */}
                    <div className="card-pro relative overflow-hidden p-12 lg:p-20 text-center mb-20">
                        {/* Decorative background */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="bg-brand-deep/50 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                            <Download className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Latest Stable Release</div>
                                            <div className="text-3xl font-bold text-white">v{version}</div>
                                        </div>
                                    </div>
                                    <p className="text-white/60 mb-10 leading-relaxed italic">
                                        Optimized for Windows 10 & 11. Single executable with built-in auto-update capabilities and local-first encryption.
                                    </p>
                                    <a href="https://github.com/Jenesh11/Evidex/releases/latest/download/EvidEx-Setup.exe">
                                        <Button className="w-full h-16 text-lg btn-pro-primary shadow-xl">
                                            Download EvidEx for Windows
                                        </Button>
                                    </a>
                                    <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/40">
                                        <span>Size: ~85MB</span>
                                        <span>•</span>
                                        <span>Release: {releaseDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-3xl flex gap-6">
                                    <ShieldCheck className="w-10 h-10 text-emerald-500 shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-bold mb-2 text-emerald-400">Signed & Verified</h3>
                                        <p className="text-sm text-emerald-500/80 leading-relaxed">
                                            Our software is digitally signed. Windows SmartScreen may show a warning during the first install because we are a new developer—click "More Info" and "Run Anyway" to proceed safely.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- STEPS & REQUIREMENTS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Steps */}
                        <div className="space-y-12">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <Terminal className="w-6 h-6 text-primary" />
                                Getting Started
                            </h3>
                            <div className="space-y-8">
                                {installationSteps.map((step, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold mb-1">{step.title}</h4>
                                            <p className="text-muted-foreground italic text-sm leading-relaxed">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="p-10 bg-brand-deep/50 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                                <Monitor className="w-6 h-6 text-emerald-500" />
                                Optimal Setup
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                {systemRequirements.map((req, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors duration-300 group">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                            <req.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{req.label}</div>
                                            <div className="text-sm font-bold text-white/80">{req.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- FOOTER TRUST --- */}
                    <div className="mt-20 p-8 border border-emerald-500/20 bg-emerald-500/[0.02] rounded-3xl flex flex-col md:flex-row items-center gap-6 justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Cloud className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold">Encrypted & Local</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    Your data never leaves your device without your explicit permission.
                                </p>
                            </div>
                        </div>
                        <Link to="/support" className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
                            Need help installing?
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
