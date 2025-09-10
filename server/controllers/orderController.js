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

        // Extract data from new frontend format
        const { cart, customerInfo, paymentMethod, userId, subtotal, shippingCost, tax, total } = req.body;

        // Generate unique order number
        const orderNumber = `HOT${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        // Parse customer name
        const nameParts = customerInfo.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const orderData = {
            orderNumber,
            user: req.user?.id || userId || null, // MongoDB uses 'user' not 'userId'
            customerInfo: {
                firstName: firstName,
                lastName: lastName,
                email: customerInfo.email,
                phone: customerInfo.phone
            },
            items: [], // This will be populated after product verification
            shippingAddress: {
                firstName: firstName,
                lastName: lastName,
                street: customerInfo.address,
                city: 'Cairo', // Default city
                state: '',
                zipCode: '',
                country: 'Egypt' // Default country
            },
            billingAddress: {
                firstName: firstName,
                lastName: lastName,
                street: customerInfo.address,
                city: 'Cairo', // Default city
                state: '',
                zipCode: '',
                country: 'Egypt' // Default country
            },
            paymentMethod: paymentMethod === 'cod' ? 'cash_on_delivery' : paymentMethod,
            paymentStatus: 'pending',
            pricing: {
                subtotal: subtotal || 0,
                shipping: shippingCost || 0,
                tax: tax || 0,
                total: total || 0
            },
            currency: 'EGP',
            status: 'pending',
            notes: {
                customer: customerInfo.notes || ''
            }
        };

        // Verify products exist and prepare item data
        const verifiedItems = [];
        let calculatedSubtotal = 0;

        for (const item of cart) {
            const product = await hybridDb.getProductById(item.id);
            
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: `Product with ID ${item.id} not found`
                });
            }

            // Check stock if available
            if (product.inStock === false) {
                return res.status(400).json({
                    status: 'error',
                    message: `Product ${product.name} is out of stock`
                });
            }

            const itemTotal = product.price * item.quantity;
            calculatedSubtotal += itemTotal;

            verifiedItems.push({
                productId: item.id,
                productName: item.name || product.name,
                price: item.price || product.price,
                quantity: item.quantity,
                total: itemTotal,
                image: item.image || product.mainImage
            });
        }

        orderData.items = verifiedItems;
        
        console.log(`Calculated subtotal: ${calculatedSubtotal}`);
        console.log(`Frontend subtotal: ${orderData.pricing.subtotal}`);
        
        // Verify totals match (allow small rounding differences)
        const totalDifference = Math.abs(calculatedSubtotal - orderData.pricing.subtotal);
        console.log(`Total difference: ${totalDifference}`);
        
        if (totalDifference > 1) {
            console.warn(`Order total mismatch: calculated ${calculatedSubtotal}, received ${orderData.pricing.subtotal}`);
            console.log('Updating order data with calculated values...');
            // Update with calculated values
            orderData.pricing.subtotal = calculatedSubtotal;
            orderData.pricing.total = calculatedSubtotal + orderData.pricing.shipping + orderData.pricing.tax;
            console.log(`New total: ${orderData.pricing.total}`);
        }

        // MongoDB will handle validation automatically
        console.log('Final order data before creation:', JSON.stringify(orderData, null, 2));

        const order = await hybridDb.createOrder(orderData);

        res.status(201).json({
            status: 'success',
            data: {
                order: new Order(order).toJSON(),
                orderNumber: orderNumber
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
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
