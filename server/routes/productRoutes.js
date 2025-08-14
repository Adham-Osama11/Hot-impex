const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    getProductsByCategory,
    searchProducts,
    getCategories
} = require('../controllers/productController');

// @route   GET /api/products
router.get('/', getProducts);

// @route   GET /api/products/categories
router.get('/categories', getCategories);

// @route   GET /api/products/search/:query
router.get('/search/:query', searchProducts);

// @route   GET /api/products/category/:category
router.get('/category/:category', getProductsByCategory);

// @route   GET /api/products/:id
router.get('/:id', getProduct);

module.exports = router;
