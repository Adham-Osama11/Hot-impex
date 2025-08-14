const hybridDb = require('../services/hybridDbService');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
    try {
        const [productsData, usersData, ordersData] = await Promise.all([
            hybridDb.getProducts(),
            hybridDb.getUsers(),
            hybridDb.getOrders()
        ]);

        const totalProducts = productsData.products.length;
        const totalUsers = usersData.users.filter(user => user.role === 'customer').length;
        const totalOrders = ordersData.orders.length;
        
        // Calculate revenue
        const totalRevenue = ordersData.orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + order.totalAmount, 0);

        // Recent orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentOrders = ordersData.orders.filter(order => 
            new Date(order.createdAt) > thirtyDaysAgo
        );

        // Order status distribution
        const orderStatusStats = ordersData.orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        // Top selling products
        const productSales = {};
        ordersData.orders.forEach(order => {
            order.items.forEach(item => {
                productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
            });
        });

        const topProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([productId, sales]) => {
                const product = productsData.products.find(p => p.id === productId);
                return {
                    productId,
                    productName: product?.name || 'Unknown Product',
                    sales
                };
            });

        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    totalProducts,
                    totalUsers,
                    totalOrders,
                    totalRevenue,
                    recentOrdersCount: recentOrders.length,
                    orderStatusStats,
                    topProducts
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private (Admin only)
const getAllOrders = async (req, res) => {
    try {
        const { status, limit, page = 1 } = req.query;
        
        const ordersData = await hybridDb.getOrders();
        let orders = ordersData.orders;

        // Filter by status
        if (status) {
            orders = orders.filter(order => order.status === status);
        }

        // Sort by creation date (newest first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Pagination
        const startIndex = (page - 1) * (limit || 20);
        const endIndex = limit ? startIndex + parseInt(limit) : orders.length;
        const paginatedOrders = orders.slice(startIndex, endIndex);

        res.status(200).json({
            status: 'success',
            results: paginatedOrders.length,
            total: orders.length,
            page: parseInt(page),
            data: {
                orders: paginatedOrders
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const { role, limit, page = 1 } = req.query;
        
        const usersData = await hybridDb.getUsers();
        let users = usersData.users;

        // Filter by role
        if (role) {
            users = users.filter(user => user.role === role);
        }

        // Sort by creation date (newest first)
        users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Pagination
        const startIndex = (page - 1) * (limit || 20);
        const endIndex = limit ? startIndex + parseInt(limit) : users.length;
        const paginatedUsers = users.slice(startIndex, endIndex);

        // Remove password from response
        const safeUsers = paginatedUsers.map(user => new User(user).toPublic());

        res.status(200).json({
            status: 'success',
            results: safeUsers.length,
            total: users.length,
            page: parseInt(page),
            data: {
                users: safeUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private (Admin only)
const createProduct = async (req, res) => {
    try {
        const productData = req.body;

        // Validate product data
        const validation = Product.validate(productData);
        if (!validation.isValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Generate product ID if not provided
        if (!productData.id) {
            productData.id = Product.generateId(productData.name);
        }

        // Generate category slug if not provided
        if (!productData.categorySlug) {
            productData.categorySlug = productData.category.toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        }

        const productsData = await hybridDb.getProducts();
        
        // Check if product ID already exists
        const existingProduct = productsData.products.find(p => p.id === productData.id);
        if (existingProduct) {
            return res.status(400).json({
                status: 'error',
                message: 'Product with this ID already exists'
            });
        }

        const product = new Product(productData);
        productsData.products.push(product.toJSON());
        
        await hybridDb.saveProducts(productsData);

        res.status(201).json({
            status: 'success',
            data: {
                product: product.toJSON()
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error creating product',
            error: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin only)
const updateProduct = async (req, res) => {
    try {
        const productsData = await hybridDb.getProducts();
        const productIndex = productsData.products.findIndex(p => p.id === req.params.id);
        
        if (productIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        // Update product data
        const updatedProductData = {
            ...productsData.products[productIndex],
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        // Validate updated data
        const validation = Product.validate(updatedProductData);
        if (!validation.isValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        productsData.products[productIndex] = updatedProductData;
        await hybridDb.saveProducts(productsData);

        res.status(200).json({
            status: 'success',
            data: {
                product: updatedProductData
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating product',
            error: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
const deleteProduct = async (req, res) => {
    try {
        const productsData = await hybridDb.getProducts();
        const productIndex = productsData.products.findIndex(p => p.id === req.params.id);
        
        if (productIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        productsData.products.splice(productIndex, 1);
        await hybridDb.saveProducts(productsData);

        res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error deleting product',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllOrders,
    getAllUsers,
    createProduct,
    updateProduct,
    deleteProduct
};
