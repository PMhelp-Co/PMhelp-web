// =====================================================
// PM Buddy API - Supabase Integration
// =====================================================
// Handles mentee and mentor application submissions
// =====================================================

const PMBuddyAPI = {
  // =====================================================
  // Submit Application
  // =====================================================
  // Submits a mentee or mentor application to Supabase
  // =====================================================
  async submitApplication(type, formData) {
    try {
      // Validate type
      if (type !== 'mentee' && type !== 'mentor') {
        return {
          success: false,
          error: 'Invalid application type. Must be "mentee" or "mentor".'
        };
      }

      // Get current user if logged in
      let userId = null;
      if (window.AuthState && window.AuthState.getIsAuthenticated()) {
        const user = window.AuthState.getCurrentUser();
        userId = user?.id || null;
      }

      // Prepare data for Supabase
      const applicationData = {
        type: type,
        full_name: formData.fullName,
        email: formData.email,
        linkedin_url: formData.linkedinUrl,
        industry: formData.industry || null,
        experience_level: formData.experienceLevel || null,
        goals: formData.goals || [], // Array of selected goals
        additional_info: formData.additionalInfo || null,
        status: 'pending',
        user_id: userId // Can be null for anonymous submissions
      };

      // Validate required fields
      if (!applicationData.full_name || !applicationData.email || !applicationData.linkedin_url) {
        return {
          success: false,
          error: 'Please fill in all required fields (Full Name, Email, LinkedIn URL).'
        };
      }

      // Validate goals (at least one required)
      if (!applicationData.goals || applicationData.goals.length === 0) {
        return {
          success: false,
          error: 'Please select at least one goal.'
        };
      }

      // Insert into Supabase
      if (!window.supabase) {
        return {
          success: false,
          error: 'Supabase client not initialized. Please refresh the page.'
        };
      }

      const { data, error } = await window.supabase
        .from('pm_buddy_applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) {
        console.error('PM Buddy API Error:', error);
        return {
          success: false,
          error: error.message || 'Failed to submit application. Please try again.'
        };
      }

      return {
        success: true,
        data: data,
        message: 'Application submitted successfully! We\'ll be in touch soon.'
      };

    } catch (error) {
      console.error('PM Buddy API Exception:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again later.'
      };
    }
  },

  // =====================================================
  // Get User Applications
  // =====================================================
  // Gets all applications for the current user (optional)
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

      // Build query
      let query = window.supabase
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
