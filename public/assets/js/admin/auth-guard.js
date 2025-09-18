// auth-guard.js
class AuthGuard {
  constructor() {
    this.getToken = () => localStorage.getItem('hotimpex-token');
    this.isAuthenticated = false;
    this.userRole = null;
  }

  async checkAdminAuth() {
    const token = this.getToken();
    if (!token) return this.handleUnauthed('No token present');

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000); // avoid hangs

      const res = await fetch(`${API_CONFIG.getApiUrl()}/admin/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal
      });
      clearTimeout(id);

      if (!res.ok) {
        // Only clear token + redirect on real auth failures
        if (res.status === 401 || res.status === 403) {
          return this.handleUnauthed(`Auth failed: ${res.status}`);
        }
        console.error('Admin profile request failed:', res.status);
        return false;
      }

      const data = await res.json();
      if (data.status === 'success' && data.data?.role === 'admin') {
        this.isAuthenticated = true;
        this.userRole = 'admin';
        return true;
      }
      return this.handleUnauthed('Insufficient privileges');
    } catch (err) {
      console.error('Admin auth check error:', err);
      // Don’t immediately redirect on network abort; let the page show a message
      this.showAccessDeniedMessage('Network error. Please try again.');
      return false;
    }
  }

  handleUnauthed(reason) {
    console.warn('Unauthenticated:', reason);
    localStorage.removeItem('hotimpex-token');
    // Show message but do NOT force a 3s timed redirect that cancels requests.
    this.showAccessDeniedMessage('Admin access required. Please log in.');
    return false;
  }

  showAccessDeniedMessage(msg) {
    // …keep your existing overlay DOM code, just use msg as the text…
  }

  static async initialize() {
    const guard = new AuthGuard();
    const ok = await guard.checkAdminAuth();
    if (ok) document.dispatchEvent(new CustomEvent('adminAuthSuccess'));
    return ok;
  }

  static logout() {
    localStorage.removeItem('hotimpex-token');
    window.location.href = '/';
  }
}

document.addEventListener('DOMContentLoaded', () => AuthGuard.initialize());
