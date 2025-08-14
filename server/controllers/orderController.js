const { validationResult } = require('express-validator');
const hybridDb = require('../services/hybridDbService');
const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const orderData = {
            userId: req.user?.id,
            customerInfo: req.body.customerInfo,
            items: req.body.items,
            shippingAddress: req.body.shippingAddress,
            billingAddress: req.body.billingAddress || req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            notes: req.body.notes || ''
        };

        // Validate order data
        const validation = Order.validate(orderData);
        if (!validation.isValid) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Verify products exist and calculate total
        let totalAmount = 0;
        const verifiedItems = [];

        for (const item of orderData.items) {
            const product = await hybridDb.findProductById(item.productId);
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: `Product with ID ${item.productId} not found`
                });
            }

            if (!product.inStock) {
                return res.status(400).json({
                    status: 'error',
                    message: `Product ${product.name} is out of stock`
                });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            verifiedItems.push({
                productId: item.productId,
                productName: product.name,
                price: product.price,
                quantity: item.quantity,
                total: itemTotal
            });
        }

        orderData.items = verifiedItems;
        orderData.totalAmount = totalAmount;

        const order = await hybridDb.createOrder(orderData);

        res.status(201).json({
            status: 'success',
            data: {
                order: new Order(order).toJSON()
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error creating order',
            error: error.message
        });
    }
};

// @desc    Get all orders for user
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const orders = await hybridDb.findOrdersByUserId(req.user.id);
        
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders
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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
    try {
        const order = await hybridDb.findOrderById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        // Check if user owns the order (unless admin)
        if (req.user.role !== 'admin' && order.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
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
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!Order.getValidStatuses().includes(status)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid order status',
                validStatuses: Order.getValidStatuses()
            });
        }

        const updatedOrder = await hybridDb.updateOrderStatus(req.params.id, status);
        
        if (!updatedOrder) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                order: updatedOrder
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

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
    try {
        const order = await hybridDb.findOrderById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        // Check if user owns the order (unless admin)
        if (req.user.role !== 'admin' && order.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        // Check if order can be cancelled
        if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
            return res.status(400).json({
                status: 'error',
                message: `Cannot cancel order with status: ${order.status}`
            });
        }

        const updatedOrder = await hybridDb.updateOrderStatus(req.params.id, 'cancelled');

        res.status(200).json({
            status: 'success',
            data: {
                order: updatedOrder
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error cancelling order',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder
};
