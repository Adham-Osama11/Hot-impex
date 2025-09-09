#!/usr/bin/env node

const jwt = require('jsonwebtoken');

// Test script to debug admin products API issue
async function testAdminProductsAuth() {
    console.log('🔍 Testing Admin Products Authentication...\n');

    // Create a test token
    const testToken = jwt.sign(
        { id: '68bf835f4296ccf209e25e4c' },
        process.env.JWT_SECRET || 'hot-impex-super-secret-key-2024',
        { expiresIn: '7d' }
    );    console.log('📝 Generated test token:', testToken.substring(0, 50) + '...\n');

    // Test each endpoint
    const endpoints = [
        '/api/admin/profile',
        '/api/admin/stats',
        '/api/admin/products'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`🌐 Testing ${endpoint}...`);
            
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${testToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const status = response.status;
            const data = await response.json();

            console.log(`   Status: ${status}`);
            console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...\n`);

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
        }
    }
}

// Test token verification
function testTokenDecoding() {
    console.log('🔐 Testing Token Decoding...\n');
    
    // Test with different token formats
    const tokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YmY4MzVmNDI5NmNjZjIwOWUyNWU0YyIsImlhdCI6MTc1NzM4NDUxOSwiZXhwIjoxNzU3OTg5MzE5fQ.1BW-sC2HYDS76P_w_gxrBy4XPieB52XOC-NeJqLE_5o'
    ];

    tokens.forEach((token, index) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hot-impex-super-secret-key-2024');
            console.log(`Token ${index + 1}: Valid - ID: ${decoded.id}, Expires: ${new Date(decoded.exp * 1000).toISOString()}`);
        } catch (error) {
            console.log(`Token ${index + 1}: Invalid - ${error.message}`);
        }
    });

    console.log('');
}

// Run tests
async function main() {
    console.log('🚀 Starting Admin Products Debug Session\n');
    
    testTokenDecoding();
    await testAdminProductsAuth();
    
    console.log('✅ Debug session complete');
}

// Only run if this script is executed directly
if (require.main === module) {
    main().catch(console.error);
}
