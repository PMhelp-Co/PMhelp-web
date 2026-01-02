// =====================================================
// Analytics Module
// =====================================================
// Centralized Google Analytics tracking for the platform
// =====================================================

const ANALYTICS_ID = 'G-F1EPZTB3XC';

/**
 * Initialize Google Analytics
 */
function initAnalytics() {
  console.log('[ANALYTICS] 🚀 Initializing Google Analytics...');
  if (window.dataLayer && window.gtag) {
    console.log('[ANALYTICS] ✅ Analytics already initialized');
    return; // Already initialized
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ANALYTICS_ID, { send_page_view: true });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
  document.head.appendChild(script);
  console.log('[ANALYTICS] ✅ Analytics initialization complete');
}

/**
 * Track page view
 * @param {string} path - Page path
 * @param {string} title - Page title
 */
function trackPageView(path, title) {
  console.log('[ANALYTICS] 📄 Tracking page view:', { path, title });
  if (typeof gtag === 'undefined') {
    console.warn('[ANALYTICS] ⚠️ Analytics not initialized. Page view not tracked.');
    return;
  }
  try {
    gtag('config', ANALYTICS_ID, {
      page_path: path,
      page_title: title
    });
    console.log('[ANALYTICS] ✅ Page view tracked:', { path, title });
  } catch (error) {
    console.error('[ANALYTICS] ❌ Error tracking page view:', error);
  }
}

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {Object} eventParams - Event parameters
 */
function trackEvent(eventName, eventParams = {}) {
  if (typeof gtag === 'undefined') {
    console.warn('[ANALYTICS] ⚠️ Analytics not initialized. Event not tracked.');
    return;
  }
  try {
    console.log('[ANALYTICS] 📊 Tracking event:', eventName, eventParams);
    gtag('event', eventName, eventParams);
    console.log('[ANALYTICS] ✅ Event tracked successfully:', eventName);
    
    // Log to dataLayer for debugging
    console.log('[ANALYTICS] 📋 Latest dataLayer entry:', window.dataLayer?.slice(-1));
  } catch (error) {
    console.error('[ANALYTICS] ❌ Error tracking event:', error);
  }
}

/**
 * Track lesson completion
 */
function trackLessonCompleted(courseId, lessonId, courseName, lessonName, userId) {
  console.log('[ANALYTICS] 🎓 Tracking lesson completion:', {
    courseId,
    lessonId,
    courseName,
    lessonName,
    userId: userId ? 'provided' : 'missing'
  });
  const hashedUserId = hashUserId(userId);
  trackEvent('lesson_completed', {
    course_id: courseId,
    lesson_id: lessonId,
    course_name: courseName,
    lesson_name: lessonName,
    user_id: hashedUserId
  });
}

/**
 * Track course completion
 */
function trackCourseCompleted(courseId, courseName, completionPercentage, userId) {
  console.log('[ANALYTICS] 🎉 Tracking course completion:', {
    courseId,
    courseName,
    completionPercentage,
    userId: userId ? 'provided' : 'missing'
  });
  const hashedUserId = hashUserId(userId);
  trackEvent('course_completed', {
    course_id: courseId,
    course_name: courseName,
    completion_percentage: completionPercentage,
    user_id: hashedUserId
  });
}

/**
 * Track course enrollment
 */
function trackCourseEnrolled(courseId, courseName, userId) {
  const hashedUserId = hashUserId(userId);
  trackEvent('course_enrolled', {
    course_id: courseId,
    course_name: courseName,
    user_id: hashedUserId
  });
}

/**
 * Track progress milestone (25%, 50%, 75%)
 */
function trackProgressMilestone(courseId, milestone, completionPercentage, userId) {
  console.log('[ANALYTICS] 🎯 Tracking progress milestone:', {
    courseId,
    milestone,
    completionPercentage,
    userId: userId ? 'provided' : 'missing'
  });
  const hashedUserId = hashUserId(userId);
  trackEvent('progress_milestone', {
    course_id: courseId,
    milestone: milestone,
    completion_percentage: completionPercentage,
    user_id: hashedUserId
  });
}

/**
 * Track course interaction (start/continue buttons)
 */
function trackCourseInteraction(courseId, courseName, action, userId) {
  const hashedUserId = hashUserId(userId);
  trackEvent('course_interaction', {
    course_id: courseId,
    course_name: courseName,
    action: action, // 'start' or 'continue'
    user_id: hashedUserId
  });
}

/**
 * Track dashboard view
 */
function trackDashboardView(userId) {
  const hashedUserId = hashUserId(userId);
  trackEvent('dashboard_viewed', {
    user_id: hashedUserId
  });
}

/**
 * Track newsletter subscription
 */
function trackNewsletterSubscribed(email) {
  trackEvent('newsletter_subscribed', {
    email_domain: email.split('@')[1] // Only track domain, not full email
  });
}

/**
 * Get current user ID
 */
async function getCurrentUserId() {
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    return null;
  }
}

/**
 * Hash user ID for privacy
 */
function hashUserId(userId) {
  if (!userId) return 'anonymous';
  // Simple hash function (for production, consider using crypto.subtle)
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Initialize analytics when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
  initAnalytics();
}

// Export to window for global access
window.analytics = {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackLessonCompleted,
  trackCourseCompleted,
  trackCourseEnrolled,
  trackProgressMilestone,
  trackCourseInteraction,
  trackDashboardView,
  trackNewsletterSubscribed,
  getCurrentUserId,
  hashUserId
};
