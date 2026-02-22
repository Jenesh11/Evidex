export const PLANS = {
    STARTER: 'STARTER',
    PRO: 'PRO',
    ENTERPRISE: 'ENTERPRISE'
};

export const PLAN_FEATURES = {
    [PLANS.STARTER]: {
        name: 'Starter',
        price: 1,
        yearlyPrice: 10,
        description: 'For small sellers and single PC setups',
        features: [
            'packing_camera',
            'packing_checklist',
            'evidence_viewer',
            'basic_returns',
            'activity_logs_readonly',
            'local_storage',
            'manual_backup'
        ],
        featureList: [
            '1 PC license',
            'Basic inventory management',
            'Order tracking',
            'Basic Returns & RTO handling',
            'Activity logs (read-only)',
            'Local storage',
            'Manual backup'
        ]
    },
    [PLANS.PRO]: {
        name: 'Pro',
        price: 1999,
        yearlyPrice: 19990,
        description: 'Recommended for growing businesses',
        recommended: true,
        features: [
            'packing_camera',
            'packing_checklist',
            'evidence_viewer',
            'basic_returns',
            'activity_logs_readonly',
            'local_storage',
            'manual_backup',
            'multi_staff',
            'inventory_reconciliation',
            'evidence_export',
            'analytics',
            'auto_backup',
            'courier_analytics',
            'priority_support'
        ],
        featureList: [
            'Everything in Starter, plus:',
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
        price: null,
        yearlyPrice: null,
        description: 'Custom solutions for large operations',
        features: ['all'],
        featureList: [
            'Everything in Pro, plus:',
            'Multiple PCs / warehouses',
            'Custom retention rules',
            'Advanced analytics',
            'Onboarding support',
            'Dedicated account manager'
        ]
    }
};

/**
 * Check if a plan has access to a specific feature
 * @param {string} currentPlan - Current plan (STARTER, PRO, ENTERPRISE)
 * @param {string} feature - Feature to check
 * @returns {boolean}
 */
export const hasFeature = (currentPlan, feature) => {
    const plan = PLAN_FEATURES[currentPlan];
    if (!plan) return false;
    if (plan.features.includes('all')) return true;
    return plan.features.includes(feature);
};

/**
 * Get the plan that is required for a feature
 * @param {string} feature - Feature to check
 * @returns {string} - Required plan name
 */
export const getRequiredPlan = (feature) => {
    if (PLAN_FEATURES[PLANS.STARTER].features.includes(feature)) {
        return PLANS.STARTER;
    }
    if (PLAN_FEATURES[PLANS.PRO].features.includes(feature)) {
        return PLANS.PRO;
    }
    return PLANS.ENTERPRISE;
};
