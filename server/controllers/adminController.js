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

                // Generate short description if not provided but description exists
        if (!productData.shortDescription && productData.description) {
            productData.shortDescription = productData.description.length > 150 
                ? productData.description.substring(0, 150) + '...'
                : productData.description;
        }

        // Map frontend 'stock' field to database 'stockQuantity' field
        if (productData.stock !== undefined) {
            productData.stockQuantity = productData.stock;
            delete productData.stock;
        }

        // Add timestamps
        productData.createdAt = new Date().toISOString();
        productData.updatedAt = new Date().toISOString();

        // Use the proper createProduct method from hybridDb
        const newProduct = await hybridDb.createProduct(productData);

        // Transform stockQuantity to stock for frontend compatibility
        const productObj = newProduct.toObject ? newProduct.toObject() : { ...newProduct };
        const responseProduct = {
            ...productObj,
            stock: productObj.stockQuantity !== undefined ? productObj.stockQuantity : productObj.stock
        };

        res.status(201).json({
            status: 'success',
            data: {
                product: responseProduct
            }
        });
    } catch (error) {
        if (error.message && error.message.includes('duplicate') || error.message.includes('already exists')) {
            return res.status(400).json({
                status: 'error',
                message: 'Product with this ID already exists'
            });
        }
        
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
        const productId = req.params.id;
        const updateData = req.body;

        // Generate short description if not provided but description exists
        if (!updateData.shortDescription && updateData.description) {
            updateData.shortDescription = updateData.description.length > 150 
                ? updateData.description.substring(0, 150) + '...'
                : updateData.description;
        }

        // Map frontend 'stock' field to database 'stockQuantity' field
        if (updateData.stock !== undefined) {
            updateData.stockQuantity = updateData.stock;
            delete updateData.stock;
        }

        // Validate updated data
        const validation = Product.validate(updateData);
        if (!validation.isValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Use the proper updateProduct method from hybridDb
        const updatedProduct = await hybridDb.updateProduct(productId, updateData);

        if (!updatedProduct) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        // Transform stockQuantity to stock for frontend compatibility
        const productObj = updatedProduct.toObject ? updatedProduct.toObject() : { ...updatedProduct };
        const responseProduct = {
            ...productObj,
            stock: productObj.stockQuantity !== undefined ? productObj.stockQuantity : productObj.stock
        };

        res.status(200).json({
            status: 'success',
            data: {
                product: responseProduct
            }
        });
    } catch (error) {
        if (error.message === 'Product not found') {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }
        
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
        const productId = req.params.id;
        const result = await hybridDb.deleteProduct(productId);

        res.status(200).json({
            status: 'success',
            message: 'Product deleted successfully',
            data: result
        });
    } catch (error) {
        console.error('Error deleting product:', error);
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

// @desc    Create new user (Admin)
// @route   POST /api/admin/users
// @access  Private (Admin only)
const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'First name, last name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await hybridDb.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User already exists with this email'
            });
        }

        // Create user data
        const userData = {
            firstName,
            lastName,
            email,
            password,
            phone: phone || '',
            role: 'customer',
            isActive: true,
            createdAt: new Date()
        };

        // Create user
        const newUser = await hybridDb.createUser(userData);

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: newUser._id || newUser.id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    phone: newUser.phone,
                    role: newUser.role,
                    isActive: newUser.isActive,
                    createdAt: newUser.createdAt
                }
            },
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating user',
            error: error.message
        });
    }
};

// @desc    Update user (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;
        const userId = req.params.id;

        // Get current user
        const currentUser = await hybridDb.getUserById(userId);
        if (!currentUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check if email is being changed and if new email already exists
        if (email && email !== currentUser.email) {
            const existingUser = await hybridDb.findUserByEmail(email);
            if (existingUser && (existingUser._id || existingUser.id) !== userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email already exists'
                });
            }
        }

        // Prepare update data
        const updateData = {
            firstName: firstName || currentUser.firstName,
            lastName: lastName || currentUser.lastName,
            email: email || currentUser.email,
            phone: phone || currentUser.phone
        };

        // Add password only if provided
        if (password) {
            updateData.password = password;
        }

        // Update user
        const updatedUser = await hybridDb.updateUser(userId, updateData);

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: updatedUser._id || updatedUser.id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    role: updatedUser.role,
                    isActive: updatedUser.isActive,
                    createdAt: updatedUser.createdAt
                }
            },
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating user',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Check if user exists first
        const usersData = await hybridDb.getUsers();
        const user = usersData.users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Don't allow deletion of admin users
        if (user.role === 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Cannot delete admin users'
            });
        }

        // Use the proper deleteUser method from hybridDb
        await hybridDb.deleteUser(userId);

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

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Admin
const getAllProducts = async (req, res) => {
    try {
        const { category, search, limit, page = 1, sortBy, sortOrder } = req.query;
        
        const options = {
            category,
            search,
            limit: limit ? parseInt(limit) : 1000, // Default to large limit for admin
            page: parseInt(page),
            sortBy,
            sortOrder
        };

        const result = await hybridDb.getAllProducts(options);

        // Transform stockQuantity to stock for frontend compatibility
        const transformedProducts = (result.products || result).map(product => {
            // Convert MongoDB document to plain object to avoid issues
            const productObj = product.toObject ? product.toObject() : { ...product };
            return {
                ...productObj,
                stock: productObj.stockQuantity !== undefined ? productObj.stockQuantity : productObj.stock
            };
        });

        // Set no-cache headers to ensure fresh data
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.status(200).json({
            status: 'success',
            results: transformedProducts.length,
            total: result.total || transformedProducts.length,
            page: result.page || 1,
            totalPages: result.totalPages || 1,
            data: {
                products: transformedProducts
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching products',
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
    createUser,
    updateUser,
    deleteUser,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getSettings,
    updateSettings
};
