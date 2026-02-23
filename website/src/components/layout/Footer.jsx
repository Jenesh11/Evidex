import { Link } from 'react-router-dom';
import { Mail, Shield, ShieldCheck, Heart } from 'lucide-react';
import Logo from '../ui/Logo';

export default function Footer() {
    return (
        <footer className="bg-brand-deep text-white pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
            {/* Subtle glow in footer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="container-wide">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 mb-20">
                    {/* Brand Info */}
                    <div className="md:col-span-5 space-y-8">
                        <Link to="/" className="flex items-center gap-4 group">
                            <Logo className="h-12 w-12" />
                            <span className="text-xl font-bold tracking-tighter opacity-90 group-hover:opacity-100 transition-opacity">
                                EVID<span className="text-primary italic">EX</span>
                            </span>
                        </Link>
                        <p className="text-white/50 text-lg leading-relaxed max-w-sm">
                            Created with intention for sellers who value truth. EvidEx is the digital shield for the modern e-commerce operator.
                        </p>
                        <div className="flex items-center gap-2 text-primary font-bold">
                            <ShieldCheck className="w-5 h-5" />
                            <span>100% Local Encryption</span>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary/80">Product</h4>
                            <ul className="space-y-4">
                                <li><Link to="/app-details" className="text-white/40 hover:text-white transition-colors">Features</Link></li>
                                <li><Link to="/pricing" className="text-white/40 hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link to="/download" className="text-white/40 hover:text-white transition-colors text-emerald-400 font-medium">Download</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary/80">Resources</h4>
                            <ul className="space-y-4">
                                <li><Link to="/support" className="text-white/40 hover:text-white transition-colors">Support Center</Link></li>
                                <li><a href="#" className="text-white/40 hover:text-white transition-colors">Guides</a></li>
                                <li><a href="#" className="text-white/40 hover:text-white transition-colors">API Docs</a></li>
                            </ul>
                        </div>
                        <div className="space-y-6 col-span-2 sm:col-span-1">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary/80">Reach Us</h4>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-2 text-white/40">
                                    <Mail className="w-4 h-4" />
                                    <span>support@evidex.in</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <p className="text-white/30 text-sm">
                        &copy; {new Date().getFullYear()} EvidEx. Built for reliability.
                    </p>
                    <div className="flex items-center gap-8 text-sm text-white/30">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <div className="flex items-center gap-2 italic">
                            <span>Made with</span>
                            <Heart className="w-3 h-3 text-red-500 fill-current" />
                            <span>for Sellers</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
