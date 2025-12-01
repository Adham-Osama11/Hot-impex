/**
 * Authentication Guard for Admin Pages (Netlify + Railway safe)
 * - Uses API_CONFIG.getApiUrl() so calls always hit your Railway API
 * - NO timed redirect (prevents client-abort/499)
 * - Only clears token on real auth failures (401/403 or non-admin)
 */

class AuthGuard {
  constructor() {
    this.isAuthenticated = false;
    this.userRole = null;
  }

  apiUrl(path) {
    // API_CONFIG is loaded first in admin.html
    const base = (window.API_CONFIG && API_CONFIG.getApiUrl()) || '/api';
    const cleanBase = base.replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  }

  get token() {
    return localStorage.getItem('hotimpex-token');
  }

  async checkAdminAuth() {
    if (!this.token) {
      this.showAccessDeniedMessage('Please sign in to continue.');
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(this.apiUrl('/admin/profile'), {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.token}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.status === 401 || res.status === 403) {
        this.cleanLogout('You need admin privileges to access this page.');
        return false;
      }

      if (!res.ok) {
        console.warn('Admin profile check failed (non-auth issue):', res.status);
        this.showAccessDeniedMessage('Could not verify admin session. Please try again.');
        return false;
      }

      const result = await res.json();
      if (result?.status === 'success' && result?.data?.role === 'admin') {
        this.isAuthenticated = true;
        this.userRole = 'admin';
        return true;
      }

      this.cleanLogout('Insufficient privileges.');
      return false;
    } catch (err) {
      console.error('Admin auth check error:', err);
      // Do not clear token or auto-redirect on network/cancel — just show message
      this.showAccessDeniedMessage('Network error while verifying admin. Please retry.');
      return false;
    }
  }

  cleanLogout(msg = '') {
    try {
      localStorage.removeItem('hotimpex-token');
      localStorage.removeItem('adminToken');
    } catch (_) {}
    this.showAccessDeniedMessage(msg || 'Admin access required.');
  }

  showAccessDeniedMessage(extra = '') {
    if (document.getElementById('admin-access-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'admin-access-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Inter', sans-serif;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: white; padding: 3rem 2rem; border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,.25); text-align: center; max-width: 420px; width: 90%;
    `;
    box.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
      <h2 style="font-size: 1.5rem; font-weight: bold; color: #1f2937; margin-bottom: .75rem;">
        Admin Access Required
      </h2>
      <p style="color:#6b7280; margin-bottom: 1rem;">
        ${extra || 'Please log in with an admin account.'}
      </p>
      <div style="background:#fef3c7; padding:1rem; border-radius:.5rem; margin-bottom:1.25rem;">
        <p style="color:#92400e; font-size:.875rem;">
          You can go back to the homepage and sign in again.
        </p>
      </div>
      <button id="go-main-btn" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white; padding: .75rem 1.5rem; border: none; border-radius: .5rem;
        font-weight: 600; cursor: pointer; transition: transform .2s;
      ">Go to Main Site</button>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const btn = document.getElementById('go-main-btn');
    if (btn) {
      btn.addEventListener('mouseover', () => (btn.style.transform = 'scale(1.05)'));
      btn.addEventListener('mouseout', () => (btn.style.transform = 'scale(1)'));
      btn.addEventListener('click', () => (window.location.href = '/index.html'));
    }
  }

  static async initialize() {
    const guard = new AuthGuard();
    const ok = await guard.checkAdminAuth();
    if (ok) document.dispatchEvent(new CustomEvent('adminAuthSuccess'));
    return ok;
  }

  static logout() {
    localStorage.removeItem('hotimpex-token');
    localStorage.removeItem('adminToken');
    window.location.href = '/index.html';
  }
}

document.addEventListener('DOMContentLoaded', () => AuthGuard.initialize());
