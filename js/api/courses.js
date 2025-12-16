// =====================================================
// Courses API
// =====================================================
// Functions for fetching course data from Supabase
// =====================================================

/**
 * Fetch all published courses
 * @returns {Promise<Array>} - Array of course objects
 */
async function getAllCourses() {
  try {
    const { data, error } = await window.supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}

/**
 * Fetch a single course by slug
 * @param {string} slug - Course slug
 * @returns {Promise<Object>} - Course object
 */
async function getCourseBySlug(slug) {
  try {
    const { data, error } = await window.supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching course by slug:', error);
    throw error;
  }
}

/**
 * Fetch a single course by ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} - Course object
 */
async function getCourseById(courseId) {
  try {
    const { data, error } = await window.supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('is_published', true)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    throw error;
  }
}

/**
 * Fetch lessons for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} - Array of lesson objects
 */
async function getCourseLessons(courseId) {
  try {
    const { data, error } = await window.supabase
      .from('lessons')
      .select('*') // select only what you need
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('order_index', { ascending: true, nullsFirst: true }); // ascending within module

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching course lessons:', error);
    throw error;
  }
}

/**
 * Fetch learning objectives for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} - Array of learning objective objects
 */
async function getCourseLearningObjectives(courseId) {
  try {
    const { data, error } = await window.supabase
      .from('course_learning_objectives')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching learning objectives:', error);
    throw error;
  }
}

/**
 * Get previous course by slug
 * @param {string} currentSlug - Current course slug
 * @returns {Promise<Object|null>} - Previous course or null
 */
async function getPreviousCourse(currentSlug) {
  try {
    // First get current course to find its order_index
    const currentCourse = await getCourseBySlug(currentSlug);
    if (!currentCourse || !currentCourse.order_index) return null;
    
    const { data, error } = await window.supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .lt('order_index', currentCourse.order_index)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || null;
  } catch (error) {
    console.error('Error fetching previous course:', error);
    return null;
  }
}

/**
 * Get next course by slug
 * @param {string} currentSlug - Current course slug
 * @returns {Promise<Object|null>} - Next course or null
 */
async function getNextCourse(currentSlug) {
  try {
    // First get current course to find its order_index
    const currentCourse = await getCourseBySlug(currentSlug);
    if (!currentCourse || !currentCourse.order_index) return null;
    
    const { data, error } = await window.supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .gt('order_index', currentCourse.order_index)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data || null;
  } catch (error) {
    console.error('Error fetching next course:', error);
    return null;
  }
}

/**
 * Get first course (lowest order_index)
 * @returns {Promise<Object|null>} - First course or null
 */
async function getFirstCourse() {
  try {
    const { data, error } = await window.supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching first course:', error);
    return null;
  }
}

/**
 * Get last course (highest order_index)
 * @returns {Promise<Object|null>} - Last course or null
 */
async function getLastCourse() {
  try {
    const { data, error } = await window.supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching last course:', error);
    return null;
  }
}

// Export functions to window for global access
window.coursesAPI = {
  getAllCourses,
  getCourseBySlug,
  getCourseById,
  getCourseLessons,
  getCourseLearningObjectives,
  getPreviousCourse,
  getNextCourse,
  getFirstCourse,  // Add this
  getLastCourse   // Add this
};
