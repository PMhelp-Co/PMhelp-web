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
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signup-page.js:30',message:'Sign-up form submitted',data:{email,hasFullName:!!fullName,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H36'})}).catch(()=>{});
    // #endregion
    
    // Disable button
    signupButton.disabled = true;
    signupButton.textContent = 'Creating account...';

    const result = await window.Auth.signUp(email, password, {
      full_name: fullName
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signup-page.js:45',message:'Sign-up result received in signup-page',data:{success:result.success,hasUser:!!result.user,hasSession:!!result.session,error:result.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H37'})}).catch(()=>{});
    // #endregion

    if (result.success) {
      // Show success message based on whether password was linked or account was created
      if (result.passwordLinked) {
        showMessage(result.message || 'Password linked successfully! You can now sign in with either Google or email/password.', false);
        // Redirect to home page since user is already signed in
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } else {
        showMessage('Account created successfully! Please check your email to verify your account.', false);
        // Show spam folder reminder
        const spamReminder = document.getElementById('spam-reminder');
        if (spamReminder) {
          spamReminder.classList.remove('hidden');
        }
        // Don't redirect immediately - let user see the spam reminder
        // Redirect after 5 seconds instead of 2
        setTimeout(() => {
          window.location.href = 'signin.html';
        }, 5000);
      }
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signup-page.js:72',message:'Sign-up failed in signup-page',data:{error:result.error,oauthAccountExists:result.oauthAccountExists},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H39'})}).catch(()=>{});
      // #endregion
      
      // Show enhanced message for OAuth account conflicts
      let errorMessage = result.error || 'Failed to create account. Please try again.';
      if (result.oauthAccountExists && result.oauthRedirect) {
        // Automatically redirect to Google OAuth
        showMessage('Redirecting to Google to link your password...', false);
        signupButton.disabled = true;
        signupButton.textContent = 'Redirecting...';
        
        // Redirect to OAuth
        if (result.oauthUrl) {
          window.location.href = result.oauthUrl;
        }
        return; // Don't re-enable button, we're redirecting
      } else if (result.oauthAccountExists) {
        // Add a helpful link/button to sign in with Google
        errorMessage = result.error + ' Click "Sign in with Google" below to get started.';
      }
      
      showMessage(errorMessage, true);
      signupButton.disabled = false;
      signupButton.textContent = 'Sign Up';
    }
  });

  // Handle Google sign up
  googleSignupBtn.addEventListener('click', async function() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signup-page.js:61',message:'Google sign-up button clicked',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H40'})}).catch(()=>{});
    // #endregion
    const result = await window.Auth.signInWithOAuth('google');
    
    if (!result.success) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signup-page.js:66',message:'Google sign-up failed in signup-page',data:{error:result.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H41'})}).catch(()=>{});
      // #endregion
      showMessage(result.error || 'Failed to sign up with Google.', true);
    }
    // OAuth will redirect, so no need to handle success
  });
});

