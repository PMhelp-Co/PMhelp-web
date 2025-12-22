// =====================================================
// Password Toggle Utility
// =====================================================
// Adds show/hide password functionality to password inputs
// =====================================================

/**
 * Initialize password toggle for a password input field
 * @param {HTMLElement} passwordInput - The password input element
 */
function initPasswordToggle(passwordInput) {
  if (!passwordInput || passwordInput.type !== 'password') return;

  // Create wrapper if it doesn't exist
  let wrapper = passwordInput.parentElement;
  if (!wrapper.classList.contains('password-input-wrapper')) {
    wrapper = document.createElement('div');
    wrapper.className = 'password-input-wrapper';
    wrapper.style.cssText = 'position: relative; width: 100%;';
    passwordInput.parentNode.insertBefore(wrapper, passwordInput);
    wrapper.appendChild(passwordInput);
  }

  // Check if toggle already exists
  if (wrapper.querySelector('.password-toggle')) return;

  // Create toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'password-toggle';
  toggleBtn.setAttribute('aria-label', 'Toggle password visibility');
  toggleBtn.style.cssText = `
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    transition: color 0.2s;
    z-index: 10;
  `;

  // Eye icon SVG (closed eye - password hidden)
  const eyeClosedSvg = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `;

  // Eye icon SVG (open eye - password visible)
  const eyeOpenSvg = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  `;

  toggleBtn.innerHTML = eyeClosedSvg;
  
  toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.color = '#7e22ce';
  });
  
  toggleBtn.addEventListener('mouseleave', () => {
    if (passwordInput.type === 'password') {
      toggleBtn.style.color = '#666';
    }
  });

  // Toggle functionality
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleBtn.innerHTML = eyeOpenSvg;
      toggleBtn.style.color = '#7e22ce';
      toggleBtn.setAttribute('aria-label', 'Hide password');
    } else {
      passwordInput.type = 'password';
      toggleBtn.innerHTML = eyeClosedSvg;
      toggleBtn.style.color = '#666';
      toggleBtn.setAttribute('aria-label', 'Show password');
    }
  });

  wrapper.appendChild(toggleBtn);
}

/**
 * Initialize password toggles for all password inputs on the page
 */
function initAllPasswordToggles() {
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  passwordInputs.forEach(input => {
    initPasswordToggle(input);
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllPasswordToggles);
} else {
  initAllPasswordToggles();
}

// Export for manual initialization if needed
window.PasswordToggle = {
  init: initPasswordToggle,
  initAll: initAllPasswordToggles
};

