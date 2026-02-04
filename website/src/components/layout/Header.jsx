import { Link, useLocation } from 'react-router-dom';
import { Download, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Features', href: '/app-details' },
        { name: 'Download', href: '/download' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Support', href: '/support' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3">
                        <img src="/logo.png" alt="EvidEx Logo" className="h-16 w-16 object-contain" />
                        <span className="text-2xl font-bold">EvidEx</span>
                    </Link>
                </div>

                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="sr-only">Toggle menu</span>
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" aria-hidden="true" />
                        ) : (
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        )}
                    </button>
                </div>

                <div className="hidden lg:flex lg:gap-x-8">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`text-sm font-semibold leading-6 transition-colors ${isActive(item.href)
                                ? 'text-primary'
                                : 'text-foreground hover:text-primary'
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    <Link to="/download">
                        <Button>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden">
                    <div className="space-y-2 px-6 pb-6 pt-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${isActive(item.href)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-foreground hover:bg-accent'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link to="/download" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full mt-4">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
