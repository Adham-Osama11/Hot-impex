const mongoose = require('mongoose');
const { ProductVisit, ProductAnalyticsSummary } = require('../server/models/ProductAnalytics');
require('dotenv').config();

async function generateSampleAnalyticsData() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

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
        for (const product of sampleProducts) {
            await updateAnalyticsSummary(product.id, product.name, product.category);
        }

        console.log('✅ Sample analytics data generated successfully!');
        console.log(`📊 Total products: ${sampleProducts.length}`);
        console.log(`📊 Total visits: ${totalVisits}`);
        console.log(`📊 Total sessions: ${sessions.length}`);

    } catch (error) {
        console.error('❌ Error generating sample data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

async function updateAnalyticsSummary(productId, productName, productCategory) {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get visit counts
        const totalVisits = await ProductVisit.countDocuments({ productId });
        const uniqueVisitors = await ProductVisit.distinct('sessionId', { productId }).then(sessions => sessions.length);
        const visitsToday = await ProductVisit.countDocuments({ 
            productId, 
            visitTimestamp: { $gte: today } 
        });
        const visitsThisWeek = await ProductVisit.countDocuments({ 
            productId, 
            visitTimestamp: { $gte: thisWeek } 
        });
        const visitsThisMonth = await ProductVisit.countDocuments({ 
            productId, 
            visitTimestamp: { $gte: thisMonth } 
        });

        // Get first and last visit dates
        const firstVisit = await ProductVisit.findOne({ productId }).sort({ visitTimestamp: 1 });
        const lastVisit = await ProductVisit.findOne({ productId }).sort({ visitTimestamp: -1 });

        // Update or create summary
        await ProductAnalyticsSummary.findOneAndUpdate(
            { productId },
            {
                productId,
                productName,
                productCategory,
                totalVisits,
                uniqueVisitors,
                visitsToday,
                visitsThisWeek,
                visitsThisMonth,
                firstVisit: firstVisit?.visitTimestamp,
                lastVisit: lastVisit?.visitTimestamp,
                lastUpdated: now
            },
            { upsert: true, new: true }
        );

        console.log(`📈 Updated summary for ${productName}: ${totalVisits} total visits`);

    } catch (error) {
        console.error('Error updating analytics summary for', productId, ':', error);
        throw error;
    }
}

// Run the script
if (require.main === module) {
    generateSampleAnalyticsData();
}

module.exports = { generateSampleAnalyticsData };