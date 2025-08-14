const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllOrders,
    getAllUsers,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

// Apply admin authentication to all routes
router.use(adminAuth);

// @route   GET /api/admin/stats
router.get('/stats', getDashboardStats);

// @route   GET /api/admin/orders
router.get('/orders', getAllOrders);

// @route   GET /api/admin/users
router.get('/users', getAllUsers);

// @route   POST /api/admin/products
router.post('/products', createProduct);

// @route   PUT /api/admin/products/:id
router.put('/products/:id', updateProduct);

// @route   DELETE /api/admin/products/:id
router.delete('/products/:id', deleteProduct);

module.exports = router;
