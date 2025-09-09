const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import User schema
const User = require('../server/models/UserSchema');

async function loginAsAdmin() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hot_impex';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Find the admin user
        const adminUser = await User.findOne({ email: 'admin@hotimpex.com', role: 'admin' });
        
        if (!adminUser) {
            console.log('❌ Admin user not found');
            process.exit(1);
        }

        console.log('📋 Found admin user:');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`);
        console.log(`   Role: ${adminUser.role}`);
        
        // Generate a new token for this user
        const token = jwt.sign(
            { id: adminUser._id },
            process.env.JWT_SECRET || 'hot-impex-secret-key',
            { expiresIn: '7d' }
        );
        
        console.log('\n🔑 Admin Login Token:');
        console.log(token);
        
        console.log('\n📝 To log in as admin, open browser console on ANY page and run:');
        console.log(`localStorage.setItem('hotimpex-token', '${token}');`);
        console.log('window.location.reload(); // Refresh to apply login');
        
        console.log('\n✨ This token works for both:');
        console.log('   - User pages (with admin privileges)');
        console.log('   - Admin dashboard (full admin access)');
        
        console.log('\n🔄 The system now uses unified authentication!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
            console.log('\n🔌 Disconnected from MongoDB');
        }
        process.exit(0);
    }
}

// Set a timeout to avoid hanging
setTimeout(() => {
    console.log('❌ Operation timed out');
    process.exit(1);
}, 10000);

loginAsAdmin();
