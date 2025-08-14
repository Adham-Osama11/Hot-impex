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
}

module.exports = User;
