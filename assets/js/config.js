/**
 * HOT IMPEX - API Configuration
 * 
 * Configuration file for nopCommerce backend API integration.
 * Update BASE_URL and API_KEY with values provided by backend team.
 * 
 * @version 1.0.0
 */

const API_CONFIG = {
    // ==================== BASE CONFIGURATION ====================
    
    /**
     * Base API URL - UPDATE THIS WITH YOUR NOPCOMMERCE API URL
     * Example: 'https://api.hotimpex.com/api'
     */
    BASE_URL: 'https://your-nopcommerce-server.com/api',
    
    /**
     * API Key - UPDATE THIS WITH YOUR API KEY
     * Get this from your backend team
     */
    API_KEY: 'your-api-key-here',
    
    // ==================== REQUEST HEADERS ====================
    
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // ==================== API ENDPOINTS ====================
    
    ENDPOINTS: {
        // Authentication & User Management
        LOGIN: '/customers/login',
        REGISTER: '/customers/register',
        LOGOUT: '/customers/logout',
        CURRENT_USER: '/customers/current',
        FORGOT_PASSWORD: '/customers/forgotpassword',
        RESET_PASSWORD: '/customers/resetpassword',
        
        // Products
        PRODUCTS: '/products',
        PRODUCT_BY_ID: '/products/{id}',
        PRODUCT_SEARCH: '/products/search',
        
        // Categories
        CATEGORIES: '/categories',
        CATEGORY_BY_ID: '/categories/{id}',
        
        // Customer Profile
        CUSTOMER_PROFILE: '/customers/{id}',
        CUSTOMER_ADDRESSES: '/customers/{id}/addresses',
        CUSTOMER_AVATAR: '/customers/{id}/avatar',
        
        // Contact & Communication
        CONTACT_SEND: '/contact/send',
        NEWSLETTER: '/newsletter/subscribe',
        
        // Admin - Products
        ADMIN_PRODUCTS: '/admin/products',
        ADMIN_PRODUCT_BY_ID: '/admin/products/{id}',
        
        // Admin - Categories
        ADMIN_CATEGORIES: '/admin/categories',
        ADMIN_CATEGORY_BY_ID: '/admin/categories/{id}',
        
        // Admin - Customers
        ADMIN_CUSTOMERS: '/admin/customers',
        ADMIN_CUSTOMER_BY_ID: '/admin/customers/{id}',
        
        // Admin - Statistics
        ADMIN_STATISTICS: '/admin/statistics/dashboard',
        
        // Images & Media
        IMAGE_THUMB: '/images/thumbs',
        IMAGE_FULL: '/images/full',
        
        // Utility
        HEALTH: '/health',
        STORE_INFO: '/store/info'
    },
    
    // ==================== PAGINATION SETTINGS ====================
    
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 12,
        MAX_PAGE_SIZE: 50,
        DEFAULT_PAGE: 1
    },
    
    // ==================== ENVIRONMENT DETECTION ====================
    
    /**
     * Check if running in production
     * @returns {boolean} True if in production
     */
    isProduction() {
        return window.location.hostname !== 'localhost' 
            && window.location.hostname !== '127.0.0.1';
    },
    
    /**
     * Get current environment name
     * @returns {string} Environment name
     */
    getEnvironment() {
        return this.isProduction() ? 'production' : 'development';
    }
};

// ==================== EXPORT ====================

// Make config available globally
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    console.log(`[API Config] Loaded for ${API_CONFIG.getEnvironment()} environment`);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
