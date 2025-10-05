const AnalyticsService = require('../services/analyticsService');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Analytics Controller
 * Handles HTTP requests for analytics endpoints
 */
class AnalyticsController {

    /**
     * Track a product page visit
     * POST /api/analytics/track-visit
     */
    static async trackVisit(req, res) {
        try {
            const {
                productId,
                productName,
                productCategory,
                userId,
                sessionId
            } = req.body;

            // Validate required fields
            if (!productId || !productName || !sessionId) {
                return res.status(400).json(
                    ApiResponse.error('Product ID, name, and session ID are required', 400)
                );
            }

            // Extract additional data from request
            const visitData = {
                productId,
                productName,
                productCategory,
                userId,
                sessionId,
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip || req.connection.remoteAddress,
                referrer: req.get('Referer')
            };

            const visit = await AnalyticsService.trackProductVisit(visitData);

            res.status(201).json(
                ApiResponse.success('Visit tracked successfully', {
                    visitId: visit._id,
                    timestamp: visit.visitTimestamp
                })
            );

        } catch (error) {
            console.error('Error in trackVisit:', error);
            res.status(500).json(
                ApiResponse.error('Failed to track visit', 500)
            );
        }
    }

    /**
     * Get top visited products
     * GET /api/analytics/top-products?limit=10&timeframe=all
     */
    static async getTopProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const timeframe = req.query.timeframe || 'all';

            // Validate timeframe
            const validTimeframes = ['all', 'today', 'week', 'month'];
            if (!validTimeframes.includes(timeframe)) {
                return res.status(400).json(
                    ApiResponse.error('Invalid timeframe. Use: all, today, week, or month', 400)
                );
            }

            const topProducts = await AnalyticsService.getTopVisitedProducts(limit, timeframe);

