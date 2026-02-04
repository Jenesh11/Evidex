import React, { useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PLANS } from '@/config/plans';
import { PLAN_FEATURES } from '@/config/planFeatures';
import { useAuth } from '@/contexts/AuthContext';

export default function Pricing() {
    const {
        effectivePlan,
        trialDaysRemaining,
        isLifetime,
        planExpiresAt,
        claimLicense,
        user
    } = useAuth();

    const [licenseCode, setLicenseCode] = useState('');
    const [claimStatus, setClaimStatus] = useState({ type: '', message: '' });
    const [isClaiming, setIsClaiming] = useState(false);

    const handleClaimLicense = async (e) => {
        e.preventDefault();
        if (!licenseCode.trim()) return;

        setIsClaiming(true);
        setClaimStatus({ type: '', message: '' });

        const result = await claimLicense(licenseCode);

        if (result.success) {
            // Build a descriptive message based on the action
            let message = '';

            if (result.was_upgrade) {
                message = `🎉 Upgraded to ${result.plan}! `;
            } else if (result.was_renewal) {
                message = `✅ ${result.plan} plan extended! `;
            } else {
                message = `✅ ${result.plan} plan activated! `;
            }

            if (result.is_lifetime) {
                message += 'Lifetime access unlocked.';
            } else if (result.expires_at) {
                const expiryDate = new Date(result.expires_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                message += `Valid until ${expiryDate}.`;
            }

            setClaimStatus({
                type: 'success',
                message
            });
            setLicenseCode('');
        } else {
            setClaimStatus({ type: 'error', message: result.message || 'Failed to claim license' });
        }

        setIsClaiming(false);
    };

    const formatExpiry = (isoString) => {
        if (!isoString) return 'Never';
        return new Date(isoString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const canManageLicense = user?.role !== 'STAFF';

    const getPlanDisplayName = () => {
        if (!effectivePlan) return 'No Active Plan';
        if (isLifetime && effectivePlan === 'PRO') return 'PRO LIFETIME';
        return effectivePlan;
    };

    const getStatusText = () => {
        if (!effectivePlan) return 'Trial expired - Claim a license to continue';
        if (isLifetime) return 'Never Expires';
        if (trialDaysRemaining > 0) return `Trial: ${trialDaysRemaining} days remaining (STARTER features)`;
        if (planExpiresAt) return `Expires: ${formatExpiry(planExpiresAt)}`;
        return '';
    };

    const starterFeatures = PLAN_FEATURES[PLANS.STARTER];
    const proFeatures = PLAN_FEATURES[PLANS.PRO];

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-6">
            {/* Current Plan Status */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>Your active subscription status</CardDescription>
                        </div>
                        <Badge
                            variant={effectivePlan === 'STARTER' ? "outline" : effectivePlan === 'PRO' ? "default" : "secondary"}
                            className="text-base px-3 py-1"
                        >
                            {getPlanDisplayName()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                        {getStatusText()}
                    </div>
                </CardContent>
            </Card>

            {/* License Code Input */}
            {canManageLicense && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Enter License Code</CardTitle>
                        <CardDescription>Claim your license to unlock features</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isLifetime ? (
                            <form onSubmit={handleClaimLicense} className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="STARTER-1M-XXXX or PRO-LIFETIME-XXXX"
                                        value={licenseCode}
                                        onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
                                        disabled={isClaiming}
                                        className="font-mono uppercase placeholder:normal-case"
                                    />
                                    <Button type="submit" disabled={!licenseCode || isClaiming}>
                                        {isClaiming ? 'Claiming...' : 'Claim'}
                                    </Button>
                                </div>
                                {claimStatus.message && (
                                    <div className={`text-sm ${claimStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {claimStatus.message}
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                ✓ You have lifetime access. No need to claim additional codes.
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Plans Comparison */}
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
                <p className="text-muted-foreground">
                    Proof-first packing system to stop fake returns and win courier disputes
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* STARTER Plan */}
                <Card className={effectivePlan === 'STARTER' ? 'border-2 border-primary' : ''}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{starterFeatures.name}</CardTitle>
                                <CardDescription>For small sellers and single PC setups</CardDescription>
                            </div>
                            {effectivePlan === 'STARTER' && (
                                <Badge variant="default">Current</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-4xl font-bold">₹{starterFeatures.price.toLocaleString('en-IN')}</div>
                            <div className="text-sm text-muted-foreground">per month</div>
                        </div>
                        <ul className="space-y-2">
                            {starterFeatures.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* PRO Plan */}
                <Card className={`relative ${effectivePlan === 'PRO' ? 'border-2 border-primary' : 'border-2 border-primary/50'}`}>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-primary">Recommended</Badge>
                    </div>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    {proFeatures.name}
                                    <Crown className="w-5 h-5 text-yellow-500" />
                                </CardTitle>
                                <CardDescription>For growing businesses</CardDescription>
                            </div>
                            {effectivePlan === 'PRO' && (
                                <Badge variant="default">Current</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-4xl font-bold">₹{proFeatures.price.toLocaleString('en-IN')}</div>
                            <div className="text-sm text-muted-foreground">per month</div>
                        </div>
                        <ul className="space-y-2">
                            {proFeatures.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className={`text-sm ${idx === 0 ? 'text-muted-foreground' : 'font-medium'}`}>
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Trial Info */}
            <Card className="bg-muted">
                <CardContent className="p-4">
                    <p className="text-sm text-center">
                        💡 <strong>New users get a 7-day free trial</strong> of STARTER features automatically.
                        After the trial, claim a license code to continue using the app.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
