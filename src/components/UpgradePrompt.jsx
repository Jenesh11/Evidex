import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const UpgradePrompt = ({ feature, requiredPlan = 'PRO', description }) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Card className="max-w-md">
                <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Upgrade to {requiredPlan}</h3>
                    <p className="text-muted-foreground mb-6">
                        {description || `Unlock ${feature} and more advanced features to grow your business.`}
                    </p>
                    <Button
                        onClick={() => navigate('/pricing')}
                        className="gap-2"
                        size="lg"
                    >
                        View Pricing Plans
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export const UpgradeButton = ({ feature, requiredPlan = 'PRO', children }) => {
    const navigate = useNavigate();

    return (
        <div className="relative group">
            <Button
                disabled
                variant="outline"
                className="opacity-60"
            >
                {children || feature} (Pro)
            </Button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Upgrade to {requiredPlan} to unlock
            </div>
        </div>
    );
};
