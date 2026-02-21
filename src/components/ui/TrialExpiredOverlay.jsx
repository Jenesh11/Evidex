import React from 'react';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function TrialExpiredOverlay({ title = "Trial Expired" }) {
    const navigate = useNavigate();

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
            <div className="max-w-md w-full bg-card border border-border/50 rounded-xl p-8 shadow-2xl text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Crown className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                    <p className="text-muted-foreground">
                        Your 7-day trial period has ended. Upgrade to a Pro plan to continue using this feature and protect your business with proof-first evidence.
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    <Button
                        size="lg"
                        className="w-full font-semibold shadow-lg shadow-primary/20"
                        onClick={() => navigate('/pricing')}
                    >
                        View Pricing Plans
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full text-muted-foreground"
                        onClick={() => navigate('/')}
                    >
                        Back to Dashboard
                    </Button>
                </div>

                <div className="pt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    Secure Payment processing via Stripe/Razorpay
                </div>
            </div>
        </div>
    );
}
