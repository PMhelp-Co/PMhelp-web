// =====================================================
// Resources Menu Component
// =====================================================
// Handles Resources dropdown menu in navigation
// Desktop: Dropdown menu
// Mobile: Inline expandable menu with indentation
// =====================================================

const ResourcesMenu = {
  menuContainer: null,
  dropdownMenu: null,
  mobileMenuItems: [],
  documentClickHandler: null,
  isMobile: false,
  isExpanded: false,
  wasOpenBeforeResize: false, // Track if menu was open before resize

  /**
   * Initialize Resources menu
   */
  init() {
    console.log('[RESOURCES MENU] 🚀 Initializing Resources menu...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createMenu());
    } else {
      this.createMenu();
    }

    // Handle window resize to switch between mobile/desktop
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  },

  /**
   * Check if we're on mobile
   */
  checkIfMobile() {
    return window.innerWidth <= 991; // Match Webflow breakpoint
  },

  /**
   * Handle window resize
   */
  handleResize() {
    // #region agent log
    const wasOpen = this.isOpen();
    const button = this.menuContainer?.querySelector('.resources-menu-button');
    const hasOpenClass = button?.classList.contains('w--nav-link-open');
    const hasMaxWidth = button?.style.maxWidth === '1218px';
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:46',message:'handleResize called',data:{windowWidth:window.innerWidth,wasMobile:this.isMobile,isExpanded:this.isExpanded,wasOpen,hasOpenClass,hasMaxWidth,buttonClasses:button?.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const wasMobile = this.isMobile;
    this.isMobile = this.checkIfMobile();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:50',message:'After checkIfMobile',data:{wasMobile,isMobile:this.isMobile,willRecreate:wasMobile!==this.isMobile},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (wasMobile !== this.isMobile) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:54',message:'Recreating menu',data:{wasMobile,isMobile:this.isMobile,wasOpen,preservingOpenState:wasOpen},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Preserve open state before closing
      this.wasOpenBeforeResize = wasOpen;
      // Close menu first to ensure clean state
      this.closeMenu();
      // Recreate menu for new screen size
      this.destroy();
      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        this.createMenu();
        // Restore open state if it was open before resize
        if (this.wasOpenBeforeResize && !this.isMobile) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:66',message:'Restoring open state after resize',data:{wasOpenBeforeResize:this.wasOpenBeforeResize,isMobile:this.isMobile,hasDropdownMenu:!!this.dropdownMenu},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          // Use setTimeout to ensure dropdown menu is fully created
          setTimeout(() => {
            if (this.dropdownMenu) {
              this.openMenu();
              // #region agent log
              const button = this.menuContainer?.querySelector('.resources-menu-button');
              fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:72',message:'After restoring open state',data:{hasOpenClass:button?.classList.contains('w--nav-link-open'),maxWidth:button?.style.maxWidth,dropdownDisplay:this.dropdownMenu?.style.display},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
            }
          }, 0);
        }
        this.wasOpenBeforeResize = false;
      });
    }
  },

  /**
   * Create Resources menu
   */
  createMenu() {
    // Find the navigation menu
    const navMenu = document.querySelector('.brix---header-menu-wrapper');
    if (!navMenu) {
      console.warn('[RESOURCES MENU] ⚠️ Navigation menu not found');
      return;
    }

    // Find the Blog link OR existing Resources container to replace
    let blogLink = Array.from(navMenu.children).find(
      link => link.href && link.href.includes('blog.html')
    );
    
    // If Blog link not found, look for existing Resources container (after resize)
    if (!blogLink) {
      blogLink = Array.from(navMenu.children).find(
        el => el.classList && el.classList.contains('resources-menu-container')
      );
    }

    if (!blogLink) {
      console.warn('[RESOURCES MENU] ⚠️ Blog link or Resources container not found');
      return;
    }

    this.isMobile = this.checkIfMobile();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:78',message:'createMenu started',data:{isMobile:this.isMobile,windowWidth:window.innerWidth,hasNavMenu:!!navMenu,hasBlogLink:!!blogLink},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Create menu container
    this.menuContainer = document.createElement('div');
    this.menuContainer.className = 'resources-menu-container';
    this.menuContainer.style.cssText = 'position: relative;';

    // Create Resources link
    const resourcesButton = document.createElement('a');
    resourcesButton.href = '#';
    resourcesButton.className = 'resources-menu-button text-block-3 w-nav-link';
    
    // On mobile, always apply w--nav-link-open and max-width to maintain alignment with other nav items
    // On desktop, these will be added/removed when menu opens/closes
    if (this.isMobile) {
      resourcesButton.classList.add('w--nav-link-open');
      resourcesButton.style.cssText = 'text-decoration: none; max-width: 1218px;';
    } else {
      // Desktop: start without open class, will be added when menu opens
      resourcesButton.style.cssText = 'text-decoration: none; display: inline-block; margin-left: 0; margin-right: 0;';
    }
    
    // Button text with arrow
    resourcesButton.innerHTML = 'Resources <svg width="12" height="12" viewBox="0 0 12 12" class="resources-menu-arrow" style="fill: currentColor; transition: transform 0.2s; margin-left: 4px; vertical-align: middle; display: inline-block;"><path d="M6 9L1 4h10z"/></svg>';

    // Click handler
    resourcesButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleMenu();
    });

    this.menuContainer.appendChild(resourcesButton);

    // Replace Blog link with Resources menu FIRST (before creating mobile/desktop menu)
    // This ensures the container is in the DOM before we try to insert mobile items
    blogLink.parentNode.replaceChild(this.menuContainer, blogLink);

    if (this.isMobile) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:103',message:'Creating mobile menu',data:{isMobile:this.isMobile},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Mobile: Create inline expandable menu (after container is in DOM)
      this.createMobileMenu(navMenu, blogLink);
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:107',message:'Creating desktop menu',data:{isMobile:this.isMobile},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Desktop: Create dropdown menu
      this.createDesktopMenu();
    }

    // Create document click handler
    this.documentClickHandler = (e) => {
      if (!this.menuContainer.contains(e.target)) {
        this.closeMenu();
      }
    };

    // Add click listener
    document.addEventListener('click', this.documentClickHandler);

    console.log('[RESOURCES MENU] ✅ Resources menu created successfully');
  },

  /**
   * Create mobile inline expandable menu
   */
  createMobileMenu(navMenu, blogLink) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:130',message:'createMobileMenu started',data:{navMenuChildren:navMenu.children.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // Find position of PM Buddy link (after Resources)
    const pmBuddyLink = Array.from(navMenu.children).find(
      link => link.href && link.href.includes('pmbuddy.html')
    );
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:135',message:'PM Buddy link search',data:{found:!!pmBuddyLink},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    if (!pmBuddyLink) {
      console.warn('[RESOURCES MENU] ⚠️ PM Buddy link not found');
      return;
    }

    // Create menu items that will be inserted into nav
    const menuItems = [
      { text: 'Reports', href: 'reports.html' },
      { text: 'Blog', href: 'blog.html' }
    ];

    this.mobileMenuItems = menuItems.map((item, index) => {
      const menuItem = document.createElement('a');
      menuItem.href = item.href;
      menuItem.className = 'resources-menu-item-mobile text-block-3 w-nav-link';
      menuItem.style.cssText = `
        text-decoration: none;
        display: none;
        padding-left: 32px;
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease;
        max-height: 0;
        overflow: hidden;
      `;
      menuItem.textContent = item.text;

      // Insert after Resources container, before PM Buddy
      // Find the Resources container in the nav (it should be there now)
      const resourcesContainer = Array.from(navMenu.children).find(
        el => el.classList && el.classList.contains('resources-menu-container')
      );
      
      if (pmBuddyLink && pmBuddyLink.parentNode) {
        // Insert before PM Buddy (which comes after Resources container)
        pmBuddyLink.parentNode.insertBefore(menuItem, pmBuddyLink);
      } else if (resourcesContainer && resourcesContainer.parentNode) {
        // Fallback: insert after Resources container
        resourcesContainer.parentNode.insertBefore(menuItem, resourcesContainer.nextSibling);
      }

      return menuItem;
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:169',message:'Mobile menu items created',data:{itemsCount:this.mobileMenuItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
  },

  /**
   * Create desktop dropdown menu
   */
  createDesktopMenu() {
    // Create dropdown menu (styled to match user menu)
    this.dropdownMenu = document.createElement('div');
    this.dropdownMenu.className = 'resources-dropdown-menu';
    this.dropdownMenu.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 8px;
      background: var(--untitled-ui--white);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 180px;
      z-index: 1000;
      display: none;
      overflow: hidden;
      border: 1px solid var(--elements-webflow-library--neutral--300);
    `;

    // Menu items
    const menuItems = [
      { text: 'Reports', href: 'reports.html' },
      { text: 'Blog', href: 'blog.html' }
    ];

    menuItems.forEach((item, index) => {
      const menuItem = document.createElement('a');
      menuItem.href = item.href;
      menuItem.className = 'resources-menu-item content';
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
        ${index > 0 ? 'border-top: 1px solid rgb(213, 213, 213);' : ''}
        background-color: #f6f6f6;
        cursor: pointer;
      `;
      menuItem.textContent = item.text;

      // Hover effects (matching user menu)
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

      this.dropdownMenu.appendChild(menuItem);
    });

    this.menuContainer.appendChild(this.dropdownMenu);
  },

  /**
   * Toggle menu (mobile or desktop)
   */
  toggleMenu() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:242',message:'toggleMenu called',data:{isMobile:this.isMobile,isExpanded:this.isExpanded,isOpen:this.isOpen(),hasDropdownMenu:!!this.dropdownMenu,mobileItemsCount:this.mobileMenuItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (this.isOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  },

  /**
   * Open menu
   */
  openMenu() {
    if (this.isMobile) {
      this.openMobileMenu();
    } else {
      this.openDesktopMenu();
    }
  },

  /**
   * Open mobile inline menu
   */
  openMobileMenu() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:264',message:'openMobileMenu called',data:{isExpanded:this.isExpanded,mobileItemsCount:this.mobileMenuItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (this.isExpanded) return;
    
    // Safety check: if no mobile items, try to recreate menu
    if (this.mobileMenuItems.length === 0) {
      console.warn('[RESOURCES MENU] ⚠️ No mobile menu items found, recreating menu...');
      const navMenu = document.querySelector('.brix---header-menu-wrapper');
      if (navMenu) {
        this.createMobileMenu(navMenu, null);
      }
    }

    this.isExpanded = true;

    // On mobile, button already has w--nav-link-open and max-width from createMenu
    // Just ensure they're still applied (they should be, but double-check)
    const button = this.menuContainer.querySelector('.resources-menu-button');
    if (button) {
      // Ensure w--nav-link-open class is present (should already be from createMenu)
      if (!button.classList.contains('w--nav-link-open')) {
        button.classList.add('w--nav-link-open');
      }
      // Ensure max-width is set (should already be from createMenu)
      if (!button.style.maxWidth || button.style.maxWidth === '') {
        button.style.maxWidth = '1218px';
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:341',message:'openMobileMenu - ensured classes/styles',data:{hasOpenClass:button.classList.contains('w--nav-link-open'),maxWidth:button.style.maxWidth,buttonClasses:button.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    }

    // Show and animate menu items
    this.mobileMenuItems.forEach((item, index) => {
      if (!item || !item.parentNode) {
        console.warn('[RESOURCES MENU] ⚠️ Mobile menu item missing or not in DOM:', index);
        return;
      }
      item.style.display = 'block';
      item.style.maxHeight = '60px';
      
      // Stagger animation
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * 50);
    });

    // Rotate arrow
    const arrow = this.menuContainer.querySelector('.resources-menu-arrow');
    if (arrow) {
      arrow.style.transform = 'rotate(180deg)';
    }

    console.log('[RESOURCES MENU] 📂 Mobile menu opened');
  },

  /**
   * Open desktop dropdown menu
   */
  openDesktopMenu() {
    if (!this.dropdownMenu) return;

    this.dropdownMenu.style.display = 'block';
    
    // Get the button element
    const button = this.menuContainer.querySelector('.resources-menu-button');
    if (button) {
      // Add w--nav-link-open class (Webflow class for open state)
      button.classList.add('w--nav-link-open');
      // Add max-width style (matches expected open state)
      button.style.maxWidth = '1218px';
      // Prevent centering - override margin auto from w-nav-link class
      // When w--nav-link-open makes it display:block, margin:auto would center it
      button.style.marginLeft = '0';
      button.style.marginRight = '0';
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:361',message:'openDesktopMenu - added classes/styles',data:{hasOpenClass:button.classList.contains('w--nav-link-open'),maxWidth:button.style.maxWidth,marginLeft:button.style.marginLeft,marginRight:button.style.marginRight,buttonClasses:button.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
    
    // Rotate arrow
    const arrow = this.menuContainer.querySelector('.resources-menu-arrow');
    if (arrow) {
      arrow.style.transform = 'rotate(180deg)';
    }

    console.log('[RESOURCES MENU] 📂 Desktop menu opened');
  },

  /**
   * Close menu
   */
  closeMenu() {
    if (this.isMobile) {
      this.closeMobileMenu();
    } else {
      this.closeDesktopMenu();
    }
  },

  /**
   * Close mobile inline menu
   */
  closeMobileMenu() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:321',message:'closeMobileMenu called',data:{isExpanded:this.isExpanded,mobileItemsCount:this.mobileMenuItems.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (!this.isExpanded) return;

    this.isExpanded = false;

    // On mobile, keep w--nav-link-open and max-width even when closed
    // This maintains alignment with other nav items (Learn, About Us, Community, etc.)
    // Only hide the submenu items
    const button = this.menuContainer.querySelector('.resources-menu-button');
    if (button) {
      // Ensure w--nav-link-open class is still present (maintains alignment)
      if (!button.classList.contains('w--nav-link-open')) {
        button.classList.add('w--nav-link-open');
      }
      // Ensure max-width is still set (maintains alignment)
      if (!button.style.maxWidth || button.style.maxWidth === '') {
        button.style.maxWidth = '1218px';
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:389',message:'closeMobileMenu - maintained classes/styles for alignment',data:{hasOpenClass:button.classList.contains('w--nav-link-open'),maxWidth:button.style.maxWidth,buttonClasses:button.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    }

    // Animate and hide menu items
    this.mobileMenuItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        item.style.maxHeight = '0';
        item.style.display = 'none';
      }, 200);
    });

    // Reset arrow
    const arrow = this.menuContainer.querySelector('.resources-menu-arrow');
    if (arrow) {
      arrow.style.transform = 'rotate(0deg)';
    }

    console.log('[RESOURCES MENU] 📁 Mobile menu closed');
  },

  /**
   * Close desktop dropdown menu
   */
  closeDesktopMenu() {
    if (!this.dropdownMenu) return;

    this.dropdownMenu.style.display = 'none';
    
    // Get the button element
    const button = this.menuContainer.querySelector('.resources-menu-button');
    if (button) {
      // Remove w--nav-link-open class
      button.classList.remove('w--nav-link-open');
      // Remove max-width style
      button.style.maxWidth = '';
      // Reset margins (they're already set in createMenu, but ensure they're reset)
      button.style.marginLeft = '0';
      button.style.marginRight = '0';
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:420',message:'closeDesktopMenu - removed classes/styles',data:{hasOpenClass:button.classList.contains('w--nav-link-open'),maxWidth:button.style.maxWidth,marginLeft:button.style.marginLeft,marginRight:button.style.marginRight,buttonClasses:button.className},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
    
    // Reset arrow
    const arrow = this.menuContainer.querySelector('.resources-menu-arrow');
    if (arrow) {
      arrow.style.transform = 'rotate(0deg)';
    }

    console.log('[RESOURCES MENU] 📁 Desktop menu closed');
  },

  /**
   * Check if menu is open
   */
  isOpen() {
    const result = this.isMobile 
      ? this.isExpanded 
      : (this.dropdownMenu && this.dropdownMenu.style.display === 'block');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:366',message:'isOpen check',data:{isMobile:this.isMobile,isExpanded:this.isExpanded,hasDropdownMenu:!!this.dropdownMenu,dropdownDisplay:this.dropdownMenu?.style.display,result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return result;
  },

  /**
   * Cleanup (remove event listeners and menu items)
   */
  destroy() {
    if (this.documentClickHandler) {
      document.removeEventListener('click', this.documentClickHandler);
      this.documentClickHandler = null;
    }

    // Remove mobile menu items from DOM
    this.mobileMenuItems.forEach(item => {
      if (item.parentNode) {
        item.parentNode.removeChild(item);
      }
    });
    this.mobileMenuItems = [];

    // Remove dropdown menu from DOM if it exists (critical for resize)
    if (this.dropdownMenu) {
      // Remove from parent if it has one
      if (this.dropdownMenu.parentNode) {
        this.dropdownMenu.parentNode.removeChild(this.dropdownMenu);
      }
      // Also search for any orphaned dropdown menus in the DOM and remove them
      const orphanedDropdowns = document.querySelectorAll('.resources-dropdown-menu');
      orphanedDropdowns.forEach(dropdown => {
        if (dropdown.parentNode) {
          dropdown.parentNode.removeChild(dropdown);
        }
      });
    }

    // Reset state (but preserve wasOpenBeforeResize for menu recreation)
    this.isExpanded = false;
    this.menuContainer = null;
    this.dropdownMenu = null;
    // Note: wasOpenBeforeResize is preserved here so it can be used in createMenu
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources-menu.js:395',message:'destroy completed',data:{isExpanded:this.isExpanded,mobileItemsCount:this.mobileMenuItems.length,wasOpenBeforeResize:this.wasOpenBeforeResize},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  }
};

// Initialize on load
ResourcesMenu.init();

// Export globally
window.ResourcesMenu = ResourcesMenu;

console.log('[RESOURCES MENU] ✅ Resources Menu module loaded');
