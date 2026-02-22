import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { plan_type, customer_details } = req.body;

    if (!plan_type || !customer_details || !customer_details.customer_email || !customer_details.customer_phone) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Set price based on plan
    const amount = plan_type === 'PRO' ? 2499 : 999;
    const orderId = `EVX_${Date.now()}`;

    try {
        const cashfreeResponse = await axios.post(
            `${process.env.CASHFREE_BASE_URL}/orders`,
            {
                order_id: orderId,
                order_amount: amount,
                order_currency: 'INR',
                customer_details: {
                    customer_id: customer_details.customer_email.replace(/[^a-zA-Z0-9]/g, '_'),
                    customer_email: customer_details.customer_email,
                    customer_phone: customer_details.customer_phone,
                    customer_name: customer_details.customer_name || 'Evidex Customer'
                },
                order_meta: {
                    return_url: `${process.env.WEBSITE_URL}/order-success?order_id={order_id}`,
                    notify_url: `${process.env.WEBSITE_URL}/api/cashfree-webhook`
                },
                order_note: `License for Evidex ${plan_type} Plan`
            },
            {
                headers: {
                    'x-client-id': process.env.CASHFREE_APP_ID,
                    'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                    'x-api-version': '2023-08-01',
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json({
            payment_session_id: cashfreeResponse.data.payment_session_id,
            order_id: orderId
        });
    } catch (error) {
        console.error('Cashfree Order Error:', error.response?.data || error.message);
        return res.status(500).json({
            error: 'Failed to create order',
            details: error.response?.data?.message || error.message
        });
    }
}
