// =====================================================
// Header Auth UI Management
// =====================================================
// Updates header based on authentication state
// =====================================================

const HeaderAuth = {
  headerRightCol: null,
  userMenu: null,
  initialized: false,

  // =====================================================
  // Initialize Header Auth
  // =====================================================
  init() {
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

    // Initial update
    this.updateHeader();

    // Listen to auth state changes
    window.AuthState.addListener((state) => {
      this.updateHeader(state);
    });

    // Also listen to custom event
    window.addEventListener('auth-state-updated', (e) => {
      this.updateHeader(e.detail);
    });

    this.initialized = true;
  },

  // =====================================================
  // Update Header Based on Auth State
  // =====================================================
  updateHeader(state = null) {
    if (!this.headerRightCol) return;

    // Get current auth state
    const isAuthenticated = state?.isAuthenticated ?? window.AuthState?.getIsAuthenticated() ?? false;
    const user = state?.user ?? window.AuthState?.getCurrentUser();

    // Clear existing auth UI
    this.clearAuthUI();

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
    // Remove existing auth buttons/menus
    const existingAuth = this.headerRightCol.querySelector('.header-auth-ui');
    if (existingAuth) {
      existingAuth.remove();
    }
  },

  // =====================================================
  // Show Unauthenticated UI (Sign In Button)
  // =====================================================
  showUnauthenticatedUI() {
    const authContainer = document.createElement('div');
    authContainer.className = 'header-auth-ui';
    
    const signInBtn = document.createElement('a');
    signInBtn.href = 'signin.html';
    signInBtn.className = 'brix---btn-primary-small w-button';
    signInBtn.textContent = 'Sign In';
    
    authContainer.appendChild(signInBtn);
    
    // Insert before hamburger menu or at the end
    const hamburgerMenu = this.headerRightCol.querySelector('.brix---hamburger-menu-wrapper');
    if (hamburgerMenu) {
      this.headerRightCol.insertBefore(authContainer, hamburgerMenu);
    } else {
      this.headerRightCol.appendChild(authContainer);
    }
  },

  // =====================================================
  // Show Authenticated UI (User Menu)
  // =====================================================
  async showAuthenticatedUI(user) {
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

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenuContainer.contains(e.target)) {
        this.closeUserMenu();
      }
    });
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

