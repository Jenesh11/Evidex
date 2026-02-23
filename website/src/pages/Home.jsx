import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Video,
    ShieldCheck,
    PackageSearch,
    Target,
    AlertTriangle,
    Mail,
    Shield,
    CheckCircle2,
    Star
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Home() {
    return (
        <div className="bg-brand-mesh min-h-screen">
            <Helmet>
                {/* ✅ SEO-optimized title: short, keyword-rich, matches H1 */}
                <title>EvidEx – Stop Return Fraud with Video Evidence Software for Windows</title>
                {/* ✅ Description: 155 chars, action-oriented, matches page content */}
                <meta name="description" content="EvidEx records tamper-proof packing videos on Windows so e-commerce sellers can win return disputes. SHA-256 sealed, offline-first, dispute-ready. Try free for 7 days." />
                <meta name="keywords" content="return fraud protection software, inventory management Windows, packing video evidence, e-commerce order management, EvidEx, stop return scams" />
                <link rel="canonical" href="https://evidex.in/" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://evidex.in/" />
                <meta property="og:title" content="EvidEx – Stop Return Fraud with Tamper-Proof Video Evidence" />
                <meta property="og:description" content="Record SHA-256 sealed packing videos on Windows. Win return disputes. Offline-first, no cloud required. Trusted by e-commerce sellers." />
                <meta property="og:image" content="https://evidex.in/logo.png" />
                <meta property="og:site_name" content="EvidEx" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="EvidEx – Stop Return Fraud with Video Evidence" />
                <meta name="twitter:description" content="Tamper-proof packing video + inventory management for Windows. SHA-256 sealed. Try free 7 days." />
                <meta name="twitter:image" content="https://evidex.in/logo.png" />

                {/* JSON-LD WebPage  */}
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": "EvidEx – Stop Return Fraud with Video Evidence Software for Windows",
                    "url": "https://evidex.in/",
                    "description": "EvidEx records tamper-proof packing videos on Windows so e-commerce sellers can win return disputes.",
                    "breadcrumb": {
                        "@type": "BreadcrumbList",
                        "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://evidex.in/" }]
                    }
                })}</script>
            </Helmet>

            {/* ===== HERO SECTION ===== */}
            <section aria-label="Hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="container-wide">
                    <div className="asymmetric-grid items-center">
                        <div className="animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-semibold mb-8">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Trusted by Professional E-commerce Sellers</span>
                            </div>

                            {/* ✅ H1: contains primary keyword, matches page title closely */}
                            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
                                Stop Return Fraud with <span className="highlight-blue">EvidEx Video Evidence</span>
                            </h1>

                            {/* ✅ Rich paragraph under H1 with keywords */}
                            <p className="text-xl text-muted-foreground leading-relaxed mb-6 max-w-xl">
                                EvidEx is <strong>Windows inventory &amp; order management software</strong> that creates SHA-256 tamper-proof packing videos — so you can win every return dispute with verified evidence.
                            </p>
                            <p className="text-base text-muted-foreground/80 leading-relaxed mb-10 max-w-xl">
                                Runs fully <strong>offline</strong>. No cloud. No subscriptions surprise. Just reliable, dispute-ready proof that protects your e-commerce business from fraudulent return claims.
                            </p>

                            {/* ✅ CTA buttons with descriptive anchor text */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/download" aria-label="Download EvidEx free trial for Windows">
                                    <Button className="btn-pro-primary text-lg px-10">
                                        Download Free Trial
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                                <Link to="/pricing" aria-label="View EvidEx pricing plans">
                                    <Button variant="outline" className="btn-pro-outline text-lg px-10">
                                        View Pricing Plans
                                    </Button>
                                </Link>
                            </div>
                            <p className="mt-8 text-sm text-muted-foreground">
                                ✓ Windows 10/11 &nbsp;•&nbsp; ✓ Local Encryption &nbsp;•&nbsp; ✓ 7-Day Free Trial
                            </p>
                        </div>

                        {/* Hero visual – real app screenshot */}
                        <div className="relative lg:translate-x-12 animate-slide-in-right">
                            {/* Glow effects */}
                            <div className="absolute -top-12 -right-12 w-72 h-72 bg-primary/25 rounded-full blur-3xl -z-10" />
                            <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-brand-accent/20 rounded-full blur-3xl -z-10" />

                            {/* Device frame */}
                            <div className="relative z-10 p-2 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl">
                                {/* Window title bar */}
                                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                                    <span className="ml-auto text-[10px] text-white/20 font-mono">EvidEx Management</span>
                                </div>
                                {/* Screenshot */}
                                <img
                                    src="/app-preview.png"
                                    alt="EvidEx inventory management dashboard showing orders, packing camera, and stock alerts"
                                    className="rounded-xl w-full object-cover"
                                    loading="eager"
                                    width="1024"
                                    height="640"
                                />
                            </div>

                            {/* Live badge */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shadow-xl backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Live App Preview
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== TRUST BAR ===== */}
            <section aria-label="Trust signals" className="py-8 border-y border-border/10 bg-white/[0.02]">
                <div className="container-wide">
                    <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground font-medium">
                        {[
                            '🔒 SHA-256 Tamper-Proof',
                            '📹 Up to 4K Packing Video',
                            '📦 Full Order Lifecycle',
                            '🖥️ Windows 10/11 Native',
                            '🔌 100% Offline Capable',
                        ].map(t => (
                            <span key={t}>{t}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== PROBLEM / SOLUTION ===== */}
            <section aria-label="Why sellers need EvidEx" className="section-spacing bg-brand-deep/40 backdrop-blur-sm border-b border-border/10">
                <div className="container-wide">
                    <div className="max-w-3xl mb-16">
                        {/* ✅ H2: clear, keyword-adjacent heading */}
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 italic text-white/90">
                            Return Fraud Costs E-Commerce Sellers Thousands Every Month
                        </h2>
                        <p className="text-xl text-white/60 leading-relaxed">
                            Without video proof, platforms like Flipkart, Amazon, and Meesho always favor the buyer.
                            EvidEx's <strong className="text-white/80">SHA-256 sealed packing evidence</strong> turns the tables — giving you an admissible record for every dispute.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* ✅ H3 sub-headings properly nested under H2 */}
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">The Problem Sellers Face</h3>
                            <p className="text-white/60 leading-relaxed italic text-sm">
                                "The customer claims they received an empty box. The platform auto-refunds them. You lose the product and the money with zero recourse."
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">How EvidEx Solves It</h3>
                            <p className="text-white/80 leading-relaxed text-sm font-medium italic">
                                "A 30-second SHA-256 verified video with a digital timestamp. Sealed by EvidEx and ready for the dispute tribunal."
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white">The Result for Your Business</h3>
                            <p className="text-white/60 leading-relaxed text-sm italic">
                                "The refund is denied. Your funds are protected. Your business scales without the constant fear of fraudulent return claims."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== KEY FEATURES ===== */}
            <section aria-label="EvidEx key features" className="section-spacing">
                <div className="container-wide">
                    <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
                        <span className="text-primary font-bold uppercase tracking-widest text-xs mb-3 block">Core Features</span>
                        {/* ✅ H2: descriptive, keyword-rich */}
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                            Inventory Management &amp; Video Evidence, Built Together
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            EvidEx combines tamper-proof recording with professional order tracking — everything a high-volume seller needs in one Windows app.
                            <Link to="/app-details" className="text-primary font-semibold ml-1 hover:underline">
                                See all features →
                            </Link>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="card-pro flex flex-col justify-between">
                            <div>
                                <Video className="w-10 h-10 text-primary mb-5" />
                                {/* ✅ H3 under H2 */}
                                <h3 className="text-2xl font-bold mb-3">Packing Camera & Video Evidence</h3>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Record every packing with simultaneous video and photo capture. Automatic SHA-256 hashing proves the file was never edited — making it admissible in platform disputes.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-border/40">
                                <ul className="space-y-2 font-medium text-sm">
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500 shrink-0" /> SHA-256 Auto-hashing for file integrity</li>
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500 shrink-0" /> Webcam support up to 4K resolution</li>
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500 shrink-0" /> Local encrypted storage — no cloud upload</li>
                                </ul>
                            </div>
                        </div>

                        <div className="card-pro flex flex-col justify-between">
                            <div>
                                <PackageSearch className="w-10 h-10 text-brand-accent mb-5" />
                                {/* ✅ H3 under H2 */}
                                <h3 className="text-2xl font-bold mb-3">Order Management & Dispute Tracking</h3>
                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                    Track every order from &apos;Ready to Ship&apos; to &apos;Delivered&apos;. Link each packing video to a specific Order ID for instant recall when a return claim arrives.
                                </p>
                            </div>
                            <div className="pt-6 border-t border-border/40">
                                <ul className="space-y-2 font-medium text-sm">
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500 shrink-0" /> Lightning-fast order search by ID or SKU</li>
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500 shrink-0" /> Custom order status workflows</li>
                                    <li className="flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500 shrink-0" /> One-click evidence pack export for disputes</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* ✅ Additional internal link to app-details */}
                    <div className="text-center mt-12">
                        <Link to="/app-details" aria-label="View all EvidEx inventory management features">
                            <Button variant="outline" className="btn-pro-outline">
                                Explore All Features
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ===== SOCIAL PROOF ===== */}
            <section aria-label="Customer testimonials" className="section-spacing bg-brand-deep/30 border-y border-border/10">
                <div className="container-wide">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">Sellers Protect Their Business with EvidEx</h2>
                        <p className="text-muted-foreground">Used by e-commerce sellers across Flipkart, Amazon, Meesho and more.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "EvidEx saved me ₹18,000 in one month. I submitted the packing video hash during a dispute and the platform sided with me for the first time ever.",
                                author: "Flipkart Seller, Delhi"
                            },
                            {
                                quote: "Before EvidEx, we lost 3-4 products every week to false 'empty box' claims. Now we have video proof for every single shipment.",
                                author: "Amazon Seller, Mumbai"
                            },
                            {
                                quote: "The offline-first design was the selling point for me. No internet required in our warehouse but we still get full protection.",
                                author: "Meesho Seller, Surat"
                            }
                        ].map((t, i) => (
                            <div key={i} className="card-pro">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed italic mb-4">"{t.quote}"</p>
                                <p className="text-xs font-bold text-primary">{t.author}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section aria-label="Get started with EvidEx" className="section-spacing relative overflow-hidden">
                <div className="container-wide">
                    <div className="relative z-10 bg-brand-deep rounded-[3rem] p-12 lg:p-24 text-center text-white overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-brand-accent/20 -z-10" />

                        {/* ✅ H2 for CTA section */}
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 max-w-3xl mx-auto">
                            Start Protecting Your E-Commerce Business Today
                        </h2>
                        <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
                            Join hundreds of sellers using EvidEx to stop return fraud with tamper-proof video evidence. Free 7-day trial. No card required.
                        </p>
                        {/* ✅ 4 internal links: /download, /pricing, /app-details, /support */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link to="/download" aria-label="Download EvidEx inventory software for Windows">
                                <Button className="btn-pro-primary text-lg px-10">
                                    Download EvidEx Free
                                </Button>
                            </Link>
                            <Link to="/pricing" aria-label="View EvidEx pricing plans">
                                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 btn-pro px-8">
                                    See Pricing Plans
                                </Button>
                            </Link>
                            <Link to="/support" aria-label="Contact EvidEx support team">
                                <Button variant="ghost" className="text-white hover:bg-white/10 btn-pro flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
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
