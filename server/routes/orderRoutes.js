const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, optionalAuth } = require('../middleware/auth');

// Validation middleware for order creation
const validateOrderData = (req, res, next) => {
    console.log('=== VALIDATION MIDDLEWARE DEBUG ===');
    const { cart, customerInfo, paymentMethod } = req.body;
    console.log('cart:', cart);
    console.log('customerInfo:', customerInfo);
    console.log('paymentMethod:', paymentMethod);
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        console.log('Validation failed: Cart validation');
        return res.status(400).json({
            status: 'error',
            message: 'Cart is required and must contain at least one item'
        });
    }
    
    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
        console.log('Validation failed: Customer info validation');
        console.log('Missing fields:', {
            customerInfo: !!customerInfo,
            name: customerInfo?.name,
            email: customerInfo?.email,
            phone: customerInfo?.phone,
            address: customerInfo?.address
        });
        return res.status(400).json({
            status: 'error',
            message: 'Customer information (name, email, phone, address) is required'
        });
    }
    
    if (!paymentMethod || paymentMethod !== 'cod') {
        console.log('Validation failed: Payment method validation');
        console.log('paymentMethod value:', paymentMethod);
        return res.status(400).json({
            status: 'error',
            message: 'Payment method must be Cash on Delivery (cod)'
        });
    }
    
    // Validate cart items
    for (const item of cart) {
        if (!item.id || !item.name || !item.price || !item.quantity) {
            console.log('Validation failed: Cart item validation');
            console.log('Failed item:', item);
            return res.status(400).json({
                status: 'error',
                message: 'Each cart item must have id, name, price, and quantity'
            });
        }
    }
    
    console.log('All validation passed!');
    console.log('=================================');
    next();
};

// Create order (allows both authenticated and guest users)
router.post('/', optionalAuth, validateOrderData, orderController.createOrder);

// Get orders (requires authentication)
router.get('/', auth, orderController.getOrders);

// Get order by ID (requires authentication)
router.get('/:id', auth, orderController.getOrder);

// Update order status (requires authentication)
router.patch('/:id/status', auth, orderController.updateOrderStatus);

// Cancel order (requires authentication)
router.patch('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;
