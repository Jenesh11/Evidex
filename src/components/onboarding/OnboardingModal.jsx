import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function OnboardingModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to Evidex",
            description: "Your proof-first packing protection system is ready.",
            actionLabel: "Get Started",
            action: () => setStep(1),
            image: "🎬" // Placeholder for an illustration
        },
        {
            title: "Add Your First Product",
            description: "Inventory is the heart of Evidex. Add a product to start tracking.",
            actionLabel: "Go to Inventory",
            action: () => { onClose(); navigate('/inventory'); },
            image: "📦"
        },
        {
            title: "Record Packing Evidence",
            description: "Secure your shipments by recording the packing process.",
            actionLabel: "Try Camera",
            action: () => { onClose(); navigate('/orders'); }, // Or camera route
            image: "🎥"
        }
    ];

    if (!isOpen) return null;

    const currentStep = steps[step];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-lg p-4"
                >
                    <Card className="overflow-hidden border-primary/20 bg-background/95 shadow-2xl">
                        <div className="p-8 text-center space-y-6">
                            <div className="text-6xl mb-4">{currentStep.image}</div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">{currentStep.title}</h2>
                                <p className="text-muted-foreground text-lg">{currentStep.description}</p>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <Button size="lg" onClick={currentStep.action} className="w-full text-lg h-12">
                                    {currentStep.actionLabel} <ChevronRight className="ml-2 w-5 h-5" />
                                </Button>
                                {step > 0 && (
                                    <Button variant="ghost" onClick={onClose} className="w-full">
                                        Skip for now
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-2 pb-6">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-primary/20'}`}
                                />
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
