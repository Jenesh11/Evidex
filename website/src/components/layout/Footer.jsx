import { Link } from 'react-router-dom';
import { Mail, FileText, Shield, Github, Twitter, Linkedin } from 'lucide-react';
import Logo from '../ui/Logo';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const productLinks = [
        { name: 'Features', href: '/app-details' },
        { name: 'Download', href: '/download' },
        { name: 'Pricing', href: '/pricing' },
    ];

    const supportLinks = [
        { name: 'Contact', href: '/support' },
        { name: 'Privacy Policy', href: '#', icon: FileText },
        { name: 'Terms of Service', href: '#', icon: Shield },
    ];

    return (
        <footer className="border-t border-border/40 bg-gradient-to-b from-background to-primary/5 mt-auto">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                                <Logo className="h-10 w-10" />
                            </div>
                            <span className="text-2xl font-bold gradient-text">EvidEx</span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-4">
                            Professional inventory & order management with tamper-proof video evidence for Windows.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="h-9 w-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                                <Github className="h-4 w-4 text-primary" />
                            </a>
                            <a href="#" className="h-9 w-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                                <Twitter className="h-4 w-4 text-primary" />
                            </a>
                            <a href="#" className="h-9 w-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                                <Linkedin className="h-4 w-4 text-primary" />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4 text-foreground">Product</h3>
                        <ul className="space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4 text-foreground">Support</h3>
                        <ul className="space-y-3">
                            {supportLinks.map((link) => (
                                <li key={link.name}>
                                    {link.href.startsWith('/') ? (
                                        <Link
                                            to={link.href}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                                        >
                                            {link.icon && <link.icon className="h-3 w-3" />}
                                            {link.name}
                                        </Link>
                                    ) : (
                                        <a
                                            href={link.href}
                                            className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                                        >
                                            {link.icon && <link.icon className="h-3 w-3" />}
                                            {link.name}
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} EvidEx. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                            <Mail className="h-3 w-3 text-primary" />
                        </div>
                        <a href="mailto:support@evidex.in" className="hover:text-primary transition-colors">
                            support@evidex.in
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
