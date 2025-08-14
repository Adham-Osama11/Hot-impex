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

// Start the server
startServer();
