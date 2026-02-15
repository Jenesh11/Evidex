import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Check } from 'lucide-react';

export default function TrialWelcomeDialog({ open, onClose, trialDays }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Crown className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl">
                        Welcome to EvidEx!
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Your {trialDays}-day trial has started
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Explore all STARTER features during your trial period:
                    </p>

                    <div className="space-y-2">
                        {[
                            'Unlimited product management',
                            'Order tracking & management',
                            'Packing camera evidence',
                            'Returns & RTO tracking',
                            'Activity logs & audit trail',
                            'Local data storage'
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-primary" />
                                </div>
                                <span className="text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/20 rounded-xl p-4 text-center">
                        <p className="text-sm font-medium">
                            Trial ends in <span className="text-primary font-bold">{trialDays} days</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Upgrade anytime to unlock PRO features
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose} className="w-full" size="lg">
                        Get Started
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
