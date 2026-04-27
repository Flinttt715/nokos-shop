// api/create-payment.js
// Integrasi ke RamaShop untuk membuat deposit QRIS

const RAMASHOP_BASE_URL = 'https://ramashop.my.id/api/public';

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
    
    const { amount } = req.body;
    
    if (!amount || amount < 100) {
        return res.status(400).json({ success: false, error: 'Amount minimal Rp100' });
    }
    
    const API_KEY = process.env.RAMASHOP_API_KEY;
    
    if (!API_KEY) {
        console.error('RAMASHOP_API_KEY not configured');
        return res.status(500).json({ success: false, error: 'Server configuration error: RAMASHOP_API_KEY missing' });
    }
    
    try {
        const response = await fetch(`${RAMASHOP_BASE_URL}/deposit/create`, {
            method: 'POST',
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount, method: 'qris' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return res.status(200).json({
                success: true,
                depositId: result.data.depositId,
                qrImage: result.data.qrImage,
                qrString: result.data.qrString,
                uniqueCode: result.data.uniqueCode,
                totalAmount: result.data.totalAmount
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                error: result.message || 'Gagal membuat deposit' 
            });
        }
    } catch (error) {
        console.error('Error create payment:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}