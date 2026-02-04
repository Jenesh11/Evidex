import { Link } from 'react-router-dom';
import { Mail, FileText, Shield } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-card mt-auto">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                                <span className="text-2xl font-bold">E</span>
                            </div>
                            <span className="text-xl font-bold">EvidEx</span>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-md">
                            Professional inventory & order management with tamper-proof video evidence for Windows.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Product</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/app-details" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link to="/download" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Download
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Pricing
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    <Shield className="h-3 w-3" />
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} EvidEx. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <a href="mailto:support@evidex.com" className="hover:text-primary transition-colors">
                            support@evidex.com
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
