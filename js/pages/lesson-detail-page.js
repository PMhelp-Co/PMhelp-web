// =====================================================
// Lesson Detail Page
// =====================================================
// Handles data fetching and rendering for lesson detail page
// =====================================================

let currentLesson = null;
let currentCourse = null;
let youtubePlayer = null; // Store YouTube player instance
let videoProgressInterval = null; // Store interval for tracking video progress
let video50PercentTracked = false; // Track if 50% milestone has been reached

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
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null
 */
function extractYouTubeVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Initialize YouTube IFrame API player
 * @param {string} videoId - YouTube video ID
 * @param {string} containerId - Container element ID
 */
function initializeYouTubePlayer(videoId, containerId) {
  console.log('[VIDEO TRACKING] 🚀 Initializing YouTube player for video:', videoId, 'in container:', containerId);
  
  // Note: CORS errors from YouTube's ad system (doubleclick.net) are expected
  // and don't affect video playback or our tracking functionality
  
  // Load YouTube IFrame API if not already loaded
  if (!window.YT) {
    console.log('[VIDEO TRACKING] 📥 Loading YouTube IFrame API...');
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.onerror = function() {
      console.error('[VIDEO TRACKING] ❌ Failed to load YouTube IFrame API');
    };
    tag.onload = function() {
      console.log('[VIDEO TRACKING] ✅ YouTube IFrame API script loaded');
    };
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Wait for API to be ready
    window.onYouTubeIframeAPIReady = function() {
      console.log('[VIDEO TRACKING] ✅ YouTube IFrame API ready - creating player');
      createYouTubePlayer(videoId, containerId);
    };
  } else if (window.YT.Player) {
    // API already loaded
    console.log('[VIDEO TRACKING] ✅ YouTube API already loaded - creating player immediately');
    createYouTubePlayer(videoId, containerId);
  } else {
    // Wait for API
    console.log('[VIDEO TRACKING] ⏳ YouTube API loading but not ready - waiting...');
    window.onYouTubeIframeAPIReady = function() {
      console.log('[VIDEO TRACKING] ✅ YouTube IFrame API ready - creating player');
      createYouTubePlayer(videoId, containerId);
    };
  }
}

/**
 * Start tracking video progress for 50% milestone
 * @param {Object} player - YouTube player instance
 */
function startVideoProgressTracking(player) {
  if (videoProgressInterval) {
    clearInterval(videoProgressInterval);
  }
  
  video50PercentTracked = false;
  
  videoProgressInterval = setInterval(() => {
    try {
      if (player && player.getCurrentTime && player.getDuration && currentCourse && currentLesson) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        
        if (duration > 0 && !video50PercentTracked) {
          const progressPercentage = (currentTime / duration) * 100;
          
          // Check if video has reached 50%
          if (progressPercentage >= 50) {
            video50PercentTracked = true;
            clearInterval(videoProgressInterval);
            videoProgressInterval = null;
            
            console.log('[VIDEO TRACKING] 📊 Video reached 50% - updating progress');
            console.log('[PROGRESS] 📞 Calling updateLessonProgress:', {
              courseId: currentCourse.id,
              lessonId: currentLesson.id,
              percentage: 50,
              reason: 'Video reached 50% playback'
            });
            
            window.progressAPI?.updateLessonProgress(
              currentCourse.id,
              currentLesson.id,
              50
            ).then((result) => {
              console.log('[VIDEO TRACKING] ✅ Progress updated to 50%');
              console.log('[PROGRESS] ✅ updateLessonProgress result:', result);
            }).catch(err => {
              if (err.message && !err.message.includes('authenticated')) {
                console.warn('[VIDEO TRACKING] ⚠️ Error tracking video progress:', err);
                console.error('[PROGRESS] ❌ updateLessonProgress error:', err);
              }
            });
          }
        }
      }
    } catch (error) {
      // Ignore errors (player might be destroyed)
      console.warn('[VIDEO TRACKING] ⚠️ Error checking video progress:', error);
    }
  }, 2000); // Check every 2 seconds
}

/**
 * Create YouTube player instance
 * @param {string} videoId - YouTube video ID
 * @param {string} containerId - Container element ID
 */
