// =====================================================
// Auth State Management
// =====================================================
// Manages authentication state across the application
// =====================================================

const AuthState = {
  currentUser: null,
  currentSession: null,
  isAuthenticated: false,
  listeners: [],

  // =====================================================
  // Initialize Auth State
  // =====================================================
  async init() {
    // Wait for Auth module to be available
    if (!window.Auth) {
      console.warn('Auth module not loaded, retrying...');
      setTimeout(() => this.init(), 100);
      return;
    }

    // Check current auth state
    await this.checkAuthState();

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
      const userResult = await window.Auth.getCurrentUser();

      this.currentSession = sessionResult.session;
      this.currentUser = userResult.user;
      this.isAuthenticated = sessionResult.success && sessionResult.session !== null;

      // Notify listeners
      this.notifyListeners();

      return {
        isAuthenticated: this.isAuthenticated,
        user: this.currentUser,
        session: this.currentSession
      };
    } catch (error) {
      console.error('Error checking auth state:', error);
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
    console.log('Auth state change event:', event);

    if (session) {
      this.currentSession = session;
      const userResult = await window.Auth.getCurrentUser();
      this.currentUser = userResult.user;
      this.isAuthenticated = true;
    } else {
      this.currentSession = null;
      this.currentUser = null;
      this.isAuthenticated = false;
    }

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
    
    // Immediately call with current state
    if (this.isAuthenticated !== undefined) {
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

