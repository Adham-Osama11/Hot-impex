/**
 * Authentication Guard for Admin Pages
 * Prevents unauthorized access to admin functionality
 */
class AuthGuard {
    constructor() {
        this.token = localStorage.getItem('hotimpex-token');
        this.isAuthenticated = false;
        this.userRole = null;
    }

    /**
     * Check if user is authenticated and has admin privileges
     */
    async checkAdminAuth() {
        try {
            if (!this.token) {
                this.redirectToLogin();
                return false;
            }

            // Verify token and get user info
            const response = await fetch('/api/admin/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success' && result.data.role === 'admin') {
                    this.isAuthenticated = true;
                    this.userRole = result.data.role;
                    return true;
                } else {
                    throw new Error('Insufficient privileges');
                }
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            console.error('Admin authentication check failed:', error);
            this.redirectToLogin();
            return false;
        }
    }

    /**
     * Redirect to login page with admin access message
     */
    redirectToLogin() {
        // Clear any invalid tokens
        localStorage.removeItem('hotimpex-token');
        localStorage.removeItem('adminToken');
        
        // Show admin access required message
        this.showAccessDeniedMessage();
        
        // Redirect to main site after delay
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 3000);
    }

    /**
     * Show access denied message
     */
    showAccessDeniedMessage() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Inter', sans-serif;
        `;

        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.style.cssText = `
            background: white;
            padding: 3rem 2rem;
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;

        messageContainer.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
            <h2 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 1rem;">
                Admin Access Required
            </h2>
            <p style="color: #6b7280; margin-bottom: 1.5rem;">
                You need admin privileges to access this page. Please log in with an admin account.
            </p>
            <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <p style="color: #92400e; font-size: 0.875rem;">
                    Redirecting to main site in 3 seconds...
                </p>
            </div>
            <button onclick="window.location.href='/index.html'" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                Go to Main Site
            </button>
        `;

        overlay.appendChild(messageContainer);
        document.body.appendChild(overlay);
    }

    /**
     * Initialize auth guard on page load
     */
    static async initialize() {
        const guard = new AuthGuard();
        const isAuthorized = await guard.checkAdminAuth();
        
        if (!isAuthorized) {
            // Stop page initialization if not authorized
            return false;
        }
        
        return true;
    }

    /**
     * Add logout functionality
     */
    static logout() {
        localStorage.removeItem('hotimpex-token');
        localStorage.removeItem('adminToken');
        window.location.href = '/index.html';
    }
}

// Auto-initialize auth guard when script loads
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthorized = await AuthGuard.initialize();
    
    if (isAuthorized) {
        // Dispatch custom event for successful authentication
        document.dispatchEvent(new CustomEvent('adminAuthSuccess'));
    }
});
