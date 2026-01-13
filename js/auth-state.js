// =====================================================
// Auth State Management
// =====================================================
// Manages authentication state across the application
// =====================================================

const AuthState = {
  currentUser: null,
  currentSession: null,
  // IMPORTANT: start as "unknown" to avoid flashing logged-out UI
  // before we finish checking Supabase session on page load.
  isAuthenticated: null,
  ready: false,
  listeners: [],

  
// =====================================================
// Initialize Auth State
// =====================================================
async init(retryCount = 0) {
  const maxRetries = 100; // Increase to 10 seconds (100 * 100ms)
  
  // Wait for Auth module to be available AND initialized
  if (!window.Auth || typeof window.Auth.init !== 'function') {
    if (retryCount < maxRetries) {
      // Silently retry (don't log warnings)
      setTimeout(() => this.init(retryCount + 1), 100);
      return;
    } else {
      console.error('Auth module failed to load after maximum retries');
      return;
    }
  }

  // Check current auth state
  await this.checkAuthState();
  this.ready = true;

  // Listen to auth state changes
  window.Auth.onAuthStateChange((event, session) => {
    this.handleAuthStateChange(event, session);
  });

  // Also listen to custom event
  window.addEventListener('auth-state-changed', (e) => {
    this.handleAuthStateChange(e.detail.event, e.detail.session);
  });
},

  
// =====================================================
// Check Current Auth State
// =====================================================
async checkAuthState() {
  try {
    const sessionResult = await window.Auth.getSession();
    
    // Only get user if we have a valid session
    if (sessionResult.success && sessionResult.session) {
      this.currentSession = sessionResult.session;
      this.currentUser = sessionResult.session.user; // Get user from session
      this.isAuthenticated = true;
    } else {
      // No session - user is not authenticated
      this.currentSession = null;
      this.currentUser = null;
      this.isAuthenticated = false;
    }

    // Notify listeners
    this.notifyListeners();

    return {
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser,
      session: this.currentSession
    };
  } catch (error) {
    // Suppress expected errors
    if (error.status !== 401 && !error.message.includes('Bearer token')) {
      console.error('Error checking auth state:', error);
    }
    this.isAuthenticated = false;
    this.currentUser = null;
    this.currentSession = null;
    this.notifyListeners();
    return {
      isAuthenticated: false,
      user: null,
      session: null
    };
  }
},

// =====================================================
// Handle Auth State Change
// =====================================================
async handleAuthStateChange(event, session) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth-state.js:98',message:'handleAuthStateChange called',data:{event,hasSession:!!session,currentPage:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'K'})}).catch(()=>{});
  // #endregion
  console.log('Auth state change event:', event);

  if (session) {
    this.currentSession = session;
    // Only get user if we have a session
    const userResult = await window.Auth.getCurrentUser();
    this.currentUser = userResult.user;
    this.isAuthenticated = true;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth-state.js:106',message:'Session set, authenticated',data:{userId:this.currentUser?.id,isAuthenticated:this.isAuthenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'L'})}).catch(()=>{});
    // #endregion
  } else {
    this.currentSession = null;
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  // Once we get any auth event, we are definitely "ready"
  this.ready = true;

  // Notify all listeners
  this.notifyListeners();

  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('auth-state-updated', {
    detail: {
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser,
      session: this.currentSession,
      event: event
    }
  }));
},

  // =====================================================
  // Get Current User
  // =====================================================
  getCurrentUser() {
    return this.currentUser;
  },

  // =====================================================
  // Get Current Session
  // =====================================================
  getCurrentSession() {
    return this.currentSession;
  },

  // =====================================================
  // Check if Authenticated
  // =====================================================
  getIsAuthenticated() {
    return this.isAuthenticated;
  },

  // =====================================================
  // Add State Change Listener
  // =====================================================
  addListener(callback) {
    this.listeners.push(callback);

    // Do NOT immediately call while auth state is still unknown.
    // This prevents flashing "logged out" UI for signed-in users.
    if (this.ready && this.isAuthenticated !== null) {
      callback({
        isAuthenticated: this.isAuthenticated,
        user: this.currentUser,
        session: this.currentSession
      });
    }

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  },

  // =====================================================
  // Remove State Change Listener
  // =====================================================
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  },

  // =====================================================
  // Notify All Listeners
  // =====================================================
  notifyListeners() {
    // Don't broadcast until we've resolved auth at least once.
    if (this.isAuthenticated === null && !this.ready) return;

    const state = {
      isAuthenticated: this.isAuthenticated,
      user: this.currentUser,
      session: this.currentSession
    };

    this.listeners.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  },

  // =====================================================
  // Get User Profile
  // =====================================================
  async getUserProfile() {
    if (!this.currentUser) {
      return null;
    }

    try {
      const result = await window.Auth.getUserProfile(this.currentUser.id);
      return result.success ? result.profile : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
};

// Export globally
window.AuthState = AuthState;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AuthState.init();
  });
} else {
  AuthState.init();
}

