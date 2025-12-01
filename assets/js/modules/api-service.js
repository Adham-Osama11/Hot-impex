// Hot Impex API Service Module
// Handles all API communication with the backend

// Use the API configuration from config.js
// This will automatically use Railway URL in production and localhost in development

// API Service Functions
class APIService {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_CONFIG.getApiUrl()}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Return the server error response instead of throwing a generic error
                return data;
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        return await this.request(endpoint);
    }

    static async getProduct(id) {
        return await this.request(`/products/${id}`);
    }

    static async getCategories() {
        return await this.request('/products/categories');
    }

    static async searchProducts(query) {
        return await this.request(`/products/search/${encodeURIComponent(query)}`);
    }

    static async getFeaturedProducts() {
        return await this.getProducts({ featured: 'true', limit: 4 });
    }

    static async getBestSellers() {
        return await this.getProducts({ bestSeller: 'true', limit: 4 });
    }

    // Cart API methods
    static async getCart() {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/users/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async addToCart(productId, quantity = 1, productData = {}) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        console.log('APIService.addToCart called with:', { productId, quantity, productData });
        
        const requestBody = { productId, quantity, productData };
        console.log('Request body:', JSON.stringify(requestBody));
        
        return await this.request('/users/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
    }

    static async updateCartItem(productId, quantity) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request(`/users/cart/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity })
        });
    }

    static async removeFromCart(productId) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request(`/users/cart/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async clearCart() {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/users/cart', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    // Order API methods
    static async createOrder(orderData) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
    }

    static async getUserOrders() {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async getOrder(orderId) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request(`/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async cancelOrder(orderId) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request(`/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    // User API methods
    static async login(credentials) {
        return await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    static async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async getUserProfile() {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async updateUserProfile(profileData) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/users/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
    }
}

// Make APIService globally available
window.APIService = APIService;
