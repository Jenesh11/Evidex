import { cn } from '@/lib/utils';

export function Card({ children, className, hover = false, ...props }) {
    return (
        <div
            className={cn(
                'rounded-lg border border-border bg-card text-card-foreground p-6',
                hover && 'card-hover cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className, ...props }) {
    return (
        <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className, ...props }) {
    return (
        <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props}>
            {children}
        </h3>
    );
}

export function CardDescription({ children, className, ...props }) {
    return (
        <p className={cn('text-sm text-muted-foreground', className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ children, className, ...props }) {
    return (
        <div className={cn('', className)} {...props}>
            {children}
        </div>
    );
}
