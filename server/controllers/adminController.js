const hybridDb = require('../services/hybridDbService');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
    try {
        const stats = await hybridDb.getDashboardStats();
        
        res.status(200).json({
            status: 'success',
            data: stats
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
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
        
        const options = { status, limit, page };
        const result = await hybridDb.getAllOrders(options);

        res.status(200).json({
            status: 'success',
            data: result
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
        
        const options = { role, limit, page };
        const result = await hybridDb.getAllUsers(options);

        res.status(200).json({
            status: 'success',
            data: result
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

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Private (Admin only)
const getOrderById = async (req, res) => {
    try {
        const ordersData = await hybridDb.getOrders();
        const order = ordersData.orders.find(o => o.id === req.params.id);
        
        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid status'
            });
        }

        const ordersData = await hybridDb.getOrders();
        const orderIndex = ordersData.orders.findIndex(o => o.id === req.params.id);
        
        if (orderIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        ordersData.orders[orderIndex].status = status;
        ordersData.orders[orderIndex].updatedAt = new Date().toISOString();
        
        await hybridDb.saveOrders(ordersData);

        res.status(200).json({
            status: 'success',
            data: {
                order: ordersData.orders[orderIndex]
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res) => {
    try {
        const usersData = await hybridDb.getUsers();
        const user = usersData.users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Remove password from response
        const safeUser = new User(user).toPublic();

        res.status(200).json({
            status: 'success',
            data: {
                user: safeUser
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
    try {
        const usersData = await hybridDb.getUsers();
        const userIndex = usersData.users.findIndex(u => u.id === req.params.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Don't allow deletion of admin users
        if (usersData.users[userIndex].role === 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Cannot delete admin users'
            });
        }

        usersData.users.splice(userIndex, 1);
        await hybridDb.saveUsers(usersData);

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error deleting user',
            error: error.message
        });
    }
};

// @desc    Get admin settings
// @route   GET /api/admin/settings
// @access  Private (Admin only)
const getSettings = async (req, res) => {
    try {
        // Default settings - in a real app, this would come from a database
        const settings = {
            storeName: 'HOT IMPEX',
            storeEmail: 'contact@hotimpex.com',
            currency: 'USD',
            timezone: 'UTC',
            notifications: {
                emailOnNewOrder: true,
                emailOnNewCustomer: false,
                emailOnLowStock: true
            },
            maintenance: {
                enabled: false,
                message: 'We are currently performing maintenance. Please check back later.'
            }
        };

        res.status(200).json({
            status: 'success',
            data: {
                settings
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching settings',
            error: error.message
        });
    }
};

// @desc    Update admin settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
const updateSettings = async (req, res) => {
    try {
        // In a real app, you would validate and save these to a database
        const updatedSettings = req.body;

        res.status(200).json({
            status: 'success',
            data: {
                settings: updatedSettings
            },
            message: 'Settings updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating settings',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getAllUsers,
    getUserById,
    deleteUser,
    createProduct,
    updateProduct,
    deleteProduct,
    getSettings,
    updateSettings
};
