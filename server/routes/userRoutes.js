const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
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
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// @route   POST /api/users/register
router.post('/register', [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').optional().isMobilePhone().withMessage('Please enter a valid phone number')
], registerUser);

// @route   POST /api/users/login
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], loginUser);

// @route   GET /api/users/profile
router.get('/profile', auth, getUserProfile);

// @route   PUT /api/users/profile
router.put('/profile', auth, updateUserProfile);

// @route   PUT /api/users/change-password
router.put('/change-password', auth, changePassword);

// Cart Routes
// @route   GET /api/users/cart
router.get('/cart', auth, getUserCart);

// @route   POST /api/users/cart
router.post('/cart', auth, [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('productData').optional().isObject().withMessage('Product data must be an object')
], addToUserCart);

// @route   PUT /api/users/cart/:productId
router.put('/cart/:productId', auth, [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
], updateCartItem);

// @route   DELETE /api/users/cart/:productId
router.delete('/cart/:productId', auth, removeFromUserCart);

// @route   DELETE /api/users/cart
router.delete('/cart', auth, clearUserCart);

module.exports = router;
