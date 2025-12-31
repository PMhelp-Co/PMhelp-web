// =====================================================
// Lesson Detail Page
// =====================================================
// Handles data fetching and rendering for lesson detail page
// =====================================================

let currentLesson = null;
let currentCourse = null;

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Render breadcrumb navigation (back to course)
 */
function renderBreadcrumb() {
  const breadcrumbLink = document.querySelector('.div-block-8 .back');
  if (breadcrumbLink && currentCourse) {
    breadcrumbLink.href = `detail_course.html?slug=${currentCourse.slug}`;
  }
}

/**
 * Render course title in breadcrumb area
 */
function renderCourseTitle() {
  const titleElement = document.querySelector('.div-block-8 .text-64.details');
  if (titleElement && currentCourse) {
    titleElement.textContent = currentCourse.title;
  }
}

/**
 * Render lesson title
 */
function renderLessonTitle() {
  const titleElement = document.querySelector('.rdv-content-div .title_header');
  if (titleElement && currentLesson) {
    titleElement.textContent = currentLesson.title;
  }
}

/**
 * Render lesson content (video or article)
 */
function renderLessonContent() {
  const contentElement = document.querySelector('.rdv-content-div .rich-text-block');
  if (!contentElement || !currentLesson) return;

  // Clear existing content
  contentElement.innerHTML = '';

  // Check if content already includes video embeds
  const hasVideoInContent = currentLesson.content && 
    (currentLesson.content.includes('<iframe') || currentLesson.content.includes('youtube.com/embed'));

  // If lesson has video_url but no video in content, render video first
  if (currentLesson.video_url && !hasVideoInContent) {
    const videoContainer = document.createElement('div');
    videoContainer.className = 'lesson-video-container';
    videoContainer.style.cssText = 'margin-bottom: 2rem;';
    
    const videoWrapper = document.createElement('figure');
    videoWrapper.className = 'w-richtext-figure-type-video w-richtext-align-fullwidth';
    videoWrapper.style.cssText = 'padding-bottom: 56.25%; position: relative; width: 100%;';
    
    const videoDiv = document.createElement('div');
    videoDiv.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';
    
    // Enhance YouTube URL with enablejsapi for progress tracking
    let videoUrl = currentLesson.video_url;
    if (videoUrl.includes('youtube.com/embed') || videoUrl.includes('youtu.be')) {
      const url = new URL(videoUrl);
      url.searchParams.set('enablejsapi', '1');
      url.searchParams.set('origin', window.location.origin);
      videoUrl = url.toString();
    }
    
    const iframe = document.createElement('iframe');
    iframe.src = videoUrl;
    iframe.allowFullscreen = true;
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.title = currentLesson.title;
    iframe.style.cssText = 'width: 100%; height: 100%;';
    iframe.id = `lesson-video-${currentLesson.id}`;
    
    videoDiv.appendChild(iframe);
    videoWrapper.appendChild(videoDiv);
    videoContainer.appendChild(videoWrapper);
    contentElement.appendChild(videoContainer);

    // Track video progress
    iframe.addEventListener('load', () => {
      // Mark as started (25% progress)
      if (currentCourse && currentLesson) {
        window.progressAPI?.updateLessonProgress(
          currentCourse.id,
          currentLesson.id,
          25
        ).catch(err => console.error('Error tracking video start:', err));
      }

      // Note: Full video progress tracking would require YouTube IFrame API
      // For now, we mark as started when video loads
      // Users can manually mark as complete or we can add a "Mark as Complete" button
    });
  }

  // Render text content if available
  if (currentLesson.content) {
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = currentLesson.content;
    contentElement.appendChild(contentDiv);

    // Track reading progress for articles (not videos)
    const isArticle = !currentLesson.video_url || hasVideoInContent;
    if (isArticle && currentLesson.content) {
      // Mark as started when content is rendered
      if (currentCourse && currentLesson) {
        window.progressAPI?.updateLessonProgress(
          currentCourse.id,
          currentLesson.id,
          25
        ).catch(err => console.error('Error tracking reading start:', err));
      }

      // Mark as complete when user scrolls to bottom
      let scrollTracked = false;
      const handleScroll = () => {
        if (scrollTracked) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

        // Mark as complete when scrolled 80% through
        if (scrollPercentage >= 80 && currentCourse && currentLesson) {
          scrollTracked = true;
          window.progressAPI?.markLessonComplete(
            currentCourse.id,
            currentLesson.id
          ).catch(err => console.error('Error marking lesson complete:', err));
          window.removeEventListener('scroll', handleScroll);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  }
}

/**
 * Render course curriculum sidebar
 */
async function renderCurriculum() {
  if (!currentCourse) return;

  try {
    const lessons = await window.coursesAPI.getCourseLessons(currentCourse.id);
    const container = document.querySelector('.collection-list-wrapper-6 .w-dyn-items');
    
    if (!container) return;

    // Clear existing items
    container.innerHTML = '';

    // Get user progress to show completed lessons
    let completedLessonIds = [];
    try {
      const progress = await window.progressAPI?.getCourseProgress(currentCourse.id);
      completedLessonIds = progress?.completedLessons || [];
    } catch (error) {
      console.error('Error fetching progress:', error);
    }

    // Render each lesson
    lessons.forEach((lesson) => {
      const isCurrentLesson = currentLesson && (lesson.id === currentLesson.id || lesson.slug === currentLesson.slug);
      const isCompleted = completedLessonIds.includes(lesson.id);
      
      const item = document.createElement('div');
      item.className = 'collection-item-8 w-dyn-item';
      item.setAttribute('role', 'listitem');

      // Determine icon based on lesson type
      const isVideo = lesson.class === 'Video' || lesson.video_url;
      const articleIcon = 'https://cdn.prod.website-files.com/66bfc83501d1faf8dbade3d5/6704403a8c7c235704031bd0_material-symbols-light_article-outline.png';
      const videoIcon = 'https://cdn.prod.website-files.com/66bfc83501d1faf8dbade3d5/6704403a2c121c9c8c458f1d_Container.png';

      const duration = lesson.duration ? formatDuration(lesson.duration) : '';

      // Build link with proper active state
      const linkClass = `content w-inline-block${isCurrentLesson ? ' w--current' : ''}`;
      const ariaCurrent = isCurrentLesson ? ' aria-current="page"' : '';

      item.innerHTML = `
        <a href="detail_course-lesson.html?course=${currentCourse.slug}&lesson=${lesson.slug}" 
           class="${linkClass}"${ariaCurrent}>
          <img src="${videoIcon}" loading="lazy" alt="" class="image-8 ${!isVideo ? 'w-condition-invisible' : ''}">
          <img src="${articleIcon}" loading="lazy" alt="" class="image-8 ${isVideo ? 'w-condition-invisible' : ''}">
          <div class="font-18px">
            ${lesson.title}
            ${isCompleted ? ' ✓' : ''}
          </div>
        </a>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('Error rendering curriculum:', error);
  }
}

/**
 * Get last lesson in course (for looping)
 */
async function getLastLessonInCourse(courseId) {
  try {
    const { data, error } = await window.supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching last lesson:', error);
    return null;
  }
}

/**
 * Render "Up Next" section with looping navigation
 */
async function renderUpNext() {
  if (!currentLesson || !currentCourse) return;

  try {
    const [nextLesson] = await Promise.all([
      window.lessonsAPI.getNextLesson(currentLesson.id, currentCourse.id)
    ]);

    // Loop navigation: if no next lesson, get first lesson
    const finalNextLesson = nextLesson || await getFirstLessonInCourse(currentCourse.id);

    const upNextContainer = document.querySelector('.frame-15 .text-66');
    const upNextLink = document.querySelector('.frame-15 .link-82');

    if (upNextContainer && finalNextLesson) {
      upNextContainer.textContent = finalNextLesson.title;
    }

    if (upNextLink && finalNextLesson) {
      upNextLink.href = `detail_course-lesson.html?course=${currentCourse.slug}&lesson=${finalNextLesson.slug}`;
      upNextLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = upNextLink.href;
      });
    } else if (upNextLink && !finalNextLesson) {
      // Hide up next section if no next lesson
      const upNextSection = document.querySelector('.frame-15');
      if (upNextSection) {
        upNextSection.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Error rendering up next:', error);
  }
}

/**
 * Get first lesson in course (for looping)
 */
async function getFirstLessonInCourse(courseId) {
  try {
    const { data, error } = await window.supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .eq('is_published', true)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching first lesson:', error);
    return null;
  }
}

/**
 * Render content sources
 */
async function renderContentSources() {
  if (!currentLesson) return;

  try {
    const sources = await window.contentSourcesAPI.getContentSourcesByLesson(currentLesson.slug);
    const container = document.querySelector('.collection-list-8');
    
    if (!container) return;

    // Clear existing items
    container.innerHTML = '';

    // If no sources found, show empty state
    if (!sources || sources.length === 0) {
      container.innerHTML = `
        <div class="w-dyn-empty">
          <div>No content sources found for this lesson.</div>
        </div>
      `;
      return;
    }

    // Render each content source
    sources.forEach((source) => {
      const item = document.createElement('div');
      item.className = 'collection-item-7 w-dyn-item';
      item.setAttribute('role', 'listitem');

      const socialLinks = [];
      if (source.website_link) {
        socialLinks.push(`<a href="${source.website_link}" target="_blank" class="website-l w-inline-block"><img src="images/world.svg" loading="lazy" alt="" class="image-10"></a>`);
      }
      if (source.linkedin_link) {
        socialLinks.push(`<a href="${source.linkedin_link}" target="_blank" class="linkedin-l w-inline-block"><img src="images/devicon-plain_linkedin.svg" loading="lazy" alt="" class="image-11"></a>`);
      }
      if (source.instagram_link) {
        socialLinks.push(`<a href="${source.instagram_link}" target="_blank" class="insta-l w-inline-block"><img src="images/devicon-insta.svg" loading="lazy" alt="" class="image-11"></a>`);
      }
      if (source.youtube_link) {
        socialLinks.push(`<a href="${source.youtube_link}" target="_blank" class="youtube-l w-inline-block"><img src="images/mingcute_youtube-fill.svg" loading="lazy" alt="" class="image-11"></a>`);
      }

      item.innerHTML = `
        <div class="div-block-7">
          <div class="content-source">
            <img src="${source.creator_image || 'images/Vectors-Wrapper_30.svg'}" 
                 loading="lazy" 
                 alt="${source.creator}" 
                 class="vectors-wrapper-56">
            <div class="font-16px bold">${source.creator}</div>
            <div class="social-link">
              ${socialLinks.join('')}
            </div>
          </div>
        </div>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('Error rendering content sources:', error);
    // Show empty state on error
    const container = document.querySelector('.collection-list-8');
    if (container) {
      container.innerHTML = `
        <div class="w-dyn-empty">
          <div>No content sources found for this lesson.</div>
        </div>
      `;
    }
  }
}

/**
 * Initialize feedback form handler
 */
function initializeFeedbackForm() {
  const form = document.getElementById('wf-form-Feedback');
  if (!form) return;

  // Find success/error messages
  const maybeSuccess = form.nextElementSibling;
  const maybeError = maybeSuccess?.nextElementSibling;

  const successMessage =
    (maybeSuccess && maybeSuccess.classList.contains('w-form-done')) ?
      maybeSuccess :
      document.querySelector('.w-form-done');

  const errorMessage =
    (maybeError && maybeError.classList.contains('w-form-fail')) ?
      maybeError :
      document.querySelector('.w-form-fail');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    if (!currentCourse) {
      alert('Course information not loaded. Please refresh the page.');
      return;
    }

    // Get form data
    const ratingInput = form.querySelector('input[name="Star-Rating-1"]:checked');
    const textareas = form.querySelectorAll('textarea[name="field-2"]');
    const valuableFeedback = textareas[0]?.value || '';
    const improvementFeedback = textareas[1]?.value || '';

    if (!ratingInput) {
      alert('Please provide a rating.');
      return;
    }

    const rating = parseInt(ratingInput.value, 10);

    // Hide both messages before submit
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';

    try {
      await window.feedbackAPI.submitCourseFeedback({
        course_id: currentCourse.id,
        rating,
        valuable_feedback: valuableFeedback,
        improvement_feedback: improvementFeedback
      });

      // Show success
      if (successMessage) successMessage.style.display = 'block';
      if (errorMessage) errorMessage.style.display = 'none';
      form.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        if (successMessage) successMessage.style.display = 'none';
      }, 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (errorMessage) errorMessage.style.display = 'block';
      if (successMessage) successMessage.style.display = 'none';
    }
  }, { capture: true });
}

/**
 * Main initialization function
 */
async function initializeLessonDetailPage() {
  try {
    // Get course and lesson slugs from URL
    const courseSlug = window.urlUtils?.getCourseSlugFromURL();
    const lessonSlug = window.urlUtils?.getLessonSlugFromURL();

    if (!courseSlug || !lessonSlug) {
      console.error('Missing course or lesson slug in URL');
      alert('Invalid lesson URL. Redirecting to learn page.');
      window.location.href = 'learn.html';
      return;
    }

    // Fetch course data
    currentCourse = await window.coursesAPI.getCourseBySlug(courseSlug);

    if (!currentCourse) {
      console.error('Course not found');
      alert('Course not found. Redirecting to learn page.');
      window.location.href = 'learn.html';
      return;
    }

    // Fetch lesson data
    currentLesson = await window.lessonsAPI.getLessonBySlug(courseSlug, lessonSlug);

    if (!currentLesson) {
      console.error('Lesson not found');
      alert('Lesson not found. Redirecting to course page.');
      window.location.href = `detail_course.html?slug=${courseSlug}`;
      return;
    }

    // Track analytics - page view and lesson viewed
    if (window.analytics && currentCourse && currentLesson) {
      try {
        window.analytics.trackPageView(
          `/courses/${courseSlug}/lessons/${lessonSlug}`,
          `${currentLesson.title} - ${currentCourse.title}`
        );
        window.analytics.trackEvent('lesson_viewed', {
          course_id: currentCourse.id,
          course_name: currentCourse.title,
          lesson_id: currentLesson.id,
          lesson_name: currentLesson.title
        });
      } catch (error) {
        console.warn('Error tracking analytics:', error);
      }
    }

    // Render all sections
    renderBreadcrumb();
    renderCourseTitle();
    renderLessonTitle();
    renderLessonContent();
    await renderCurriculum();
    await renderUpNext();
    await renderContentSources();

    // Initialize feedback form
    initializeFeedbackForm();

    // Mark lesson as viewed (if authenticated)
    try {
      if (currentCourse && currentLesson) {
        await window.progressAPI?.updateLessonProgress(
          currentCourse.id,
          currentLesson.id,
          10 // 10% for viewing
        );
      }
    } catch (error) {
      // Silently fail if user is not authenticated
      console.log('Progress tracking skipped (user not authenticated)');
    }

  } catch (error) {
    console.error('Error initializing lesson detail page:', error);
    alert('Error loading lesson. Please try again later.');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLessonDetailPage);
} else {
  initializeLessonDetailPage();
}

