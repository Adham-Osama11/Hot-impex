/**
 * Analytics Service
 * Handles product visit tracking and analytics data
 */
class AnalyticsService {
    static STORAGE_KEY = 'hotimpex_analytics';
    
    /**
     * Initialize analytics system
     */
    static initialize() {
        // Ensure analytics object exists in localStorage
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
                productVisits: {},
                lastUpdated: new Date().toISOString()
            }));
        }
    }
    
    /**
     * Track a product page visit
     * @param {string} productId - The product ID
     * @param {string} productName - The product name (optional)
     */
    static trackProductVisit(productId, productName = null) {
        try {
            const analytics = this.getAnalytics();
            
            // Initialize product if it doesn't exist
            if (!analytics.productVisits[productId]) {
                analytics.productVisits[productId] = {
                    count: 0,
                    name: productName || `Product ${productId}`,
                    lastVisit: null
                };
            }
            
            // Increment visit count
            analytics.productVisits[productId].count++;
            analytics.productVisits[productId].lastVisit = new Date().toISOString();
            
            // Update product name if provided
            if (productName) {
                analytics.productVisits[productId].name = productName;
            }
            
            // Update last updated timestamp
            analytics.lastUpdated = new Date().toISOString();
            
            // Save back to localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analytics));
            
            console.log(`📊 Tracked visit to product: ${productId}`, analytics.productVisits[productId]);
        } catch (error) {
            console.error('Error tracking product visit:', error);
        }
    }
    
    /**
     * Get all analytics data
     * @returns {Object} Analytics data
     */
    static getAnalytics() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : { productVisits: {}, lastUpdated: new Date().toISOString() };
        } catch (error) {
            console.error('Error loading analytics:', error);
            return { productVisits: {}, lastUpdated: new Date().toISOString() };
        }
    }
    
    /**
     * Get product visit statistics
     * @returns {Array} Array of products with visit counts
     */
    static getProductVisitStats() {
        const analytics = this.getAnalytics();
        
        // Convert to array and sort by visit count
        return Object.entries(analytics.productVisits)
            .map(([productId, data]) => ({
                id: productId,
                name: data.name,
                visits: data.count,
                lastVisit: data.lastVisit
            }))
            .sort((a, b) => b.visits - a.visits);
    }
    
    /**
     * Get top visited products for chart display
     * @param {number} limit - Number of top products to return
     * @returns {Object} Chart data with labels and values
     */
    static getTopProductsChartData(limit = 10) {
        const stats = this.getProductVisitStats();
        const topProducts = stats.slice(0, limit);
        
        return {
            labels: topProducts.map(p => {
                // For horizontal bar chart, we can afford longer names
                return p.name.length > 30 ? p.name.substring(0, 30) + '...' : p.name;
            }),
            data: topProducts.map(p => p.visits),
            fullNames: topProducts.map(p => p.name),
            productIds: topProducts.map(p => p.id),
            totalVisits: topProducts.reduce((sum, p) => sum + p.visits, 0)
        };
    }
    
    /**
     * Clear all analytics data
     */
    static clearAnalytics() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
            productVisits: {},
            lastUpdated: new Date().toISOString()
        }));
        console.log('📊 Analytics data cleared');
    }
    
    /**
     * Generate sample analytics data for demonstration
     */
    static generateSampleData() {
        const sampleProducts = [
            { id: 'wm-001', name: 'N2 Fixed Wall Mount', visits: 45 },
            { id: 'wm-002', name: 'Premium Tilt Mount', visits: 32 },
            { id: 'cable-001', name: 'HDMI Cable 4K', visits: 28 },
            { id: 'gaming-001', name: 'Gaming Console Mount', visits: 23 },
            { id: 'ceiling-001', name: 'Ceiling Bracket Pro', visits: 19 },
            { id: 'motion-001', name: 'Full Motion Articulating', visits: 16 },
            { id: 'cart-001', name: 'Mobile TV Cart', visits: 12 },
            { id: 'motor-001', name: 'Motorized TV Lift', visits: 8 },
            { id: 'wall-001', name: 'Video Wall System', visits: 5 }
        ];
        
        const analytics = {
            productVisits: {},
            lastUpdated: new Date().toISOString()
        };
        
        sampleProducts.forEach(product => {
            analytics.productVisits[product.id] = {
                count: product.visits,
                name: product.name,
                lastVisit: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            };
        });
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analytics));
        console.log('📊 Sample analytics data generated:', analytics);
        
        // Update chart if it exists
        if (typeof ChartManager !== 'undefined' && ChartManager.updateProductPopularityChart) {
            ChartManager.updateProductPopularityChart();
        }
    }
    
    /**
     * Get total number of tracked visits
     * @returns {number} Total visits
     */
    static getTotalVisits() {
        const analytics = this.getAnalytics();
        return Object.values(analytics.productVisits).reduce((total, product) => total + product.count, 0);
    }
}

// Initialize analytics on load
document.addEventListener('DOMContentLoaded', () => {
    AnalyticsService.initialize();
});

// Export for use in other modules
window.AnalyticsService = AnalyticsService;