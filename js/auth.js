// =====================================================
// Authentication Module
// =====================================================
// Centralized authentication functions for PMHelp
// =====================================================

const Auth = {
  // =====================================================
  // Sign In with Email/Password
  // =====================================================
  async signIn(email, password) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:11',message:'signIn called',data:{email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    try {
      if (!window.supabaseClient) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:13',message:'Supabase client not initialized in signIn',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        throw new Error('Supabase client not initialized');
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:17',message:'Calling signInWithPassword',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion

      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:20',message:'signInWithPassword response',data:{hasError:!!error,errorMessage:error?.message,errorStatus:error?.status,errorCode:error?.code,hasUser:!!data?.user,userId:data?.user?.id,userEmail:data?.user?.email,hasPasswordSet:!!data?.user?.app_metadata?.provider?.includes('email'),providers:data?.user?.app_metadata?.providers,hasSession:!!data?.session},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion

      if (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:22',message:'Sign-in error details',data:{message:error.message,status:error.status,code:error.code,name:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        
        // If "Invalid login credentials", show generic error
        // We don't check for OAuth conflicts here to avoid:
        // 1. Sending unwanted password reset emails
        // 2. Showing OAuth error for wrong passwords on regular accounts
        // OAuth conflicts are only detected during signup flow, not during sign-in
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:43',message:'Invalid login credentials - showing generic error',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H61'})}).catch(()=>{});
        // #endregion
        
        throw error;
      }

      // Store session
      this.storeSession(data.session);

      // Don't clear OAuth cache on password sign-in
      // The cache is used for password linking, not conflict detection
      // It will be cleared when password is successfully linked

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:125',message:'Sign-in successful',data:{userId:data.user?.id,userEmail:data.user?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Sign in error:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:35',message:'Sign-in catch block',data:{message:error?.message,status:error?.status,code:error?.code,name:error?.name,stack:error?.stack?.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        error: error.message || 'Failed to sign in',
        oauthConflict: error.oauthConflict || false,
        canLinkPassword: error.canLinkPassword || false
      };
    }
  },

  // =====================================================
  // Sign Up with Email/Password
  // =====================================================
  async signUp(email, password, metadata = {}) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:44',message:'signUp called',data:{email,hasPassword:!!password,hasMetadata:!!metadata,metadataKeys:Object.keys(metadata)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H7'})}).catch(()=>{});
    // #endregion
    try {
      if (!window.supabaseClient) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:151',message:'Supabase client not initialized in signUp',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H7'})}).catch(()=>{});
        // #endregion
        throw new Error('Supabase client not initialized');
      }

      // Check if user is already signed in with OAuth
      // Use getSession() first as it's more reliable for detecting active sessions
      const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();
      const currentUser = session?.user || null;
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:157',message:'Checking if user is already signed in',data:{hasSession:!!session,hasCurrentUser:!!currentUser,currentUserEmail:currentUser?.email,requestedEmail:email,emailsMatch:currentUser?.email?.toLowerCase() === email.toLowerCase(),sessionError:sessionError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H75'})}).catch(()=>{});
      // #endregion

      // If user is signed in and email matches, link password to existing OAuth account
      if (currentUser && session && !sessionError && currentUser.email?.toLowerCase() === email.toLowerCase()) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:163',message:'User signed in with OAuth, linking password',data:{userId:currentUser.id,email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H76'})}).catch(()=>{});
        // #endregion

        // Link password to existing OAuth account
        const { data: updateData, error: updateError } = await window.supabaseClient.auth.updateUser({
          password: password
        });

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:171',message:'Password linked to OAuth account',data:{hasError:!!updateError,errorMessage:updateError?.message,hasUser:!!updateData?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H77'})}).catch(()=>{});
        // #endregion

        if (updateError) {
          throw updateError;
        }

        // Update profile metadata if provided
        if (metadata.full_name && updateData.user) {
          await this.updateProfile(updateData.user.id, { full_name: metadata.full_name });
        }

        // Clear OAuth conflict cache
        const cacheKey = `oauth_conflict_${email.toLowerCase()}`;
        sessionStorage.removeItem(cacheKey);

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:187',message:'Password successfully linked to OAuth account',data:{userId:updateData.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H78'})}).catch(()=>{});
        // #endregion

        return {
          success: true,
          user: updateData.user,
          session: (await window.supabaseClient.auth.getSession()).data.session,
          passwordLinked: true,
          message: 'Password linked successfully! You can now sign in with either Google or email/password.'
        };
      }

      // If user is signed in but email doesn't match, return error
      if (currentUser && session && !sessionError && currentUser.email?.toLowerCase() !== email.toLowerCase()) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:200',message:'User signed in with different email',data:{currentEmail:currentUser.email,requestedEmail:email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H79'})}).catch(()=>{});
        // #endregion
        return {
          success: false,
          error: `You are signed in with ${currentUser.email}. Please sign out first or use that email to link a password.`
        };
      }

      // Normal signup flow - user is not signed in
      // Before creating account, check if OAuth account exists for this email
      // ONLY use cache - never call resetPasswordForEmail here to avoid sending unwanted emails
      const cacheKey = `oauth_conflict_${email.toLowerCase()}`;
      const cachedOAuthConflict = sessionStorage.getItem(cacheKey);
      
      let oauthAccountExists = false;
      
      // Only check cache - if not cached, allow signup and let sign-in detect conflicts later
      if (cachedOAuthConflict === 'true') {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:220',message:'OAuth account exists (from cache)',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H80'})}).catch(()=>{});
        // #endregion
        oauthAccountExists = true;
      }
      // If not cached, we don't check - let signup proceed
      // The sign-in function will detect OAuth conflicts and cache them for future attempts

      // If OAuth account exists, store password for linking after OAuth sign-in
      if (oauthAccountExists) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:262',message:'OAuth account exists, storing password for auto-linking',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H84'})}).catch(()=>{});
        // #endregion
        
        // Store password and metadata temporarily for linking after OAuth
        sessionStorage.setItem('pending_password_link', JSON.stringify({
          email: email,
          password: password,
          metadata: metadata,
          timestamp: Date.now()
        }));
        
        // Trigger automatic Google OAuth sign-in
        const redirectUrl = `${window.location.origin}/signup.html?autoLinkPassword=true`;
        const { data: oauthData, error: oauthError } = await window.supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:280',message:'Triggered OAuth sign-in for password linking',data:{hasError:!!oauthError,hasUrl:!!oauthData?.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H85'})}).catch(()=>{});
        // #endregion
        
        if (oauthError) {
          sessionStorage.removeItem('pending_password_link');
          throw oauthError;
        }
        
        return {
          success: false,
          error: 'Redirecting to Google to link your password...',
          oauthAccountExists: true,
          oauthRedirect: true,
          oauthUrl: oauthData.url
        };
      }

      // Set email redirect URL for confirmation
      // IMPORTANT: this must be a real file path for static hosting (Live Server),
      // otherwise you'll see "Cannot GET /auth/confirm".
      const emailRedirectTo = `${window.location.origin}/auth/confirm.html`;

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:266',message:'Calling auth.signUp (normal flow)',data:{email,emailRedirectTo},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H8'})}).catch(()=>{});
      // #endregion

      const { data, error } = await window.supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: metadata,
          emailRedirectTo: emailRedirectTo
        }
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:64',message:'auth.signUp response',data:{hasError:!!error,errorMessage:error?.message,errorStatus:error?.status,errorCode:error?.code,hasUser:!!data?.user,userId:data?.user?.id,userEmail:data?.user?.email,emailConfirmed:data?.user?.email_confirmed_at,hasSession:!!data?.session,hasVerificationEmailSent:data?.user !== null && data?.session === null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H9'})}).catch(()=>{});
      // #endregion

      // Check if signup created a user but there's an OAuth account conflict
      // After signup, if email verification is required, we can't test sign-in yet
      // But we can detect conflicts after the user tries to sign in
      // Note: This check happens in the sign-in function instead

      if (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:108',message:'Sign-up error details',data:{message:error.message,status:error.status,code:error.code,name:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H10'})}).catch(()=>{});
        // #endregion
        throw error;
      }

      // Create profile if user was created
      if (data.user) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:72',message:'User created, creating profile',data:{userId:data.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H11'})}).catch(()=>{});
        // #endregion
        await this.createProfile(data.user, metadata);
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:79',message:'Sign-up successful',data:{userId:data.user?.id,userEmail:data.user?.email,hasSession:!!data.session,emailConfirmed:!!data.user?.email_confirmed_at},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H12'})}).catch(()=>{});
      // #endregion

      return {
        success: true,
        user: data.user,
        session: data.session
      };
    } catch (error) {
      console.error('Sign up error:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:88',message:'Sign-up catch block',data:{message:error?.message,status:error?.status,code:error?.code,name:error?.name,stack:error?.stack?.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H13'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        error: error.message || 'Failed to create account'
      };
    }
  },

  // =====================================================
  // Sign Out
  // =====================================================
  async signOut() {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await window.supabaseClient.auth.signOut();

      if (error) throw error;

      // Clear stored session
      this.clearSession();

      return {
        success: true
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out'
      };
    }
  },

  // =====================================================
  // Reset Password (Send Reset Email)
  // =====================================================
  async resetPassword(email, redirectUrl = null) {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:116',message:'resetPassword called',data:{email,redirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H20'})}).catch(()=>{});
      // #endregion
      
      if (!window.supabaseClient) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:122',message:'Supabase client not initialized in resetPassword',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H20'})}).catch(()=>{});
        // #endregion
        throw new Error('Supabase client not initialized');
      }

      // Default redirect URL
      if (!redirectUrl) {
        // Route password recovery back through /auth/confirm.html so it can
        // set the session from the URL fragment, then redirect to reset-password.html.
        redirectUrl = `${window.location.origin}/auth/confirm.html`;
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:140',message:'Calling resetPasswordForEmail',data:{email,redirectUrl,supabaseClientExists:!!window.supabaseClient},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H21'})}).catch(()=>{});
      // #endregion

      const { data, error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:145',message:'resetPasswordForEmail response received',data:{hasError:!!error,errorMessage:error?.message,errorStatus:error?.status,errorCode:error?.code,hasData:!!data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H22'})}).catch(()=>{});
      // #endregion

      if (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:149',message:'Password reset error details',data:{message:error.message,status:error.status,name:error.name,code:error.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H23'})}).catch(()=>{});
        // #endregion
        throw error;
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:156',message:'Password reset success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H24'})}).catch(()=>{});
      // #endregion

      return {
        success: true,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:166',message:'Password reset catch block',data:{message:error?.message,status:error?.status,name:error?.name,code:error?.code,stack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H25'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        error: error.message || 'Failed to send reset email'
      };
    }
  },

  // =====================================================
  // Link Email/Password to OAuth Account
  // =====================================================
  // Allows users who signed in with OAuth to add email/password login
  async linkEmailPassword(email, password) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:233',message:'linkEmailPassword called',data:{email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H68'})}).catch(()=>{});
    // #endregion
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      // Check if user is authenticated
      const { data: { user }, error: userError } = await window.supabaseClient.auth.getUser();
      
      if (userError || !user) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:242',message:'User not authenticated for linking',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H69'})}).catch(()=>{});
        // #endregion
        throw new Error('You must be signed in to link a password. Please sign in with Google first.');
      }

      // Update user with password - this links email/password to the OAuth account
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:248',message:'Linking password to OAuth account',data:{userId:user.id,userEmail:user.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H70'})}).catch(()=>{});
      // #endregion

      const { data, error } = await window.supabaseClient.auth.updateUser({
        email: email, // Ensure email matches
        password: password
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:255',message:'updateUser response for linking',data:{hasError:!!error,errorMessage:error?.message,hasUser:!!data?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H71'})}).catch(()=>{});
      // #endregion

      if (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:260',message:'Link password error',data:{message:error.message,status:error.status,code:error.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H72'})}).catch(()=>{});
        // #endregion
        throw error;
      }

      // Clear OAuth conflict cache since password is now linked
      const cacheKey = `oauth_conflict_${email.toLowerCase()}`;
      sessionStorage.removeItem(cacheKey);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:270',message:'Password linked successfully',data:{userId:data.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H73'})}).catch(()=>{});
      // #endregion

      return {
        success: true,
        user: data.user,
        message: 'Password linked successfully! You can now sign in with either Google or email/password.'
      };
    } catch (error) {
      console.error('Link password error:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:280',message:'Link password catch block',data:{message:error?.message,status:error?.status,code:error?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H74'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        error: error.message || 'Failed to link password'
      };
    }
  },

  // =====================================================
  // Update Password
  // =====================================================
  async updatePassword(newPassword) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:233',message:'updatePassword called',data:{hasPassword:!!newPassword},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H42'})}).catch(()=>{});
    // #endregion
    try {
      if (!window.supabaseClient) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:235',message:'Supabase client not initialized in updatePassword',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H42'})}).catch(()=>{});
        // #endregion
        throw new Error('Supabase client not initialized');
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:239',message:'Calling auth.updateUser to update password',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H43'})}).catch(()=>{});
      // #endregion

      const { data, error } = await window.supabaseClient.auth.updateUser({
        password: newPassword
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:244',message:'updateUser response',data:{hasError:!!error,errorMessage:error?.message,errorStatus:error?.status,errorCode:error?.code,hasUser:!!data?.user,userId:data?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H44'})}).catch(()=>{});
      // #endregion

      if (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:247',message:'Update password error details',data:{message:error.message,status:error.status,code:error.code,name:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H45'})}).catch(()=>{});
        // #endregion
        throw error;
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:252',message:'Update password successful',data:{userId:data.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H46'})}).catch(()=>{});
      // #endregion

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Update password error:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:260',message:'Update password catch block',data:{message:error?.message,status:error?.status,code:error?.code,name:error?.name,stack:error?.stack?.substring(0,300)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H47'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        error: error.message || 'Failed to update password'
      };
    }
  },

  // =====================================================
  // Sign In with OAuth (Google, etc.)
  // =====================================================
  async signInWithOAuth(provider = 'google', redirectUrl = null) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:206',message:'signInWithOAuth called',data:{provider,redirectUrl,currentOrigin:window.location.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H14'})}).catch(()=>{});
    // #endregion
    try {
      if (!window.supabaseClient) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:208',message:'Supabase client not initialized in signInWithOAuth',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H14'})}).catch(()=>{});
        // #endregion
        throw new Error('Supabase client not initialized');
      }

      // Default redirect URL
      if (!redirectUrl) {
        // Ensure we're using the correct origin
        const origin = window.location.origin; // This should be http://localhost:8000 or http://127.0.0.1:8000
        redirectUrl = `${origin}/index.html`;
        
        // Debug: log the redirect URL
        console.log('OAuth redirect URL:', redirectUrl);
      }
     

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:223',message:'Calling signInWithOAuth',data:{provider,redirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H15'})}).catch(()=>{});
      // #endregion

      const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl
        }
      });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:231',message:'signInWithOAuth response',data:{hasError:!!error,errorMessage:error?.message,errorStatus:error?.status,hasUrl:!!data?.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H16'})}).catch(()=>{});
      // #endregion

      if (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:234',message:'OAuth sign-in error details',data:{message:error.message,status:error.status,code:error.code,name:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H17'})}).catch(()=>{});
        // #endregion
        throw error;
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:240',message:'OAuth sign-in successful, redirecting',data:{hasUrl:!!data.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H18'})}).catch(()=>{});
      // #endregion

      return {
        success: true,
        url: data.url
      };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:247',message:'OAuth sign-in catch block',data:{message:error?.message,status:error?.status,code:error?.code,name:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H19'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        error: error.message || 'Failed to sign in with OAuth'
      };
    }
  },

