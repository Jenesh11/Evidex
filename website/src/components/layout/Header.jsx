import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Shield, Download } from 'lucide-react';
import Logo from '../ui/Logo';
import { Button } from '../ui/Button';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { name: 'Features', href: '/app-details' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Support', href: '/support' },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-4 glass-nav shadow-lg' : 'py-8 bg-transparent'}`}>
            <nav className="container-wide">
                <div className="flex items-center justify-between">
                    {/* Logo Area */}
                    <div className="flex shrink-0">
                        <Link to="/" className="flex items-center gap-4 group">
                            <Logo className="h-12 w-12 group-hover:rotate-12 transition-transform duration-500" />
                            <span className="text-2xl font-bold tracking-tighter">
                                EVID<span className="text-primary italic">EX</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-12">
                        <div className="flex items-center gap-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`text-sm font-bold tracking-wide uppercase transition-all hover:text-primary ${location.pathname === item.href ? 'text-primary' : 'text-foreground/60'}`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                        <div className="h-8 w-[1px] bg-border/40 mx-2" />
                        <Link to="/download">
                            <Button className="btn-pro-primary h-12">
                                <Download className="mr-2 w-4 h-4" />
                                Download Free
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            className="p-2 text-foreground/60 hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden mt-4 p-8 glass-nav rounded-3xl animate-fade-in border border-border/40 shadow-2xl">
                        <div className="flex flex-col gap-6">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`text-xl font-bold tracking-tight py-2 border-b border-border/10 ${location.pathname === item.href ? 'text-primary' : 'text-foreground'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <Link to="/download" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full btn-pro-primary h-16 text-lg mt-4">
                                    Download EvidEx
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
