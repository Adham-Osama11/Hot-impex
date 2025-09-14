const Product = require('../models/ProductSchema');
const User = require('../models/UserSchema');
const Order = require('../models/OrderSchema');
const mongoose = require('mongoose');

class MongoService {
    // Product methods
    async getAllProducts(options = {}) {
        try {
            const {
                category,
                search,
                featured,
                bestSeller,
                inStock,
                minPrice,
                maxPrice,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                page = 1,
                limit = 10
            } = options;

            let query = {};
            let sort = {};

            // Build query
            if (category) {
                query.categorySlug = category;
            }

            if (search) {
                query.$text = { $search: search };
            }

            if (featured !== undefined) {
                query.featured = featured;
            }

            if (bestSeller !== undefined) {
                query.bestSeller = bestSeller;
            }

            if (inStock !== undefined) {
                query.inStock = inStock;
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                query.price = {};
                if (minPrice !== undefined) query.price.$gte = minPrice;
                if (maxPrice !== undefined) query.price.$lte = maxPrice;
            }

            // Build sort
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            // Execute query with pagination
            const skip = (page - 1) * limit;
            const products = await Product.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Product.countDocuments(query);

            return {
                products,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error getting products:', error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            return await Product.findOne({ id });
        } catch (error) {
            console.error('Error getting product by ID:', error);
            throw error;
        }
    }

    async getProductsByCategory(category) {
        try {
            return await Product.find({ categorySlug: category });
        } catch (error) {
            console.error('Error getting products by category:', error);
            throw error;
        }
    }

    async searchProducts(query) {
        try {
            return await Product.find({ $text: { $search: query } });
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    async getCategories() {
        try {
            const categories = await Product.distinct('category');
            return categories;
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    async createProduct(productData) {
        try {
            const product = new Product(productData);
            return await product.save();
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(id, productData) {
        try {
            return await Product.findOneAndUpdate(
                { id },
                { ...productData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            return await Product.findOneAndDelete({ id });
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    // User methods
    async findUserByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    async findUserByEmailWithPassword(email) {
        try {
            return await User.findByEmailWithPassword(email);
        } catch (error) {
            console.error('Error finding user by email with password:', error);
            throw error;
        }
    }

    async findUserById(id) {
        try {
            return await User.findById(id);
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    async findUserByIdWithPassword(id) {
        try {
            return await User.findById(id).select('+password');
        } catch (error) {
            console.error('Error finding user by ID with password:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const user = new User(userData);
            return await user.save();
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async updateUser(id, userData) {
        try {
            return await User.findByIdAndUpdate(
                id,
                { ...userData, updatedAt: new Date() },
                { new: true, runValidators: true }
            );
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async getAllUsers(options = {}) {
        try {
            const { role, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
            
            let query = {};
            if (role) {
                query.role = role;
            }

            const skip = (page - 1) * limit;
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const users = await User.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            const total = await User.countDocuments(query);

            return {
                users,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                return null;
            }
            return user;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Order methods
    async createOrder(orderData) {
        try {
            const order = new Order(orderData);
            return await order.save();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async findOrderById(id) {
        try {
            return await Order.findById(id).populate('user', 'firstName lastName email');
        } catch (error) {
            console.error('Error finding order by ID:', error);
            throw error;
        }
    }

    async findOrderByOrderNumber(orderNumber) {
        try {
            return await Order.findOne({ orderNumber }).populate('user', 'firstName lastName email');
        } catch (error) {
            console.error('Error finding order by order number:', error);
            throw error;
        }
    }

    async findOrdersByUserId(userId, options = {}) {
        try {
            return await Order.findByUser(userId, options);
        } catch (error) {
            console.error('Error finding orders by user ID:', error);
            throw error;
        }
    }

    async getAllOrders(options = {}) {
        try {
            const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
            
            let query = {};
            if (status) {
                query.status = status;
            }

            const skip = (page - 1) * limit;
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

            const orders = await Order.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'firstName lastName email');

            const total = await Order.countDocuments(query);

            return {
                orders,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error getting all orders:', error);
            throw error;
        }
    }

    async updateOrderStatus(orderId, status, notes = '', updatedBy = null) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                return null;
            }

            order.addStatusHistory(status, notes, updatedBy);
            return await order.save();
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    async updateOrder(orderId, updateData) {
        try {
            const order = await Order.findByIdAndUpdate(
                orderId,
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            ).populate('user', 'firstName lastName email');
            
            if (!order) {
                return null;
            }
            return order;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }

    // Statistics methods
    async getDashboardStats() {
        try {
            const [productStats, userStats, orderStats, recentActivity] = await Promise.all([
                this.getProductStats(),
                this.getUserStats(),
                this.getOrderStats(),
                this.getRecentActivity()
            ]);

            return {
                products: productStats,
                users: userStats,
                orders: orderStats,
                recentActivity,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw error;
        }
    }

    async getProductStats() {
        try {
            const totalProducts = await Product.countDocuments();
            const inStockProducts = await Product.countDocuments({ stockQuantity: { $gt: 0 } });
            const outOfStockProducts = await Product.countDocuments({ stockQuantity: { $lte: 0 } });
            const lowStockProducts = await Product.countDocuments({ 
                stockQuantity: { $gt: 0, $lte: 10 } 
            });
            const featuredProducts = await Product.countDocuments({ featured: true });
            const bestSellerProducts = await Product.countDocuments({ bestSeller: true });

            const categories = await Product.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        averagePrice: { $avg: '$price' }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            // Get top selling products (this would need order data integration in a real system)
            const totalValue = await Product.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: { $multiply: ['$price', '$stockQuantity'] } }
                    }
                }
            ]);

            return {
                total: totalProducts,
                inStock: inStockProducts,
                outOfStock: outOfStockProducts,
                lowStock: lowStockProducts,
                featured: featuredProducts,
                bestSellers: bestSellerProducts,
                categories,
                totalInventoryValue: totalValue[0]?.totalValue || 0,
                stockPercentage: totalProducts > 0 ? Math.round((inStockProducts / totalProducts) * 100) : 0
            };
        } catch (error) {
            console.error('Error getting product stats:', error);
            throw error;
        }
    }

    async getUserStats() {
        try {
            const totalUsers = await User.countDocuments();
            const activeUsers = await User.countDocuments({ isActive: true });
            const adminUsers = await User.countDocuments({ role: 'admin' });
            const customerUsers = await User.countDocuments({ role: 'customer' });

            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

            const recentUsers = await User.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            const previousMonthUsers = await User.countDocuments({
                createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
            });

            // Calculate growth percentage
            const growthPercentage = previousMonthUsers > 0 
                ? Math.round(((recentUsers - previousMonthUsers) / previousMonthUsers) * 100)
                : recentUsers > 0 ? 100 : 0;

            // Get user registration trends (last 7 days)
            const registrationTrends = await User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { 
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return {
                total: totalUsers,
                active: activeUsers,
                admins: adminUsers,
                customers: customerUsers,
                recentSignups: recentUsers,
                growthPercentage,
                registrationTrends,
                activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    async getOrderStats() {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            // Basic counts
            const totalOrders = await Order.countDocuments();
            const pendingOrders = await Order.countDocuments({ status: 'pending' });
            const completedOrders = await Order.countDocuments({ 
                status: { $in: ['delivered', 'completed'] } 
            });
            const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

            // Monthly orders and revenue
            const monthlyOrders = await Order.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            const previousMonthOrders = await Order.countDocuments({
                createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
            });

            // Revenue calculations
            const revenueData = await Order.aggregate([
                {
                    $match: { 
                        status: { $in: ['delivered', 'completed'] },
                        'pricing.total': { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$pricing.total' },
                        averageOrderValue: { $avg: '$pricing.total' },
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Monthly revenue
            const monthlyRevenueData = await Order.aggregate([
                {
                    $match: { 
                        status: { $in: ['delivered', 'completed'] },
                        createdAt: { $gte: thirtyDaysAgo },
                        'pricing.total': { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: null,
                        monthlyRevenue: { $sum: '$pricing.total' },
                        monthlyAverage: { $avg: '$pricing.total' }
                    }
                }
            ]);

            // Previous month revenue for comparison
            const previousMonthRevenueData = await Order.aggregate([
                {
                    $match: { 
                        status: { $in: ['delivered', 'completed'] },
                        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
                        'pricing.total': { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: null,
                        previousMonthRevenue: { $sum: '$pricing.total' }
                    }
                }
            ]);

            // Weekly revenue trend (last 7 days)
            const weeklyRevenueTrend = await Order.aggregate([
                {
                    $match: {
                        status: { $in: ['delivered', 'completed'] },
                        createdAt: { $gte: sevenDaysAgo },
                        'pricing.total': { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: { 
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        dailyRevenue: { $sum: '$pricing.total' },
                        orderCount: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Status breakdown with percentages
            const statusBreakdown = await Order.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Payment method breakdown
            const paymentMethodBreakdown = await Order.aggregate([
                {
                    $group: {
                        _id: '$paymentMethod',
                        count: { $sum: 1 },
                        revenue: { $sum: '$pricing.total' }
                    }
                }
            ]);

            // Calculate growth percentages
            const orderGrowthPercentage = previousMonthOrders > 0 
                ? Math.round(((monthlyOrders - previousMonthOrders) / previousMonthOrders) * 100)
                : monthlyOrders > 0 ? 100 : 0;

            const monthlyRevenue = monthlyRevenueData[0]?.monthlyRevenue || 0;
            const previousMonthRevenue = previousMonthRevenueData[0]?.previousMonthRevenue || 0;
            const revenueGrowthPercentage = previousMonthRevenue > 0 
                ? Math.round(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
                : monthlyRevenue > 0 ? 100 : 0;

            return {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
                cancelled: cancelledOrders,
                monthlyOrders,
                orderGrowthPercentage,
                totalRevenue: revenueData[0]?.totalRevenue || 0,
                monthlyRevenue,
                revenueGrowthPercentage,
                averageOrderValue: revenueData[0]?.averageOrderValue || 0,
                completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
                statusBreakdown,
                paymentMethodBreakdown,
                weeklyRevenueTrend
            };
        } catch (error) {
            console.error('Error getting order stats:', error);
            throw error;
        }
    }

    async getRecentActivity() {
        try {
            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // Initialize empty arrays in case queries fail
            let recentOrders = [];
            let recentUsers = [];
            let recentOrderUpdates = [];

            try {
                // Get recent orders
                recentOrders = await Order.find({
                    createdAt: { $gte: twentyFourHoursAgo }
                })
                .populate('user', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(5) || [];
            } catch (error) {
                console.error('Error fetching recent orders:', error);
            }

            try {
                // Get recent user registrations
                recentUsers = await User.find({
                    createdAt: { $gte: twentyFourHoursAgo }
                })
                .select('firstName lastName email createdAt')
                .sort({ createdAt: -1 })
                .limit(5) || [];
            } catch (error) {
                console.error('Error fetching recent users:', error);
            }

            try {
                // Get recent order status changes (orders updated in last 24h but not created)
                recentOrderUpdates = await Order.find({
                    updatedAt: { $gte: twentyFourHoursAgo },
                    createdAt: { $lt: twentyFourHoursAgo }
                })
                .populate('user', 'firstName lastName email')
                .sort({ updatedAt: -1 })
                .limit(3) || [];
            } catch (error) {
                console.error('Error fetching recent order updates:', error);
            }

            // Format activities for the dashboard
            const activities = [];

            // Add order activities
            recentOrders.forEach(order => {
                try {
                    activities.push({
                        type: 'order',
                        icon: 'shopping-cart',
                        color: 'green',
                        title: 'New Order',
                        description: `Order #${order.orderNumber || 'N/A'} placed by ${order.user?.firstName || 'Customer'}`,
                        amount: `+$${order.pricing?.total || 0}`,
                        time: order.createdAt,
                        status: order.status || 'pending'
                    });
                } catch (error) {
                    console.error('Error processing order activity:', error);
                }
            });

            // Add user registration activities
            recentUsers.forEach(user => {
                try {
                    activities.push({
                        type: 'user',
                        icon: 'user-plus',
                        color: 'blue',
                        title: 'New Customer',
                        description: `${user.firstName || 'User'} ${user.lastName || ''} joined`,
                        amount: null,
                        time: user.createdAt,
                        status: 'active'
                    });
                } catch (error) {
                    console.error('Error processing user activity:', error);
                }
            });

            // Add order update activities
            recentOrderUpdates.forEach(order => {
                try {
                    activities.push({
                        type: 'order_update',
                        icon: 'refresh-cw',
                        color: 'orange',
                        title: 'Order Updated',
                        description: `Order #${order.orderNumber || 'N/A'} status changed to ${order.status || 'unknown'}`,
                        amount: null,
                        time: order.updatedAt,
                        status: order.status || 'unknown'
                    });
                } catch (error) {
                    console.error('Error processing order update activity:', error);
                }
            });

            // Sort all activities by time (most recent first)
            activities.sort((a, b) => new Date(b.time) - new Date(a.time));

            return {
                activities: activities.slice(0, 10), // Return top 10 most recent activities
                totalToday: activities.length,
                summary: {
                    newOrders: recentOrders.length,
                    newUsers: recentUsers.length,
                    orderUpdates: recentOrderUpdates.length
                }
            };
        } catch (error) {
            console.error('Error getting recent activity:', error);
            // Return default empty structure instead of throwing
            return {
                activities: [],
                totalToday: 0,
                summary: {
                    newOrders: 0,
                    newUsers: 0,
                    orderUpdates: 0
                }
            };
        }
    }

    // Data migration methods
    async migrateFromJSON(jsonData) {
        try {
            console.log('🔄 Starting data migration from JSON to MongoDB...');

            // Migrate products
            if (jsonData.products && jsonData.products.length > 0) {
                console.log(`📦 Migrating ${jsonData.products.length} products...`);
                
                for (const productData of jsonData.products) {
                    const existingProduct = await Product.findOne({ id: productData.id });
                    if (!existingProduct) {
                        const product = new Product(productData);
                        await product.save();
                        console.log(`✅ Migrated product: ${productData.name}`);
                    } else {
                        console.log(`⏭️ Product already exists: ${productData.name}`);
                    }
                }
            }

            console.log('✅ Data migration completed successfully!');
        } catch (error) {
            console.error('❌ Error during data migration:', error);
            throw error;
        }
    }
}

module.exports = new MongoService();
