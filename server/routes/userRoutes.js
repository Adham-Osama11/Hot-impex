const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword
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

module.exports = router;
