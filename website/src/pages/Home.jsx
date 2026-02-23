import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Video,
    ShieldCheck,
    PackageSearch,
    TrendingUp,
    Undo2,
    Database,
    Download,
    CheckCircle2,
    Target,
    AlertTriangle,
    Mail,
    Shield
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

export default function Home() {
    return (
        <div className="bg-brand-mesh min-h-screen">
            <Helmet>
                <title>EvidEx | Professional Inventory & Video Evidence Software</title>
                <meta name="description" content="Protect your e-commerce business from return scams with tamper-proof video evidence and professional order management built for Windows." />
            </Helmet>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="container-wide">
                    <div className="asymmetric-grid items-center">
                        <div className="animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-semibold mb-8">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Built for Professional E-commerce Sellers</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
                                Secure Your Shipments with <span className="highlight-blue">Verified Evidence</span>
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-xl">
                                EvidEx is professional Windows software that stops return scams by creating tamper-proof video evidence of your packing process.
                                <span className="text-foreground font-medium italic block mt-4">No buzzwords. Just reliability.</span>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/download">
                                    <Button className="btn-pro-primary text-lg px-10">
                                        Download App
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link to="/pricing">
                                    <Button variant="outline" className="btn-pro-outline text-lg px-10">
                                        View Pricing
                                    </Button>
                                </Link>
                            </div>
                            <p className="mt-8 text-sm text-muted-foreground">
                                Windows 10/11 • Local Encryption • Offline Support
                            </p>
                        </div>

                        {/* Visual Rep of App - purposeful asymmetry */}
                        <div className="relative lg:translate-x-12 animate-slide-in-right">
                            <div className="relative z-10 p-4 bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
                                <div className="bg-brand-deep/80 rounded-2xl overflow-hidden aspect-video shadow-inner flex items-center justify-center p-8 text-center text-white/20 font-mono text-xs border border-white/5">
                                    {/* Abstract placeholder for real screenshot later */}
                                    [ PRODUCT UI PREVIEW ]
                                </div>
                            </div>
                            {/* Decorative background shape */}
                            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />
                            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl -z-10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PROBLEM/SOLUTION SECTION --- */}
            <section className="section-spacing bg-brand-deep/40 backdrop-blur-sm border-y border-border/10">
                <div className="container-wide">
                    <div className="max-w-3xl mb-24">
                        <h2 className="text-4xl lg:text-5xl font-bold mb-8 italic text-white/90">
                            The "Wrong Item" Scandal is Costing You Thousands.
                        </h2>
                        <p className="text-xl text-white/60">
                            Without proof, platforms always favor the buyer. EvidEx gives you a digital shield by hashing and local-storing packing videos that are admissible in audits and disputes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">The Problem</h3>
                            <p className="text-white/60 leading-relaxed italic">
                                "The customer says they received an empty box. The platform has auto-refunded them. You've lost the product and the money."
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">The Solution</h3>
                            <p className="text-white/80 leading-relaxed font-bold italic">
                                "A 30-second video with a digital timestamp and SHA-256 seal. Verified by EvidEx, ready for the dispute tribunal."
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">The Result</h3>
                            <p className="text-white/60 leading-relaxed italic">
                                "Refund denied for the buyer. Your funds are protected. Your business continues to grow without the fear of fraud."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURE SECTION --- */}
            <section className="section-spacing">
                <div className="container-wide">
                    <div className="text-center max-w-2xl mx-auto mb-20 animate-fade-in">
                        <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block">Engineered for Efficiency</span>
                        <h2 className="text-4xl lg:text-6xl font-bold mb-6">Designed by Real Operators</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="card-pro flex flex-col justify-between">
                            <div>
                                <Video className="w-10 h-10 text-primary mb-6" />
                                <h3 className="text-3xl font-bold mb-4">Packing Cam</h3>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Simultaneous video and photo capture. Automatic hashing ensures the file can never be claimed as 'edited'.
                                </p>
                            </div>
                            <div className="pt-8 border-t border-border/40">
                                <ul className="space-y-3 font-medium text-sm">
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> Auto-hashing for integrity</li>
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> Webcam Support up to 4K</li>
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> Local Encrypted Storage</li>
                                </ul>
                            </div>
                        </div>

                        <div className="card-pro flex flex-col justify-between">
                            <div>
                                <PackageSearch className="w-10 h-10 text-brand-accent mb-6" />
                                <h3 className="text-3xl font-bold mb-4">Order Intel</h3>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Track orders from 'Ready to Ship' to 'Complete'. Link every video to a specific Order ID for instant recall.
                                </p>
                            </div>
                            <div className="pt-8 border-t border-border/40">
                                <ul className="space-y-3 font-medium text-sm">
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> Lightning Search</li>
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> Custom Status Logic</li>
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500" /> Export Evidence Packs</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA SECTION --- */}
            <section className="section-spacing relative overflow-hidden">
                <div className="container-wide">
                    <div className="relative z-10 bg-brand-deep rounded-[3rem] p-12 lg:p-24 text-center text-white overflow-hidden overflow-hidden shadow-2xl">
                        {/* Mesh background for the card */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-brand-accent/20 -z-10" />

                        <h2 className="text-4xl lg:text-6xl font-bold mb-8 max-w-3xl mx-auto">
                            Stop Guessing. <br /><span className="text-primary-foreground italic">Start Protecting.</span>
                        </h2>
                        <p className="text-xl text-white/70 mb-12 max-w-xl mx-auto">
                            Join hundreds of sellers who have recovered thousands in fraudulent claims using EvidEx.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <Link to="/download">
                                <Button className="btn-pro-primary text-lg px-12">
                                    Download EvidEx
                                </Button>
                            </Link>
                            <Link to="/support">
                                <Button variant="ghost" className="text-white hover:bg-white/10 btn-pro flex items-center gap-2">
                                    <Mail className="w-5 h-5" />
                                    Talk to a Human
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
