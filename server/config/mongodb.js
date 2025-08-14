const mongoose = require('mongoose');
require('dotenv').config();

class MongoDatabase {
    constructor() {
        this.isConnected = false;
    }

    async connect() {
        try {
            if (this.isConnected) {
                console.log('Already connected to MongoDB');
                return;
            }

            const mongoUri = process.env.MONGODB_URI;
            if (!mongoUri) {
                throw new Error('MONGODB_URI is not defined in environment variables');
            }

            // Replace <db_password> with actual password if needed
            const connectionString = mongoUri.replace('<db_password>', process.env.DB_PASSWORD || '');

            await mongoose.connect(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            this.isConnected = true;
            console.log('✅ Connected to MongoDB successfully');
            
            // Handle connection events
            mongoose.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('📴 MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
                this.isConnected = true;
            });

        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            throw error;
        }
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            this.isConnected = false;
            console.log('📴 Disconnected from MongoDB');
        } catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error);
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name
        };
    }
}

module.exports = new MongoDatabase();
