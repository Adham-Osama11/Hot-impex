const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    productName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    productSnapshot: {
        name: String,
        description: String,
        image: String,
        specifications: Map
    }
});

const addressSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    street: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customerInfo: {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        }
    },
    items: [orderItemSchema],
    pricing: {
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        tax: {
            type: Number,
            default: 0,
            min: 0
        },
        shipping: {
            type: Number,
            default: 0,
            min: 0
        },
        discount: {
            type: Number,
            default: 0,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    currency: {
        type: String,
        default: 'EGP',
        enum: ['EGP', 'USD', 'EUR']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
        index: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cash_on_delivery', 'credit_card', 'bank_transfer', 'paypal', 'stripe']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending',
        index: true
    },
    paymentDetails: {
        transactionId: String,
        paymentDate: Date,
        paymentAmount: Number,
        refundAmount: Number,
        paymentNotes: String
    },
    shippingAddress: {
        type: addressSchema,
        required: true
    },
    billingAddress: {
        type: addressSchema
    },
    shipping: {
        method: {
            type: String,
            default: 'standard'
        },
        trackingNumber: String,
        carrier: String,
        estimatedDelivery: Date,
        actualDelivery: Date,
        shippingCost: {
            type: Number,
            default: 0
        }
    },
    notes: {
        customer: String,
        internal: String
    },
    history: [{
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        notes: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ user: 1, createdAt: -1 });

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
    return Date.now() - this.createdAt;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.orderNumber) {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        this.orderNumber = `HOT-${timestamp.slice(-8)}-${random}`;
    }
    next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
    if (this.isModified('items')) {
        this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
        this.pricing.total = this.pricing.subtotal + this.pricing.tax + this.pricing.shipping - this.pricing.discount;
    }
    next();
});

// Instance method to add status to history
orderSchema.methods.addStatusHistory = function(status, notes = '', updatedBy = null) {
    this.history.push({
        status,
        notes,
        updatedBy,
        timestamp: new Date()
    });
    this.status = status;
};

// Instance method to calculate shipping cost
orderSchema.methods.calculateShipping = function() {
    // Basic shipping calculation - can be made more sophisticated
    const weight = this.items.length; // Simple weight calculation
    const baseShipping = 50; // Base shipping cost in EGP
    
    if (this.pricing.subtotal > 1000) {
        return 0; // Free shipping for orders over 1000 EGP
    }
    
    return baseShipping + (weight * 10);
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = function(startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = startDate;
        if (endDate) matchStage.createdAt.$lte = endDate;
    }

    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalValue: { $sum: '$pricing.total' }
            }
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: '$count' },
                totalRevenue: { $sum: '$totalValue' },
                statusBreakdown: {
                    $push: {
                        status: '$_id',
                        count: '$count',
                        value: '$totalValue'
                    }
                }
            }
        }
    ]);
};

// Static method to find orders by user
orderSchema.statics.findByUser = function(userId, options = {}) {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    let query = { user: userId };
    if (status) {
        query.status = status;
    }
    
    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    return this.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'firstName lastName email');
};

module.exports = mongoose.model('Order', orderSchema);
