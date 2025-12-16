// =====================================================
// Lessons API
// =====================================================
// Functions for fetching lesson data from Supabase
// =====================================================

/**
 * Fetch a lesson by slug
 * @param {string} courseSlug - Course slug
 * @param {string} lessonSlug - Lesson slug
 * @returns {Promise<Object>} - Lesson object
 */
async function getLessonBySlug(courseSlug, lessonSlug) {
  try {
    // First get the course to get course_id
    const course = await window.coursesAPI.getCourseBySlug(courseSlug);
    if (!course) throw new Error('Course not found');
    
    const { data, error } = await window.supabase
      .from('lessons')
      .select('*')
      .eq('course_id', course.id)
      .eq('slug', lessonSlug)
      .eq('is_published', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Lesson not found');
    }
    
    // Return the first result (in case of duplicates, prefer the one with lowest order_index)
    return data[0];
  } catch (error) {
    console.error('Error fetching lesson by slug:', error);
    throw error;
  }
}

/**
 * Fetch a lesson by ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<Object>} - Lesson object
 */
async function getLessonById(lessonId) {
  try {
    const { data, error } = await window.supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('is_published', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching lesson by ID:', error);
    throw error;
  }
}

/**
 * Get next lesson in course
 * @param {string} currentLessonId - Current lesson ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object|null>} - Next lesson or null
 */
async function getNextLesson(currentLessonId, courseId) {
  try {
    // Get current lesson to find its order_index
    const currentLesson = await getLessonById(currentLessonId);
    if (!currentLesson || currentLesson.order_index === undefined) return null;
    
    const { data, error } = await window.supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .gt('order_index', currentLesson.order_index)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || null;
  } catch (error) {
    console.error('Error fetching next lesson:', error);
    return null;
  }
}

/**
 * Get previous lesson in course
 * @param {string} currentLessonId - Current lesson ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object|null>} - Previous lesson or null
 */
async function getPreviousLesson(currentLessonId, courseId) {
  try {
    // Get current lesson to find its order_index
    const currentLesson = await getLessonById(currentLessonId);
    if (!currentLesson || currentLesson.order_index === undefined) return null;
    
    const { data, error } = await window.supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .lt('order_index', currentLesson.order_index)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || null;
  } catch (error) {
    console.error('Error fetching previous lesson:', error);
    return null;
  }
}

// Export functions to window for global access
window.lessonsAPI = {
  getLessonBySlug,
  getLessonById,
  getNextLesson,
  getPreviousLesson
};
