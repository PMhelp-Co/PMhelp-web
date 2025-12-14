// =====================================================
// Feedback API
// =====================================================
// Functions for submitting course feedback to Supabase
// =====================================================

/**
 * Submit course feedback
 * @param {Object} feedbackData - Feedback data object
 * @param {string} feedbackData.course_id - Course ID
 * @param {number} feedbackData.rating - Rating (1-5)
 * @param {string} feedbackData.valuable_feedback - What user found valuable
 * @param {string} feedbackData.improvement_feedback - Suggestions for improvement
 * @param {string} feedbackData.name - User's name
 * @param {string} feedbackData.email - User's email
 * @param {string} [feedbackData.user_id] - User ID (optional, if authenticated)
 * @returns {Promise<Object>} - Created feedback record
 */
async function submitCourseFeedback(feedbackData) {
  try {
    // Get current user if authenticated
    const { data: { user } } = await window.supabase.auth.getUser();
    if (user) {
      feedbackData.user_id = user.id;
    }
    
    const { data, error } = await window.supabase
      .from('course_feedback')
      .insert([feedbackData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}

/**
 * Get feedback for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} - Array of feedback objects
 */
async function getCourseFeedback(courseId) {
  try {
    const { data, error } = await window.supabase
      .from('course_feedback')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching course feedback:', error);
    throw error;
  }
}

// Export functions to window for global access
window.feedbackAPI = {
  submitCourseFeedback,
  getCourseFeedback
};
