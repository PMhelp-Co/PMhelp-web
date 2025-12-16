// =====================================================
// Progress API
// =====================================================
// Functions for tracking user progress on courses and lessons
// =====================================================

/**
 * Mark a lesson as completed
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} - Created or updated progress record
 */
async function markLessonComplete(courseId, lessonId) {
  try {
    // Get current user
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to track progress');
    }

    // Check if progress already exists
    const { data: existing, error: checkError } = await window.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError; // Re-throw if it's not a "no rows" error
    }

    if (existing) {
      // Update existing progress
      const { data, error } = await window.supabase
        .from('user_progress')
        .update({
          completed_at: new Date().toISOString(),
          progress_percentage: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new progress record
      const { data, error } = await window.supabase
        .from('user_progress')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
          progress_percentage: 100
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    // Handle RLS or authentication errors gracefully
    if (error.code === 'PGRST301' || error.status === 406 || error.message?.includes('permission')) {
      console.warn('Progress tracking blocked by RLS or permissions. User may not be authenticated or RLS policy may need adjustment.');
      return null; // Return null instead of throwing to allow page to continue loading
    }
    console.error('Error marking lesson complete:', error);
    throw error;
  }
}

/**
 * Get user progress for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} - Progress data with completion percentage
 */
async function getCourseProgress(courseId) {
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
      return {
        completedLessons: [],
        totalLessons: 0,
        completionPercentage: 0
      };
    }

    // Get all lessons for the course
    const { data: lessons, error: lessonsError } = await window.supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('is_published', true);

    if (lessonsError) throw lessonsError;

    // Get completed lessons
    const { data: progress, error: progressError } = await window.supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .not('completed_at', 'is', null);

    if (progressError) throw progressError;

    const completedLessonIds = (progress || []).map(p => p.lesson_id);
    const totalLessons = lessons?.length || 0;
    const completedCount = completedLessonIds.length;
    const completionPercentage = totalLessons > 0 
      ? Math.round((completedCount / totalLessons) * 100) 
      : 0;

    return {
      completedLessons: completedLessonIds,
      totalLessons,
      completedCount,
      completionPercentage
    };
  } catch (error) {
    console.error('Error getting course progress:', error);
    throw error;
  }
}

/**
 * Check if a lesson is completed
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<boolean>} - True if lesson is completed
 */
async function isLessonCompleted(lessonId) {
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await window.supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .not('completed_at', 'is', null)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error) {
    console.error('Error checking lesson completion:', error);
    return false;
  }
}

/**
 * Update lesson progress percentage (for video watching, article reading, etc.)
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {number} percentage - Progress percentage (0-100)
 * @returns {Promise<Object>} - Updated progress record
 */
async function updateLessonProgress(courseId, lessonId, percentage) {
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to track progress');
    }

    // Clamp percentage between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    // Check if progress exists
    const { data: existing, error: checkError } = await window.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError; // Re-throw if it's not a "no rows" error
    }

    if (existing) {
      // Update existing progress
      const updateData = {
        progress_percentage: clampedPercentage,
        updated_at: new Date().toISOString()
      };

      // Mark as completed if percentage is 100
      if (clampedPercentage === 100 && !existing.completed_at) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await window.supabase
        .from('user_progress')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new progress record
      const insertData = {
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        progress_percentage: clampedPercentage
      };

      // Mark as completed if percentage is 100
      if (clampedPercentage === 100) {
        insertData.completed_at = new Date().toISOString();
      }

      const { data, error } = await window.supabase
        .from('user_progress')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    // Handle RLS or authentication errors gracefully
    if (error.code === 'PGRST301' || error.status === 406 || error.message?.includes('permission')) {
      console.warn('Progress tracking blocked by RLS or permissions. User may not be authenticated or RLS policy may need adjustment.');
      return null; // Return null instead of throwing to allow page to continue loading
    }
    console.error('Error updating lesson progress:', error);
    throw error;
  }
}

// Export functions to window for global access
window.progressAPI = {
  markLessonComplete,
  getCourseProgress,
  isLessonCompleted,
  updateLessonProgress
};

