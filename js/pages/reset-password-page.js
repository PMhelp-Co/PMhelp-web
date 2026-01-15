// =====================================================
// Reset Password Page - Set New Password Logic
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
  const resetForm = document.getElementById('reset-form');
  const messageDiv = document.getElementById('message');
  const resetButton = document.getElementById('reset-button');

  // Show message helper
  function showMessage(text, isError = false) {
    messageDiv.textContent = text;
    messageDiv.className = `text-sm text-center p-3 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    messageDiv.classList.remove('hidden');
    setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, 5000);
  }

  // Wait for Auth module to be available
  if (!window.Auth) {
    console.error('Auth module not loaded');
    return;
  }

  // Check if user has valid reset token
  async function checkResetToken() {
    const sessionResult = await window.Auth.getSession();
    
    if (!sessionResult.success || !sessionResult.session) {
      showMessage('Invalid or expired reset link. Please request a new one.', true);
      setTimeout(() => {
        window.location.href = 'forgot-password.html';
      }, 3000);
      return false;
    }
    
    return true;
  }

  // Initialize - check token on page load
  checkResetToken();

  // Handle password reset
  resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
      showMessage('Passwords do not match. Please try again.', true);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long.', true);
      return;
    }
    
    // Disable button
    resetButton.disabled = true;
    resetButton.textContent = 'Updating...';

    const result = await window.Auth.updatePassword(password);

    if (result.success) {
      // Success message
      showMessage('Password updated successfully! Redirecting to sign in...', false);
      
      // Sign out to clear session
      await window.Auth.signOut();
      
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        window.location.href = 'signin.html';
      }, 2000);
    } else {
      showMessage(result.error || 'Failed to update password. Please try again.', true);
      resetButton.disabled = false;
      resetButton.textContent = 'Update Password';
    }
  });
});