// =====================================================
// Get Current User
// =====================================================
async getCurrentUser() {
  try {
    if (!window.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { data: { user }, error } = await window.supabaseClient.auth.getUser();

    if (error) {
      // Don't log 401 errors - they're expected when user is not logged in
      if (error.status !== 401 && error.message !== 'Invalid API key') {
        console.error('Get user error:', error);
      }
      throw error;
    }

    return {
      success: true,
      user: user
    };
  } catch (error) {
    // Only log non-401 errors
    if (error.status !== 401 && error.message !== 'Invalid API key' && !error.message.includes('Bearer token')) {
      console.error('Get user error:', error);
    }
    return {
      success: false,
      error: error.message,
      user: null
    };
  }
},

// =====================================================
// Get Current Session
// =====================================================
async getSession() {
  try {
    if (!window.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const { data: { session }, error } = await window.supabaseClient.auth.getSession();

    if (error) {
      // Don't log 401 errors - they're expected when user is not logged in
      if (error.status !== 401 && !error.message.includes('Bearer token')) {
        console.error('Get session error:', error);
      }
      return {
        success: false,
        error: error.message,
        session: null
      };
    }

    return {
      success: true,
      session: session
    };
  } catch (error) {
    // Suppress 401 errors - they're expected when not logged in
    if (error.status !== 401 && !error.message.includes('Bearer token')) {
      console.error('Get session error:', error);
    }
    return {
      success: false,
      error: error.message,
      session: null
    };
  }
},

  // =====================================================
  // Check if User is Authenticated
  // =====================================================
  async isAuthenticated() {
    const sessionResult = await this.getSession();
    return sessionResult.success && sessionResult.session !== null;
  },

  // =====================================================
  // Create User Profile
  // =====================================================
  async createProfile(user, metadata = {}) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await window.supabaseClient
        .from('profiles')
        .insert({
          id: user.id,
          full_name: metadata.full_name || user.user_metadata?.full_name || null,
          role: 'student',
          avatar_url: user.user_metadata?.avatar_url || null
        });

      if (error) {
        // If profile already exists, try to update instead
        if (error.code === '23505') { // Unique violation
          console.log('Profile already exists, skipping creation');
          return { success: true };
        }
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Create profile error:', error);
      // Don't throw - profile creation failure shouldn't block signup
      return {
        success: false,
        error: error.message
      };
    }
  },

  // =====================================================
  // Get User Profile
  // =====================================================
  async getUserProfile(userId = null) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      // If no userId provided, get current user
      if (!userId) {
        const userResult = await this.getCurrentUser();
        if (!userResult.success || !userResult.user) {
          throw new Error('No user found');
        }
        userId = userResult.user.id;
      }

      const { data, error } = await window.supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.message,
        profile: null
      };
    }
  },

  // =====================================================
  // Update User Profile
  // =====================================================
  async updateProfile(userId, updates) {
    try {
      if (!window.supabaseClient) {
        throw new Error('Supabase client not initialized');
      }

      // If no userId provided, get current user
      if (!userId) {
        const userResult = await this.getCurrentUser();
        if (!userResult.success || !userResult.user) {
          throw new Error('No user found');
        }
        userId = userResult.user.id;
      }

      const { data, error } = await window.supabaseClient
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // =====================================================
  // Store Session in LocalStorage
  // =====================================================
  storeSession(session) {
    if (session) {
      try {
        localStorage.setItem('supabase.auth.session', JSON.stringify(session));
        localStorage.setItem('supabase.auth.token', session.access_token);
      } catch (error) {
        console.error('Error storing session:', error);
      }
    }
  },

  // =====================================================
  // Get Stored Session from LocalStorage
  // =====================================================
  getStoredSession() {
    try {
      const sessionStr = localStorage.getItem('supabase.auth.session');
      if (sessionStr) {
        return JSON.parse(sessionStr);
      }
    } catch (error) {
      console.error('Error reading stored session:', error);
    }
    return null;
  },

  // =====================================================
  // Clear Stored Session
  // =====================================================
  clearSession() {
    try {
      localStorage.removeItem('supabase.auth.session');
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },

  // =====================================================
  // Listen to Auth State Changes
  // =====================================================
  onAuthStateChange(callback) {
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      return null;
    }

    const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange((event, session) => {
      // Store session when it changes
      if (session) {
        this.storeSession(session);
      } else {
        this.clearSession();
      }

      // Call the callback
      if (callback) {
        callback(event, session);
      }
    });

    return subscription;
  },

  // =====================================================
  // Initialize Auth State Listener
  // =====================================================
  init() {
    // Set up auth state change listener
    this.onAuthStateChange((event, session) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:650',message:'Auth state change event received in Auth.init',data:{event,hasSession:!!session,userId:session?.user?.id,userEmail:session?.user?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H26'})}).catch(()=>{});
      // #endregion
      console.log('Auth state changed:', event, session ? 'User signed in' : 'User signed out');
      
      // Cache OAuth accounts ONLY when they're OAuth-only (no password identity)
      // This allows sign-up page to detect OAuth-only accounts and link passwords
      // If user has both OAuth and password, don't cache (they can use either method)
      if (session && session.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        const identities = session.user.identities || [];
        const hasOAuthIdentity = identities.some(identity => identity.provider !== 'email');
        const hasEmailIdentity = identities.some(identity => identity.provider === 'email');
        
        // Only cache if OAuth-only (has OAuth but no email/password identity)
        if (hasOAuthIdentity && !hasEmailIdentity && session.user.email) {
          // Cache that this email has OAuth-only account (for sign-up password linking)
          const cacheKey = `oauth_conflict_${session.user.email.toLowerCase()}`;
          sessionStorage.setItem(cacheKey, 'true');
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:867',message:'OAuth-only account detected, caching for password linking',data:{email:session.user.email,providers:identities.map(i => i.provider),hasEmailIdentity},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H91'})}).catch(()=>{});
          // #endregion
        } else if (hasOAuthIdentity && hasEmailIdentity && session.user.email) {
          // User has both OAuth and password - clear cache if it exists
          const cacheKey = `oauth_conflict_${session.user.email.toLowerCase()}`;
          sessionStorage.removeItem(cacheKey);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/46e91860-3131-4ee5-9172-bd43e7c7305a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'js/auth.js:880',message:'User has both OAuth and password, clearing cache',data:{email:session.user.email,providers:identities.map(i => i.provider)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H93'})}).catch(()=>{});
          // #endregion
        }
      }
      
      // Dispatch custom event for other parts of the app
      window.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { event, session }
      }));
    });

    // Restore session on page load
    this.restoreSession();
  },

  // =====================================================
  // Restore Session on Page Load
  // =====================================================
  async restoreSession() {
    try {
      const sessionResult = await this.getSession();
      if (sessionResult.success && sessionResult.session) {
        this.storeSession(sessionResult.session);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  }
};

// Export globally
window.Auth = Auth;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
  });
} else {
  Auth.init();
}

