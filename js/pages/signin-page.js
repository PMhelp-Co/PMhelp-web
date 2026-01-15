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
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signin-page.js:30',message:'Sign-in form submitted',data:{hasAuth:!!window.Auth,hasRouteGuard:!!window.RouteGuard,hasAuthState:!!window.AuthState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H29'})}).catch(()=>{});
    // #endregion
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Disable button
    signinButton.disabled = true;
    signinButton.textContent = 'Signing in...';

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signin-page.js:45',message:'Calling Auth.signIn from signin-page',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H30'})}).catch(()=>{});
    // #endregion

    const result = await window.Auth.signIn(email, password);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signin-page.js:51',message:'Auth.signIn result received in signin-page',data:{success:result.success,hasUser:!!result.user,hasSession:!!result.session,error:result.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H31'})}).catch(()=>{});
    // #endregion

    if (result.success) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signin-page.js:56',message:'Sign-in successful, refreshing auth state',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H32'})}).catch(()=>{});
      // #endregion
      
      // Refresh auth state to ensure it's updated before redirect
      if (window.AuthState?.checkAuthState) {
        await window.AuthState.checkAuthState();
      }
      
      // Small delay to ensure state is fully updated
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get redirect URL from sessionStorage if it exists (set by RouteGuard)
      const savedRedirectUrl = sessionStorage.getItem('redirectAfterLogin');
      const redirectUrl = savedRedirectUrl || 'index.html';
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signin-page.js:72',message:'About to redirect after successful sign-in',data:{routeGuardExists:!!window.RouteGuard,hasRedirectAfterLogin:!!window.RouteGuard?.redirectAfterLogin,savedRedirectUrl,redirectUrl,currentUrl:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H33'})}).catch(()=>{});
      // #endregion
      
      // Clear the saved redirect URL if it exists
      if (savedRedirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
      }
      
      // Use RouteGuard helper method if available, otherwise direct redirect
      if (window.RouteGuard && typeof window.RouteGuard.redirectAfterLogin === 'function') {
        window.RouteGuard.redirectAfterLogin(redirectUrl);
      } else {
        // Fallback: direct redirect (RouteGuard not loaded on signin page)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signin-page.js:86',message:'RouteGuard not available, using direct redirect',data:{redirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H34'})}).catch(()=>{});
        // #endregion
        // Use replace instead of href to avoid back button issues
        window.location.replace(redirectUrl);
      }
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/pages/signin-page.js:93',message:'Sign-in failed in signin-page',data:{error:result.error,oauthConflict:result.oauthConflict},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H35'})}).catch(()=>{});
      // #endregion
      
      // Show enhanced message for OAuth conflicts
      let errorMessage = result.error || 'Failed to sign in. Please check your credentials.';
      if (result.oauthConflict) {
        errorMessage = result.error + ' After signing in with Google, you can add a password in your account settings to use both methods.';
      }
      
      showMessage(errorMessage, true);
      signinButton.disabled = false;
      signinButton.textContent = 'Sign in';
    }
  });

  // Handle Google sign in
  googleSigninBtn.addEventListener('click', async function() {
    const result = await window.Auth.signInWithOAuth('google');
    if (result.success) {
      // Use RouteGuard helper method   log the result
      console.log("result success");
      window.RouteGuard?.redirectAfterLogin('index.html');
    } else {
      showMessage(result.error || 'Failed to sign in with Google.', true);
    }
   
  });
});

