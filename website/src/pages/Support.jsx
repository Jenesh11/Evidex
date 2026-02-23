import { Helmet } from 'react-helmet-async';
import {
    Mail,
    MessageSquare,
    HelpCircle,
    Send,
    Phone,
    Clock,
    ArrowRight,
    MessageCircle,
    CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Support() {
    const faqs = [
        {
            question: 'How do I activate my license?',
            answer: 'After checkout, you will receive a license code via email. Launch the EvidEx desktop app, go to Settings > License, and enter your code to activate your 30-day term.',
        },
        {
            question: 'Is my video data uploaded anywhere?',
            answer: 'No. EvidEx is a "Local First" application. Your evidence remains on your hardware. We only store the cryptographic hash (SHA-256) for verification purposes.',
        },
        {
            question: 'Can I use one license on multiple stations?',
            answer: 'Standard licenses are per-device. For multi-station warehouse setups, please contact our Sales team for site-wide volume licensing.',
        },
        {
            question: 'What if my internet goes down?',
            answer: 'EvidEx records offline. The application only requires an occasional heartbeat connection to verify license status.',
        },
    ];

    const contactMethods = [
        {
            icon: Mail,
            title: 'Technical Support',
            description: 'For bugs, installation issues, or technical queries.',
            action: 'support@evidex.in',
            href: 'mailto:support@evidex.in',
            color: 'text-primary'
        },
        {
            icon: MessageCircle,
            title: 'Priority WhatsApp',
            description: 'Fastest response for Pro plan users in India.',
            action: 'Chat on WhatsApp',
            href: 'https://wa.me/91XXXXXXXXXX',
            color: 'text-emerald-500'
        },
        {
            icon: Phone,
            title: 'Sales Inquiry',
            description: 'Speak to an expert about bulk warehouse setups.',
            action: '+91 (0) XXX-XXX-XXXX',
            color: 'text-brand-deep'
        }
    ];

    return (
        <div className="bg-brand-mesh min-h-screen pt-32 pb-24">
            <Helmet>
                <title>EvidEx Support – FAQs, License Help & Expert Assistance</title>
                <meta name="description" content="Need help with EvidEx? Get answers on license activation, video privacy, multi-station setups, and more. Contact our expert support team." />
                <meta name="keywords" content="EvidEx support, inventory software help, license activation EvidEx, video evidence software FAQ" />
                <link rel="canonical" href="https://evidex.in/support" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://evidex.in/support" />
                <meta property="og:title" content="EvidEx Support – We've Got Your Back" />
                <meta property="og:description" content="Expert support for EvidEx users. License help, camera setup, multi-station warehouses. Human-focused assistance." />
                <meta property="og:image" content="https://evidex.in/logo.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="EvidEx Support & FAQ" />
                <meta name="twitter:description" content="Get answers fast. License activation, video privacy, multi-station setup guidance and more." />
                <meta name="twitter:image" content="https://evidex.in/logo.png" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        { "@type": "Question", "name": "How do I activate my license?", "acceptedAnswer": { "@type": "Answer", "text": "After checkout, you will receive a license code via email. Launch EvidEx, go to Settings > License, and enter your code." } },
                        { "@type": "Question", "name": "Is my video data uploaded anywhere?", "acceptedAnswer": { "@type": "Answer", "text": "No. EvidEx is a Local First application. Your evidence stays on your hardware. Only the SHA-256 hash is stored for verification." } },
                        { "@type": "Question", "name": "Can I use one license on multiple stations?", "acceptedAnswer": { "@type": "Answer", "text": "Standard licenses are per-device. Contact our Sales team for multi-station volume licensing." } },
                        { "@type": "Question", "name": "What if my internet goes down?", "acceptedAnswer": { "@type": "Answer", "text": "EvidEx is fully offline-capable. All packing, recording, and evidence generation works without an internet connection." } }
                    ]
                })}</script>
            </Helmet>

            <div className="container-wide">
                {/* --- HEADER --- */}
                <div className="asymmetric-grid items-center mb-24">
                    <div className="animate-fade-in">
                        <span className="text-primary font-bold uppercase tracking-widest text-xs mb-4 block">Human-Focused Support</span>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8">
                            We've got <span className="highlight-blue">your back.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                            Whether you're troubleshooting a camera setup or scaling to a ten-station warehouse, our specialized team is ready to assist.
                        </p>
                    </div>
                    <div className="relative group lg:translate-x-12">
                        <div className="relative z-10 p-4 bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl">
                            <div className="bg-brand-deep/80 rounded-[2rem] p-10 flex flex-col justify-end aspect-square md:aspect-video text-white border border-white/5">
                                <Clock className="w-12 h-12 text-primary mb-6" />
                                <div className="text-2xl font-bold mb-2">Support Hours</div>
                                <div className="text-white/60 font-medium italic">Mon – Sat, 9:00 AM – 7:00 PM IST</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CONTACT CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {contactMethods.map((m, i) => (
                        <div key={i} className="card-pro group flex flex-col justify-between">
                            <div>
                                <div className={`w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center ${m.color} mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                    <m.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{m.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-8 italic">{m.description}</p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full btn-pro-outline font-bold tracking-tight"
                                onClick={() => m.href && window.open(m.href, '_blank')}
                            >
                                {m.action}
                            </Button>
                        </div>
                    ))}
                </div>

                {/* --- MESSAGE FORM --- */}
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-32">
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Send a Detailed Inquiry</h2>
                        <p className="text-muted-foreground leading-relaxed mb-8">
                            For complex setup issues, please provide as much detail as possible about your hardware (Camera model, Windows version).
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-sm font-bold">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span>Typical Response: &lt; 4 Hours</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <span>Technical Expert Assigned Directly</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-secondary/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-border/40 shadow-xl space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                            <input type="text" className="w-full h-14 px-6 rounded-2xl bg-brand-deep/50 border border-white/5 focus:ring-2 focus:ring-primary focus:bg-brand-deep/80 text-white transition-all outline-none font-medium" placeholder="E.g. Vikram Seth" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                            <input type="email" className="w-full h-14 px-6 rounded-2xl bg-brand-deep/50 border border-white/5 focus:ring-2 focus:ring-primary focus:bg-brand-deep/80 text-white transition-all outline-none font-medium" placeholder="E.g. vikram@store.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Message</label>
                            <textarea className="w-full p-6 rounded-2xl bg-brand-deep/50 border border-white/5 focus:ring-2 focus:ring-primary focus:bg-brand-deep/80 text-white transition-all outline-none font-medium min-h-[160px] resize-none" placeholder="How can we help?" />
                        </div>
                        <Button className="w-full h-16 text-lg btn-pro-primary">
                            <Send className="mr-2 w-5 h-5" />
                            Dispatch Message
                        </Button>
                    </div>
                </div>

                {/* --- FAQ SECTION --- */}
                <section>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Quick Answers</h2>
                        <div className="h-1 w-12 bg-primary/20 mx-auto rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {faqs.map((f, i) => (
                            <div key={i} className="card-pro bg-white/40 ring-1 ring-border/10">
                                <h4 className="text-lg font-bold mb-3 flex items-center gap-3">
                                    <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                                    {f.question}
                                </h4>
                                <p className="text-muted-foreground text-sm leading-relaxed italic border-l-2 border-primary/20 pl-4">
                                    {f.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
