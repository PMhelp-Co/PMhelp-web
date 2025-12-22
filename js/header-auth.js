// =====================================================
// Header Auth UI Management
// =====================================================
// Updates header based on authentication state
// =====================================================

const HeaderAuth = {
  headerRightCol: null,
  userMenu: null,
  initialized: false,
  documentClickHandler: null,
  authStateListener: null,
  _updateInProgress: false,
  _needsUpdate: false,
  _latestState: null,

  // =====================================================
  // Initialize Header Auth
  // =====================================================
  init() {
    // Prevent duplicate initialization
    if (this.initialized) {
      return;
    }
    
    // Find header right column (where auth buttons go)
    this.headerRightCol = document.querySelector('.brix---header-right-col');
    
    if (!this.headerRightCol) {
      console.warn('Header right column not found');
      return;
    }

    // Wait for AuthState to be ready
    if (!window.AuthState) {
      setTimeout(() => this.init(), 100);
      return;
    }

    // Create listener function once and store reference
    this.authStateListener = (state) => {
      this.updateHeader(state);
    };

    // Listen to auth state changes (only once)
    window.AuthState.addListener(this.authStateListener);

    this.initialized = true;
  },

  // =====================================================
  // Update Header Based on Auth State
  // =====================================================
  updateHeader(state = null) {
    if (!this.headerRightCol) return;

    // Always keep the latest state so we render the most recent auth info.
    this._latestState = state;

    // Serialize updates (prevents duplicate menus when async rendering overlaps).
    if (this._updateInProgress) {
      this._needsUpdate = true;
      return;
    }

    this._updateInProgress = true;

    requestAnimationFrame(() => {
      (async () => {
        do {
          this._needsUpdate = false;
          await this._performUpdate(this._latestState);
        } while (this._needsUpdate);

        this._updateInProgress = false;
      })();
    });
  },

  // =====================================================
  // Perform the actual update
  // =====================================================
  async _performUpdate(state) {
    // Clear existing auth UI FIRST
    this.clearAuthUI();
    
    // Get current auth state
    const isAuthenticated = state?.isAuthenticated ?? window.AuthState?.getIsAuthenticated() ?? false;
    const user = state?.user ?? window.AuthState?.getCurrentUser();

    // Keep the early "no flicker" class in sync with actual auth state
    document.documentElement.classList.toggle('auth-has-session', !!(isAuthenticated && user));

    if (isAuthenticated && user) {
      await this.showAuthenticatedUI(user);
    } else {
      this.showUnauthenticatedUI();
    }
  },

  // =====================================================
  // Helpers: hide/show header CTAs across pages
  // =====================================================
  _getHeaderRoot() {
    // Scope DOM changes to the header to avoid affecting page content CTAs.
    return this.headerRightCol?.closest('.brix---header-wrapper') || document;
  },

  _setUnauthHeaderCtasVisible(visible) {
    const root = this._getHeaderRoot();

    // Different pages use different wrappers for the unauth CTAs.
    const candidates = [
      ...root.querySelectorAll('.header-auth-buttons'),
      ...root.querySelectorAll('.menu-buttons-wrapper'),
      ...root.querySelectorAll('.brix---btn-header-hidden-on-mbl'),
    ];

    candidates.forEach((el) => {
      const links = Array.from(el.querySelectorAll('a[href]'));

      const hasAuthCta = links.some((a) => {
        const href = (a.getAttribute('href') || '').toLowerCase();
        const txt = (a.textContent || '').toLowerCase().trim();

        return (
          href.includes('signin') ||
          href.includes('signup') ||
          txt.includes('start your journey') ||
          txt === 'sign in' ||
          txt === 'sign up' ||
          txt === 'signup'
        );
      });

      if (hasAuthCta) {
        el.style.display = visible ? '' : 'none';
      }
    });
  },

  // =====================================================
  // Clear Auth UI
  // =====================================================
  clearAuthUI() {
    if (!this.headerRightCol) return;
    
    // Remove document click handler if it exists
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
      this.documentClickHandler = null;
    }
    
    // Remove ALL existing auth buttons/menus (not just the first one)
    const existingAuthElements = this.headerRightCol.querySelectorAll('.header-auth-ui');
    existingAuthElements.forEach(element => {
      element.remove();
    });
    
    // Also remove any user-menu-container that might be orphaned
    const orphanedMenus = this.headerRightCol.querySelectorAll('.user-menu-container');
    orphanedMenus.forEach(element => {
      element.remove();
    });
    
    // Remove mobile menu auth elements
    const mobileMenu = document.querySelector('.brix---header-menu-wrapper.w-nav-menu');
    if (mobileMenu) {
      const mobileSignIn = mobileMenu.querySelector('.header-auth-mobile-signin');
      if (mobileSignIn) {
        mobileSignIn.remove();
      }
      const mobileDivider = mobileMenu.querySelector('.header-auth-mobile-divider');
      if (mobileDivider) {
        mobileDivider.remove();
      }
      const mobileCtas = mobileMenu.querySelector('.header-auth-mobile-ctas');
      if (mobileCtas) {
        mobileCtas.remove();
      }
      // Also remove mobile user menu if it exists
      const mobileUserMenu = mobileMenu.querySelector('.header-auth-mobile-user');
      if (mobileUserMenu) {
        mobileUserMenu.remove();
      }
    }
    
    // Clear the userMenu reference
    this.userMenu = null;
  },

  // =====================================================
  // Show Unauthenticated UI (Sign In Button)
  // =====================================================
  showUnauthenticatedUI() {
    // We no longer hardcode auth CTAs in HTML.
    // If the user is logged out, inject them into the header + mobile menu.

    // --- Desktop header CTAs (hidden on mobile by Webflow class) ---
    const makeCta = (href, text) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'brix---btn-header-hidden-on-mbl header-auth-ui header-auth-unauth';

      const link = document.createElement('a');
      link.href = href;
      link.className = 'brix---btn-primary-small w-button';
      link.textContent = text;

      const svg = document.createElement('div');
      svg.className = 'svg';
      svg.innerHTML = '<img width="11" height="8.79999828338623" alt="" src="images/Vectors-Wrapper.svg" loading="lazy" class="vectors-wrapper-2">';

      wrapper.appendChild(link);
      wrapper.appendChild(svg);
      return wrapper;
    };

    const hamburgerMenu = this.headerRightCol.querySelector('.brix---hamburger-menu-wrapper');
    const signInCta = makeCta('signin.html', 'Sign In');
    const startJourneyCta = makeCta('signup.html', 'Start your Journey');

    if (hamburgerMenu) {
      // Order: Sign In first, then Start your Journey (as requested)
      this.headerRightCol.insertBefore(signInCta, hamburgerMenu);
      this.headerRightCol.insertBefore(startJourneyCta, hamburgerMenu);
    } else {
      this.headerRightCol.appendChild(signInCta);
      this.headerRightCol.appendChild(startJourneyCta);
    }

    // --- Mobile menu CTAs (shown only on mobile by existing CSS rules) ---
    const mobileMenu = document.querySelector('.brix---header-menu-wrapper.w-nav-menu');
    if (mobileMenu && !mobileMenu.querySelector('.header-auth-mobile-ctas')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'menu-buttons-wrapper header-auth-mobile-ctas';
      wrapper.innerHTML = `
        <a href="signin.html" class="brix---btn-primary-small w-button login-btn">Sign in</a>
        <a href="signup.html" class="brix---btn-primary-small w-button start-btn">Start your Journey</a>
      `;
      mobileMenu.appendChild(wrapper);
    }
  },

  // =====================================================
  // Show Authenticated UI (User Menu)
  // =====================================================
  async showAuthenticatedUI(user) {
    // Hide unauth CTAs across all pages (Start your Journey / Sign in / Sign up).
    this._setUnauthHeaderCtasVisible(false);

    // ... rest of existing showAuthenticatedUI code ...
    const authContainer = document.createElement('div');
    authContainer.className = 'header-auth-ui';
    
    // Get user profile for name/avatar
    let profile = null;
    if (window.AuthState) {
      profile = await window.AuthState.getUserProfile();
    }

    const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
    const userAvatar = profile?.avatar_url || null;

    // Create user menu container
    const userMenuContainer = document.createElement('div');
    userMenuContainer.className = 'user-menu-container';
    userMenuContainer.style.cssText = 'position: relative; display: inline-block;';

    // Create user button
    const userButton = document.createElement('button');
    userButton.className = 'user-menu-button';
    userButton.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: transparent; border: none; cursor: pointer; border-radius: 8px; transition: background 0.2s;';
    
    userButton.addEventListener('mouseenter', () => {
      userButton.style.background = 'rgba(0,0,0,0.05)';
    });
    userButton.addEventListener('mouseleave', () => {
      userButton.style.background = 'transparent';
    });
    userButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleUserMenu();
    });

    // Avatar or initial
    if (userAvatar) {
      const avatarImg = document.createElement('img');
      avatarImg.src = userAvatar;
      avatarImg.alt = userName;
      avatarImg.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; object-fit: cover;';
      userButton.appendChild(avatarImg);
    } else {
      const avatarDiv = document.createElement('div');
      avatarDiv.textContent = userName.charAt(0).toUpperCase();
      avatarDiv.style.cssText = 'width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #7e22ce, #9333ea); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;';
      userButton.appendChild(avatarDiv);
    }

    // User name
    const nameSpan = document.createElement('span');
    nameSpan.textContent = userName;
    nameSpan.style.cssText = 'color: #333; font-size: 14px; font-weight: 500;';
    userButton.appendChild(nameSpan);

    // Dropdown arrow
    const arrowSvg = document.createElement('svg');
    arrowSvg.setAttribute('width', '12');
    arrowSvg.setAttribute('height', '12');
    arrowSvg.setAttribute('viewBox', '0 0 12 12');
    arrowSvg.style.cssText = 'fill: #666; transition: transform 0.2s;';
    arrowSvg.innerHTML = '<path d="M6 9L1 4h10z"/>';
    userButton.appendChild(arrowSvg);

    userMenuContainer.appendChild(userButton);

    // Create dropdown menu (styled to match curriculum)
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'user-dropdown-menu';
    dropdownMenu.style.cssText = 'position: absolute; top: 100%; right: 0; margin-top: 8px; background: var(--untitled-ui--white); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 220px; z-index: 1000; display: none; overflow: hidden; border: 1px solid var(--elements-webflow-library--neutral--300);';
    
    // Menu items (no icons, matching curriculum style)
    const menuItems = [
      { text: 'Dashboard', href: 'dashboard.html' },
      { text: 'My Progress', href: 'dashboard.html#progress' },
      { text: 'Settings', href: 'dashboard.html#settings' },
      { type: 'divider' },
      { text: 'Sign Out', action: 'signout' }
    ];

    menuItems.forEach(item => {
      if (item.type === 'divider') {
        const divider = document.createElement('div');
        divider.style.cssText = 'height: 1px; background: var(--elements-webflow-library--neutral--300); margin: 1px 0;';
        dropdownMenu.appendChild(divider);
      } else {
        const menuItem = document.createElement('a');
        menuItem.href = item.href || '#';
        menuItem.className = 'user-menu-item content'; // Add 'content' class to match curriculum style
        menuItem.style.cssText = `
          display: flex;
          align-items: center;
          padding: 12px 24px;
          color: var(--untitled-ui--primary900);
          text-decoration: none;
          transition: all 0.2s;
          font-size: 13px;
          font-weight: 700;
          line-height: 24px;
          font-family: Satoshi, sans-serif;
          border-top: 1px solid rgb(213, 213, 213));
          background-color: #f6f6f6;
          cursor: pointer;
        `;
        menuItem.textContent = item.text;
        
        // Match curriculum hover style
        menuItem.addEventListener('mouseenter', () => {
          menuItem.style.background = 'var(--elements-webflow-library--secondary--color-2)';
          menuItem.style.color = 'var(--untitled-ui--primary600)';
          menuItem.style.transform = 'scale(0.98)';
        });
        menuItem.addEventListener('mouseleave', () => {
          menuItem.style.background = '#f6f6f6';
          menuItem.style.color = 'var(--untitled-ui--primary900)';
          menuItem.style.transform = 'scale(1)';
        });

        if (item.action === 'signout') {
          menuItem.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.handleSignOut();
          });
        }

        dropdownMenu.appendChild(menuItem);
      }
    });

    userMenuContainer.appendChild(dropdownMenu);
    authContainer.appendChild(userMenuContainer);

    // Store reference to dropdown
    this.userMenu = dropdownMenu;

    // Insert into header
    const hamburgerMenu = this.headerRightCol.querySelector('.brix---hamburger-menu-wrapper');
    if (hamburgerMenu) {
      this.headerRightCol.insertBefore(authContainer, hamburgerMenu);
    } else {
      this.headerRightCol.appendChild(authContainer);
    }

    // Create and store document click handler
    this.documentClickHandler = (e) => {
      if (!userMenuContainer.contains(e.target)) {
        this.closeUserMenu();
      }
    };
    
    // Add the click listener (will be removed in clearAuthUI)
    document.addEventListener('click', this.documentClickHandler);
  },

  // =====================================================
  // Toggle User Menu
  // =====================================================
  toggleUserMenu() {
    if (!this.userMenu) return;

    const isOpen = this.userMenu.style.display === 'block';
    this.userMenu.style.display = isOpen ? 'none' : 'block';

    // Rotate arrow
    const arrow = this.userMenu.parentElement.querySelector('svg');
    if (arrow) {
      arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  },

  // =====================================================
  // Close User Menu
  // =====================================================
  closeUserMenu() {
    if (!this.userMenu) return;
    this.userMenu.style.display = 'none';

    // Reset arrow
    const arrow = this.userMenu.parentElement.querySelector('svg');
    if (arrow) {
      arrow.style.transform = 'rotate(0deg)';
    }
  },

  // =====================================================
  // Handle Sign Out
  // =====================================================
  async handleSignOut() {
    if (!window.Auth) {
      console.error('Auth module not available');
      return;
    }

    const result = await window.Auth.signOut();
    
    if (result.success) {
      // Redirect to home page
      window.location.href = 'index.html';
    } else {
      console.error('Sign out error:', result.error);
      alert('Failed to sign out. Please try again.');
    }
  },

  // =====================================================
  // Cleanup method (call when needed)
  // =====================================================
  destroy() {
    if (this.authStateListener && window.AuthState) {
      window.AuthState.removeListener(this.authStateListener);
    }
    this.clearAuthUI();
    this.initialized = false;
  }
};

// Export globally
window.HeaderAuth = HeaderAuth;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    HeaderAuth.init();
  });
} else {
  HeaderAuth.init();
}