function createYouTubePlayer(videoId, containerId) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lesson-detail-page.js:132',message:'createYouTubePlayer called',data:{videoId,containerId,hasYT:!!window.YT,hasYTPlayer:!!window.YT?.Player},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  console.log('[VIDEO TRACKING] 🎬 Creating YouTube player for video:', videoId);
  
  try {
    if (!window.YT || !window.YT.Player) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lesson-detail-page.js:137',message:'YouTube API not available',data:{hasYT:!!window.YT,hasYTPlayer:!!window.YT?.Player},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      console.error('[VIDEO TRACKING] ❌ YouTube API not available');
      return;
    }
    
    youtubePlayer = new window.YT.Player(containerId, {
      videoId: videoId,
      playerVars: {
        'playsinline': 1,
        'rel': 0,
        'modestbranding': 1,
        'enablejsapi': 1
      },
      events: {
        'onReady': function(event) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lesson-detail-page.js:150',message:'YouTube player onReady event fired',data:{videoId,hasCurrentCourse:!!currentCourse,hasCurrentLesson:!!currentLesson},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
          // #endregion
          console.log('[VIDEO TRACKING] ✅ Player ready for video:', videoId);
          // Store player reference for progress tracking
          youtubePlayer = event.target;
        },
        'onStateChange': function(event) {
          // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          const states = {
            '-1': 'UNSTARTED',
            '0': 'ENDED',
            '1': 'PLAYING',
            '2': 'PAUSED',
            '3': 'BUFFERING',
            '5': 'CUED'
          };
          const stateName = states[event.data] || event.data;
          console.log('[VIDEO TRACKING] 📊 Video state changed:', stateName);
          
          if (event.data === window.YT.PlayerState.PLAYING) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lesson-detail-page.js:192',message:'YouTube player PLAYING state detected',data:{videoId,hasCurrentCourse:!!currentCourse,hasCurrentLesson:!!currentLesson},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
            // #endregion
            console.log('[VIDEO TRACKING] ▶️ Video started playing');
            // Update progress to 25% when user starts playing (first play)
            if (currentCourse && currentLesson) {
              console.log('[VIDEO TRACKING] 📊 Marking lesson as 25% complete (video playing)');
              console.log('[PROGRESS] 📞 Calling updateLessonProgress:', {
                courseId: currentCourse.id,
                lessonId: currentLesson.id,
                percentage: 25,
                reason: 'Video playing (onStateChange PLAYING)'
              });
              window.progressAPI?.updateLessonProgress(
                currentCourse.id,
                currentLesson.id,
                25
              ).then((result) => {
                console.log('[VIDEO TRACKING] ✅ Progress updated to 25%');
                console.log('[PROGRESS] ✅ updateLessonProgress result:', result);
              }).catch(err => {
                if (err.message && !err.message.includes('authenticated')) {
                  console.warn('[VIDEO TRACKING] ⚠️ Error tracking video play:', err);
                  console.error('[PROGRESS] ❌ updateLessonProgress error:', err);
                } else {
                  console.log('[VIDEO TRACKING] ℹ️ Progress tracking skipped (user not authenticated)');
                  console.log('[PROGRESS] ℹ️ updateLessonProgress skipped (user not authenticated)');
                }
              });
              
              // Start tracking video progress for 50% milestone
              startVideoProgressTracking(event.target);
            }
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            // Stop progress tracking when paused
            if (videoProgressInterval) {
              clearInterval(videoProgressInterval);
              videoProgressInterval = null;
            }
          } else if (event.data === window.YT.PlayerState.ENDED) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lesson-detail-page.js:220',message:'YouTube player ENDED state detected',data:{videoId,hasCurrentCourse:!!currentCourse,hasCurrentLesson:!!currentLesson},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
            // #endregion
            console.log('[VIDEO TRACKING] ✅ Video ended - marking lesson complete');
            
            // Stop progress tracking
            if (videoProgressInterval) {
              clearInterval(videoProgressInterval);
              videoProgressInterval = null;
            }
            
            // Video finished - mark lesson as complete
            if (currentCourse && currentLesson) {
              console.log('[VIDEO TRACKING] 📊 Marking lesson as 100% complete (video ended)');
              console.log('[PROGRESS] 📞 Calling markLessonComplete:', {
                courseId: currentCourse.id,
                lessonId: currentLesson.id,
                reason: 'Video ended (onStateChange ENDED)'
              });
              window.progressAPI?.markLessonComplete(
                currentCourse.id,
                currentLesson.id
              ).then(async (result) => {
                console.log('[VIDEO TRACKING] ✅ Lesson marked as complete!');
                console.log('[PROGRESS] ✅ markLessonComplete result:', result);
                
                // Update curriculum sidebar in real-time to show checkmark
                await updateCurriculumSidebar();
                console.log('[VIDEO TRACKING] ✅ Curriculum sidebar updated - checkmark should now be visible');
              }).catch(err => {
                if (err.message && !err.message.includes('authenticated')) {
                  console.warn('[VIDEO TRACKING] ⚠️ Error marking video complete:', err);
                  console.error('[PROGRESS] ❌ markLessonComplete error:', err);
                } else {
                  console.log('[VIDEO TRACKING] ℹ️ Progress tracking skipped (user not authenticated)');
                  console.log('[PROGRESS] ℹ️ markLessonComplete skipped (user not authenticated)');
                }
              });
            }
          }
        },
        'onError': function(event) {
          // YouTube error codes: 2=invalid video, 5=HTML5 error, 100=video not found, 101/150=not playable
          // Note: CORS errors from doubleclick.net are expected and don't affect playback
          if (event.data === 2 || event.data === 5 || event.data === 100 || event.data === 101 || event.data === 150) {
            console.error('[VIDEO TRACKING] ❌ YouTube player error:', event.data, '- Video may not be playable');
          }
          // Other errors (like CORS from ad system) are expected and can be ignored
        }
      }
    });
    
    console.log('[VIDEO TRACKING] ✅ YouTube player instance created');
  } catch (error) {
    console.error('[VIDEO TRACKING] ❌ Error creating YouTube player:', error);
  }
}

