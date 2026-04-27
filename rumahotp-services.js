// api/rumahotp-services.js
// Ambil daftar layanan OTP yang tersedia dari RumahOTP

const RUMAHOTP_BASE_URL = 'https://www.rumahotp.io/api/v2';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const API_KEY = process.env.RUMAHOTP_API_KEY;
    
    if (!API_KEY) {
        console.error('RUMAHOTP_API_KEY not configured');
        return res.status(500).json({ 
            success: false, 
            error: 'RUMAHOTP_API_KEY not configured' 
        });
    }
    
    try {
        // 1. Ambil daftar layanan
        const servicesRes = await fetch(`${RUMAHOTP_BASE_URL}/services`, {
            headers: { 'x-apikey': API_KEY }
        });
        const servicesData = await servicesRes.json();
        
        if (!servicesData.success || !servicesData.data) {
            return res.status(500).json({ success: false, error: 'Failed to fetch services' });
        }
        
        const products = [];
        
        // 2. Untuk setiap service, ambil daftar negara + harga
        for (const service of servicesData.data) {
            try {
                const countriesRes = await fetch(
                    `${RUMAHOTP_BASE_URL}/countries?service_id=${service.service_code}`,
                    { headers: { 'x-apikey': API_KEY } }
                );
                const countriesData = await countriesRes.json();
                
                if (countriesData.success && countriesData.data) {
                    // Cari Indonesia
                    const indonesia = countriesData.data.find(
                        c => c.name === 'Indonesia' || c.iso_code === 'id'
                    );
                    
                    if (indonesia && indonesia.pricelist && indonesia.pricelist.length > 0) {
                        const lowestPrice = Math.min(...indonesia.pricelist.map(p => p.price));
                        products.push({
                            id: service.service_code,
                            name: service.service_name,
                            price: lowestPrice,
                            img: service.service_img || null
                        });
                    }
                }
            } catch (err) {
                console.error(`Error fetching countries for service ${service.service_code}:`, err);
            }
        }
        
        return res.status(200).json({ success: true, products });
        
    } catch (error) {
        console.error('Error fetching services:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch services' });
    }
}