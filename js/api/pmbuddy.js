// =====================================================
// PM Buddy API - Supabase Integration (FIXED v2)
// =====================================================
// Handles mentee and mentor application submissions
// =====================================================

const PMBuddyAPI = {
  // =====================================================
  // Submit Application
  // =====================================================
  async submitApplication(type, formData) {
    try {
      console.log('🔍 PM Buddy API - Starting submission');
      console.log('Type:', type);
      console.log('Type check:', type === 'mentor', type === 'mentee');
      
      // Validate type
      if (type !== 'mentee' && type !== 'mentor') {
        console.error('❌ Invalid type:', type);
        return {
          success: false,
          error: 'Invalid application type. Must be "mentee" or "mentor".'
        };
      }

      // Get the correct Supabase client
      const supabase = window.supabase || window.supabaseClient;
      
      if (!supabase) {
        console.error('❌ Supabase client not found');
        console.log('window.supabase:', window.supabase);
        console.log('window.supabaseClient:', window.supabaseClient);
        return {
          success: false,
          error: 'Supabase client not initialized. Please refresh the page.'
        };
      }

      console.log('✅ Supabase client found');

      // CRITICAL: Check actual Supabase session, not just AuthState
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUser = session?.user || null;
      
      console.log('🔐 Supabase session check:');
      console.log('- Has session:', !!session);
      console.log('- Session user:', supabaseUser?.id);
      
      // Get current user from AuthState
      let userId = null;
      let isAuthenticated = false;
      
      if (window.AuthState && window.AuthState.getIsAuthenticated()) {
        const user = window.AuthState.getCurrentUser();
        userId = user?.id || null;
        isAuthenticated = !!userId;
      }

      console.log('📊 AuthState check:');
      console.log('- AuthState authenticated:', isAuthenticated);
      console.log('- AuthState user ID:', userId);
      
      // CRITICAL: Use Supabase session user, not AuthState user
      // Because the Supabase client uses its own session
      const actualUserId = supabaseUser?.id || null;
      const actuallyAuthenticated = !!actualUserId;
      
      console.log('✅ Final auth status:');
      console.log('- Actually authenticated:', actuallyAuthenticated);
      console.log('- Actual user ID:', actualUserId);

      // Prepare data for Supabase
      const applicationData = {
        type: type,
        full_name: formData.fullName,
        email: formData.email,
        linkedin_url: formData.linkedinUrl,
        industry: formData.industry || null,
        experience_level: formData.experienceLevel || null,
        goals: formData.goals || [],
        additional_info: formData.additionalInfo || null,
        status: 'pending'
      };

      // CRITICAL FIX: Only include user_id if Supabase session exists
      if (actualUserId) {
        applicationData.user_id = actualUserId;
        console.log('👤 Adding user_id to data:', actualUserId);
      } else {
        console.log('👤 No user_id - anonymous submission');
      }

      console.log('📦 Data to insert:', JSON.stringify(applicationData, null, 2));

      // Validate required fields
      if (!applicationData.full_name || !applicationData.email || !applicationData.linkedin_url) {
        console.error('❌ Missing required fields');
        return {
          success: false,
          error: 'Please fill in all required fields (Full Name, Email, LinkedIn URL).'
        };
      }

      // Validate goals (at least one required)
      if (!applicationData.goals || applicationData.goals.length === 0) {
        console.error('❌ No goals selected');
        return {
          success: false,
          error: 'Please select at least one goal.'
        };
      }

      console.log('✅ Validation passed');

      // For mentor applications by anonymous users, we might need to force anonymous mode
      if (type === 'mentor' && !actuallyAuthenticated) {
        console.log('🔓 Mentor submission - ensuring anonymous mode');
        
        // Double-check: if there's a stale session, clear it
        if (session) {
          console.warn('⚠️ Found stale session for anonymous submission - clearing');
          await supabase.auth.signOut();
        }
      }

      // Insert into Supabase
      console.log('📤 Sending to Supabase...');
      
      const { data, error } = await supabase
        .from('pm_buddy_applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        // Log more context for RLS errors
        if (error.message.includes('row-level security')) {
          console.error('🔒 RLS Policy Violation Details:');
          console.error('- Type being inserted:', applicationData.type);
          console.error('- Supabase user:', actualUserId);
          console.error('- AuthState user:', userId);
          console.error('- Has session:', !!session);
          console.error('- Expected: mentor without auth OR any type with auth');
          
          // Check localStorage for stale tokens
          console.error('🔍 Checking localStorage:');
          const lsKeys = Object.keys(localStorage).filter(k => k.includes('supabase'));
          console.error('- Supabase keys in localStorage:', lsKeys);
          lsKeys.forEach(key => {
            try {
              const value = localStorage.getItem(key);
              console.error(`  - ${key}:`, value ? 'exists' : 'null');
            } catch (e) {
              console.error(`  - ${key}: error reading`);
            }
          });
        }
        
        return {
          success: false,
          error: error.message || 'Failed to submit application. Please try again.'
        };
      }

      console.log('✅ Success!', data);
      return {
        success: true,
        data: data,
        message: 'Application submitted successfully! We\'ll be in touch soon.'
      };

    } catch (error) {
      console.error('❌ PM Buddy API Exception:', error);
      console.error('Exception stack:', error.stack);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again later.'
      };
    }
  },

  // =====================================================
  // Get User Applications
  // =====================================================
  async getApplications(type = null) {
    try {
      // Check if user is authenticated
      if (!window.AuthState || !window.AuthState.getIsAuthenticated()) {
        return {
          success: false,
          error: 'You must be signed in to view your applications.'
        };
      }

      const user = window.AuthState.getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'User not found.'
        };
      }

      // Get the correct Supabase client
      const supabase = window.supabase || window.supabaseClient;
      
      if (!supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized.'
        };
      }

      // Build query
      let query = supabase
        .from('pm_buddy_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Filter by type if provided
      if (type && (type === 'mentee' || type === 'mentor')) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('PM Buddy API Error:', error);
        return {
          success: false,
          error: error.message || 'Failed to fetch applications.'
        };
      }

      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('PM Buddy API Exception:', error);
      return {
        success: false,
        error: 'An unexpected error occurred.'
      };
    }
  }
};

// Export globally
window.PMBuddyAPI = PMBuddyAPI;