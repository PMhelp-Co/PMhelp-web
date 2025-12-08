// =====================================================
// Sign In Page - Authentication Logic
// =====================================================
// Uses centralized Auth module from js/auth.js
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
  const signinForm = document.getElementById('signin-form');
  const googleSigninBtn = document.getElementById('google-signin');
  const messageDiv = document.getElementById('message');
  const signinButton = document.getElementById('signin-button');

  // Wait for Auth module to be available
  if (!window.Auth) {
    console.error('Auth module not loaded');
    return;
  }

  // Show message helper
  function showMessage(text, isError = false) {
    messageDiv.textContent = text;
    messageDiv.className = `text-sm text-center p-3 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    messageDiv.classList.remove('hidden');
    setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, 5000);
  }

  // Handle email/password sign in
  signinForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Disable button
    signinButton.disabled = true;
    signinButton.textContent = 'Signing in...';

    const result = await window.Auth.signIn(email, password);

    if (result.success) {
      // Success - redirect to dashboard or intended page
      const redirectUrl = window.RouteGuard?.getRedirectUrl() || 
                         new URLSearchParams(window.location.search).get('redirect') || 
                         'index.html';
      window.location.href = redirectUrl;
    } else {
      showMessage(result.error || 'Failed to sign in. Please check your credentials.', true);
      signinButton.disabled = false;
      signinButton.textContent = 'Sign in';
    }
  });

  // Handle Google sign in
  googleSigninBtn.addEventListener('click', async function() {
    const result = await window.Auth.signInWithOAuth('google');
    
    if (!result.success) {
      showMessage(result.error || 'Failed to sign in with Google.', true);
    }
    // OAuth will redirect, so no need to handle success
  });
});

