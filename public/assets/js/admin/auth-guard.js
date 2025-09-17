/**
 * Authentication Guard for Admin Pages (Netlify + Railway safe)
 * - Resolves absolute API base (works with or without Netlify proxy)
 * - Uses Bearer token from localStorage('hotimpex-token')
 * - Only logs out on real auth failures (401/403 or not admin)
 * - Handles network/CORS errors gracefully
 */

class AuthGuard {
  constructor() {
    this.token = localStorage.getItem('hotimpex-token');
    this.isAuthenticated = false;
    this.userRole = null;

    // Bind once
    this.redirectToLogin = this.redirectToLogin.bind(this);
    this.showAccessDeniedMessage = this.showAccessDeniedMessage.bind(this);
  }

  /**
   * Build a safe API URL regardless of hosting:
   * - If window.API_CONFIG?.baseURL (your app config) exists, use it
   * - Else if window.API_BASE_URL/global or localStorage('api-base-url') set, use it
   * - Else fall back to same-origin "/api" (works if Netlify proxy is configured)
   */
  resolveApiUrl(path) {
    const fromConfig =
      (window.API_CONFIG && window.API_CONFIG.baseURL) || // if your frontend exposes it
      window.API_BASE_URL ||
      localStorage.getItem('api-base-url') ||
      '';

    // If fromConfig already includes '/api', avoid doubling it
    if (fromConfig) {
      const trimmed = fromConfig.replace(/\/+$/, '');
      const normalizedPath = path.replace(/^\/+/, '');
      return `${trimmed}/${normalizedPath}`;
    }

    // Fallback to same-origin (assumes Netlify _redirects proxy: /api/* -> Railway)
    // If you don't proxy, set localStorage.setItem('api-base-url','https://<railway>/api')
    return `/api/${path.replace(/^\/?api\/?/, '')}`;
  }

  /**
   * Check if user is authenticated and has admin privileges
   */
  async checkAdminAuth() {
    try {
      if (!this.token) {
        this.redirectToLogin('Missing token');
        return false;
      }

      const url = this.resolveApiUrl('/api/admin/profile'); // mounted in app.js
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        // If your API ever sets cookies alongside tokens, keep credentials on:
        // credentials: 'include',
      });

      // Handle explicit auth failures first
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        // Non-auth errors (e.g., 404 from wrong origin / missing proxy) -> do NOT logout
        const text = await response.text().catch(() => '');
        console.warn('Admin profile request failed (non-auth):', response.status, text);
        this.showAccessDeniedMessage(
          'Could not verify admin session. Check API base or Netlify proxy.'
        );
        // Gentle redirect but keep token (maybe just a routing/proxy issue)
        setTimeout(() => (window.location.href = '/index.html'), 3000);
        return false;
      }

      const result = await response.json();
      // Expect your ApiResponse.success shape
      // { status:'success', data: { role:'admin', ... } }
      if (result?.status === 'success' && result?.data?.role === 'admin') {
        this.isAuthenticated = true;
        this.userRole = 'admin';
        return true;
      }

      throw new Error('Insufficient privileges');
    } catch (error) {
      // Only clear tokens on *real* auth problems
      const isAuthError =
        /auth/i.test(error.message) ||
        /privilege/i.test(error.message) ||
        /Unauthorized/i.test(error.message);

      console.error('Admin authentication check failed:', error);

      if (isAuthError) {
        this.redirectToLogin();
      } else {
        // Network/CORS/timeouts: keep token, inform user, soft-redirect
        this.showAccessDeniedMessage(
          'Network issue while verifying admin. Retrying later — taking you to the homepage.'
        );
        setTimeout(() => (window.location.href = '/index.html'), 3000);
      }
      return false;
    }
  }

  /**
   * Redirect to login page with admin access message
   */
  redirectToLogin(reason = '') {
    try {
      // Clear only known admin tokens
      localStorage.removeItem('hotimpex-token');
      localStorage.removeItem('adminToken');
    } catch (_) {}

    this.showAccessDeniedMessage(
      reason && /missing token/i.test(reason)
        ? 'Please sign in to continue.'
        : 'You need admin privileges to access this page.'
    );

    // Redirect to main site after delay
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 3000);
  }

  /**
   * Show access denied message
   */
  showAccessDeniedMessage(extra = '') {
    // Avoid stacking multiple overlays
    if (document.getElementById('admin-access-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'admin-access-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Inter', sans-serif;
    `;

    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
      background: white; padding: 3rem 2rem; border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,.25); text-align: center; max-width: 420px; width: 90%;
    `;

    messageContainer.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
      <h2 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: 0.75rem;">
        Admin Access Required
      </h2>
      <p style="color: #6b7280; margin-bottom: 1rem;">
        ${extra || 'Please log in with an admin account.'}
      </p>
      <div style="background: #fef3c7; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
        <p style="color: #92400e; font-size: 0.875rem;">
          Redirecting to main site in 3 seconds...
        </p>
      </div>
      <button id="go-main-btn" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem;
        font-weight: 600; cursor: pointer; transition: transform .2s;
      ">
        Go to Main Site
      </button>
    `;

    overlay.appendChild(messageContainer);
    document.body.appendChild(overlay);

    const btn = document.getElementById('go-main-btn');
    if (btn) {
      btn.addEventListener('mouseover', () => (btn.style.transform = 'scale(1.05)'));
      btn.addEventListener('mouseout', () => (btn.style.transform = 'scale(1)'));
      btn.addEventListener('click', () => (window.location.href = '/index.html'));
    }
  }

  /**
   * Initialize auth guard on page load
   */
  static async initialize() {
    const guard = new AuthGuard();
    const isAuthorized = await guard.checkAdminAuth();
    if (!isAuthorized) return false;

    // Dispatch custom event for successful authentication
    document.dispatchEvent(new CustomEvent('adminAuthSuccess'));
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
document.addEventListener('DOMContentLoaded', () => {
  AuthGuard.initialize();
});