/**
 * Render lesson content (video or article)
 */
function renderLessonContent() {
  console.log('[VIDEO TRACKING] 🎬 renderLessonContent called');
  console.log('[VIDEO TRACKING] 📋 Lesson data:', {
    hasVideoUrl: !!currentLesson?.video_url,
    videoUrl: currentLesson?.video_url,
    hasContent: !!currentLesson?.content,
    contentLength: currentLesson?.content?.length || 0
  });
  
  const contentElement = document.querySelector('.rdv-content-div .rich-text-block');
  if (!contentElement) {
    console.warn('[VIDEO TRACKING] ⚠️ Content element not found:', '.rdv-content-div .rich-text-block');
    return;
  }
  if (!currentLesson) {
    console.warn('[VIDEO TRACKING] ⚠️ Current lesson not found');
    return;
  }

  // Clear existing content
  contentElement.innerHTML = '';

  // Check if content already includes video embeds
  const hasVideoInContent = currentLesson.content && 
    (currentLesson.content.includes('<iframe') || currentLesson.content.includes('youtube.com/embed'));

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lesson-detail-page.js:293',message:'Video detection check',data:{hasVideoInContent,hasVideoUrl:!!currentLesson.video_url,willRenderVideo:!!(currentLesson.video_url && !hasVideoInContent),contentPreview:currentLesson.content?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  console.log('[VIDEO TRACKING] 🔍 Video detection:', {
    hasVideoInContent,
    hasVideoUrl: !!currentLesson.video_url,
    willRenderVideo: !!(currentLesson.video_url && !hasVideoInContent)
  });

  // If lesson has video_url but no video in content, render video first
  if (currentLesson.video_url && !hasVideoInContent) {
    console.log('[VIDEO TRACKING] ✅ Rendering video from video_url');
    const videoContainer = document.createElement('div');
    videoContainer.className = 'lesson-video-container';
    videoContainer.style.cssText = 'margin-bottom: 2rem; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    
    const videoWrapper = document.createElement('figure');
    videoWrapper.className = 'w-richtext-figure-type-video w-richtext-align-fullwidth';
    videoWrapper.style.cssText = 'padding-bottom: 56.25%; position: relative; width: 100%; background: #000;';
    
    const videoDiv = document.createElement('div');
    videoDiv.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';
    videoDiv.id = `lesson-video-${currentLesson.id}`;
    
    // Extract YouTube video ID
    console.log('[VIDEO TRACKING] 🔍 Extracting video ID from URL:', currentLesson.video_url);
    const videoId = extractYouTubeVideoId(currentLesson.video_url);
    console.log('[VIDEO TRACKING] 🎯 Extracted video ID:', videoId);
    
    if (videoId) {
      console.log('[VIDEO TRACKING] ✅ YouTube video detected, using IFrame API');
      // Use YouTube IFrame API for proper tracking
      videoWrapper.appendChild(videoDiv);
      videoContainer.appendChild(videoWrapper);
      contentElement.appendChild(videoContainer);
      
      // Initialize YouTube player
      initializeYouTubePlayer(videoId, videoDiv.id);
    } else {
      console.log('[VIDEO TRACKING] ⚠️ Non-YouTube video or extraction failed, using iframe fallback');
      console.log('[VIDEO TRACKING] 📝 Video URL that failed extraction:', currentLesson.video_url);
      // Fallback for non-YouTube videos
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
      
      videoDiv.appendChild(iframe);
      videoWrapper.appendChild(videoDiv);
      videoContainer.appendChild(videoWrapper);
      contentElement.appendChild(videoContainer);

      // Track video progress (fallback - basic tracking only)
      iframe.addEventListener('load', () => {
        if (currentCourse && currentLesson) {
          console.log('[VIDEO TRACKING] 📊 Fallback: Marking lesson as 25% complete (iframe loaded)');
          console.log('[PROGRESS] 📞 Calling updateLessonProgress:', {
            courseId: currentCourse.id,
            lessonId: currentLesson.id,
            percentage: 25,
            reason: 'Iframe loaded (fallback tracking)'
          });
          window.progressAPI?.updateLessonProgress(
            currentCourse.id,
            currentLesson.id,
            25
          ).then((result) => {
            console.log('[VIDEO TRACKING] ✅ Fallback progress updated to 25%');
            console.log('[PROGRESS] ✅ updateLessonProgress result:', result);
          }).catch(err => {
            console.error('[VIDEO TRACKING] ❌ Error tracking video start:', err);
            console.error('[PROGRESS] ❌ updateLessonProgress error:', err);
          });
        }
      });
    }
  } else if (currentLesson.video_url && hasVideoInContent) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lesson-detail-page.js:378',message:'Video in content detected - need to replace iframe',data:{videoUrl:currentLesson.video_url,hasVideoInContent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    console.log('[VIDEO TRACKING] ⚠️ Video not rendered because:', {
      hasVideoUrl: !!currentLesson.video_url,
      hasVideoInContent,
      reason: !currentLesson.video_url ? 'No video_url' : 'Video already in content'
    });
    
    // Render content first, then find and replace iframe with tracked player
    if (currentLesson.content) {
      console.log('[VIDEO TRACKING] 📄 Rendering text content (will replace iframe with tracked player)');
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = currentLesson.content;
      contentElement.appendChild(contentDiv);
      
      // Find YouTube iframe in the rendered content and replace it
      setTimeout(() => {
        const iframes = contentDiv.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lesson-detail-page.js:395',message:'Searching for YouTube iframes in content',data:{iframeCount:iframes.length,iframeSrcs:Array.from(iframes).map(iframe=>iframe.src)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        if (iframes.length > 0) {
          const iframe = iframes[0];
          const iframeSrc = iframe.src;
          console.log('[VIDEO TRACKING] 🔍 Found YouTube iframe in content:', iframeSrc);
          
          // Extract video ID from iframe src or video_url
          let videoId = extractYouTubeVideoId(iframeSrc) || extractYouTubeVideoId(currentLesson.video_url);
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lesson-detail-page.js:405',message:'Extracted video ID from iframe',data:{videoId,iframeSrc,extractedFromIframe:!!extractYouTubeVideoId(iframeSrc),extractedFromUrl:!!extractYouTubeVideoId(currentLesson.video_url)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          
          if (videoId) {
            // Replace iframe with YouTube API player container
            const containerId = `lesson-video-${currentLesson.id}`;
            
            // Create proper video container structure with aspect ratio
            const videoContainer = document.createElement('div');
            videoContainer.className = 'lesson-video-container';
            videoContainer.style.cssText = 'margin-bottom: 2rem; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
            
            const videoWrapper = document.createElement('figure');
            videoWrapper.className = 'w-richtext-figure-type-video w-richtext-align-fullwidth';
            videoWrapper.style.cssText = 'padding-bottom: 56.25%; position: relative; width: 100%; background: #000;';
            
            const videoDiv = document.createElement('div');
            videoDiv.id = containerId;
            videoDiv.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';
            
            videoWrapper.appendChild(videoDiv);
            videoContainer.appendChild(videoWrapper);
            
            // Replace iframe's parent or the iframe itself
            const iframeParent = iframe.parentElement;
            if (iframeParent && iframeParent.tagName === 'FIGURE' || iframeParent.classList.contains('w-richtext-figure-type-video')) {
              // Replace the figure/parent container
              iframeParent.replaceWith(videoContainer);
            } else {
              // Replace just the iframe
              iframe.replaceWith(videoContainer);
            }
            
            console.log('[VIDEO TRACKING] ✅ Replaced iframe with YouTube API player container');
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lesson-detail-page.js:425',message:'Initializing YouTube player to replace iframe',data:{videoId,containerId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            
            // Initialize YouTube player with tracking
            initializeYouTubePlayer(videoId, containerId);
          } else {
            console.warn('[VIDEO TRACKING] ⚠️ Could not extract video ID from iframe or video_url');
          }
        } else {
          console.log('[VIDEO TRACKING] ℹ️ No YouTube iframes found in content');
        }
      }, 100);
    }
  } else {
    console.log('[VIDEO TRACKING] ⚠️ Video not rendered because:', {
      hasVideoUrl: !!currentLesson.video_url,
      hasVideoInContent,
      reason: !currentLesson.video_url ? 'No video_url' : 'Video already in content'
    });
  }

  // Render text content if available (only if not already rendered above)
  if (currentLesson.content && !(currentLesson.video_url && hasVideoInContent)) {
    console.log('[VIDEO TRACKING] 📄 Rendering text content');
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = currentLesson.content;
    contentElement.appendChild(contentDiv);

    // Track reading progress ONLY for articles (lessons WITHOUT video_url)
    // Videos should ONLY use video playback tracking, NOT scroll tracking
    const isArticle = !currentLesson.video_url && !hasVideoInContent;
    console.log('[VIDEO TRACKING] 📝 Content type detection:', {
      hasVideoUrl: !!currentLesson.video_url,
      hasVideoInContent,
      isArticle,
      willUseScrollTracking: isArticle
    });
    
    if (isArticle && currentLesson.content) {
      console.log('[VIDEO TRACKING] 📖 This is an ARTICLE - using scroll tracking');
      
      // Throttle scroll updates to avoid too many database calls
      let scrollUpdateTimeout = null;
      let lastUpdatePercentage = -1;
      
      const handleScroll = async () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollPercentage = (scrollHeight > clientHeight) 
          ? (scrollTop / (scrollHeight - clientHeight)) * 100 
          : 100; // If content fits in viewport, consider it 100%
        
        // Determine progress based on scroll position
        let progressPercentage = 10; // Default: at beginning
        
        if (scrollPercentage >= 55) {
          // At end or beyond limit - mark as complete
          progressPercentage = 100;
        } else if (scrollPercentage > 0 && scrollPercentage < 55) {
          // Scrolled but not at end
          progressPercentage = 25;
        }
        
        // Only update if progress changed significantly (avoid too many updates)
        const shouldUpdate = Math.abs(progressPercentage - lastUpdatePercentage) >= 15 || 
                            (progressPercentage === 100 && lastUpdatePercentage !== 100);
        
        if (shouldUpdate && currentCourse && currentLesson) {
          // Clear any pending update
          if (scrollUpdateTimeout) {
            clearTimeout(scrollUpdateTimeout);
          }
          
          // Throttle updates (wait 300ms after last scroll event)
          scrollUpdateTimeout = setTimeout(async () => {
            try {
              if (progressPercentage === 100) {
                // Mark as complete
                console.log('[VIDEO TRACKING] 📊 Marking article as 100% complete (scrolled 55%+)');
                console.log('[PROGRESS] 📞 Calling markLessonComplete:', {
                  courseId: currentCourse.id,
                  lessonId: currentLesson.id,
                  scrollPercentage: Math.round(scrollPercentage),
                  reason: 'Article scrolled 55%+'
                });
                
                const result = await window.progressAPI?.markLessonComplete(
                  currentCourse.id,
                  currentLesson.id
                );
                console.log('[VIDEO TRACKING] ✅ Article marked as complete!');
                console.log('[PROGRESS] ✅ markLessonComplete result:', result);
                
                // Update curriculum sidebar in real-time to show checkmark
                await updateCurriculumSidebar();
                console.log('[VIDEO TRACKING] ✅ Curriculum sidebar updated - checkmark should now be visible');
              } else {
                // Update progress
                console.log('[VIDEO TRACKING] 📊 Updating article progress:', progressPercentage + '%');
                console.log('[PROGRESS] 📞 Calling updateLessonProgress:', {
                  courseId: currentCourse.id,
                  lessonId: currentLesson.id,
                  percentage: progressPercentage,
                  scrollPercentage: Math.round(scrollPercentage),
                  reason: 'Article scroll position changed'
                });
                
                const result = await window.progressAPI?.updateLessonProgress(
                  currentCourse.id,
                  currentLesson.id,
                  progressPercentage
                );
                console.log('[VIDEO TRACKING] ✅ Article progress updated to', progressPercentage + '%');
                console.log('[PROGRESS] ✅ updateLessonProgress result:', result);
              }
              
              lastUpdatePercentage = progressPercentage;
            } catch (err) {
              if (err.message && !err.message.includes('authenticated')) {
                console.error('[VIDEO TRACKING] ❌ Error updating progress:', err);
                console.error('[PROGRESS] ❌ Error:', err);
              } else {
                console.log('[VIDEO TRACKING] ℹ️ Progress tracking skipped (user not authenticated)');
              }
            }
          }, 300); // Wait 300ms after scrolling stops
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
    } else if (currentLesson.video_url || hasVideoInContent) {
      console.log('[VIDEO TRACKING] 🎥 This is a VIDEO lesson - scroll tracking DISABLED (using video playback tracking only)');
    }
    // Note: If it's a video lesson, scroll tracking is DISABLED - completion happens when video ends
  }
}

