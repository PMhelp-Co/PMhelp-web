// =====================================================
// Course Detail Page
// =====================================================
// Handles data fetching and rendering for course detail page
// =====================================================

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
 * Render course title
 */
function renderCourseTitle() {
  const titleElement = document.querySelector('.course-title');
  if (titleElement && currentCourse) {
    titleElement.textContent = currentCourse.title;
  }
}

/**
 * Render course about section
 */
function renderCourseAbout() {
  console.log('Rendering course about:', currentCourse);
  const aboutElement = document.querySelector('.about .w-richtext');
  if (aboutElement && currentCourse) {
    aboutElement.innerHTML = currentCourse.about || currentCourse.description || '';
  }
}

/**
 * Render learning objectives
 */
async function renderLearningObjectives() {
  console.log('Rendering learning objectives:', currentCourse);
  
  if (!currentCourse) return;
  
  try {
    const objectives = await window.coursesAPI.getCourseLearningObjectives(currentCourse.id);
    console.log('obj  ', objectives);
    const container = document.querySelector('.what-you-learn .spacing-16');
    
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Render each objective
    objectives.forEach((objective) => {
      const item = document.createElement('div');
      item.className = 'wyl-content';
      item.innerHTML = `
        <img src="images/Vectors-Wrapper_16.svg" loading="lazy" width="24" height="24" alt="" class="vectors-wrapper-27">
        <div class="font-16px">${objective.objective_text}</div>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('Error rendering learning objectives:', error);
  }
}

/**
 * Render course lessons/curriculum
 */
async function renderLessons() {
  if (!currentCourse) return;
  
  try {
    const lessons = await window.coursesAPI.getCourseLessons(currentCourse.id);
    console.log('lessons  ', lessons);
    const container = document.querySelector('.collection-list-9');
    

    if (!container) return;
    
    // Clear existing items
    container.innerHTML = '';
    
    // Render each lesson
    lessons.forEach((lesson) => {
      const item = document.createElement('div');
      item.className = 'w-dyn-item';
      item.setAttribute('role', 'listitem');
      
      // Determine icon based on lesson type (Video or Article)
      const isVideo = lesson.class === 'Video' || lesson.video_url;
      const articleIcon = 'images/material-symbols-light_article-outline.png';
      const videoIcon = 'images/Container.png';
      
      const duration = lesson.duration ? formatDuration(lesson.duration) : '';
      
      item.innerHTML = `
        <a href="detail_course-lesson.html?course=${currentCourse.slug}&lesson=${lesson.slug}" class="content w-inline-block">
          <img src="${articleIcon}" loading="lazy" alt="" class="image-8 ${isVideo ? 'w-condition-invisible' : ''}">
          <img src="${videoIcon}" loading="lazy" alt="" class="image-8 ${!isVideo ? 'w-condition-invisible' : ''}">
          <div class="font-18px">${lesson.title}</div>
          ${duration ? `<div class="duration">${duration}</div>` : '<div class="duration"></div>'}
        </a>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('Error rendering lessons:', error);
  }
}

/**
 * Get course thumbnail URL from Supabase Storage
 * @param {string} courseSlug - Course slug
 * @returns {string} - Storage URL
 */
function getCourseThumbnailUrl(courseSlug) {
  console.log("course slug " + courseSlug);
  console.log("course thumbnail url " + `https://igiemqicokpdyhunldtq.supabase.co/storage/v1/object/public/course-thumbnails/${courseSlug}.jpg`);
  if (!courseSlug) return null;
  return `https://igiemqicokpdyhunldtq.supabase.co/storage/v1/object/public/course-thumbnails/${courseSlug}.jpg`;
}

/**
 * Render course details sidebar
 */
async function renderCourseSidebar() {
  if (!currentCourse) return;
  
  // Update course thumbnail from Supabase Storage
  const thumbnail = document.querySelector('.frame-1171276812 .image-9');
  if (thumbnail) {
    const storageUrl = getCourseThumbnailUrl(currentCourse.slug);
    
    if (storageUrl) {

      thumbnail.src = storageUrl;
      thumbnail.alt = currentCourse.title;
      
      // Handle image load error (fallback to icon_url)
      thumbnail.onerror = function() {
        
        if (currentCourse.icon_url) {
          this.src = currentCourse.icon_url;
        }
        this.onerror = null; // Prevent infinite loop
      };
    } else if (currentCourse.icon_url) {
      // Fallback to icon_url if slug is not available
      thumbnail.src = currentCourse.icon_url;
      thumbnail.alt = currentCourse.title;
    }
  }
  
  // Fetch and update lesson count
  try {
    const lessons = await window.coursesAPI.getCourseLessons(currentCourse.id);
    const lessonCount = lessons ? lessons.length : 0;
    
    const lessonCountElement = document.querySelector('.details-div .course-details:first-child .font-16px');
    if (lessonCountElement) {
      lessonCountElement.textContent = `${lessonCount} ${lessonCount === 1 ? 'Lesson' : 'Lessons'}`;
    }
  } catch (error) {
    console.error('Error fetching lesson count:', error);
    // Fallback to 0 if fetch fails
    const lessonCountElement = document.querySelector('.details-div .course-details:first-child .font-16px');
    if (lessonCountElement) {
      lessonCountElement.textContent = '0 Lessons';
    }
  }
  
  // Update enroll button link
  const enrollButton = document.querySelector('.enroll-background');
  if (enrollButton && currentCourse.id) {
    const firstLesson = document.querySelector('.collection-list-9 .w-dyn-item:first-child a');
    if (firstLesson) {
      enrollButton.href = firstLesson.href;
    }
  }
}

/**
 * Render content sources
 */
async function renderContentSources() {
  if (!currentCourse) return;
  
  try {
    const sources = await window.contentSourcesAPI.getContentSourcesByModule(currentCourse.slug);
    const container = document.querySelector('.collection-list-7');
    
    if (!container) return;
    
    // Clear existing items
    container.innerHTML = '';
    
    // Render each content source
    sources.forEach((source) => {
      const item = document.createElement('div');
      item.className = 'collection-item-6 w-dyn-item';
      item.setAttribute('role', 'listitem');
      
      const socialLinks = [];
      if (source.website_link) {
        socialLinks.push(`<a href="${source.website_link}" target="_blank" class="website-l w-inline-block"><img src="images/world.svg" loading="lazy" alt=""></a>`);
      }
      if (source.linkedin_link) {
        socialLinks.push(`<a href="${source.linkedin_link}" target="_blank" class="linkedin-l w-inline-block"><img src="images/devicon-plain_linkedin.svg" loading="lazy" alt=""></a>`);
      }
      if (source.instagram_link) {
        socialLinks.push(`<a href="${source.instagram_link}" target="_blank" class="insta-l w-inline-block"><img src="images/devicon-insta.svg" loading="lazy" alt=""></a>`);
      }
      if (source.youtube_link) {
        socialLinks.push(`<a href="${source.youtube_link}" target="_blank" class="youtube-l w-inline-block"><img src="images/mingcute_youtube-fill.svg" loading="lazy" alt=""></a>`);
      }
      
      item.innerHTML = `
        <div class="div-block-7">
          <div class="content-source">
            <div class="cretor-profile">
              <img src="${source.creator_image || 'images/Vectors-Wrapper_30.svg'}" loading="lazy" width="31.77486801147461" height="31.77486801147461" alt="${source.creator}" class="vectors-wrapper-56">
              <div class="font-16px bold">${source.creator}</div>
            </div>
            <div class="social-link modulle">
              ${socialLinks.join('')}
            </div>
          </div>
        </div>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('Error rendering content sources:', error);
  }
}

/**
 * Render previous/next course navigation
 */
async function renderCourseNavigation() {
  if (!currentCourse) return;

  try {
    const [previousCourse, nextCourse] = await Promise.all([
      window.coursesAPI.getPreviousCourse(currentCourse.slug),
      window.coursesAPI.getNextCourse(currentCourse.slug)
    ]);

    // Loop navigation: if no previous, get last course; if no next, get first course
    const [loopedPrevious, loopedNext] = await Promise.all([
      previousCourse ? Promise.resolve(previousCourse) : window.coursesAPI.getLastCourse(),
      nextCourse ? Promise.resolve(nextCourse) : window.coursesAPI.getFirstCourse()
    ]);

    const placeholder =
      'https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg';

    // -------------------------
    // Render previous course
    // -------------------------
    const previousContainer = document.querySelector(
      '.lesson .next-section-div:first-child .w-dyn-items'
    );

    if (previousContainer && loopedPrevious) {
      const prevThumbnail =
        getCourseThumbnailUrl(loopedPrevious.slug) || placeholder;

      previousContainer.innerHTML = `
        <div role="listitem" class="collection-item-10 w-dyn-item">
          <a href="detail_course.html?slug=${loopedPrevious.slug}" class="link-block-7 w-inline-block">
            <img src="images/chevron-right.svg" loading="lazy" width="50" alt="" class="image-12">
            <div class="font-20px module">${loopedPrevious.title}</div>
            <img
              src="${prevThumbnail}"
              loading="lazy"
              alt="${loopedPrevious.title}"
              class="next-lesson-image"
              onerror="this.src='${placeholder}'"
            >
          </a>
        </div>
      `;
    } else if (previousContainer) {
      previousContainer.innerHTML = '';
    }

    // -------------------------
    // Render next course
    // -------------------------
    const nextContainer = document.querySelector(
      '.lesson .next-section-div:last-child .w-dyn-items'
    );

    if (nextContainer && loopedNext) {
      const nextThumbnail =
        getCourseThumbnailUrl(loopedNext.slug) || placeholder;

      nextContainer.innerHTML = `
        <div role="listitem" class="collection-item-10 w-dyn-item">
          <a href="detail_course.html?slug=${loopedNext.slug}" class="link-block-7 w-inline-block">
            <img
              src="${nextThumbnail}"
              loading="lazy"
              alt="${loopedNext.title}"
              class="next-lesson-image"
              onerror="this.src='${placeholder}'"
            >
            <div class="font-20px module">${loopedNext.title}</div>
            <img src="images/chevron-right.svg" loading="lazy" width="50" alt="" class="image-12 next">
          </a>
        </div>
      `;
    } else if (nextContainer) {
      nextContainer.innerHTML = '';
    }
  } catch (error) {
    console.error('Error rendering course navigation:', error);
  }
}


/**
 * Initialize feedback form handler
 */
function initializeFeedbackForm() {
  const form = document.getElementById('wf-form-Feedback');
  if (!form) return;

  // Find the success / error nodes that are siblings of the form (Webflow places them after the form)
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

  // optional "lock" to ignore external changes while we're submitting

  // Attach the listener in capture phase so it runs before other non-capture listeners
  form.addEventListener('submit', async (e) => {
    // run as early as possible
    e.preventDefault();
    // stop other listeners from running on this event (prevents Webflow's default toggles)
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

    // defensive: hide both messages before submit
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';

    try {
      await window.feedbackAPI.submitCourseFeedback({
        course_id: currentCourse.id,
        rating,
        valuable_feedback: valuableFeedback,
        improvement_feedback: improvementFeedback
      });

      // on success
      if (successMessage) successMessage.style.display = 'block';
      if (errorMessage) errorMessage.style.display = 'none';
      form.reset();

      // hide after 5s (only if still our submission)
      setTimeout(() => {
        // optional guard: only hide if we are not in another submit cycle
      
        if (successMessage) {successMessage.style.display = 'none';}
      }, 5000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (errorMessage) errorMessage.style.display = 'block';
      if (successMessage) successMessage.style.display = 'none';
    } finally {
      // release lock after everything completed
    }
  }, { capture: true }); // <--- capture: true is important
}


/**
 * Main initialization function
 */
async function initializeCourseDetailPage() {
  try {
    // Get course slug from URL
    const courseSlug = window.urlUtils?.getCourseSlugFromURL();
    
    if (!courseSlug) {
      console.error('No course slug found in URL');
      // Redirect to learn page if no slug
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
    
    // Render all sections
    renderCourseTitle();
    renderCourseAbout();
    await renderLearningObjectives();
    await renderLessons();
    await renderCourseSidebar();
    await renderContentSources();
    await renderCourseNavigation();
    
    // Initialize feedback form
    initializeFeedbackForm();
    
  } catch (error) {
    console.error('Error initializing course detail page:', error);
    alert('Error loading course. Please try again later.');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCourseDetailPage);
} else {
  initializeCourseDetailPage();
}
