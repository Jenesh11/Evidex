import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Helper to generate a unique license code
function generateLicenseCode(planType) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like O, 0, I, 1
    const part = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `EVX-${planType}-${part(4)}-${part(4)}-${part(4)}`;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { order_id } = req.body;

    if (!order_id) {
        return res.status(400).json({ error: 'Missing Order ID' });
    }

    try {
        const baseUrl = process.env.CASHFREE_BASE_URL.replace(/\/+$/, '');
        // 1. Verify Payment with Cashfree
        const cashfreeResponse = await axios.get(
            `${baseUrl}/orders/${order_id}`,
            {
                headers: {
                    'x-client-id': process.env.CASHFREE_APP_ID,
                    'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                    'x-api-version': '2023-08-01'
                }
            }
        );

        const order = cashfreeResponse.data;

        if (order.order_status !== 'PAID') {
            return res.status(400).json({
                error: 'Payment not completed',
                status: order.order_status
            });
        }

        // 2. Initialize Supabase with Service Role Key (Admin)
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // 3. Check if license already generated for this order to prevent duplicates
        const { data: existingLicense } = await supabase
            .from('license_codes')
            .select('code')
            .eq('order_id', order_id)
            .single();

        if (existingLicense) {
            return res.status(200).json({ code: existingLicense.code });
        }

        // 4. Determine Plan Type from Order ID or amount
        // In create-order we set amount to 2499 for PRO
        const planType = order.order_amount >= 2499 ? 'PRO' : 'STARTER';
        const licenseCode = generateLicenseCode(planType);

        // 5. Store in Supabase
        const { error: insertError } = await supabase
            .from('license_codes')
            .insert({
                code: licenseCode,
                plan_type: planType,
                order_id: order_id,
                customer_email: order.customer_details.customer_email,
                duration_months: 1, // Default to 1 month
                is_used: false
            });

        if (insertError) {
            console.error('Supabase Insert Error:', insertError);
            throw new Error('Failed to store license code');
        }

        return res.status(200).json({
            success: true,
            code: licenseCode,
            plan: planType
        });

    } catch (error) {
        console.error('Verification Error:', error.response?.data || error.message);
        return res.status(500).json({
            error: 'Failed to verify payment',
            details: error.message
        });
    }
}
