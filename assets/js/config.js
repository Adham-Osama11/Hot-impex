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
     * Base API URL - Domnex Web API Frontend
     * Example: 'http://backend.hotimpex.net'
     */
    BASE_URL: '',  // Use relative URLs to work with Netlify proxy
    
    // ==================== REQUEST HEADERS ====================
    
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // ==================== API ENDPOINTS (CATALOG ONLY) ====================
    
    ENDPOINTS: {
        // API Version
        API_VERSION: '/api-frontend/Authenticate/GetApiVersion', // GET
        
        // Products
        PRODUCT_BY_ID: '/api-frontend/Product/GetProductDetails/{productId}', // GET
        PRODUCT_COMBINATIONS: '/api-frontend/Product/GetProductCombinations/{productId}', // GET
        HOME_PAGE_PRODUCTS: '/api-frontend/Product/HomePageProducts', // GET
        RELATED_PRODUCTS: '/api-frontend/Product/GetRelatedProducts/{productId}', // GET
        RECENTLY_VIEWED_PRODUCTS: '/api-frontend/Product/RecentlyViewedProducts', // GET
        
        // Categories
        CATALOG_ROOT: '/api-frontend/Catalog/GetCatalogRoot', // GET (returns all categories)
        CATEGORY_BY_ID: '/api-frontend/Catalog/GetCategory/{categoryId}', // POST
        CATEGORY_PRODUCTS: '/api-frontend/Catalog/GetCategoryProducts/{categoryId}', // POST
        CATEGORY_SUBCATEGORIES: '/api-frontend/Catalog/GetCatalogSubCategories/{id}', // GET
        HOME_PAGE_CATEGORIES: '/api-frontend/Catalog/HomePageCategories', // GET
        
        // Search
        SEARCH: '/api-frontend/Catalog/Search', // POST
        SEARCH_PRODUCTS: '/api-frontend/Catalog/SearchProducts', // POST
        SEARCH_AUTOCOMPLETE: '/api-frontend/Catalog/SearchTermAutoComplete', // GET with ?term=
        
        // New Products
        NEW_PRODUCTS: '/api-frontend/Catalog/NewProducts', // GET
        NEW_PRODUCTS_RSS: '/api-frontend/Catalog/NewProductsRss', // GET
        
        // Product Tags
        PRODUCTS_BY_TAG: '/api-frontend/Catalog/GetProductsByTag/{productTagId}', // POST
        TAG_PRODUCTS: '/api-frontend/Catalog/GetTagProducts/{productTagId}', // POST
        ALL_PRODUCT_TAGS: '/api-frontend/Catalog/ProductTagsAll', // GET
        
        // Manufacturers
        MANUFACTURER_BY_ID: '/api-frontend/Catalog/GetManufacturer/{manufacturerId}', // POST
        MANUFACTURER_PRODUCTS: '/api-frontend/Catalog/GetManufacturerProducts/{manufacturerId}', // POST
        ALL_MANUFACTURERS: '/api-frontend/Catalog/ManufacturerAll', // GET
        
        // Vendors
        VENDOR_BY_ID: '/api-frontend/Catalog/GetVendor/{vendorId}', // POST
        VENDOR_PRODUCTS: '/api-frontend/Catalog/GetVendorProducts/{vendorId}', // POST
        ALL_VENDORS: '/api-frontend/Catalog/VendorAll', // GET
        
        // Contact & Communication
        CONTACT_US: '/api-frontend/Common/ContactUs', // GET
        CONTACT_US_SEND: '/api-frontend/Common/ContactUsSend', // POST
        
        // Utility
        TOPIC_DETAILS: '/api-frontend/Topic/GetTopicDetails/{id}', // GET
        TOPIC_BY_SYSTEM_NAME: '/api-frontend/Topic/GetTopicDetailsBySystemName/{systemName}' // GET
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
