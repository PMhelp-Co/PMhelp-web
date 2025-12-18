// =====================================================
// Authentication Module
// =====================================================
// Centralized authentication functions for PMHelp
// =====================================================

const Auth = {
  // =====================================================
  // Sign In with Email/Password
  // =====================================================
  async signIn(email, password) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      // Store session
      this.storeSession(data.session);

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in'
      };
    }
  },

  // =====================================================
  // Sign Up with Email/Password
  // =====================================================
  async signUp(email, password, metadata = {}) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      // Set email redirect URL for confirmation
      // IMPORTANT: this must be a real file path for static hosting (Live Server),
      // otherwise you'll see "Cannot GET /auth/confirm".
      const emailRedirectTo = `${window.location.origin}/auth/confirm.html`;

      const { data, error } = await window.supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: metadata,
          emailRedirectTo: emailRedirectTo
        }
      });

      if (error) throw error;

      // Create profile if user was created
      if (data.user) {
        await this.createProfile(data.user, metadata);
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create account'
      };
    }
  },

  // =====================================================
  // Sign Out
  // =====================================================
  async signOut() {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await window.supabaseClient.auth.signOut();

      if (error) throw error;

      // Clear stored session
      this.clearSession();

      return {
        success: true
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out'
      };
    }
  },

  // =====================================================
  // Reset Password (Send Reset Email)
  // =====================================================
  async resetPassword(email, redirectUrl = null) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      // Default redirect URL
      if (!redirectUrl) {
        // Route password recovery back through /auth/confirm.html so it can
        // set the session from the URL fragment, then redirect to reset-password.html.
        redirectUrl = `${window.location.origin}/auth/confirm.html`;
      }

      const { data, error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send reset email'
      };
    }
  },

  // =====================================================
  // Update Password
  // =====================================================
  async updatePassword(newPassword) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await window.supabaseClient.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update password'
      };
    }
  },

  // =====================================================
  // Sign In with OAuth (Google, etc.)
  // =====================================================
  async signInWithOAuth(provider = 'google', redirectUrl = null) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      // Default redirect URL
      if (!redirectUrl) {
        // Ensure we're using the correct origin
        const origin = window.location.origin; // This should be http://localhost:8000 or http://127.0.0.1:8000
        redirectUrl = `${origin}/index.html`;
        
        // Debug: log the redirect URL
        console.log('OAuth redirect URL:', redirectUrl);
      }
     

      const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) throw error;

      return {
        success: true,
        url: data.url
      };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in with OAuth'
      };
    }
  },

// =====================================================
// Get Current User
// =====================================================
async getCurrentUser() {
  try {
    if (!window.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { data: { user }, error } = await window.supabaseClient.auth.getUser();

    if (error) {
      // Don't log 401 errors - they're expected when user is not logged in
      if (error.status !== 401 && error.message !== 'Invalid API key') {
        console.error('Get user error:', error);
      }
      throw error;
    }

    return {
      success: true,
      user: user
    };
  } catch (error) {
    // Only log non-401 errors
    if (error.status !== 401 && error.message !== 'Invalid API key' && !error.message.includes('Bearer token')) {
      console.error('Get user error:', error);
    }
    return {
      success: false,
      error: error.message,
      user: null
    };
  }
},

// =====================================================
// Get Current Session
// =====================================================
async getSession() {
  try {
    if (!window.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { data: { session }, error } = await window.supabaseClient.auth.getSession();

    if (error) {
      // Don't log 401 errors - they're expected when user is not logged in
      if (error.status !== 401 && !error.message.includes('Bearer token')) {
        console.error('Get session error:', error);
      }
      return {
        success: false,
        error: error.message,
        session: null
      };
    }

    return {
      success: true,
      session: session
    };
  } catch (error) {
    // Suppress 401 errors - they're expected when not logged in
    if (error.status !== 401 && !error.message.includes('Bearer token')) {
      console.error('Get session error:', error);
    }
    return {
      success: false,
      error: error.message,
      session: null
    };
  }
},

  // =====================================================
  // Check if User is Authenticated
  // =====================================================
  async isAuthenticated() {
    const sessionResult = await this.getSession();
    return sessionResult.success && sessionResult.session !== null;
  },

  // =====================================================
  // Create User Profile
  // =====================================================
  async createProfile(user, metadata = {}) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await window.supabaseClient
        .from('profiles')
        .insert({
          id: user.id,
          full_name: metadata.full_name || user.user_metadata?.full_name || null,
          role: 'student',
          avatar_url: user.user_metadata?.avatar_url || null
        });

      if (error) {
        // If profile already exists, try to update instead
        if (error.code === '23505') { // Unique violation
          console.log('Profile already exists, skipping creation');
          return { success: true };
        }
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Create profile error:', error);
      // Don't throw - profile creation failure shouldn't block signup
      return {
        success: false,
        error: error.message
      };
    }
  },

  // =====================================================
  // Get User Profile
  // =====================================================
  async getUserProfile(userId = null) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      // If no userId provided, get current user
      if (!userId) {
        const userResult = await this.getCurrentUser();
        if (!userResult.success || !userResult.user) {
          throw new Error('No user found');
        }
        userId = userResult.user.id;
      }

      const { data, error } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.message,
        profile: null
      };
    }
  },

  // =====================================================
  // Update User Profile
  // =====================================================
  async updateProfile(userId, updates) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      // If no userId provided, get current user
      if (!userId) {
        const userResult = await this.getCurrentUser();
        if (!userResult.success || !userResult.user) {
          throw new Error('No user found');
        }
        userId = userResult.user.id;
      }

      const { data, error } = await window.supabaseClient
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // =====================================================
  // Store Session in LocalStorage
  // =====================================================
  storeSession(session) {
    if (session) {
      try {
        localStorage.setItem('supabase.auth.session', JSON.stringify(session));
        localStorage.setItem('supabase.auth.token', session.access_token);
      } catch (error) {
        console.error('Error storing session:', error);
      }
    }
  },

  // =====================================================
  // Get Stored Session from LocalStorage
  // =====================================================
  getStoredSession() {
    try {
      const sessionStr = localStorage.getItem('supabase.auth.session');
      if (sessionStr) {
        return JSON.parse(sessionStr);
      }
    } catch (error) {
      console.error('Error reading stored session:', error);
    }
    return null;
  },

  // =====================================================
  // Clear Stored Session
  // =====================================================
  clearSession() {
    try {
      localStorage.removeItem('supabase.auth.session');
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },

  // =====================================================
  // Listen to Auth State Changes
  // =====================================================
  onAuthStateChange(callback) {
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return null;
    }

    const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange((event, session) => {
      // Store session when it changes
      if (session) {
        this.storeSession(session);
      } else {
        this.clearSession();
      }

      // Call the callback
      if (callback) {
        callback(event, session);
      }
    });

    return subscription;
  },

  // =====================================================
  // Initialize Auth State Listener
  // =====================================================
  init() {
    // Set up auth state change listener
    this.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'User signed in' : 'User signed out');
      
      // Dispatch custom event for other parts of the app
      window.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { event, session }
      }));
    });

    // Restore session on page load
    this.restoreSession();
  },

  // =====================================================
  // Restore Session on Page Load
  // =====================================================
  async restoreSession() {
    try {
      const sessionResult = await this.getSession();
      if (sessionResult.success && sessionResult.session) {
        this.storeSession(sessionResult.session);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  }
};

// Export globally
window.Auth = Auth;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
  });
} else {
  Auth.init();
}

