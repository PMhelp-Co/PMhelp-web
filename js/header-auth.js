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
    
    // Prevent rapid successive updates using requestAnimationFrame
    if (this._updateScheduled) {
      return;
    }
    this._updateScheduled = true;
    
    requestAnimationFrame(() => {
      this._performUpdate(state);
      this._updateScheduled = false;
    });
  },

  // =====================================================
  // Perform the actual update
  // =====================================================
  _performUpdate(state) {
    // Clear existing auth UI FIRST
    this.clearAuthUI();
    
    // Get current auth state
    const isAuthenticated = state?.isAuthenticated ?? window.AuthState?.getIsAuthenticated() ?? false;
    const user = state?.user ?? window.AuthState?.getCurrentUser();

    if (isAuthenticated && user) {
      this.showAuthenticatedUI(user);
    } else {
      this.showUnauthenticatedUI();
    }
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
    
    // Reset the visibility of header auth buttons (they'll be shown/hidden by updateHeader)
    const authButtons = document.querySelectorAll('.header-auth-buttons');
    authButtons.forEach(button => {
      button.style.display = '';
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

    const authButtons = document.querySelectorAll('.header-auth-buttons');
    authButtons.forEach(button => {
      button.style.display = '';
    });
  
  
    // Create desktop version (hidden on mobile)
    // const authContainer = document.createElement('div');
    // authContainer.className = 'header-auth-ui brix---btn-header-hidden-on-mbl';
    
    // const signInBtn = document.createElement('a');
    // signInBtn.href = 'signin.html';
    // signInBtn.className = 'brix---btn-primary-small w-button';
    // signInBtn.textContent = 'Sign In';
    
    // authContainer.appendChild(signInBtn);
    
    // // Insert before hamburger menu or at the end
    // const hamburgerMenu = this.headerRightCol.querySelector('.brix---hamburger-menu-wrapper');
    // if (hamburgerMenu) {
    //   this.headerRightCol.insertBefore(authContainer, hamburgerMenu);
    // } else {
    //   this.headerRightCol.appendChild(authContainer);
    // }

    // // Create mobile version (in dropdown menu)
    // const mobileMenu = document.querySelector('.brix---header-menu-wrapper.w-nav-menu');
    // if (mobileMenu) {
    //   // Check if mobile sign in link already exists
    //   let mobileSignIn = mobileMenu.querySelector('.header-auth-mobile-signin');
      
    //   if (!mobileSignIn) {
    //     // Create divider before sign in button
    //     const divider = document.createElement('div');
    //     divider.style.cssText = 'height: 1px; background: #e5e7eb; margin: 16px 0;';
    //     divider.className = 'header-auth-mobile-divider';
        
    //     // Create mobile sign in link
    //     mobileSignIn = document.createElement('a');
    //     mobileSignIn.href = 'signin.html';
    //     mobileSignIn.className = 'text-block-3 w-nav-link header-auth-mobile-signin';
    //     mobileSignIn.textContent = 'Sign In';
    //     mobileSignIn.style.cssText = 'padding: 12px 20px; font-weight: 500;';
        
    //     // Insert divider and sign in link at the end of mobile menu
    //     mobileMenu.appendChild(divider);
    //     mobileMenu.appendChild(mobileSignIn);
    //   }
    // }
  },

  // =====================================================
  // Show Authenticated UI (User Menu)
  // =====================================================
  async showAuthenticatedUI(user) {
    const authButtons = document.querySelectorAll('.header-auth-buttons');
    authButtons.forEach(button => {
      button.style.display = 'none';
    });

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

    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'user-dropdown-menu';
    dropdownMenu.style.cssText = 'position: absolute; top: 100%; right: 0; margin-top: 8px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 200px; z-index: 1000; display: none; overflow: hidden;';
    
    // Menu items
    const menuItems = [
      { text: 'Dashboard', href: 'dashboard.html', icon: '📊' },
      { text: 'My Progress', href: 'dashboard.html#progress', icon: '📈' },
      { text: 'Settings', href: 'dashboard.html#settings', icon: '⚙️' },
      { type: 'divider' },
      { text: 'Sign Out', action: 'signout', icon: '🚪' }
    ];

    menuItems.forEach(item => {
      if (item.type === 'divider') {
        const divider = document.createElement('div');
        divider.style.cssText = 'height: 1px; background: #e5e7eb; margin: 4px 0;';
        dropdownMenu.appendChild(divider);
      } else {
        const menuItem = document.createElement('a');
        menuItem.href = item.href || '#';
        menuItem.className = 'user-menu-item';
        menuItem.style.cssText = 'display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: #333; text-decoration: none; transition: background 0.2s; font-size: 14px;';
        menuItem.innerHTML = `<span>${item.icon}</span><span>${item.text}</span>`;
        
        menuItem.addEventListener('mouseenter', () => {
          menuItem.style.background = '#f3f4f6';
        });
        menuItem.addEventListener('mouseleave', () => {
          menuItem.style.background = 'transparent';
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
