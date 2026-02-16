import { Link, useLocation } from 'react-router-dom';
import { Download, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import Logo from '../ui/Logo';
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
        <header className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-premium bg-background/80">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3 group">
                        <Logo className="h-10 w-10 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-2xl font-bold gradient-text">EvidEx</span>
                    </Link>
                </div>

                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground hover:bg-primary/10 transition-colors"
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
                            className={`text-sm font-semibold leading-6 transition-all relative ${isActive(item.href)
                                ? 'text-primary'
                                : 'text-foreground hover:text-primary'
                                }`}
                        >
                            {item.name}
                            {isActive(item.href) && (
                                <span className="absolute -bottom-[1.15rem] left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/80" />
                            )}
                        </Link>
                    ))}
                </div>

                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    <Link to="/download">
                        <Button className="btn-gradient btn-glow">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-border/40 backdrop-blur-xl bg-background/95">
                    <div className="space-y-1 px-4 pb-4 pt-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`block rounded-lg px-4 py-3 text-base font-semibold leading-7 transition-all ${isActive(item.href)
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg'
                                    : 'text-foreground hover:bg-primary/10'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link to="/download" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full mt-4 btn-gradient btn-glow">
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
