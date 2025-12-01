/**
 * nopCommerce API Service
 * 
 * A comprehensive API client for interacting with nopCommerce backend.
 * Handles all HTTP requests, authentication, error handling, and data transformation.
 * 
 * @version 1.0.0
 * @author Hot Impex Development Team
 */

class NopCommerceAPI {
    /**
     * Initialize the API client
     * @param {Object} config - Configuration object from config.js
     */
    constructor(config) {
        this.baseURL = config.BASE_URL || '';
        this.apiKey = config.API_KEY || '';
        this.endpoints = config.ENDPOINTS || {};
        this.headers = config.HEADERS || {};
        this.token = this.getStoredToken();
        this.currentUser = this.getStoredUser();
    }

    // ==================== PRIVATE HELPER METHODS ====================

    /**
     * Get stored authentication token from localStorage
     * @private
     * @returns {string|null} Authentication token
     */
    getStoredToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Store authentication token in localStorage
     * @private
     * @param {string} token - Authentication token
     */
    setStoredToken(token) {
        if (token) {
            this.token = token;
            localStorage.setItem('authToken', token);
        } else {
            this.token = null;
            localStorage.removeItem('authToken');
        }
    }

    /**
     * Get stored user data from localStorage
     * @private
     * @returns {Object|null} User data
     */
    getStoredUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Store user data in localStorage
     * @private
     * @param {Object} user - User data
     */
    setStoredUser(user) {
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
        }
    }

    /**
     * Build complete request headers
     * @private
     * @param {Object} additionalHeaders - Additional headers to merge
     * @returns {Object} Complete headers object
     */
    buildHeaders(additionalHeaders = {}) {
        const headers = {
            ...this.headers,
            ...additionalHeaders
        };

        // Add authentication
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        } else if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        return headers;
    }

    /**
     * Replace placeholders in endpoint URLs
     * @private
     * @param {string} endpoint - Endpoint with placeholders
     * @param {Object} params - Parameters to replace
     * @returns {string} Endpoint with replaced values
     */
    replaceParams(endpoint, params = {}) {
        let url = endpoint;
        Object.keys(params).forEach(key => {
            url = url.replace(`{${key}}`, params[key]);
        });
        return url;
    }

    /**
     * Build query string from object
     * @private
     * @param {Object} params - Query parameters
     * @returns {string} Query string
     */
    buildQueryString(params = {}) {
        const filtered = Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null && value !== '')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
        const queryString = new URLSearchParams(filtered).toString();
        return queryString ? `?${queryString}` : '';
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
            console.log(`[API Request] ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(url, config);
            
            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');

            if (!response.ok) {
                const errorData = isJson ? await response.json() : { error: await response.text() };
                throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = isJson ? await response.json() : await response.text();
            console.log(`[API Response] Success:`, data);
            
            return data;

        } catch (error) {
            console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error);
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
        if (!imagePath) {
            return `${this.baseURL}${this.endpoints.IMAGE_THUMB}/default.jpg`;
        }

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        const cleanPath = imagePath.replace(/^\/+/, '');
        return `${this.baseURL}${this.endpoints.IMAGE_THUMB}/${cleanPath}`;
    }

    // ==================== AUTHENTICATION METHODS ====================

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data with token
     */
    async login(email, password) {
        try {
            const response = await this.request(this.endpoints.LOGIN, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.token) {
                this.setStoredToken(response.token);
                this.setStoredUser(response.customer);
            }

            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} User data with token
     */
    async register(userData) {
        try {
            const response = await this.request(this.endpoints.REGISTER, {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            if (response.token) {
                this.setStoredToken(response.token);
                this.setStoredUser(response.customer);
            }

            return response;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    /**
     * Logout current user
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            if (this.token) {
                await this.request(this.endpoints.LOGOUT, {
                    method: 'POST'
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.setStoredToken(null);
            this.setStoredUser(null);
        }
    }

    /**
     * Get current authenticated user
     * @returns {Promise<Object>} User data
     */
    async getCurrentUser() {
        try {
            const user = await this.request(this.endpoints.CURRENT_USER);
            this.setStoredUser(user);
            return user;
        } catch (error) {
            console.error('Failed to get current user:', error);
            throw error;
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} Response message
     */
    async forgotPassword(email) {
        return await this.request(this.endpoints.FORGOT_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response message
     */
    async resetPassword(token, newPassword) {
        return await this.request(this.endpoints.RESET_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ token, newPassword })
        });
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Check if current user is admin
     * @returns {boolean} Admin status
     */
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin === true;
    }

    // ==================== PRODUCT METHODS ====================

    /**
     * Get all products with optional filters
     * @param {Object} params - Query parameters (page, pageSize, categoryid, q, etc.)
     * @returns {Promise<Object>} Products data with pagination
     */
    async getProducts(params = {}) {
        const queryString = this.buildQueryString(params);
        const endpoint = `${this.endpoints.PRODUCTS}${queryString}`;
        return await this.request(endpoint);
    }

    /**
     * Get single product by ID
     * @param {number} id - Product ID
     * @returns {Promise<Object>} Product data
     */
    async getProductById(id) {
        const endpoint = this.replaceParams(this.endpoints.PRODUCT_BY_ID, { id });
        return await this.request(endpoint);
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @param {Object} params - Additional parameters
     * @returns {Promise<Object>} Search results
     */
    async searchProducts(query, params = {}) {
        const searchParams = this.buildQueryString({
            q: query,
            ...params
        });
        const endpoint = `${this.endpoints.PRODUCT_SEARCH}${searchParams}`;
        return await this.request(endpoint);
    }

    /**
     * Get products by category
     * @param {number} categoryId - Category ID
     * @param {Object} params - Additional parameters
     * @returns {Promise<Object>} Products data
     */
    async getProductsByCategory(categoryId, params = {}) {
        const queryParams = this.buildQueryString({
            categoryid: categoryId,
            ...params
        });
        const endpoint = `${this.endpoints.PRODUCTS}${queryParams}`;
        return await this.request(endpoint);
    }

    // ==================== CATEGORY METHODS ====================

    /**
     * Get all categories
     * @returns {Promise<Object>} Categories data
     */
    async getCategories() {
        return await this.request(this.endpoints.CATEGORIES);
    }

    /**
     * Get single category by ID
     * @param {number} id - Category ID
     * @returns {Promise<Object>} Category data
     */
    async getCategoryById(id) {
        const endpoint = this.replaceParams(this.endpoints.CATEGORY_BY_ID, { id });
        return await this.request(endpoint);
    }

    // ==================== CUSTOMER PROFILE METHODS ====================

    /**
     * Get customer profile
     * @param {number} id - Customer ID
     * @returns {Promise<Object>} Customer data
     */
    async getCustomerProfile(id) {
        const endpoint = this.replaceParams(this.endpoints.CUSTOMER_PROFILE, { id });
        return await this.request(endpoint);
    }

    /**
     * Update customer profile
     * @param {number} id - Customer ID
     * @param {Object} data - Updated profile data
     * @returns {Promise<Object>} Updated customer data
     */
    async updateCustomerProfile(id, data) {
        const endpoint = this.replaceParams(this.endpoints.CUSTOMER_PROFILE, { id });
        return await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Get customer addresses
     * @param {number} id - Customer ID
     * @returns {Promise<Object>} Addresses data
     */
    async getCustomerAddresses(id) {
        const endpoint = this.replaceParams(this.endpoints.CUSTOMER_ADDRESSES, { id });
        return await this.request(endpoint);
    }

    /**
     * Add customer address
     * @param {number} id - Customer ID
     * @param {Object} addressData - Address data
     * @returns {Promise<Object>} Created address
     */
    async addCustomerAddress(id, addressData) {
        const endpoint = this.replaceParams(this.endpoints.CUSTOMER_ADDRESSES, { id });
        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(addressData)
        });
    }

    /**
     * Update customer address
     * @param {number} customerId - Customer ID
     * @param {number} addressId - Address ID
     * @param {Object} addressData - Updated address data
     * @returns {Promise<Object>} Updated address
     */
    async updateCustomerAddress(customerId, addressId, addressData) {
        const endpoint = `${this.replaceParams(this.endpoints.CUSTOMER_ADDRESSES, { id: customerId })}/${addressId}`;
        return await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(addressData)
        });
    }

    /**
     * Delete customer address
     * @param {number} customerId - Customer ID
     * @param {number} addressId - Address ID
     * @returns {Promise<Object>} Response message
     */
    async deleteCustomerAddress(customerId, addressId) {
        const endpoint = `${this.replaceParams(this.endpoints.CUSTOMER_ADDRESSES, { id: customerId })}/${addressId}`;
        return await this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Upload customer avatar
     * @param {number} id - Customer ID
     * @param {File} file - Image file
     * @returns {Promise<Object>} Avatar URL
     */
    async uploadCustomerAvatar(id, file) {
        const endpoint = this.replaceParams(this.endpoints.CUSTOMER_AVATAR, { id });
        const formData = new FormData();
        formData.append('avatar', file);

        return await this.request(endpoint, {
            method: 'POST',
            headers: {
                // Don't set Content-Type, let browser set it with boundary
            },
            body: formData
        });
    }

    // ==================== CONTACT & COMMUNICATION METHODS ====================

    /**
     * Send contact form
     * @param {Object} contactData - Contact form data
     * @returns {Promise<Object>} Response message
     */
    async sendContactForm(contactData) {
        return await this.request(this.endpoints.CONTACT_SEND, {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    }

    /**
     * Subscribe to newsletter
     * @param {string} email - Email address
     * @returns {Promise<Object>} Response message
     */
    async subscribeNewsletter(email) {
        return await this.request(this.endpoints.NEWSLETTER, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    // ==================== ADMIN METHODS ====================

    /**
     * Get all products (admin view)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Products data
     */
    async adminGetProducts(params = {}) {
        const queryString = this.buildQueryString(params);
        const endpoint = `${this.endpoints.ADMIN_PRODUCTS}${queryString}`;
        return await this.request(endpoint);
    }

    /**
     * Create new product (admin)
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} Created product
     */
    async adminCreateProduct(productData) {
        return await this.request(this.endpoints.ADMIN_PRODUCTS, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    /**
     * Update product (admin)
     * @param {number} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise<Object>} Updated product
     */
    async adminUpdateProduct(id, productData) {
        const endpoint = `${this.endpoints.ADMIN_PRODUCTS}/${id}`;
        return await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    /**
     * Delete product (admin)
     * @param {number} id - Product ID
     * @returns {Promise<Object>} Response message
     */
    async adminDeleteProduct(id) {
        const endpoint = `${this.endpoints.ADMIN_PRODUCTS}/${id}`;
        return await this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Get all categories (admin view)
     * @returns {Promise<Object>} Categories data
     */
    async adminGetCategories() {
        return await this.request(this.endpoints.ADMIN_CATEGORIES);
    }

    /**
     * Create new category (admin)
     * @param {Object} categoryData - Category data
     * @returns {Promise<Object>} Created category
     */
    async adminCreateCategory(categoryData) {
        return await this.request(this.endpoints.ADMIN_CATEGORIES, {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    }

    /**
     * Update category (admin)
     * @param {number} id - Category ID
     * @param {Object} categoryData - Updated category data
     * @returns {Promise<Object>} Updated category
     */
    async adminUpdateCategory(id, categoryData) {
        const endpoint = `${this.endpoints.ADMIN_CATEGORIES}/${id}`;
        return await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
    }

    /**
     * Delete category (admin)
     * @param {number} id - Category ID
     * @returns {Promise<Object>} Response message
     */
    async adminDeleteCategory(id) {
        const endpoint = `${this.endpoints.ADMIN_CATEGORIES}/${id}`;
        return await this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Get all customers (admin view)
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Customers data
     */
    async adminGetCustomers(params = {}) {
        const queryString = this.buildQueryString(params);
        const endpoint = `${this.endpoints.ADMIN_CUSTOMERS}${queryString}`;
        return await this.request(endpoint);
    }

    /**
     * Update customer (admin)
     * @param {number} id - Customer ID
     * @param {Object} customerData - Updated customer data
     * @returns {Promise<Object>} Updated customer
     */
    async adminUpdateCustomer(id, customerData) {
        const endpoint = `${this.endpoints.ADMIN_CUSTOMERS}/${id}`;
        return await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(customerData)
        });
    }

    /**
     * Delete customer (admin)
     * @param {number} id - Customer ID
     * @returns {Promise<Object>} Response message
     */
    async adminDeleteCustomer(id) {
        const endpoint = `${this.endpoints.ADMIN_CUSTOMERS}/${id}`;
        return await this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Get dashboard statistics (admin)
     * @returns {Promise<Object>} Statistics data
     */
    async adminGetStatistics() {
        return await this.request(this.endpoints.ADMIN_STATISTICS);
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Check API health
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        try {
            return await this.request('/health');
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'unhealthy', error: error.message };
        }
    }

    /**
     * Get store information
     * @returns {Promise<Object>} Store data
     */
    async getStoreInfo() {
        return await this.request('/store/info');
    }
}

// ==================== EXPORT AND INITIALIZATION ====================

// Initialize global API instance when config is available
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        if (window.API_CONFIG) {
            window.nopAPI = new NopCommerceAPI(window.API_CONFIG);
            console.log('[nopCommerce API] Initialized successfully');
        } else {
            console.error('[nopCommerce API] API_CONFIG not found. Please load config.js first.');
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NopCommerceAPI;
}
