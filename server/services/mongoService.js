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
            const [productStats, userStats, orderStats] = await Promise.all([
                this.getProductStats(),
                this.getUserStats(),
                this.getOrderStats()
            ]);

            return {
                products: productStats,
                users: userStats,
                orders: orderStats
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw error;
        }
    }

    async getProductStats() {
        try {
            const totalProducts = await Product.countDocuments();
            const inStockProducts = await Product.countDocuments({ inStock: true });
            const featuredProducts = await Product.countDocuments({ featured: true });
            const bestSellerProducts = await Product.countDocuments({ bestSeller: true });

            const categories = await Product.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                }
            ]);

            return {
                total: totalProducts,
                inStock: inStockProducts,
                featured: featuredProducts,
                bestSellers: bestSellerProducts,
                categories
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

            const recentUsers = await User.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });

            return {
                total: totalUsers,
                active: activeUsers,
                admins: adminUsers,
                recentSignups: recentUsers
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    async getOrderStats() {
        try {
            const totalOrders = await Order.countDocuments();
            const pendingOrders = await Order.countDocuments({ status: 'pending' });
            const completedOrders = await Order.countDocuments({ status: 'delivered' });

            const revenueData = await Order.aggregate([
                {
                    $match: { status: 'delivered' }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$pricing.total' },
                        averageOrderValue: { $avg: '$pricing.total' }
                    }
                }
            ]);

            const monthlyOrders = await Order.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });

            const statusBreakdown = await Order.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            return {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
                monthlyOrders,
                totalRevenue: revenueData[0]?.totalRevenue || 0,
                averageOrderValue: revenueData[0]?.averageOrderValue || 0,
                statusBreakdown
            };
        } catch (error) {
            console.error('Error getting order stats:', error);
            throw error;
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
