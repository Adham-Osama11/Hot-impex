// API Configuration for HOT IMPEX
// Update the RAILWAY_API_URL with your actual Railway deployment URL

const API_CONFIG = {
    // REPLACE THIS WITH YOUR ACTUAL RAILWAY URL
    RAILWAY_API_URL: 'https://your-app-name.railway.app/api',
    
    // Fallback for development
    LOCAL_API_URL: 'http://localhost:3000/api',
    
    // Determine which API URL to use
    getApiUrl() {
        // In production (Netlify), use Railway API
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return this.RAILWAY_API_URL;
        }
        // In development, use local API
        return this.LOCAL_API_URL;
    },
    
    // API endpoints
    endpoints: {
        // Products
        products: '/products',
        productById: (id) => `/products/${id}`,
        productsByCategory: (category) => `/products?category=${category}`,
        
        // Users
        users: '/users',
        register: '/users/register',
        login: '/users/login',
        logout: '/users/logout',
        profile: '/users/profile',
        updateProfile: '/users/profile',
        
        // Orders
        orders: '/orders',
        createOrder: '/orders',
        orderById: (id) => `/orders/${id}`,
        userOrders: '/orders/user',
        
        // Admin
        admin: '/admin',
        adminLogin: '/admin/login',
        adminProducts: '/admin/products',
        adminOrders: '/admin/orders',
        adminUsers: '/admin/users',
        adminStats: '/admin/stats',
        
        // Health check
        health: '/health'
    }
};

// Helper function to make API calls
const apiCall = {
    async get(endpoint, options = {}) {
        const url = API_CONFIG.getApiUrl() + endpoint;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include', // Include cookies for authentication
            ...options
        });
        return response;
    },
    
    async post(endpoint, data, options = {}) {
        const url = API_CONFIG.getApiUrl() + endpoint;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data),
            credentials: 'include',
            ...options
        });
        return response;
    },
    
    async put(endpoint, data, options = {}) {
        const url = API_CONFIG.getApiUrl() + endpoint;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(data),
            credentials: 'include',
            ...options
        });
        return response;
    },
    
    async delete(endpoint, options = {}) {
        const url = API_CONFIG.getApiUrl() + endpoint;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include',
            ...options
        });
        return response;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, apiCall };
}