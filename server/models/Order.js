class Order {
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.customerInfo = data.customerInfo || {};
        this.items = data.items || [];
        this.totalAmount = data.totalAmount || 0;
        this.currency = data.currency || 'EGP';
        this.status = data.status || 'pending';
        this.paymentMethod = data.paymentMethod;
        this.paymentStatus = data.paymentStatus || 'pending';
        this.shippingAddress = data.shippingAddress || {};
        this.billingAddress = data.billingAddress || {};
        this.notes = data.notes || '';
        this.trackingNumber = data.trackingNumber;
        this.estimatedDelivery = data.estimatedDelivery;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.completedAt = data.completedAt;
    }

    static validate(data) {
        const errors = [];

        if (!data.customerInfo || !data.customerInfo.email) {
            errors.push('Customer email is required');
        }

        if (!data.customerInfo || !data.customerInfo.firstName) {
            errors.push('Customer first name is required');
        }

        if (!data.customerInfo || !data.customerInfo.lastName) {
            errors.push('Customer last name is required');
        }

        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            errors.push('Order must contain at least one item');
        }

        if (data.items && Array.isArray(data.items)) {
            data.items.forEach((item, index) => {
                if (!item.productId) {
                    errors.push(`Item ${index + 1}: Product ID is required`);
                }
                if (!item.quantity || item.quantity <= 0) {
                    errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
                }
                if (!item.price || item.price <= 0) {
                    errors.push(`Item ${index + 1}: Price must be greater than 0`);
                }
            });
        }

        if (!data.shippingAddress || !data.shippingAddress.street) {
            errors.push('Shipping address is required');
        }

        if (!data.shippingAddress || !data.shippingAddress.city) {
            errors.push('Shipping city is required');
        }

        if (!data.shippingAddress || !data.shippingAddress.country) {
            errors.push('Shipping country is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    calculateTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    static getValidStatuses() {
        return ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    }

    static getValidPaymentStatuses() {
        return ['pending', 'paid', 'failed', 'refunded'];
    }

    updateStatus(newStatus) {
        if (!Order.getValidStatuses().includes(newStatus)) {
            throw new Error('Invalid order status');
        }
        
        this.status = newStatus;
        this.updatedAt = new Date().toISOString();
        
        if (newStatus === 'delivered') {
            this.completedAt = new Date().toISOString();
        }
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            customerInfo: this.customerInfo,
            items: this.items,
            totalAmount: this.totalAmount,
            currency: this.currency,
            status: this.status,
            paymentMethod: this.paymentMethod,
            paymentStatus: this.paymentStatus,
            shippingAddress: this.shippingAddress,
            billingAddress: this.billingAddress,
            notes: this.notes,
            trackingNumber: this.trackingNumber,
            estimatedDelivery: this.estimatedDelivery,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            completedAt: this.completedAt
        };
    }
}

module.exports = Order;