            res.json(
                ApiResponse.success('Top products retrieved successfully', {
                    products: topProducts,
                    count: topProducts.length,
                    timeframe,
                    limit
                })
            );

        } catch (error) {
            console.error('Error in getTopProducts:', error);
            res.status(500).json(
                ApiResponse.error('Failed to retrieve top products', 500)
            );
        }
    }

    /**
     * Get analytics overview
     * GET /api/analytics/overview
     */
    static async getOverview(req, res) {
        try {
            const overview = await AnalyticsService.getAnalyticsOverview();

            res.json(
                ApiResponse.success('Analytics overview retrieved successfully', overview)
            );

        } catch (error) {
            console.error('Error in getOverview:', error);
            res.status(500).json(
                ApiResponse.error('Failed to retrieve analytics overview', 500)
            );
        }
    }

    /**
     * Get top categories by visits
     * GET /api/analytics/top-categories?limit=10
     */
    static async getTopCategories(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const topCategories = await AnalyticsService.getTopCategoriesByVisits(limit);

            res.json(
                ApiResponse.success('Top categories retrieved successfully', {
                    categories: topCategories,
                    count: topCategories.length
                })
            );

        } catch (error) {
            console.error('Error in getTopCategories:', error);
            res.status(500).json(
                ApiResponse.error('Failed to retrieve top categories', 500)
            );
        }
    }

    /**
     * Get visit trends over time
     * GET /api/analytics/trends?days=7
     */
    static async getVisitTrends(req, res) {
        try {
            const days = parseInt(req.query.days) || 7;

            if (days < 1 || days > 365) {
                return res.status(400).json(
                    ApiResponse.error('Days must be between 1 and 365', 400)
                );
            }

            const trends = await AnalyticsService.getVisitTrends(days);

            res.json(
                ApiResponse.success('Visit trends retrieved successfully', {
                    trends,
                    days,
                    count: trends.length
                })
            );

        } catch (error) {
            console.error('Error in getVisitTrends:', error);
            res.status(500).json(
                ApiResponse.error('Failed to retrieve visit trends', 500)
            );
        }
    }

    /**
     * Generate sample analytics data (development only)
     * POST /api/analytics/generate-sample-data
     */
    static async generateSampleData(req, res) {
        try {
            // Only allow in development mode
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json(
                    ApiResponse.error('Sample data generation not allowed in production', 403)
                );
            }

            const { generateSampleAnalyticsData } = require('../../scripts/generate-sample-analytics');
            await generateSampleAnalyticsData();

            res.json(
                ApiResponse.success('Sample analytics data generated successfully')
            );

        } catch (error) {
            console.error('Error in generateSampleData:', error);
            res.status(500).json(
                ApiResponse.error('Failed to generate sample data', 500)
            );
        }
    }

    /**
     * Get chart data for admin dashboard
     * GET /api/analytics/chart-data?type=top-products&limit=10
     */
    static async getChartData(req, res) {
        try {
            const chartType = req.query.type || 'top-products';
            const limit = parseInt(req.query.limit) || 10;
            const timeframe = req.query.timeframe || 'all';

            let chartData = {};

            switch (chartType) {
                case 'top-products':
                    const topProducts = await AnalyticsService.getTopVisitedProducts(limit, timeframe);
                    chartData = {
                        labels: topProducts.map(p => p.productName),
                        datasets: [{
                            label: 'Product Visits',
                            data: topProducts.map(p => {
                                switch (timeframe) {
                                    case 'today':
                                        return p.visitsToday;
                                    case 'week':
                                        return p.visitsThisWeek;
                                    case 'month':
                                        return p.visitsThisMonth;
                                    default:
                                        return p.totalVisits;
                                }
                            }),
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 205, 86, 0.8)',
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(153, 102, 255, 0.8)',
                                'rgba(255, 159, 64, 0.8)',
                                'rgba(199, 199, 199, 0.8)',
                                'rgba(83, 102, 255, 0.8)',
                                'rgba(40, 159, 64, 0.8)',
                                'rgba(210, 199, 199, 0.8)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 205, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(199, 199, 199, 1)',
                                'rgba(83, 102, 255, 1)',
                                'rgba(40, 159, 64, 1)',
                                'rgba(210, 199, 199, 1)'
                            ],
                            borderWidth: 1
                        }]
                    };
                    break;

                case 'top-categories':
                    const topCategories = await AnalyticsService.getTopCategoriesByVisits(limit);
                    chartData = {
                        labels: topCategories.map(c => c.category),
                        datasets: [{
                            label: 'Category Visits',
                            data: topCategories.map(c => c.totalVisits),
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 205, 86, 0.8)',
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(153, 102, 255, 0.8)',
                                'rgba(255, 159, 64, 0.8)',
                                'rgba(199, 199, 199, 0.8)',
                                'rgba(83, 102, 255, 0.8)',
                                'rgba(40, 159, 64, 0.8)',
                                'rgba(210, 199, 199, 0.8)'
                            ]
                        }]
                    };
                    break;

                case 'visit-trends':
                    const days = parseInt(req.query.days) || 7;
                    const trends = await AnalyticsService.getVisitTrends(days);
                    chartData = {
                        labels: trends.map(t => t.date.toISOString().split('T')[0]),
                        datasets: [{
                            label: 'Daily Visits',
                            data: trends.map(t => t.visitCount),
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1
                        }]
                    };
                    break;

                default:
                    return res.status(400).json(
                        ApiResponse.error('Invalid chart type', 400)
                    );
            }

            res.json(
                ApiResponse.success('Chart data retrieved successfully', {
                    chartType,
                    chartData,
                    metadata: {
                        limit,
                        timeframe,
                        generatedAt: new Date()
                    }
                })
            );

        } catch (error) {
            console.error('Error in getChartData:', error);
            res.status(500).json(
                ApiResponse.error('Failed to retrieve chart data', 500)
            );
        }
    }

    /**
     * Get most viewed products from product schema
     * GET /api/analytics/most-viewed?limit=10&timeframe=all
     */
    static async getMostViewedProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const timeframe = req.query.timeframe || 'all';
            
            const Product = require('../models/Product');
            const products = await Product.getMostViewed(limit, timeframe);

            res.json(
                ApiResponse.success('Most viewed products retrieved successfully', {
                    products,
                    count: products.length,
                    timeframe,
                    limit
                })
            );

        } catch (error) {
            console.error('Error in getMostViewedProducts:', error);
            res.status(500).json(
                ApiResponse.error('Failed to retrieve most viewed products', 500)
            );
        }
    }

    /**
     * Get trending products
     * GET /api/analytics/trending?limit=10
     */
    static async getTrendingProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            
            const Product = require('../models/Product');
            const products = await Product.getTrendingProducts(limit);

            res.json(
                ApiResponse.success('Trending products retrieved successfully', {
                    products,
                    count: products.length,
                    limit
                })
            );

        } catch (error) {
            console.error('Error in getTrendingProducts:', error);
            res.status(500).json(
                ApiResponse.error('Failed to retrieve trending products', 500)
            );
        }
    }

    /**
     * Get product analytics summary
     * GET /api/analytics/product/:productId
     */
    static async getProductAnalytics(req, res) {
        try {
            const { productId } = req.params;
            
            const Product = require('../models/Product');
            const product = await Product.findOne({ id: productId })
                .select('id name category analytics sold rating');

            if (!product) {
                return res.status(404).json(
                    ApiResponse.error('Product not found', 404)
                );
            }

            res.json(
                ApiResponse.success('Product analytics retrieved successfully', {
                    productId,
                    productName: product.name,
                    category: product.category,
                    analytics: product.analyticsInfo,
                    sold: product.sold,
                    rating: product.rating
                })
            );

        } catch (error) {
            console.error('Error in getProductAnalytics:', error);
            res.status(500).json(
                ApiResponse.error('Failed to retrieve product analytics', 500)
            );
        }
    }
}

module.exports = AnalyticsController;