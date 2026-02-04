import { cn } from '@/lib/utils';

export function Badge({ children, className, variant = 'default', ...props }) {
    const variants = {
        default: 'bg-primary/10 text-primary border-primary/20',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-border',
        success: 'bg-green-500/10 text-green-500 border-green-500/20',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
