// =====================================================
// Forgot Password Page - Password Reset Logic
// =====================================================
// Uses centralized Auth module from js/auth.js
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
  const forgotForm = document.getElementById('forgot-form');
  const messageDiv = document.getElementById('message');
  const resetButton = document.getElementById('reset-button');

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

  // Handle password reset request
  forgotForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    
    // Disable button
    resetButton.disabled = true;
    resetButton.textContent = 'Sending...';

    const result = await window.Auth.resetPassword(email);

    if (result.success) {
      // Success message
      showMessage('Password reset link sent! Please check your email.', false);
      resetButton.textContent = 'Link Sent';
      
      // Clear form
      document.getElementById('email').value = '';
    } else {
      showMessage(result.error || 'Failed to send reset link. Please try again.', true);
      resetButton.disabled = false;
      resetButton.textContent = 'Send Reset Link';
    }
  });
});

