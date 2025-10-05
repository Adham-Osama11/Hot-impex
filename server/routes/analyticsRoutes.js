const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');

/**
 * Analytics Routes
 * All routes are prefixed with /api/analytics
 */

// Track a product page visit
// POST /api/analytics/track-visit
router.post('/track-visit', AnalyticsController.trackVisit);

// Get top visited products
// GET /api/analytics/top-products?limit=10&timeframe=all
router.get('/top-products', AnalyticsController.getTopProducts);

// Get analytics overview
// GET /api/analytics/overview
router.get('/overview', AnalyticsController.getOverview);

// Get top categories by visits
// GET /api/analytics/top-categories?limit=10
router.get('/top-categories', AnalyticsController.getTopCategories);

// Get visit trends over time
// GET /api/analytics/trends?days=7
router.get('/trends', AnalyticsController.getVisitTrends);

// Get chart data for admin dashboard
// GET /api/analytics/chart-data?type=top-products&limit=10&timeframe=all
router.get('/chart-data', AnalyticsController.getChartData);

// Generate sample analytics data (development only)
// POST /api/analytics/generate-sample-data
router.post('/generate-sample-data', AnalyticsController.generateSampleData);

// Get most viewed products from product schema
// GET /api/analytics/most-viewed?limit=10&timeframe=all
router.get('/most-viewed', AnalyticsController.getMostViewedProducts);

// Get trending products
// GET /api/analytics/trending?limit=10
router.get('/trending', AnalyticsController.getTrendingProducts);

// Get product analytics summary
// GET /api/analytics/product/:productId
router.get('/product/:productId', AnalyticsController.getProductAnalytics);

module.exports = router;