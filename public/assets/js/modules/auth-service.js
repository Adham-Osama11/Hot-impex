// Hot Impex Authentication Service Module
// Handles user authentication and session management

class AuthService {
    static getToken() {
        return localStorage.getItem('hotimpex-auth-token') || sessionStorage.getItem('hotimpex-auth-token');
    }

    static setToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('hotimpex-auth-token', token);
        } else {
            sessionStorage.setItem('hotimpex-auth-token', token);
        }
    }

    static removeToken() {
        localStorage.removeItem('hotimpex-auth-token');
        sessionStorage.removeItem('hotimpex-auth-token');
    }

    static isLoggedIn() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            // Basic JWT validation (check if token is expired)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (payload.exp && payload.exp < currentTime) {
                this.logout(); // Token expired, remove it
                return false;
            }
            
            return true;
        } catch (error) {
            console.warn('Invalid token format:', error);
            this.logout(); // Invalid token, remove it
            return false;
        }
    }

    static getUserInfo() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.userId || payload.id,
                email: payload.email,
                name: payload.name,
                role: payload.role || 'user'
            };
        } catch (error) {
            console.warn('Could not parse user info from token:', error);
            return null;
        }
    }

    static async login(credentials) {
        try {
            const response = await APIService.login(credentials);
            
            if (response.status === 'success' && response.data.token) {
                this.setToken(response.data.token, credentials.remember);
                
                // Migrate guest cart to user cart if needed
                if (window.CartService) {
                    await CartService.migrateGuestCartToUser();
                }
                
                return { success: true, user: response.data.user };
            } else {
                return { success: false, message: response.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error occurred' };
        }
    }

    static async register(userData) {
        try {
            const response = await APIService.register(userData);
            
            if (response.status === 'success' && response.data.token) {
                this.setToken(response.data.token, false);
                
                // Migrate guest cart to user cart if needed
                if (window.CartService) {
                    await CartService.migrateGuestCartToUser();
                }
                
                return { success: true, user: response.data.user };
            } else {
                return { success: false, message: response.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Network error occurred' };
        }
    }

    static logout() {
        this.removeToken();
        
        // Clear any user-specific data
        if (window.cart) {
            window.cart = [];
        }
        
        // Update UI
        if (window.cartUI) {
            cartUI.updateCartUI();
        }
        
        // Redirect to home or login page if needed
        const currentPage = window.location.pathname;
        if (currentPage.includes('profile') || currentPage.includes('admin')) {
            window.location.href = '/';
        }
    }

    static async refreshToken() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            // If your API supports token refresh, implement it here
            // For now, we'll just validate the current token
            return this.isLoggedIn();
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    static async getUserProfile() {
        if (!this.isLoggedIn()) {
            throw new Error('User not authenticated');
        }
        
        try {
            const response = await APIService.getUserProfile();
            
            if (response.status === 'success') {
                return response.data.user;
            } else {
                throw new Error(response.message || 'Failed to get user profile');
            }
        } catch (error) {
            console.error('Get user profile error:', error);
            throw error;
        }
    }

    static async updateProfile(profileData) {
        if (!this.isLoggedIn()) {
            throw new Error('User not authenticated');
        }
        
        try {
            const response = await APIService.updateUserProfile(profileData);
            
            if (response.status === 'success') {
                return response.data.user;
            } else {
                throw new Error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    // Initialize auth service
    static init() {
        // Check if user is logged in on page load
        if (this.isLoggedIn()) {
            console.log('User is logged in:', this.getUserInfo());
            
            // Load user cart
            if (window.CartService) {
                CartService.loadUserCart();
            }
        } else {
            console.log('User is not logged in');
            
            // Load guest cart
            if (window.CartService) {
                CartService.loadGuestCart();
            }
        }
        
        // Set up periodic token validation
        this.setupTokenValidation();
    }

    static setupTokenValidation() {
        // Check token validity every 15 minutes
        setInterval(() => {
            if (this.getToken() && !this.isLoggedIn()) {
                console.log('Token expired, logging out user');
                this.logout();
                
                // Show notification
                if (window.UIComponents) {
                    UIComponents.showNotification('Session expired. Please log in again.', 'warning');
                }
            }
        }, 15 * 60 * 1000); // 15 minutes
    }
}

// Initialize auth service when the module loads
document.addEventListener('DOMContentLoaded', () => {
    AuthService.init();
});

// Make AuthService globally available
window.AuthService = AuthService;
