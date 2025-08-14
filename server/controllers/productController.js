const hybridDb = require('../services/hybridDbService');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { category, search, featured, bestSeller, limit, page = 1, sortBy, sortOrder } = req.query;
        
        const options = {
            category,
            search,
            featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
            bestSeller: bestSeller === 'true' ? true : bestSeller === 'false' ? false : undefined,
            limit: limit ? parseInt(limit) : 10,
            page: parseInt(page),
            sortBy,
            sortOrder
        };

        const result = await hybridDb.getAllProducts(options);

        res.status(200).json({
            status: 'success',
            results: result.products.length,
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            data: {
                products: result.products
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
    try {
        const product = await hybridDb.getProductById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                product
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res) => {
    try {
        const products = await hybridDb.getProductsByCategory(req.params.category);
        
        res.status(200).json({
            status: 'success',
            results: products.length,
            data: {
                products
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching products by category',
            error: error.message
        });
    }
};

// @desc    Search products
// @route   GET /api/products/search/:query
// @access  Public
const searchProducts = async (req, res) => {
    try {
        const products = await hybridDb.searchProducts(req.params.query);
        
        res.status(200).json({
            status: 'success',
            results: products.length,
            data: {
                products
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error searching products',
            error: error.message
        });
    }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await hybridDb.getCategories();
        
        res.status(200).json({
            status: 'success',
            data: {
                categories
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

module.exports = {
    getProducts,
    getProduct,
    getProductsByCategory,
    searchProducts,
    getCategories
};
