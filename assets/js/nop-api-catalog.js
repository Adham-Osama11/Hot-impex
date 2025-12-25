/**
 * nopCommerce Catalog API Service
 * 
 * A simple API client for displaying product catalog.
 * Handles product and category requests for catalog display only.
 * No authentication, cart, or checkout functionality.
 * 
 * @version 2.0.0 (Catalog Only)
 * @author Hot Impex Development Team
 */

class NopCommerceAPI {
    /**
     * Initialize the API client
     * @param {Object} config - Configuration object from config.js
     */
    constructor(config) {
        this.baseURL = config.BASE_URL || '';
        this.endpoints = config.ENDPOINTS || {};
        this.headers = config.HEADERS || {};
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Build complete request headers
     * @private
     * @param {Object} additionalHeaders - Additional headers to merge
     * @returns {Object} Complete headers object
     */
    buildHeaders(additionalHeaders = {}) {
        return {
            ...this.headers,
            ...additionalHeaders
        };
    }

    /**
     * Replace placeholders in endpoint URLs
     * @private
     * @param {string} endpoint - Endpoint with placeholders
     * @param {Object} params - Parameters to replace
     * @returns {string} Endpoint with replaced values
     */
    replaceParams(endpoint, params = {}) {
        let result = endpoint;
        for (const [key, value] of Object.entries(params)) {
            result = result.replace(`{${key}}`, value);
        }
        return result;
    }

    /**
     * Build query string from object
     * @private
     * @param {Object} params - Query parameters
     * @returns {string} Query string
     */
    buildQueryString(params = {}) {
        const query = new URLSearchParams(params).toString();
        return query ? `?${query}` : '';
    }

    /**
     * Generic HTTP request handler
     * @private
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     * @throws {Error} API error
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.buildHeaders(options.headers)
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    /**
     * Transform nopCommerce image URL
     * @private
     * @param {string} imagePath - Image path from API
     * @returns {string} Full image URL
     */
    getImageUrl(imagePath) {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        return `${this.baseURL}${imagePath}`;
    }

    // ==================== API VERSION ====================

    /**
     * Get API version
     * @returns {Promise<Object>} API version info
     */
    async getApiVersion() {
        return await this.request(this.endpoints.API_VERSION);
    }

    // ==================== PRODUCT METHODS ====================

    /**
     * Get product details by ID
     * @param {number} productId - Product ID
     * @returns {Promise<Object>} Product details
     */
    async getProductById(productId) {
        const endpoint = this.replaceParams(this.endpoints.PRODUCT_BY_ID, { productId });
        const response = await this.request(endpoint);
        // Extract product_details_model from the response
        return response.product_details_model || response;
    }

    /**
     * Get home page products (featured products)
     * @returns {Promise<Object>} Featured products
     */
    async getHomePageProducts() {
        return await this.request(this.endpoints.HOME_PAGE_PRODUCTS);
    }

    /**
     * Get new products
     * @returns {Promise<Object>} New products
     */
    async getNewProducts() {
        return await this.request(this.endpoints.NEW_PRODUCTS);
    }

    /**
     * Search (full search with filters)
     * @param {Object} searchData - Search parameters {q, categoryId, manufacturerId, etc.}
     * @returns {Promise<Object>} Search results with products and filters
     */
    async search(searchData) {
        return await this.request(this.endpoints.SEARCH, {
            method: 'POST',
            body: JSON.stringify(searchData)
        });
    }

    /**
     * Search products (simplified product search)
     * @param {Object} searchData - Search parameters {q, pageSize, pageNumber}
     * @returns {Promise<Object>} Product search results
     */
    async searchProducts(searchData) {
        return await this.request(this.endpoints.SEARCH_PRODUCTS, {
            method: 'POST',
            body: JSON.stringify(searchData)
        });
    }

    /**
     * Get search autocomplete suggestions
     * @param {string} term - Search term (minimum 2 characters)
     * @returns {Promise<Array>} Autocomplete suggestions
     */
    async getSearchAutocomplete(term) {
        const queryString = this.buildQueryString({ term });
        return await this.request(`${this.endpoints.SEARCH_AUTOCOMPLETE}${queryString}`);
    }

    /**
     * Get related products
     * @param {number} productId - Product ID
     * @param {number} productThumbPictureSize - Thumbnail size (optional)
     * @returns {Promise<Array>} Related products
     */
    async getRelatedProducts(productId, productThumbPictureSize = null) {
        const endpoint = this.replaceParams(this.endpoints.RELATED_PRODUCTS, { productId });
        const queryString = productThumbPictureSize ? this.buildQueryString({ productThumbPictureSize }) : '';
        return await this.request(`${endpoint}${queryString}`);
    }

    /**
     * Get recently viewed products
     * @returns {Promise<Array>} Recently viewed products
     */
    async getRecentlyViewedProducts() {
        return await this.request(this.endpoints.RECENTLY_VIEWED_PRODUCTS);
    }

    /**
     * Get product combinations
     * @param {number} productId - Product ID
     * @returns {Promise<Array>} Product combinations/variants
     */
    async getProductCombinations(productId) {
        const endpoint = this.replaceParams(this.endpoints.PRODUCT_COMBINATIONS, { productId });
        return await this.request(endpoint);
    }

    // ==================== CATEGORY METHODS ====================

    /**
     * Get catalog root (all categories)
     * @param {boolean} loadImage - Whether to load category images
     * @returns {Promise<Array>} Array of categories
     */
    async getCategories(loadImage = false) {
        const queryString = this.buildQueryString({ loadImage });
        return await this.request(`${this.endpoints.CATALOG_ROOT}${queryString}`);
    }

    /**
     * Get single category by ID
     * @param {number} categoryId - Category ID
     * @returns {Promise<Object>} Category data
     */
    async getCategoryById(categoryId) {
        const endpoint = this.replaceParams(this.endpoints.CATEGORY_BY_ID, { categoryId });
        return await this.request(endpoint, {
            method: 'POST'
        });
    }

    /**
     * Get category products
     * @param {number} categoryId - Category ID
     * @param {Object} params - Additional parameters
     * @returns {Promise<Object>} Category products
     */
    async getCategoryProducts(categoryId, params = {}) {
        const endpoint = this.replaceParams(this.endpoints.CATEGORY_PRODUCTS, { categoryId });
        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    /**
     * Get category subcategories
     * @param {number} id - Category ID
     * @returns {Promise<Object>} Subcategories
     */
    async getCategorySubcategories(id) {
        const endpoint = this.replaceParams(this.endpoints.CATEGORY_SUBCATEGORIES, { id });
        return await this.request(endpoint);
    }

    /**
     * Get home page categories
     * @returns {Promise<Object>} Home page categories
     */
    async getHomePageCategories() {
        return await this.request(this.endpoints.HOME_PAGE_CATEGORIES);
    }

    // ==================== PRODUCT TAGS METHODS ====================

    /**
     * Get all product tags
     * @returns {Promise<Array>} All popular product tags
     */
    async getAllProductTags() {
        return await this.request(this.endpoints.ALL_PRODUCT_TAGS);
    }

    /**
     * Get products by tag ID
     * @param {number} productTagId - Tag ID
     * @param {Object} params - Additional parameters
     * @returns {Promise<Object>} Products with the tag
     */
    async getProductsByTag(productTagId, params = {}) {
        const endpoint = this.replaceParams(this.endpoints.PRODUCTS_BY_TAG, { productTagId });
        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    /**
     * Get tag products
     * @param {number} productTagId - Tag ID
     * @param {Object} params - Additional parameters
     * @returns {Promise<Object>} Tag products
     */
    async getTagProducts(productTagId, params = {}) {
        const endpoint = this.replaceParams(this.endpoints.TAG_PRODUCTS, { productTagId });
        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    // ==================== MANUFACTURER & VENDOR METHODS ====================

    /**
     * Get all manufacturers
     * @returns {Promise<Array>} Manufacturers data
     */
    async getAllManufacturers() {
        return await this.request(this.endpoints.ALL_MANUFACTURERS);
    }

    /**
     * Get manufacturer by ID
     * @param {number} manufacturerId - Manufacturer ID
     * @returns {Promise<Object>} Manufacturer data
     */
    async getManufacturerById(manufacturerId) {
        const endpoint = this.replaceParams(this.endpoints.MANUFACTURER_BY_ID, { manufacturerId });
        return await this.request(endpoint, {
            method: 'POST'
        });
    }

    /**
     * Get manufacturer products
     * @param {number} manufacturerId - Manufacturer ID
     * @param {Object} params - Additional parameters
     * @returns {Promise<Object>} Products data
     */
    async getManufacturerProducts(manufacturerId, params = {}) {
        const endpoint = this.replaceParams(this.endpoints.MANUFACTURER_PRODUCTS, { manufacturerId });
        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    /**
     * Get all vendors
     * @returns {Promise<Array>} Vendors data
     */
    async getAllVendors() {
        return await this.request(this.endpoints.ALL_VENDORS);
    }

    /**
     * Get vendor by ID
     * @param {number} vendorId - Vendor ID
     * @returns {Promise<Object>} Vendor data
     */
    async getVendorById(vendorId) {
        const endpoint = this.replaceParams(this.endpoints.VENDOR_BY_ID, { vendorId });
        return await this.request(endpoint, {
            method: 'POST'
        });
    }

    /**
     * Get vendor products
     * @param {number} vendorId - Vendor ID
     * @param {Object} params - Additional parameters
     * @returns {Promise<Object>} Products data
     */
    async getVendorProducts(vendorId, params = {}) {
        const endpoint = this.replaceParams(this.endpoints.VENDOR_PRODUCTS, { vendorId });
        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(params)
        });
    }

    // ==================== CONTACT & COMMUNICATION METHODS ====================

    /**
     * Get contact us page model
     * @returns {Promise<Object>} Contact page data
     */
    async getContactUs() {
        return await this.request(this.endpoints.CONTACT_US);
    }

    /**
     * Send contact form
     * @param {Object} contactData - Contact form data
     * @returns {Promise<Object>} Response message
     */
    async sendContactForm(contactData) {
        return await this.request(this.endpoints.CONTACT_US_SEND, {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Get topic details by ID
     * @param {number} id - Topic ID
     * @returns {Promise<Object>} Topic data
     */
    async getTopicDetails(id) {
        const endpoint = this.replaceParams(this.endpoints.TOPIC_DETAILS, { id });
        return await this.request(endpoint);
    }

    /**
     * Get topic details by system name
     * @param {string} systemName - Topic system name
     * @returns {Promise<Object>} Topic data
     */
    async getTopicBySystemName(systemName) {
        const endpoint = this.replaceParams(this.endpoints.TOPIC_BY_SYSTEM_NAME, { systemName });
        return await this.request(endpoint);
    }

    /**
     * Check API health and version
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        try {
            return await this.getApiVersion();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'unhealthy', error: error.message };
        }
    }
}

// ==================== EXPORT AND INITIALIZATION ====================

// Initialize global API instance when config is available
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof API_CONFIG !== 'undefined') {
            window.nopAPI = new NopCommerceAPI(API_CONFIG);
            console.log('[nopCommerce API] Catalog service initialized');
        } else {
            console.error('[nopCommerce API] API_CONFIG not found. Please include config.js before this script.');
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NopCommerceAPI;
}
