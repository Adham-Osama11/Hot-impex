const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = require('./app');
const hybridDb = require('./services/hybridDbService');
const mongoService = require('./services/mongoService');
const fs = require('fs').promises;

const PORT = process.env.PORT || 3000;

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database (MongoDB or file-based fallback)
        console.log('🔄 Initializing database...');
        const mongoConnected = await hybridDb.initialize();
        
        // Check if we need to migrate data from JSON files (only for MongoDB)
        if (mongoConnected) {
            console.log('🔄 Checking for data migration...');
            await migrateInitialData();
            
            // Initialize analytics data if needed
            await initializeAnalyticsData();
        }
        
        // Start server
        const server = app.listen(PORT, () => {
            const dbInfo = hybridDb.getConnectionInfo();
            console.log(`🚀 HOT IMPEX Server running on port ${PORT}`);
            console.log(`📱 Client: http://localhost:${PORT}`);
            console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
            console.log(`📊 API: http://localhost:${PORT}/api`);
            console.log(`💾 Database: ${dbInfo.type} (${dbInfo.connected ? 'Connected' : 'Disconnected'})`);
            
            if (!mongoConnected) {
                console.log('');
                console.log('📋 To use MongoDB:');
                console.log('   1. Set your MongoDB password in .env file');
                console.log('   2. Replace <db_password> with your actual password');
                console.log('   3. Or run: ./setup-mongodb.sh');
                console.log('');
            }
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (err, promise) => {
            console.log(`❌ Error: ${err.message}`);
            // Close server & exit process
            server.close(async () => {
                if (hybridDb.getConnectionInfo().type === 'MongoDB') {
                    const mongodb = require('./config/mongodb');
                    await mongodb.disconnect();
                }
                process.exit(1);
            });
        });

        // Handle SIGTERM
        process.on('SIGTERM', async () => {
            console.log('👋 SIGTERM received, shutting down gracefully...');
            server.close(async () => {
                if (hybridDb.getConnectionInfo().type === 'MongoDB') {
                    const mongodb = require('./config/mongodb');
                    await mongodb.disconnect();
                }
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Function to migrate initial data from JSON files
async function migrateInitialData() {
    try {
        const productsPath = path.join(__dirname, '../database/products.json');
        const usersPath = path.join(__dirname, '../database/users.json');
        
        // Check if JSON files exist and migrate them
        try {
            const productsData = await fs.readFile(productsPath, 'utf8');
            const parsedProducts = JSON.parse(productsData);
            
            if (parsedProducts.products && parsedProducts.products.length > 0) {
                await mongoService.migrateFromJSON(parsedProducts);
            }
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn('⚠️ Warning: Could not migrate products data:', error.message);
            }
        }
        
        // Migrate users data
        try {
            const usersData = await fs.readFile(usersPath, 'utf8');
            const parsedUsers = JSON.parse(usersData);
            
            if (parsedUsers.users && parsedUsers.users.length > 0) {
                // Check if admin user exists
                const adminExists = await mongoService.findUserByEmail('admin@hotimpex.com');
                if (!adminExists) {
                    const adminUser = parsedUsers.users.find(user => user.role === 'admin');
                    if (adminUser) {
                        await mongoService.createUser(adminUser);
                        console.log('✅ Admin user migrated successfully');
                    }
                }
            }
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn('⚠️ Warning: Could not migrate users data:', error.message);
            }
        }
        
    } catch (error) {
        console.warn('⚠️ Warning: Data migration failed:', error.message);
    }
}

// Initialize analytics data if none exists
async function initializeAnalyticsData() {
    try {
        const { ProductAnalyticsSummary } = require('./models/ProductAnalytics');
        const existingData = await ProductAnalyticsSummary.countDocuments();
        
        if (existingData === 0 && process.env.NODE_ENV !== 'production') {
            console.log('🔄 No analytics data found, generating sample data...');
            await generateSampleAnalyticsDataInline();
            console.log('✅ Sample analytics data initialized');
        } else {
            console.log(`📊 Analytics data already exists: ${existingData} product summaries`);
        }
        
    } catch (error) {
        console.warn('⚠️ Warning: Analytics initialization failed:', error.message);
    }
}

// Generate sample analytics data using existing connection
async function generateSampleAnalyticsDataInline() {
    try {
        const { ProductVisit, ProductAnalyticsSummary } = require('./models/ProductAnalytics');
        
        // Clear existing analytics data
        await ProductVisit.deleteMany({});
        await ProductAnalyticsSummary.deleteMany({});
        console.log('🗑️ Cleared existing analytics data');

        // Sample product data
        const sampleProducts = [
            { id: 'wm-001', name: 'N2 Fixed Wall Mount', category: 'Wall Mount' },
            { id: 'wm-002', name: 'Premium Tilt Mount', category: 'Wall Mount' },
            { id: 'cable-001', name: 'HDMI Cable 4K', category: 'Cable' },
            { id: 'gaming-001', name: 'Gaming Console Mount', category: 'Gaming' },
            { id: 'ceiling-001', name: 'Ceiling Bracket Pro', category: 'Ceiling Bracket' },
            { id: 'motion-001', name: 'Full Motion Articulating', category: 'Wall Mount' },
            { id: 'cart-001', name: 'Mobile TV Cart', category: 'AV Distribution' },
            { id: 'motor-001', name: 'Motorized TV Lift', category: 'AV Distribution' },
            { id: 'wall-001', name: 'Video Wall System', category: 'AV Distribution' },
            { id: 'stand-001', name: 'Premium TV Stand', category: 'AV Distribution' }
        ];

        // Generate visits for the last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        const sessions = [];
        for (let i = 0; i < 50; i++) {
            sessions.push(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`);
        }

        let totalVisits = 0;

        for (const product of sampleProducts) {
            // Generate random number of visits (between 5 and 50)
            const visitCount = Math.floor(Math.random() * 45) + 5;
            
            for (let i = 0; i < visitCount; i++) {
                // Random date within the last 30 days
                const randomDate = new Date(
                    thirtyDaysAgo.getTime() + 
                    Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
                );

                // Random session
                const sessionId = sessions[Math.floor(Math.random() * sessions.length)];

                const visit = new ProductVisit({
                    productId: product.id,
                    productName: product.name,
                    productCategory: product.category,
                    sessionId: sessionId,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                    visitTimestamp: randomDate,
                    referrer: Math.random() > 0.5 ? 'https://google.com' : null
                });

                await visit.save();
                totalVisits++;
            }

            console.log(`📊 Generated ${visitCount} visits for ${product.name}`);
        }

        console.log(`✅ Generated ${totalVisits} total visits`);

        // Update analytics summaries for all products
        console.log('📈 Updating analytics summaries...');
        const AnalyticsService = require('./services/analyticsService');
        for (const product of sampleProducts) {
            await AnalyticsService.updateAnalyticsSummary(product.id, product.name, product.category);
        }

        console.log('✅ Sample analytics data generated successfully!');
        
    } catch (error) {
        console.error('❌ Error generating sample data:', error);
        throw error;
    }
}

// Start the server
startServer();
