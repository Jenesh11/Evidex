import React from 'react';
import { Toaster } from 'sonner';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            duration={4000}
            toastOptions={{
                style: {
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--card-foreground))',
                },
                className: 'rounded-xl',
            }}
        />
    );
}
