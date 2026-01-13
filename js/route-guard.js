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
    // Refresh auth state before deciding (avoids false redirects on slow loads)
    try {
      if (window.AuthState?.checkAuthState) {
        await window.AuthState.checkAuthState();
      }
    } catch (e) {
      // If refresh fails, we'll fall back to current state + retry loop below
      console.warn('RouteGuard: checkAuthState failed, falling back:', e?.message || e);
    }

    // Small retry loop to avoid race conditions (e.g. rapid clicks on curriculum links)
    let isAuthenticated = window.AuthState?.getIsAuthenticated() ?? false;
    for (let i = 0; i < 10 && !isAuthenticated; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      try {
        if (window.AuthState?.checkAuthState) {
          await window.AuthState.checkAuthState();
        }
      } catch (_) {
        // ignore
      }
      isAuthenticated = window.AuthState?.getIsAuthenticated() ?? false;
    }

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/route-guard.js:123',message:'redirectAfterLogin called',data:{defaultUrl,currentHref:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    const redirectUrl = this.getRedirectUrl();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/route-guard.js:125',message:'About to redirect',data:{redirectUrl:redirectUrl||defaultUrl,finalUrl:redirectUrl||defaultUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
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