/**
 * Update curriculum sidebar (refresh to show updated completion status)
 */
async function updateCurriculumSidebar() {
  console.log('[PROGRESS] 🔄 Updating curriculum sidebar...');
  try {
    if (!currentCourse) return;
    
    const container = document.querySelector('.collection-list-wrapper-6 .w-dyn-items');
    if (!container) return;
    
    // Get all lessons to match by slug
    let lessons = [];
    try {
      lessons = await window.coursesAPI.getCourseLessons(currentCourse.id);
    } catch (error) {
      console.error('[PROGRESS] ❌ Error fetching lessons:', error);
      return;
    }
    
    // Get updated progress
    let completedLessonIds = [];
    try {
      const progress = await window.progressAPI?.getCourseProgress(currentCourse.id);
      completedLessonIds = progress?.completedLessons || [];
      console.log('[PROGRESS] ✅ Updated progress fetched:', {
        completedCount: progress?.completedCount || 0,
        totalLessons: progress?.totalLessons || 0,
        completedLessonIds
      });
    } catch (error) {
      console.error('[PROGRESS] ❌ Error fetching updated progress:', error);
      return;
    }
    
    // Update checkmarks for all lessons in sidebar
    const lessonItems = container.querySelectorAll('.collection-item-8');
    lessonItems.forEach((item) => {
      const link = item.querySelector('a');
      if (!link) return;
      
      const lessonTitleDiv = link.querySelector('.font-18px');
      if (!lessonTitleDiv) return;
      
      // Extract lesson slug from href
      const href = link.getAttribute('href');
      const lessonSlugMatch = href?.match(/lesson=([^&]+)/);
      if (!lessonSlugMatch) return;
      
      const lessonSlug = decodeURIComponent(lessonSlugMatch[1]);
      
      // Find the lesson by slug to get its ID
      const lesson = lessons.find(l => l.slug === lessonSlug);
      if (!lesson) return;
      
      const isCompleted = completedLessonIds.includes(lesson.id);
      const titleText = lessonTitleDiv.textContent.replace(/\s*✓\s*$/, '').trim(); // Remove existing checkmark
      
      if (isCompleted && !lessonTitleDiv.textContent.includes('✓')) {
        lessonTitleDiv.textContent = titleText + ' ✓';
        console.log('[PROGRESS] ✅ Checkmark added to lesson in sidebar:', lesson.title);
      } else if (!isCompleted && lessonTitleDiv.textContent.includes('✓')) {
        lessonTitleDiv.textContent = titleText;
        console.log('[PROGRESS] 🔄 Checkmark removed from lesson in sidebar:', lesson.title);
      }
    });
    
    console.log('[PROGRESS] ✅ Curriculum sidebar update complete');
  } catch (error) {
    console.error('[PROGRESS] ❌ Error updating curriculum sidebar:', error);
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
      console.log('[PROGRESS] 📞 Calling getCourseProgress:', {
        courseId: currentCourse.id,
        reason: 'Rendering curriculum sidebar'
      });
      const progress = await window.progressAPI?.getCourseProgress(currentCourse.id);
      completedLessonIds = progress?.completedLessons || [];
      console.log('[PROGRESS] ✅ getCourseProgress result:', {
        completedCount: progress?.completedCount || 0,
        totalLessons: progress?.totalLessons || 0,
        percentage: progress?.completionPercentage || 0,
        completedLessonIds
      });
    } catch (error) {
      console.error('[PROGRESS] ❌ Error fetching progress:', error);
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

    // For videos: Reset to 0% on page load (start fresh)
    // For articles: Check scroll position on page load and set initial progress
    try {
      if (currentCourse && currentLesson) {
        // Check if this is a video lesson
        const hasVideoUrl = !!currentLesson.video_url;
        const hasVideoInContent = currentLesson.content && 
          (currentLesson.content.includes('<iframe') || currentLesson.content.includes('youtube.com/embed'));
        const isVideo = hasVideoUrl || hasVideoInContent;
        const isArticle = !hasVideoUrl && !hasVideoInContent;
        
        if (isVideo) {
          // For videos: Reset to 0% on page reload (start fresh)
          console.log('[PROGRESS] 🎥 Video lesson - resetting to 0% on page load');
          console.log('[PROGRESS] 📞 Calling updateLessonProgress:', {
            courseId: currentCourse.id,
            lessonId: currentLesson.id,
            percentage: 0,
            reason: 'Video lesson page reloaded - starting fresh'
          });
          
          await window.progressAPI?.updateLessonProgress(
            currentCourse.id,
            currentLesson.id,
            0
          );
          console.log('[PROGRESS] ✅ Progress reset to 0% (video lesson reloaded)');
        } else if (isArticle) {
          // For articles: Check scroll position on page load and set initial progress
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = document.documentElement.clientHeight;
          const scrollPercentage = (scrollHeight > clientHeight) 
            ? (scrollTop / (scrollHeight - clientHeight)) * 100 
            : 100;
          
          let initialProgress = 10; // Default: at beginning
          
          if (scrollPercentage >= 55) {
            // At end or beyond limit
            initialProgress = 100;
            console.log('[PROGRESS] 📄 Article - page reloaded at end (55%+ scroll) - setting 100%');
          } else if (scrollPercentage > 0 && scrollPercentage < 55) {
            // Scrolled but not at end
            initialProgress = 25;
            console.log('[PROGRESS] 📄 Article - page reloaded while scrolled - setting 25%');
          } else {
            // At beginning
            console.log('[PROGRESS] 📄 Article - page reloaded at beginning - setting 10%');
          }
          
          console.log('[PROGRESS] 📞 Calling updateLessonProgress:', {
            courseId: currentCourse.id,
            lessonId: currentLesson.id,
            percentage: initialProgress,
            scrollPercentage: Math.round(scrollPercentage),
            reason: 'Article page reloaded - setting initial progress based on scroll position'
          });
          
          await window.progressAPI?.updateLessonProgress(
            currentCourse.id,
            currentLesson.id,
            initialProgress
          );
          console.log('[PROGRESS] ✅ Progress set to', initialProgress + '% (article reloaded)');
        }
      }
    } catch (error) {
      // Silently fail if user is not authenticated
      if (error.message && !error.message.includes('authenticated')) {
        console.error('[PROGRESS] ❌ Error checking lesson status:', error);
      } else {
        console.log('[PROGRESS] ℹ️ Progress tracking skipped (user not authenticated)');
      }
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

