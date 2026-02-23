import { useMemo } from 'react';
import logoImg from '@/assets/logo.png';

export default function Logo({ className = "h-12 w-12", variant = "default" }) {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img
                src={logoImg}
                alt="EvidEx Logo"
                className="w-full h-full object-contain"
            />
        </div>
    );
}
