// =====================================================
// Content Sources API
// =====================================================
// Functions for fetching content sources data from Supabase
// =====================================================

/**
 * Fetch content sources for a course/module
 * @param {string} moduleSlug - Module slug (e.g., 'introduction-to-product-management')
 * @returns {Promise<Array>} - Array of content source objects
 */
async function getContentSourcesByModule(moduleSlug) {
  try {
    // Fetch all content sources (since module_slug is a text field, not an array)
    const { data, error } = await window.supabase
      .from('content_sources')
      .select('*');

    
    
    if (error) throw error;

    console.log('All content sources:', data);
    console.log('Looking for module:', moduleSlug);
    
    // Filter results where moduleSlug is in the module_slug field
    // module_slug format: 'slug1; slug2; slug3' or 'slug1' or 'slug1; slug2'
    const filtered = (data || []).filter(source => {
      if (!source.module_slug) return false;
      console.log(source.module_slug);

      
      const slugs = source.module_slug.split(';').map(s => s.trim());
      console.log(slugs);

      return slugs.includes(moduleSlug);
    });
    
    return filtered;
  } catch (error) {
    console.error('Error fetching content sources:', error);
    throw error;
  }
  
}

/**
 * Fetch all content sources
 * @returns {Promise<Array>} - Array of content source objects
 */
async function getAllContentSources() {
  try {
    const { data, error } = await window.supabase
      .from('content_sources')
      .select('*');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all content sources:', error);
    throw error;
  }
}

/**
 * Fetch a single content source by slug
 * @param {string} slug - Content source slug
 * @returns {Promise<Object>} - Content source object
 */
async function getContentSourceBySlug(slug) {
  try {
    const { data, error } = await window.supabase
      .from('content_sources')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching content source by slug:', error);
    throw error;
  }
}

/**
 * Fetch content sources for a specific lesson
 * @param {string} lessonSlug - Lesson slug (e.g., 'who-are-stakeholders-and-how-to-get-them-on-your-side')
 * @returns {Promise<Array>} - Array of content source objects
 */
async function getContentSourcesByLesson(lessonSlug) {
  try {
    // Fetch all content sources
    const { data, error } = await window.supabase
      .from('content_sources')
      .select('*');
    
    if (error) throw error;

    // Filter results where lessonSlug is in the lessons field
    // lessons format: 'lesson-slug1; lesson-slug2; lesson-slug3' or 'lesson-slug1'
    const filtered = (data || []).filter(source => {
      if (!source.lessons) return false;
      
      // Split by semicolon and trim each slug
      const lessonSlugs = source.lessons.split(';').map(s => s.trim());
      
      // Check if the current lesson slug is in the list
      return lessonSlugs.includes(lessonSlug);
    });
    
    return filtered;
  } catch (error) {
    console.error('Error fetching content sources by lesson:', error);
    throw error;
  }
}

// Export functions to window for global access
window.contentSourcesAPI = {
  getContentSourcesByModule,
  getContentSourcesByLesson,
  getAllContentSources,
  getContentSourceBySlug
};
