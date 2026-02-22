import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

        let licenseCode;
        let planType = order.order_amount >= 1999 ? 'PRO' : 'STARTER';

        if (existingLicense) {
            licenseCode = existingLicense.code;
        } else {
            // 4. Generate & Store new license
            licenseCode = generateLicenseCode(planType);

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
        }

        // 5. Send Email via Resend
        if (process.env.RESEND_API_KEY) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const customerEmail = order.customer_details.customer_email;

                await resend.emails.send({
                    from: 'Evidex <no-reply@resend.dev>',
                    to: customerEmail,
                    subject: 'Your Evidex License Code',
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #6d28d9;">Thank you for your purchase!</h2>
                            <p>Your <strong>Evidex ${planType}</strong> license code is ready for activation.</p>
                            
                            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                                <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">License Code</p>
                                <h1 style="font-family: monospace; letter-spacing: 2px; color: #111827; margin: 0;">${licenseCode}</h1>
                            </div>

                            <h3>How to activate:</h3>
                            <ol>
                                <li>Open the <strong>Evidex Desktop App</strong>.</li>
                                <li>Go to the <strong>Pricing</strong> section.</li>
                                <li>Click <strong>"I have a license code"</strong>.</li>
                                <li>Paste your code and click <strong>Activate</strong>.</li>
                            </ol>

                            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                                If you have any questions, visit our support page.
                            </p>
                        </div>
                    `
                });
                console.log(`License email sent to ${customerEmail}`);
            } catch (emailError) {
                console.error('Email delivery failed:', emailError);
                // We don't throw here so the user still gets the code on screen
            }
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
