// =====================================================
// Route Guard
// =====================================================
// Protects routes that require authentication
// =====================================================

const RouteGuard = {
  // Protect BOTH pretty URLs and .html pages by using base names.
  // Netlify can serve `detail_course.html` at `/detail_course` (pretty URLs),
  // and can also add trailing slashes.
  protectedRoutes: [
    'detail_course',
    'detail_course-lesson',
    'dashboard'
  ],

  // =====================================================
  // Initialize Route Guard
  // =====================================================
  async init() {
    // Wait for AuthState to be ready
    if (!window.AuthState) {
      setTimeout(() => this.init(), 100);
      return;
    }

    // Check if current page is protected
    const currentPage = this.getCurrentPage();
    
    if (this.isProtectedRoute(currentPage)) {
      await this.checkAuth();
    }
  },

  // =====================================================
  // Get Current Page
  // =====================================================
  getCurrentPage() {
    // Works for:
    // - /detail_course.html
    // - /detail_course
    // - /detail_course/
    // - /
    const segments = window.location.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || 'index';

    // Normalize: remove `.html` if present
    return last.replace(/\.html$/i, '');
  },

  // =====================================================
  // Check if Route is Protected
  // =====================================================
  isProtectedRoute(page) {
    const normalized = (page || '').replace(/\.html$/i, '');
    return this.protectedRoutes.some(route => normalized.includes(route));
  },

  // =====================================================
  // Check Authentication
  // =====================================================
  async checkAuth() {
    // Wait a bit for AuthState to initialize
    await new Promise(resolve => setTimeout(resolve, 200));

    const isAuthenticated = window.AuthState?.getIsAuthenticated() ?? false;

    if (!isAuthenticated) {
      // Store intended destination
      const currentUrl = window.location.href;
      sessionStorage.setItem('redirectAfterLogin', currentUrl);

      // Redirect to sign in
      // Use absolute path so it works even when current URL is `/detail_course/` etc.
      window.location.href = '/signin.html';
      return false;
    }

    return true;
  },

  // =====================================================
  // Require Auth (for programmatic checks)
  // =====================================================
  async requireAuth() {
    return await this.checkAuth();
  },

  // =====================================================
  // Get Redirect URL After Login
  // =====================================================
  getRedirectUrl() {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
      sessionStorage.removeItem('redirectAfterLogin');
      return redirectUrl;
    }
    return null;
  },

  // =====================================================
  // Redirect After Login
  // =====================================================
  redirectAfterLogin(defaultUrl = 'index.html') {
    const redirectUrl = this.getRedirectUrl();
    window.location.href = redirectUrl || defaultUrl;
  },

  // =====================================================
  // Add Protected Route
  // =====================================================
  addProtectedRoute(route) {
    if (!this.protectedRoutes.includes(route)) {
      this.protectedRoutes.push(route);
    }
  },

  // =====================================================
  // Remove Protected Route
  // =====================================================
  removeProtectedRoute(route) {
    this.protectedRoutes = this.protectedRoutes.filter(r => r !== route);
  }
};

// Export globally
window.RouteGuard = RouteGuard;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    RouteGuard.init();
  });
} else {
  RouteGuard.init();
}

