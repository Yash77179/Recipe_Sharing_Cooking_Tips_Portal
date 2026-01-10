const http = require('http');

async function testEndpoint() {
    console.log('🚀 Testing /api/auth/send-otp endpoint...');

    const email = `test_${Date.now()}@example.com`; // Unique email
    const postData = JSON.stringify({
        name: 'Test Endpoint User',
        email: email,
        password: 'Password123!'
    });

    const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/auth/send-otp',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`\n📡 Status Code: ${res.statusCode}`);
            try {
                const parsed = JSON.parse(data);
                console.log('📦 Response Body:', JSON.stringify(parsed, null, 2));

                if (res.statusCode === 200) {
                    console.log('\n✅ SUCCESS: Endpoint is working and email should be sent.');
                } else {
                    console.log('\n❌ FAILURE: Endpoint returned an error.');
                }
            } catch (e) {
                console.log('📦 Response Body (raw):', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`\n❌ Network/Server Error: ${e.message}`);
        console.log('Ensure the server is running on port 5001 (npm run dev).');
    });

    req.write(postData);
    req.end();
}

testEndpoint();

