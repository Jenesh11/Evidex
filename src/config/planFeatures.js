import { PLANS } from './plans';

// Feature definitions for each plan
export const PLAN_FEATURES = {
    [PLANS.STARTER]: {
        name: 'Starter',
        price: 499,
        yearlyPrice: 4990, // ~₹415/month
        features: [
            '1 PC license',
            'Packing camera recording',
            'Packing checklist + photos',
            'Evidence viewer (video + photos)',
            'Basic Returns & RTO handling',
            'Activity logs (read-only)',
            'Local storage',
            'Manual backup'
        ]
    },
    [PLANS.PRO]: {
        name: 'Pro',
        price: 1999,
        yearlyPrice: 19990, // ~₹1,665/month
        features: [
            'Everything in Starter',
            'Multiple staff accounts',
            'Inventory reconciliation',
            'Evidence export (ZIP/PDF)',
            'RTO & Return analytics',
            'Courier-wise RTO tracking',
            'Auto daily backups',
            'Priority support'
        ]
    },
    [PLANS.ENTERPRISE]: {
        name: 'Enterprise',
        price: null, // Custom pricing
        yearlyPrice: null,
        features: [
            'Everything in Pro',
            'Multiple PCs / warehouses',
            'Custom retention rules',
            'Advanced analytics',
            'Onboarding support',
            'Dedicated account manager'
        ]
    }
};
