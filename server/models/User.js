const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.password = data.password;
        this.phone = data.phone;
        this.role = data.role || 'customer';
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.address = data.address || {};
        this.preferences = data.preferences || {};
        this.cart = data.cart || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.lastLoginAt = data.lastLoginAt;
    }

    static validate(data, isUpdate = false) {
        const errors = [];

        if (!isUpdate) {
            if (!data.firstName || data.firstName.trim().length === 0) {
                errors.push('First name is required');
            }

            if (!data.lastName || data.lastName.trim().length === 0) {
                errors.push('Last name is required');
            }

            if (!data.email || !this.isValidEmail(data.email)) {
                errors.push('Valid email is required');
            }

            if (!data.password || data.password.length < 6) {
                errors.push('Password must be at least 6 characters long');
            }
        } else {
            if (data.email && !this.isValidEmail(data.email)) {
                errors.push('Valid email is required');
            }

            if (data.password && data.password.length < 6) {
                errors.push('Password must be at least 6 characters long');
            }
        }

        if (data.phone && !this.isValidPhone(data.phone)) {
            errors.push('Valid phone number is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async comparePassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }

    toPublic() {
        return {
            id: this.id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            phone: this.phone,
            role: this.role,
            isActive: this.isActive,
            createdAt: this.createdAt,
            lastLoginAt: this.lastLoginAt
        };
    }

    // Cart management methods
    addToCart(productId, quantity = 1, productData = {}) {
        if (!this.cart) this.cart = [];
        
        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.updatedAt = new Date().toISOString();
        } else {
            this.cart.push({
                productId,
                quantity,
                productData, // Store product name, price, image for quick access
                addedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
        
        this.updatedAt = new Date().toISOString();
        return this.cart;
    }

    removeFromCart(productId) {
        if (!this.cart) return [];
        
        this.cart = this.cart.filter(item => item.productId !== productId);
        this.updatedAt = new Date().toISOString();
        return this.cart;
    }

    updateCartItemQuantity(productId, quantity) {
        if (!this.cart) return [];
        
        const item = this.cart.find(item => item.productId === productId);
        if (item) {
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                item.updatedAt = new Date().toISOString();
                this.updatedAt = new Date().toISOString();
            }
        }
        
        return this.cart;
    }

    clearCart() {
        this.cart = [];
        this.updatedAt = new Date().toISOString();
        return this.cart;
    }

    getCartTotal() {
        if (!this.cart) return { total: 0, count: 0 };
        
        let total = 0;
        let count = 0;
        
        this.cart.forEach(item => {
            const price = parseFloat(item.productData.price) || 0;
            total += price * item.quantity;
            count += item.quantity;
        });
        
        return { total: total.toFixed(2), count };
    }
}

module.exports = User;
