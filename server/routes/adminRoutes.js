const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
    getDashboardStats,
    getAllOrders,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateOrderStatus,
    getOrderById,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getSettings,
    updateSettings,
    getCurrentAdmin
} = require('../controllers/adminController');
// const { adminAuth } = require('../middleware/auth');

// Apply admin authentication to all routes (temporarily disabled)
// router.use(adminAuth);

// @route   GET /api/admin/stats
router.get('/stats', getDashboardStats);

// @route   GET /api/admin/profile
router.get('/profile', adminAuth, getCurrentAdmin);

// @route   GET /api/admin/orders
router.get('/orders', getAllOrders);

// @route   GET /api/admin/orders/:id
router.get('/orders/:id', getOrderById);

// @route   PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', updateOrderStatus);

// @route   GET /api/admin/users
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
router.get('/users/:id', getUserById);

// @route   POST /api/admin/users
router.post('/users', createUser);

// @route   PUT /api/admin/users/:id
router.put('/users/:id', updateUser);

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

// @route   GET /api/admin/products
router.get('/products', getAllProducts);

// @route   POST /api/admin/products
router.post('/products', createProduct);

// @route   PUT /api/admin/products/:id
router.put('/products/:id', updateProduct);

// @route   DELETE /api/admin/products/:id
router.delete('/products/:id', deleteProduct);

// @route   GET /api/admin/settings
router.get('/settings', getSettings);

// @route   PUT /api/admin/settings
router.put('/settings', updateSettings);

module.exports = router;
