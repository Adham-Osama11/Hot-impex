const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const hybridDb = require('../services/hybridDbService');
const User = require('../models/UserSchema');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'hot-impex-secret-key', {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await hybridDb.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User already exists with this email'
            });
        }

        // Create user (password will be hashed by the schema pre-save middleware)
        const userData = {
            firstName,
            lastName,
            email,
            password,
            phone,
            role: 'customer'
        };

        const user = await hybridDb.createUser(userData);

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    createdAt: user.createdAt
                },
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error creating user',
            error: error.message
        });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check for user with password
        const user = await hybridDb.findUserByEmailWithPassword(email);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(423).json({
                status: 'error',
                message: 'Account temporarily locked due to too many failed login attempts'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await user.incLoginAttempts();
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Update last login
        await hybridDb.updateUser(user._id, { lastLoginAt: new Date() });

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    lastLoginAt: new Date()
                },
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error logging in user',
            error: error.message
        });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await hybridDb.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user profile',
            error: error.message
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;

        // Validate required fields
        if (!firstName || !lastName) {
            return res.status(400).json({
                status: 'error',
                message: 'First name and last name are required'
            });
        }

        // Validate phone if provided
        if (phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(phone.trim())) {
            return res.status(400).json({
                status: 'error',
                message: 'Please enter a valid phone number'
            });
        }

        const updateData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone ? phone.trim() : '',
            updatedAt: new Date()
        };

        const updatedUser = await hybridDb.updateUser(req.user.id, updateData);
        
        if (!updatedUser) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: updatedUser._id,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    role: updatedUser.role,
                    createdAt: updatedUser.createdAt,
                    lastLoginAt: updatedUser.lastLoginAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating user profile',
            error: error.message
        });
    }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: 'error',
                message: 'New password must be at least 6 characters long'
            });
        }

        // Get user with password
        const user = await hybridDb.findUserByIdWithPassword(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await hybridDb.updateUser(req.user.id, { 
            password: hashedPassword,
            updatedAt: new Date()
        });

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error changing password',
            error: error.message
        });
    }
};

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getUserCart = async (req, res) => {
    try {
        const user = await hybridDb.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        const cart = user.cart || [];
        const cartTotal = user.getCartTotal();

        res.status(200).json({
            status: 'success',
            data: {
                cart,
                total: cartTotal.total,
                count: cartTotal.count
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching cart',
            error: error.message
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/users/cart
// @access  Private
const addToUserCart = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { productId, quantity = 1, productData = {} } = req.body;

        const user = await hybridDb.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Verify product exists (optional, but recommended)
        try {
            const product = await hybridDb.getProductById(productId);
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Product not found'
                });
            }
            
            // If productData is not provided, use product info
            if (!productData.name) {
                productData.name = product.name;
                productData.price = product.price;
                productData.image = product.mainImage;
                productData.currency = product.currency;
            }
        } catch (productError) {
            // If we can't verify the product, continue with provided data
            console.warn('Could not verify product:', productError.message);
        }

        user.addToCart(productId, quantity, productData);
        await hybridDb.updateUser(req.user.id, { 
            cart: user.cart,
            updatedAt: new Date()
        });

        const cartTotal = user.getCartTotal();

        res.status(200).json({
            status: 'success',
            message: 'Item added to cart',
            data: {
                cart: user.cart,
                total: cartTotal.total,
                count: cartTotal.count
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error adding item to cart',
            error: error.message
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/users/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { productId } = req.params;
        const { quantity } = req.body;

        const user = await hybridDb.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        user.updateCartItemQuantity(productId, quantity);
        await hybridDb.updateUser(req.user.id, { 
            cart: user.cart,
            updatedAt: new Date()
        });

        const cartTotal = user.getCartTotal();

        res.status(200).json({
            status: 'success',
            message: 'Cart item updated',
            data: {
                cart: user.cart,
                total: cartTotal.total,
                count: cartTotal.count
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating cart item',
            error: error.message
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
const removeFromUserCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const user = await hybridDb.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        user.removeFromCart(productId);
        await hybridDb.updateUser(req.user.id, { 
            cart: user.cart,
            updatedAt: new Date()
        });

        const cartTotal = user.getCartTotal();

        res.status(200).json({
            status: 'success',
            message: 'Item removed from cart',
            data: {
                cart: user.cart,
                total: cartTotal.total,
                count: cartTotal.count
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error removing item from cart',
            error: error.message
        });
    }
};

// @desc    Clear user cart
// @route   DELETE /api/users/cart
// @access  Private
const clearUserCart = async (req, res) => {
    try {
        const user = await hybridDb.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        user.clearCart();
        await hybridDb.updateUser(req.user.id, { 
            cart: user.cart,
            updatedAt: new Date()
        });

        res.status(200).json({
            status: 'success',
            message: 'Cart cleared',
            data: {
                cart: [],
                total: '0.00',
                count: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error clearing cart',
            error: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    getUserCart,
    addToUserCart,
    updateCartItem,
    removeFromUserCart,
    clearUserCart
};
