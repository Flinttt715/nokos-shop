// api/check-otp-code.js
// Cek apakah kode OTP sudah masuk

const RUMAHOTP_BASE_URL_OLD = 'https://www.rumahotp.io/api/v1';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { orderId } = req.query;
    const API_KEY = process.env.RUMAHOTP_API_KEY;
    
    if (!API_KEY) {
        console.error('RUMAHOTP_API_KEY not configured');
        return res.status(500).json({ success: false, error: 'RUMAHOTP_API_KEY not configured' });
    }
    
    if (!orderId) {
        return res.status(400).json({ success: false, error: 'orderId required' });
    }
    
    try {
        const statusRes = await fetch(
            `${RUMAHOTP_BASE_URL_OLD}/orders/get_status?order_id=${orderId}`,
            { headers: { 'x-apikey': API_KEY } }
        );
        
        const statusData = await statusRes.json();
        
        if (statusData.success && statusData.data) {
            return res.status(200).json({
                success: true,
                status: statusData.data.status,
                otpCode: statusData.data.otp_code,
                otpMessage: statusData.data.otp_msg,
                phoneNumber: statusData.data.phone_number
            });
        } else {
            return res.status(200).json({ success: false, status: 'not_found' });
        }
    } catch (error) {
        console.error('Error checking OTP:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}