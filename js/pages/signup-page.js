// =====================================================
// Sign Up Page - Registration Logic
// =====================================================
// Uses centralized Auth module from js/auth.js
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById('signup-form');
  const googleSignupBtn = document.getElementById('google-signup');
  const messageDiv = document.getElementById('message');
  const signupButton = document.getElementById('signup-button');

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

  // Handle email/password sign up
  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('full_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Disable button
    signupButton.disabled = true;
    signupButton.textContent = 'Creating account...';

    const result = await window.Auth.signUp(email, password, {
      full_name: fullName
    });

    if (result.success) {
      // Show success message
      showMessage('Account created successfully! Please check your email to verify your account.', false);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = 'signin.html';
      }, 2000);
    } else {
      showMessage(result.error || 'Failed to create account. Please try again.', true);
      signupButton.disabled = false;
      signupButton.textContent = 'Sign Up';
    }
  });

  // Handle Google sign up
  googleSignupBtn.addEventListener('click', async function() {
    const result = await window.Auth.signInWithOAuth('google');
    
    if (!result.success) {
      showMessage(result.error || 'Failed to sign up with Google.', true);
    }
    // OAuth will redirect, so no need to handle success
  });
});

