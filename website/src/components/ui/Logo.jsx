export default function Logo({ className = "h-12 w-12", variant = "default" }) {
    // Gradient colors based on variant
    const gradients = {
        default: {
            start: "#6D28D9", // Deep purple
            end: "#A78BFA"    // Light purple
        },
        light: {
            start: "#8B5CF6",
            end: "#C4B5FD"
        }
    };

    const colors = gradients[variant] || gradients.default;

    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors.start} />
                    <stop offset="100%" stopColor={colors.end} />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Shield shape */}
            <path
                d="M50 10 L85 25 L85 50 C85 70 70 85 50 95 C30 85 15 70 15 50 L15 25 Z"
                fill="url(#shieldGradient)"
                filter="url(#shadow)"
            />

            {/* Checkmark */}
            <path
                d="M35 50 L45 60 L70 35"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}
