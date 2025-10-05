/**
 * Analytics Service
 * Handles product visit tracking and analytics data using database API
 */
class AnalyticsService {
    static API_BASE = '/api/analytics';
    
    /**
     * Generate or get session ID for tracking anonymous users
     */
    static getSessionId() {
        let sessionId = localStorage.getItem('hotimpex_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('hotimpex_session_id', sessionId);
        }
        return sessionId;
    }
    
    /**
     * Track a product page visit
     * @param {string} productId - The product ID
     * @param {string} productName - The product name
     * @param {string} productCategory - The product category
     */
    static async trackProductVisit(productId, productName, productCategory = null) {
        try {
            const visitData = {
                productId,
                productName,
                productCategory,
                sessionId: this.getSessionId(),
                userId: this.getCurrentUserId() // Get from auth if available
            };

            const response = await fetch(`${this.API_BASE}/track-visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(visitData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(`📊 Tracked visit to product: ${productId}`, result);
            
            return result;
        } catch (error) {
            console.error('Error tracking product visit:', error);
            // Fallback to localStorage for offline functionality
            this.trackVisitOffline(productId, productName);
        }
    }
    
    /**
     * Fallback method to track visits offline using localStorage
     * @param {string} productId 
     * @param {string} productName 
     */
    static trackVisitOffline(productId, productName) {
        try {
            const offlineKey = 'hotimpex_offline_visits';
            let offlineVisits = JSON.parse(localStorage.getItem(offlineKey) || '[]');
            
            offlineVisits.push({
                productId,
                productName,
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId()
            });
            
            // Keep only last 100 offline visits
            if (offlineVisits.length > 100) {
                offlineVisits = offlineVisits.slice(-100);
            }
            
            localStorage.setItem(offlineKey, JSON.stringify(offlineVisits));
            console.log('📊 Visit tracked offline:', { productId, productName });
        } catch (error) {
            console.error('Error tracking visit offline:', error);
        }
    }
    
    /**
     * Get current user ID if authenticated
     * @returns {string|null} User ID or null
     */
    static getCurrentUserId() {
        // Check if user is logged in (implement based on your auth system)
        const userData = localStorage.getItem('hotimpex_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.id || user._id;
            } catch (e) {
                return null;
            }
        }
        return null;
    }
    
    /**
     * Get top visited products for chart display
     * @param {number} limit - Number of top products to return
     * @param {string} timeframe - 'all', 'today', 'week', 'month'
     * @returns {Object} Chart data with labels and values
     */
    static async getTopProductsChartData(limit = 10, timeframe = 'all') {
        try {
            const response = await fetch(`${this.API_BASE}/chart-data?type=top-products&limit=${limit}&timeframe=${timeframe}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success' && result.message.chartData) {
                const chartData = result.message.chartData;
                return {
                    labels: chartData.labels,
                    data: chartData.datasets[0].data,
                    backgroundColor: chartData.datasets[0].backgroundColor,
                    borderColor: chartData.datasets[0].borderColor,
                    totalVisits: chartData.datasets[0].data.reduce((sum, val) => sum + val, 0)
                };
            }
            
            throw new Error('Invalid response format');
            
        } catch (error) {
            console.error('Error fetching chart data:', error);
            // Fallback to empty data
            return {
                labels: ['No Data'],
                data: [0],
                backgroundColor: ['rgba(200, 200, 200, 0.8)'],
                borderColor: ['rgba(200, 200, 200, 1)'],
                totalVisits: 0
            };
        }
    }
    
    /**
     * Get analytics overview
     * @returns {Object} Analytics overview data
     */
    static async getAnalyticsOverview() {
        try {
            const response = await fetch(`${this.API_BASE}/overview`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            }
            
            throw new Error('Failed to fetch analytics overview');
            
        } catch (error) {
            console.error('Error fetching analytics overview:', error);
            return {
                totalVisits: 0,
                visitsToday: 0,
                visitsThisWeek: 0,
                visitsThisMonth: 0,
                uniqueProducts: 0,
                topCategories: []
            };
        }
    }
    
    /**
     * Get top categories by visits
     * @param {number} limit - Number of categories to return
     * @returns {Array} Top categories
     */
    static async getTopCategories(limit = 10) {
        try {
            const response = await fetch(`${this.API_BASE}/top-categories?limit=${limit}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                return result.data.categories;
            }
            
            throw new Error('Failed to fetch top categories');
            
        } catch (error) {
            console.error('Error fetching top categories:', error);
            return [];
        }
    }
    
    /**
     * Get visit trends over time
     * @param {number} days - Number of days to look back
     * @returns {Array} Visit trends
     */
    static async getVisitTrends(days = 7) {
        try {
            const response = await fetch(`${this.API_BASE}/trends?days=${days}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                return result.data.trends;
            }
            
            throw new Error('Failed to fetch visit trends');
            
        } catch (error) {
            console.error('Error fetching visit trends:', error);
            return [];
        }
    }
    
    /**
     * Sync offline visits with server (call this when connection is restored)
     */
    static async syncOfflineVisits() {
        try {
            const offlineKey = 'hotimpex_offline_visits';
            const offlineVisits = JSON.parse(localStorage.getItem(offlineKey) || '[]');
            
            if (offlineVisits.length === 0) {
                return;
            }
            
            console.log(`📊 Syncing ${offlineVisits.length} offline visits...`);
            
            for (const visit of offlineVisits) {
                await this.trackProductVisit(visit.productId, visit.productName);
                // Small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Clear offline visits after successful sync
            localStorage.removeItem(offlineKey);
            console.log('📊 Offline visits synced successfully');
            
        } catch (error) {
            console.error('Error syncing offline visits:', error);
        }
    }
    
    /**
     * Initialize analytics system
     */
    static initialize() {
        // Sync offline visits on initialization
        this.syncOfflineVisits();
        
        // Set up periodic sync for offline visits
        setInterval(() => {
            this.syncOfflineVisits();
        }, 5 * 60 * 1000); // Sync every 5 minutes
    }
}

// Initialize analytics on load
document.addEventListener('DOMContentLoaded', () => {
    AnalyticsService.initialize();
});

// Export for use in other modules
window.AnalyticsService = AnalyticsService;