// api/create-otp-order.js
// Memesan nomor OTP dari RumahOTP

const RUMAHOTP_BASE_URL = 'https://www.rumahotp.io/api/v2';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    const { serviceId, countryId, providerId, operatorId } = req.body;
    const API_KEY = process.env.RUMAHOTP_API_KEY;
    
    if (!API_KEY) {
        console.error('RUMAHOTP_API_KEY not configured');
        return res.status(500).json({ success: false, error: 'RUMAHOTP_API_KEY not configured' });
    }
    
    // Validasi parameter
    if (!serviceId || !countryId || !providerId || !operatorId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required parameters: serviceId, countryId, providerId, operatorId' 
        });
    }
    
    try {
        const orderRes = await fetch(
            `${RUMAHOTP_BASE_URL}/orders?number_id=${countryId}&provider_id=${providerId}&operator_id=${operatorId}`,
            { headers: { 'x-apikey': API_KEY } }
        );
        
        const orderData = await orderRes.json();
        
        if (orderData.success && orderData.data) {
            return res.status(200).json({
                success: true,
                orderId: orderData.data.order_id,
                phoneNumber: orderData.data.phone_number,
                price: orderData.data.price,
                serviceName: orderData.data.service,
                expiredAt: orderData.data.expired_at
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                error: orderData.error?.message || 'Failed to create OTP order' 
            });
        }
    } catch (error) {
        console.error('Error creating OTP order:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}