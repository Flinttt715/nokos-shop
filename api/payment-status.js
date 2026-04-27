// api/payment-status.js
// Cek status deposit dari RamaShop

const RAMASHOP_BASE_URL = 'https://ramashop.my.id/api/public';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { depositId } = req.query;
    
    if (!depositId) {
        return res.status(400).json({ error: 'depositId required' });
    }
    
    const API_KEY = process.env.RAMASHOP_API_KEY;
    
    if (!API_KEY) {
        console.error('RAMASHOP_API_KEY not configured');
        return res.status(500).json({ error: 'Server configuration error: RAMASHOP_API_KEY missing' });
    }
    
    try {
        const response = await fetch(`${RAMASHOP_BASE_URL}/deposit/status/${depositId}`, {
            headers: { 'X-API-Key': API_KEY }
        });
        
        const result = await response.json();
        
        if (result.status && result.data) {
            return res.status(200).json({ status: result.data.status });
        } else {
            return res.status(200).json({ status: 'pending' });
        }
    } catch (error) {
        console.error('Error check status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
