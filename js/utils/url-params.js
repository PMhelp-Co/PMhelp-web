// =====================================================
// URL Parameter Utilities
// =====================================================
// Helper functions for working with URL parameters
// =====================================================

/**
 * Get a URL parameter by name
 * @param {string} paramName - The name of the parameter to get
 * @returns {string|null} - The parameter value or null if not found
 */
function getURLParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

/**
 * Get all URL parameters as an object
 * @returns {Object} - Object with all URL parameters
 */
function getAllURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }
  return params;
}

/**
 * Get course slug from URL
 * Supports both ?slug=course-slug and ?course=course-slug formats
 * @returns {string|null} - The course slug or null if not found
 */
function getCourseSlugFromURL() {
  return getURLParam('slug') || getURLParam('course');
}

/**
 * Get lesson slug from URL
 * @returns {string|null} - The lesson slug or null if not found
 */
function getLessonSlugFromURL() {
  return getURLParam('lesson');
}

/**
 * Build URL with parameters
 * @param {string} baseUrl - Base URL (e.g., 'detail_course.html')
 * @param {Object} params - Object with parameters to add
 * @returns {string} - Complete URL with parameters
 */
function buildURLWithParams(baseUrl, params) {
  const url = new URL(baseUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  });
  return url.pathname + url.search;
}

// Export functions to window for global access
window.urlUtils = {
  getURLParam,
  getAllURLParams,
  getCourseSlugFromURL,
  getLessonSlugFromURL,
  buildURLWithParams
};
