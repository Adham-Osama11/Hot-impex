const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

// @route   POST /api/orders
router.post('/', [
    body('customerInfo.firstName').trim().notEmpty().withMessage('Customer first name is required'),
    body('customerInfo.lastName').trim().notEmpty().withMessage('Customer last name is required'),
    body('customerInfo.email').isEmail().withMessage('Customer email is required'),
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required for each item'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress.street').trim().notEmpty().withMessage('Shipping address is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('Shipping city is required'),
    body('shippingAddress.country').trim().notEmpty().withMessage('Shipping country is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required')
], createOrder);

// @route   GET /api/orders
router.get('/', auth, getOrders);

// @route   GET /api/orders/:id
router.get('/:id', auth, getOrder);

// @route   PUT /api/orders/:id/status
router.put('/:id/status', adminAuth, updateOrderStatus);

// @route   PUT /api/orders/:id/cancel
router.put('/:id/cancel', auth, cancelOrder);

module.exports = router;
