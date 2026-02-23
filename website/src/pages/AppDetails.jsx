import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    Download,
    Video,
    Shield,
    Package,
    BarChart3,
    Users,
    FileCheck,
    HardDrive,
    Zap,
    Monitor,
    Cpu,
    Camera,
    Target,
    Activity,
    Lock
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function AppDetails() {
    const coreFeatures = [
        {
            icon: Video,
            title: 'Evidence-Grade Recording',
            description: 'Capture every packing detail in up to 4K resolution. Hardware acceleration ensures zero lag during the packing process.',
            points: ['Auto-checksum generation', 'Webcam preview overlays', 'Variable frame rate support']
        },
        {
            icon: Package,
            title: 'Lifecycle Management',
            description: 'Track orders from "Ready to Pack" to "Dispatched". Integrated barcode scanning for light-speed processing.',
            points: ['Barcode scanner support', 'Custom order statuses', 'Bulk order import']
        },
        {
            icon: Lock,
            title: 'Tamper-Proof Integrity',
            description: 'Every file is cryptographically sealed the moment it is saved. Admissible proof for platform disputes and audits.',
            points: ['SHA-256 Hashing', 'Local encryption', 'Metadata watermarking']
        },
        {
            icon: FileCheck,
            title: 'RTO & Returns Processing',
            description: 'Stop the drain on your profits. Process returns with photographic evidence linked directly to the original shipment.',
            points: ['Return reason tracking', 'Loss prevention analytics', 'One-click evidence export']
        }
    ];

    const techSpecs = [
        { icon: Monitor, label: 'OS', value: 'Windows 10/11 (64-bit)' },
        { icon: Cpu, label: 'CPU', value: 'Quad-core 2.4GHz+' },
        { icon: Activity, label: 'RAM', value: '8GB Recommended' },
        { icon: HardDrive, label: 'Disk', value: '500MB + Storage' },
    ];

    return (
        <div className="bg-brand-mesh min-h-screen pt-32 pb-24">
            <Helmet>
                <title>Features | The Technology Behind EvidEx Protection</title>
                <meta name="description" content="Discover the professional-grade features of EvidEx. From cryptographically sealed video evidence to advanced order lifecycle tracking." />
            </Helmet>

            <div className="container-wide">
                {/* --- HERO / INTRO --- */}
                <div className="asymmetric-grid items-center mb-32">
                    <div className="animate-fade-in">
                        <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block">Inside the Engine</span>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8">
                            Built for <span className="highlight-blue">Unfailing Evidence</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                            EvidEx isn't just a recording tool. It's a comprehensive loss-prevention suite engineered for high-volume e-commerce warehouses where every second and every shipment counts.
                        </p>
                    </div>
                    <div className="relative group lg:translate-x-12">
                        <div className="relative z-10 p-6 bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-2xl transition-transform duration-700 group-hover:-rotate-1">
                            <div className="bg-brand-deep/80 rounded-[2rem] p-12 aspect-[4/3] flex flex-col justify-center text-white overflow-hidden relative border border-white/5">
                                <Activity className="absolute -top-12 -right-12 w-64 h-64 text-white/5" />
                                <div className="space-y-6 relative z-10">
                                    <div className="h-2 w-24 bg-primary rounded-full" />
                                    <div className="text-4xl font-bold tracking-tighter">System Health: Operational</div>
                                    <div className="text-white/40 font-mono text-sm">ENCRYPTION_LAYER: ACTIVE [AES-256]</div>
                                    <div className="text-white/40 font-mono text-sm">EVIDENCE_HASHING: VERIFIED [SHA-256]</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CORE CAPABILITIES --- */}
                <div className="mb-32">
                    <div className="text-center mb-20 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-bold mb-6">Core Capabilities</h2>
                        <div className="h-1 w-20 bg-primary/20 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {coreFeatures.map((f, i) => (
                            <div key={i} className="card-pro group hover:bg-primary/5 hover:border-primary/20 transition-all duration-500">
                                <div className="flex gap-6">
                                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                        <f.icon className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold mb-4 transition-colors duration-500">{f.title}</h3>
                                        <p className="text-muted-foreground mb-8 leading-relaxed transition-colors duration-500">
                                            {f.description}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {f.points.map((p, pi) => (
                                                <div key={pi} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 transition-colors duration-500">
                                                    <Target className="w-3 h-3 text-primary" />
                                                    <span>{p}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- SYSTEM REQUIREMENTS --- */}
                <section className="bg-brand-deep rounded-[3rem] p-12 lg:p-24 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />

                    <div className="relative z-10">
                        <div className="max-w-3xl mb-16">
                            <h2 className="text-4xl font-bold mb-6">System Requirements</h2>
                            <p className="text-white/60 text-lg leading-relaxed italic">
                                Optimized for Windows performance. We recommend a dedicated packing station for the best experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {techSpecs.map((s, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                                    <s.icon className="w-6 h-6 text-primary mb-4" />
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{s.label}</div>
                                    <div className="text-xl font-bold">{s.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- FINAL CTA --- */}
                <div className="mt-32 text-center animate-fade-in">
                    <h3 className="text-3xl font-bold mb-8">Ready to secure your shipments?</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link to="/download">
                            <Button className="btn-pro-primary h-16 px-12 text-lg">
                                <Download className="mr-2 w-5 h-5" />
                                Download EvidEx
                            </Button>
                        </Link>
                        <Link to="/pricing">
                            <Button variant="outline" className="btn-pro-outline h-16 px-12 text-lg">
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
