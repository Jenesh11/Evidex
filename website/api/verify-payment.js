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
        const baseUrl = process.env.CASHFREE_BASE_URL ? process.env.CASHFREE_BASE_URL.replace(/\/+$/, '') : 'https://api.cashfree.com/pg';

        console.log(`Verifying order: ${order_id} at ${baseUrl}`);

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
        ).catch(err => {
            console.error('Cashfree API Error:', err.response?.data || err.message);
            throw new Error(`Cashfree Error: ${err.response?.data?.message || err.message}`);
        });

        const order = cashfreeResponse.data;
        console.log(`Order status for ${order_id}: ${order.order_status}`);

        if (order.order_status !== 'PAID') {
            return res.status(400).json({
                error: `Payment status is ${order.order_status}. Please wait a moment or contact support if you have already paid.`,
                status: order.order_status
            });
        }

        // 2. Initialize Supabase
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
            throw new Error('Server configuration error: Missing Supabase key');
        }

        const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // 3. Check if license already generated
        const { data: existingLicense, error: fetchError } = await supabase
            .from('license_codes')
            .select('code')
            .eq('order_id', order_id)
            .maybeSingle();

        if (fetchError) {
            console.error('Supabase Query Error:', fetchError);
            throw new Error(`Database Error: ${fetchError.message}`);
        }

        if (existingLicense) {
            return res.status(200).json({
                success: true,
                code: existingLicense.code,
                plan: order.order_amount >= 1999 ? 'PRO' : 'STARTER'
            });
        }

        // 4. Determine Plan Type
        const planType = order.order_amount >= 1999 ? 'PRO' : 'STARTER';
        const licenseCode = generateLicenseCode(planType);

        // 5. Store in Supabase
        const { error: insertError } = await supabase
            .from('license_codes')
            .insert({
                code: licenseCode,
                plan_type: planType,
                order_id: order_id,
                customer_email: order.customer_details.customer_email,
                duration_months: 1,
                is_used: false
            });

        if (insertError) {
            console.error('Supabase Insert Error:', insertError);
            throw new Error(`Database Insert Error: ${insertError.message}`);
        }

        return res.status(200).json({
            success: true,
            code: licenseCode,
            plan: planType
        });

    } catch (error) {
        console.error('Verification Error:', error.message);
        return res.status(500).json({
            error: error.message || 'Failed to verify payment',
            details: error.message
        });
    }
}
