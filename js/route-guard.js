// =====================================================
// Route Guard
// =====================================================
// Protects routes that require authentication
// =====================================================

const RouteGuard = {
  protectedRoutes: [
    'detail_course.html',
    'detail_course-lesson.html',
    'dashboard.html'
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
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
  },

  // =====================================================
  // Check if Route is Protected
  // =====================================================
  isProtectedRoute(page) {
    return this.protectedRoutes.some(route => page.includes(route));
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
      window.location.href = 'signin.html';
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

