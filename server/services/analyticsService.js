const { ProductVisit, ProductAnalyticsSummary } = require('../models/ProductAnalytics');
const Product = require('../models/Product');

/**
 * Analytics Service
 * Handles product visit tracking and analytics data
 */
class AnalyticsService {
    
    /**
     * Track a product page visit
     * @param {Object} visitData - Visit information
     * @returns {Promise<Object>} - Created visit record
     */
    static async trackProductVisit(visitData) {
        try {
            const {
                productId,
                productName,
                productCategory,
                userId = null,
                sessionId,
                userAgent,
                ipAddress,
                referrer = null
            } = visitData;

            // Create the visit record
            const visit = new ProductVisit({
                productId,
                productName,
                productCategory,
                userId,
                sessionId,
                userAgent,
                ipAddress,
                referrer,
                visitTimestamp: new Date()
            });

            await visit.save();

            // Update the analytics summary
            await this.updateAnalyticsSummary(productId, productName, productCategory);

            // Update product analytics in the product schema
            await this.updateProductAnalytics(productId, visitData);

            return visit;
        } catch (error) {
            console.error('Error tracking product visit:', error);
            throw error;
        }
    }

    /**
     * Update analytics summary for a product
     * @param {String} productId - Product ID
     * @param {String} productName - Product name
     * @param {String} productCategory - Product category
     */
    static async updateAnalyticsSummary(productId, productName, productCategory) {
        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            // Get visit counts
            const totalVisits = await ProductVisit.countDocuments({ productId });
            const uniqueVisitors = await ProductVisit.distinct('sessionId', { productId }).then(sessions => sessions.length);
            const visitsToday = await ProductVisit.countDocuments({ 
                productId, 
                visitTimestamp: { $gte: today } 
            });
            const visitsThisWeek = await ProductVisit.countDocuments({ 
                productId, 
                visitTimestamp: { $gte: thisWeek } 
            });
            const visitsThisMonth = await ProductVisit.countDocuments({ 
                productId, 
                visitTimestamp: { $gte: thisMonth } 
            });

            // Get first and last visit dates
            const firstVisit = await ProductVisit.findOne({ productId }).sort({ visitTimestamp: 1 });
            const lastVisit = await ProductVisit.findOne({ productId }).sort({ visitTimestamp: -1 });

            // Update or create summary
            await ProductAnalyticsSummary.findOneAndUpdate(
                { productId },
                {
                    productId,
                    productName,
                    productCategory,
                    totalVisits,
                    uniqueVisitors,
                    visitsToday,
                    visitsThisWeek,
                    visitsThisMonth,
                    firstVisit: firstVisit?.visitTimestamp,
                    lastVisit: lastVisit?.visitTimestamp,
                    lastUpdated: now
                },
                { upsert: true, new: true }
            );

        } catch (error) {
            console.error('Error updating analytics summary:', error);
            throw error;
        }
    }

    /**
     * Get top visited products
     * @param {Number} limit - Number of products to return
     * @param {String} timeframe - 'all', 'today', 'week', 'month'
     * @returns {Promise<Array>} - Top visited products
     */
    static async getTopVisitedProducts(limit = 10, timeframe = 'all') {
        try {
            let sortField = 'totalVisits';
            
            switch (timeframe) {
                case 'today':
                    sortField = 'visitsToday';
                    break;
                case 'week':
                    sortField = 'visitsThisWeek';
                    break;
                case 'month':
                    sortField = 'visitsThisMonth';
                    break;
                default:
                    sortField = 'totalVisits';
            }

            const topProducts = await ProductAnalyticsSummary
                .find({})
                .sort({ [sortField]: -1 })
                .limit(limit)
                .select('productId productName productCategory totalVisits visitsToday visitsThisWeek visitsThisMonth lastVisit');

            return topProducts;
        } catch (error) {
            console.error('Error getting top visited products:', error);
            throw error;
        }
    }

    /**
     * Get analytics overview
     * @returns {Promise<Object>} - Analytics overview data
     */
    static async getAnalyticsOverview() {
        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const [
                totalVisits,
                visitsToday,
                visitsThisWeek,
                visitsThisMonth,
                uniqueProducts,
                topCategories
            ] = await Promise.all([
                ProductVisit.countDocuments({}),
                ProductVisit.countDocuments({ visitTimestamp: { $gte: today } }),
                ProductVisit.countDocuments({ visitTimestamp: { $gte: thisWeek } }),
                ProductVisit.countDocuments({ visitTimestamp: { $gte: thisMonth } }),
                ProductAnalyticsSummary.countDocuments({}),
                this.getTopCategoriesByVisits()
            ]);

            return {
                totalVisits,
                visitsToday,
                visitsThisWeek,
                visitsThisMonth,
                uniqueProducts,
                topCategories
            };
        } catch (error) {
            console.error('Error getting analytics overview:', error);
            throw error;
        }
    }

    /**
     * Get top categories by visits
     * @param {Number} limit - Number of categories to return
     * @returns {Promise<Array>} - Top categories
     */
    static async getTopCategoriesByVisits(limit = 10) {
        try {
            const topCategories = await ProductAnalyticsSummary.aggregate([
                {
                    $group: {
                        _id: '$productCategory',
                        totalVisits: { $sum: '$totalVisits' },
                        productCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { totalVisits: -1 }
                },
                {
                    $limit: limit
                },
                {
                    $project: {
                        category: '$_id',
                        totalVisits: 1,
                        productCount: 1,
                        _id: 0
                    }
                }
            ]);

            return topCategories;
        } catch (error) {
            console.error('Error getting top categories:', error);
            throw error;
        }
    }

    /**
     * Get visit trends over time
     * @param {Number} days - Number of days to look back
     * @returns {Promise<Array>} - Daily visit counts
     */
    static async getVisitTrends(days = 7) {
        try {
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

            const trends = await ProductVisit.aggregate([
                {
                    $match: {
                        visitTimestamp: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$visitTimestamp' },
                            month: { $month: '$visitTimestamp' },
                            day: { $dayOfMonth: '$visitTimestamp' }
                        },
                        visitCount: { $sum: 1 },
                        uniqueProducts: { $addToSet: '$productId' }
                    }
                },
                {
                    $project: {
                        date: {
                            $dateFromParts: {
                                year: '$_id.year',
                                month: '$_id.month',
                                day: '$_id.day'
                            }
                        },
                        visitCount: 1,
                        uniqueProductCount: { $size: '$uniqueProducts' },
                        _id: 0
                    }
                },
                {
                    $sort: { date: 1 }
                }
            ]);

            return trends;
        } catch (error) {
            console.error('Error getting visit trends:', error);
            throw error;
        }
    }

    /**
     * Update product analytics in the product schema
     * @param {String} productId - Product ID
     * @param {Object} visitData - Visit data
     */
    static async updateProductAnalytics(productId, visitData) {
        try {
            const Product = require('../models/Product');
            
            // Check if this is a unique view (new session for this product)
            const existingVisit = await ProductVisit.findOne({
                productId,
                sessionId: visitData.sessionId
            });
            
            const isUnique = !existingVisit;
            const isFirstView = await ProductVisit.countDocuments({ productId }) === 1;
            
            await Product.updateAnalytics(productId, {
                timestamp: new Date(),
                isUnique,
                isFirstView
            });
            
        } catch (error) {
            console.error('Error updating product analytics:', error);
            // Don't throw error to prevent visit tracking failure
        }
    }
}

module.exports = AnalyticsService;