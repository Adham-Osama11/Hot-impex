const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import User schema
const User = require('../server/models/UserSchema');

async function createAdminUser() {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hot_impex';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin@hotimpex.com' });
        
        if (existingAdmin) {
            console.log('📋 Admin user already exists:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
            console.log(`   Role: ${existingAdmin.role}`);
            
            // Generate a new token for this user
            const token = jwt.sign(
                { id: existingAdmin._id },
                process.env.JWT_SECRET || 'hot-impex-secret-key',
                { expiresIn: '7d' }
            );
            
            console.log('\n🔑 Admin Token (copy this to localStorage as "adminToken"):');
            console.log(token);
            
            // Update the localStorage instruction
            console.log('\n📝 To set the token in browser localStorage, open browser console and run:');
            console.log(`localStorage.setItem('adminToken', '${token}');`);
            
        } else {
            // Create new admin user
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash('admin123', saltRounds);
            
            const adminUser = new User({
                firstName: 'Adham',
                lastName: 'Osama',
                email: 'admin@hotimpex.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true
            });

            await adminUser.save();
            console.log('✅ Admin user created successfully!');
            console.log(`   Email: ${adminUser.email}`);
            console.log(`   Password: admin123`);
            console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`);
            
            // Generate token for the new user
            const token = jwt.sign(
                { id: adminUser._id },
                process.env.JWT_SECRET || 'hot-impex-secret-key',
                { expiresIn: '7d' }
            );
            
            console.log('\n🔑 Admin Token (copy this to localStorage as "adminToken"):');
            console.log(token);
            
            console.log('\n📝 To set the token in browser localStorage, open browser console and run:');
            console.log(`localStorage.setItem('adminToken', '${token}');`);
        }

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

createAdminUser();
