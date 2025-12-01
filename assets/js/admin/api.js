/**
 * Admin API Client
 * Handles all API communication for the admin dashboard
 */
class AdminAPI {
    constructor() {
        // Use the API configuration for the base URL
        this.baseURL = API_CONFIG.getApiUrl() + '/admin';
        this.token = localStorage.getItem('hotimpex-token'); // Use unified token
    }

    /**
     * Make a request to the admin API
     * @param {string} endpoint - API endpoint
     * @param {object} options - Request options
     * @returns {Promise<object>} - Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Always check for fresh token from localStorage
        this.token = localStorage.getItem('hotimpex-token'); // Use unified token
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Dashboard Stats
    async getDashboardStats() {
        return this.request('/stats');
    }

    // Admin Profile
    async getCurrentAdmin() {
        return this.request('/profile');
    }

    // Orders Management
    async getAllOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/orders${queryString ? `?${queryString}` : ''}`);
    }

    async getOrderById(orderId) {
        return this.request(`/orders/${orderId}`);
    }

    async updateOrderStatus(orderId, status) {
        return this.request(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Users Management
    async getAllUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/users${queryString ? `?${queryString}` : ''}`);
    }

    async getUserById(userId) {
        return this.request(`/users/${userId}`);
    }

    async createUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async updateUser(userId, userData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deleteUser(userId) {
        return this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // Products Management
    async getProducts() {
        return this.request('/products');
    }

    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    // Settings Management
    async getSettings() {
        return this.request('/settings');
    }

    async updateSettings(settings) {
        return this.request('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }
}

// Export the API instance
window.AdminAPI = AdminAPI;
