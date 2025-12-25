
const fs = require('fs');
const https = require('https');

// Read .env
const env = fs.readFileSync('.env', 'utf8');
const getVar = (name) => {
    const match = env.match(new RegExp(`${name}=(.*)`));
    return match ? match[1].trim() : null;
};

const SUPABASE_URL = getVar('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = getVar('VITE_SUPABASE_ANON_KEY');
const PRICE_ID = getVar('VITE_STRIPE_STANDARD_PRICE_ID');

console.log('Testing with:');
console.log('URL:', SUPABASE_URL);
console.log('Price ID:', PRICE_ID);
// Don't log full key

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !PRICE_ID) {
    console.error('Missing env vars');
    process.exit(1);
}

// Function URL (assuming project URL format)
// If VITE_SUPABASE_URL is http://... it might be local. 
// If it is myrthifravcxvcqlptcp.supabase.co, we use https.
let functionUrl = `${SUPABASE_URL}/functions/v1/create-checkout-session`;

// payload
const data = JSON.stringify({
    priceId: PRICE_ID,
    userId: 'test-user-simulation',
    planType: 'standard'
});

const urlObj = new URL(functionUrl);
const options = {
    hostname: urlObj.hostname,
    port: urlObj.port || 443,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Length': data.length,
        'Origin': 'http://localhost:5173'
    }
};

const req = (urlObj.protocol === 'https:' ? https : require('http')).request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        fs.writeFileSync('response.json', JSON.stringify({
            status: res.statusCode,
            body: body
        }, null, 2));
        console.log('Response saved to response.json');
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
