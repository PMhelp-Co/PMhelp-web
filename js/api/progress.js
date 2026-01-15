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
  console.log('[PROGRESS] 🎯 markLessonComplete called:', { courseId, lessonId });
  try {
    // Get current user
    console.log('[PROGRESS] 👤 Getting current user...');
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    if (userError) {
      console.error('[PROGRESS] ❌ Error getting user:', userError);
      throw userError;
    }
    if (!user) {
      console.warn('[PROGRESS] ⚠️ No user found - authentication required');
      throw new Error('User must be authenticated to track progress');
    }
    console.log('[PROGRESS] ✅ User authenticated:', { userId: user.id, email: user.email });

    // Check if progress already exists
    console.log('[PROGRESS] 🔍 Checking for existing progress record...');
    const { data: existing, error: checkError } = await window.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[PROGRESS] ❌ Error checking existing progress:', checkError);
      throw checkError; // Re-throw if it's not a "no rows" error
    }

    const isNewCompletion = !existing || !existing.completed_at;
    console.log('[PROGRESS] 📊 Existing progress check:', {
      exists: !!existing,
      alreadyCompleted: !!existing?.completed_at,
      isNewCompletion,
      existingProgress: existing?.progress_percentage || 0
    });

    if (existing) {
      // Update existing progress
      console.log('[PROGRESS] 📝 Updating existing progress record:', { recordId: existing.id });
      const updateData = {
        completed_at: new Date().toISOString(),
        progress_percentage: 100,
        updated_at: new Date().toISOString()
      };
      console.log('[PROGRESS] 📤 Database UPDATE operation:', {
        table: 'user_progress',
        recordId: existing.id,
        data: updateData
      });
      
      const { data, error } = await window.supabase
        .from('user_progress')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('[PROGRESS] ❌ Database UPDATE error:', error);
        throw error;
      }
      console.log('[PROGRESS] ✅ Progress updated successfully:', { recordId: data.id, completedAt: data.completed_at });

      // Track analytics if this is a new completion
      if (isNewCompletion && window.analytics) {
        console.log('[PROGRESS] 📊 Tracking analytics for new completion...');
        try {
          console.log('[PROGRESS] 🔍 Fetching course and lesson names for analytics...');
          const [courseData, lessonData] = await Promise.all([
            window.supabase.from('courses').select('title').eq('id', courseId).single(),
            window.supabase.from('lessons').select('title').eq('id', lessonId).single()
          ]);
          const courseName = courseData?.data?.title || 'Unknown Course';
          const lessonName = lessonData?.data?.title || 'Unknown Lesson';
          console.log('[PROGRESS] 📝 Course/Lesson names:', { courseName, lessonName });
          
          console.log('[PROGRESS] 📊 Calling analytics.trackLessonCompleted...');
          window.analytics.trackLessonCompleted(courseId, lessonId, courseName, lessonName, user.id);

          // Check if course is complete
          console.log('[PROGRESS] 🔍 Checking course completion status...');
          const progress = await getCourseProgress(courseId);
          console.log('[PROGRESS] 📊 Course progress:', {
            completed: progress.completedCount,
            total: progress.totalLessons,
            percentage: progress.completionPercentage
          });
          
          if (progress.completionPercentage === 100) {
            console.log('[PROGRESS] 🎉 Course is 100% complete! Tracking course completion...');
            window.analytics.trackCourseCompleted(courseId, courseName, 100, user.id);
          } else {
            // Check for milestones
            console.log('[PROGRESS] 🔍 Checking for progress milestones...');
            const milestones = [25, 50, 75];
            const previousPercentage = progress.totalLessons > 0 
              ? Math.round(((progress.completedCount - 1) / progress.totalLessons) * 100)
              : 0;
            console.log('[PROGRESS] 📊 Milestone check:', { previousPercentage, currentPercentage: progress.completionPercentage });
            for (const milestone of milestones) {
              if (previousPercentage < milestone && progress.completionPercentage >= milestone) {
                console.log(`[PROGRESS] 🎯 Milestone reached: ${milestone}%`);
                window.analytics.trackProgressMilestone(courseId, `${milestone}%`, progress.completionPercentage, user.id);
                break;
              }
            }
          }
          console.log('[PROGRESS] ✅ Analytics tracking completed');
        } catch (analyticsError) {
          console.warn('[PROGRESS] ⚠️ Error tracking analytics (non-fatal):', analyticsError);
        }
      } else if (!isNewCompletion) {
        console.log('[PROGRESS] ℹ️ Lesson already completed - skipping analytics');
      } else if (!window.analytics) {
        console.warn('[PROGRESS] ⚠️ Analytics module not available - skipping analytics');
      }

      return data;
    } else {
      // Create new progress record
      console.log('[PROGRESS] 📝 Creating new progress record...');
      const insertData = {
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString(),
        progress_percentage: 100
      };
      console.log('[PROGRESS] 📤 Database INSERT operation:', {
        table: 'user_progress',
        data: insertData
      });
      
      const { data, error } = await window.supabase
        .from('user_progress')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('[PROGRESS] ❌ Database INSERT error:', error);
        throw error;
      }
      console.log('[PROGRESS] ✅ Progress record created successfully:', { recordId: data.id, completedAt: data.completed_at });

      // Track analytics
      if (window.analytics) {
        console.log('[PROGRESS] 📊 Tracking analytics for new completion...');
        try {
          console.log('[PROGRESS] 🔍 Fetching course and lesson names for analytics...');
          const [courseData, lessonData] = await Promise.all([
            window.supabase.from('courses').select('title').eq('id', courseId).single(),
            window.supabase.from('lessons').select('title').eq('id', lessonId).single()
          ]);
          const courseName = courseData?.data?.title || 'Unknown Course';
          const lessonName = lessonData?.data?.title || 'Unknown Lesson';
          console.log('[PROGRESS] 📝 Course/Lesson names:', { courseName, lessonName });
          
          console.log('[PROGRESS] 📊 Calling analytics.trackLessonCompleted...');
          window.analytics.trackLessonCompleted(courseId, lessonId, courseName, lessonName, user.id);

          // Check if course is complete
          console.log('[PROGRESS] 🔍 Checking course completion status...');
          const progress = await getCourseProgress(courseId);
          console.log('[PROGRESS] 📊 Course progress:', {
            completed: progress.completedCount,
            total: progress.totalLessons,
            percentage: progress.completionPercentage
          });
          
          if (progress.completionPercentage === 100) {
            console.log('[PROGRESS] 🎉 Course is 100% complete! Tracking course completion...');
            window.analytics.trackCourseCompleted(courseId, courseName, 100, user.id);
          } else {
            // Check for milestones
            console.log('[PROGRESS] 🔍 Checking for progress milestones...');
            const milestones = [25, 50, 75];
            for (const milestone of milestones) {
              if (progress.completionPercentage >= milestone) {
                console.log(`[PROGRESS] 🎯 Milestone reached: ${milestone}%`);
                window.analytics.trackProgressMilestone(courseId, `${milestone}%`, progress.completionPercentage, user.id);
                break;
              }
            }
          }
          console.log('[PROGRESS] ✅ Analytics tracking completed');
        } catch (analyticsError) {
          console.warn('[PROGRESS] ⚠️ Error tracking analytics (non-fatal):', analyticsError);
        }
      } else {
        console.warn('[PROGRESS] ⚠️ Analytics module not available - skipping analytics');
      }

      return data;
    }
  } catch (error) {
    // Handle RLS or authentication errors gracefully
    if (error.code === 'PGRST301' || error.status === 406 || error.message?.includes('permission')) {
      console.warn('[PROGRESS] ⚠️ Progress tracking blocked by RLS or permissions. User may not be authenticated or RLS policy may need adjustment.');
      console.warn('[PROGRESS] ⚠️ Error details:', { code: error.code, status: error.status, message: error.message });
      return null; // Return null instead of throwing to allow page to continue loading
    }
    console.error('[PROGRESS] ❌ Error marking lesson complete:', error);
    throw error;
  }
}

/**
 * Get user progress for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} - Progress data with completion percentage
 */
async function getCourseProgress(courseId) {
  console.log('[PROGRESS] 🔍 getCourseProgress called for course:', courseId);
  try {
    console.log('[PROGRESS] 👤 Getting current user...');
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    if (userError) {
      console.error('[PROGRESS] ❌ Error getting user:', userError);
      throw userError;
    }
    if (!user) {
      console.log('[PROGRESS] ⚠️ No user found - returning empty progress');
      return {
        completedLessons: [],
        totalLessons: 0,
        completionPercentage: 0
      };
    }
    console.log('[PROGRESS] ✅ User authenticated:', { userId: user.id });

    // Get all lessons for the course
    console.log('[PROGRESS] 📚 Fetching all lessons for course...');
    const { data: lessons, error: lessonsError } = await window.supabase
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('is_published', true);

    if (lessonsError) {
      console.error('[PROGRESS] ❌ Error fetching lessons:', lessonsError);
      throw lessonsError;
    }
    console.log('[PROGRESS] 📚 Total lessons found:', lessons?.length || 0);

    // Get completed lessons
    console.log('[PROGRESS] ✅ Fetching completed lessons...');
    const { data: progress, error: progressError } = await window.supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .not('completed_at', 'is', null);

    if (progressError) {
      console.error('[PROGRESS] ❌ Error fetching progress:', progressError);
      throw progressError;
    }
    console.log('[PROGRESS] ✅ Completed lessons found:', progress?.length || 0);

    const completedLessonIds = (progress || []).map(p => p.lesson_id);
    const totalLessons = lessons?.length || 0;
    const completedCount = completedLessonIds.length;
    const completionPercentage = totalLessons > 0 
      ? Math.round((completedCount / totalLessons) * 100) 
      : 0;

    console.log('[PROGRESS] 📊 Course progress calculated:', {
      completed: completedCount,
      total: totalLessons,
      percentage: `${completionPercentage}%`,
      completedLessonIds
    });

    return {
      completedLessons: completedLessonIds,
      totalLessons,
      completedCount,
      completionPercentage
    };
  } catch (error) {
    console.error('[PROGRESS] ❌ Error getting course progress:', error);
    throw error;
  }
}

/**
 * Check if a lesson is completed
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<boolean>} - True if lesson is completed
 */
async function isLessonCompleted(lessonId) {
  console.log('[PROGRESS] 🔍 isLessonCompleted called for lesson:', lessonId);
  try {
    console.log('[PROGRESS] 👤 Getting current user...');
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    if (userError) {
      console.error('[PROGRESS] ❌ Error getting user:', userError);
      return false;
    }
    if (!user) {
      console.log('[PROGRESS] ⚠️ No user found - lesson not completed');
      return false;
    }
    console.log('[PROGRESS] ✅ User authenticated:', { userId: user.id });

    console.log('[PROGRESS] 🔍 Checking if lesson is completed in database...');
    const { data, error } = await window.supabase
      .from('user_progress')
      .select('id, completed_at')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .not('completed_at', 'is', null)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[PROGRESS] ❌ Error checking lesson completion:', error);
      throw error; // PGRST116 = no rows
    }
    
    const isCompleted = !!data;
    console.log('[PROGRESS] 📊 Lesson completion status:', {
      lessonId,
      isCompleted,
      completedAt: data?.completed_at || null
    });
    
    return isCompleted;
  } catch (error) {
    console.error('[PROGRESS] ❌ Error checking lesson completion:', error);
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
  console.log('[PROGRESS] 📈 updateLessonProgress called:', { courseId, lessonId, percentage });
  try {
    console.log('[PROGRESS] 👤 Getting current user...');
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    if (userError) {
      console.error('[PROGRESS] ❌ Error getting user:', userError);
      throw userError;
    }
    if (!user) {
      console.warn('[PROGRESS] ⚠️ No user found - authentication required');
      throw new Error('User must be authenticated to track progress');
    }
    console.log('[PROGRESS] ✅ User authenticated:', { userId: user.id, email: user.email });

    // Clamp percentage between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    console.log('[PROGRESS] 📊 Clamped percentage:', { original: percentage, clamped: clampedPercentage });

    // Check if progress exists
    console.log('[PROGRESS] 🔍 Checking for existing progress record...');
    const { data: existing, error: checkError } = await window.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[PROGRESS] ❌ Error checking existing progress:', checkError);
      throw checkError; // Re-throw if it's not a "no rows" error
    }
    
    console.log('[PROGRESS] 📊 Existing progress check:', {
      exists: !!existing,
      currentProgress: existing?.progress_percentage || 0,
      alreadyCompleted: !!existing?.completed_at,
      recordId: existing?.id || null
    });

    if (existing) {
      // Update existing progress
      const updateData = {
        progress_percentage: clampedPercentage,
        updated_at: new Date().toISOString()
      };

      // Mark as completed if percentage is 100
      const isNewCompletion = clampedPercentage === 100 && !existing.completed_at;
      if (isNewCompletion) {
        updateData.completed_at = new Date().toISOString();
        console.log('[PROGRESS] 🎉 Progress reached 100% - marking as completed');
      }

      console.log('[PROGRESS] 📝 Updating progress:', {
        recordId: existing.id,
        updateData,
        isNewCompletion
      });
      console.log('[PROGRESS] 📤 Database UPDATE operation:', {
        table: 'user_progress',
        recordId: existing.id,
        data: updateData
      });

      const { data, error } = await window.supabase
        .from('user_progress')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('[PROGRESS] ❌ Database UPDATE error:', error);
        throw error;
      }
      console.log('[PROGRESS] ✅ Progress updated:', {
        recordId: data.id,
        progressPercentage: data.progress_percentage,
        completedAt: data.completed_at
      });

      // Track analytics if this is a new completion
      if (isNewCompletion && window.analytics) {
        console.log('[PROGRESS] 📊 Tracking analytics for new completion...');
        try {
          console.log('[PROGRESS] 🔍 Fetching course and lesson names for analytics...');
          const [courseData, lessonData] = await Promise.all([
            window.supabase.from('courses').select('title').eq('id', courseId).single(),
            window.supabase.from('lessons').select('title').eq('id', lessonId).single()
          ]);

          const courseName = courseData?.data?.title || 'Unknown Course';
          const lessonName = lessonData?.data?.title || 'Unknown Lesson';
          console.log('[PROGRESS] 📝 Course/Lesson names:', { courseName, lessonName });

          // Track lesson completion
          console.log('[PROGRESS] 📊 Calling analytics.trackLessonCompleted...');
          window.analytics.trackLessonCompleted(courseId, lessonId, courseName, lessonName, user.id);

          // Check if course is now complete and track milestone
          console.log('[PROGRESS] 🔍 Checking course completion status...');
          const progress = await getCourseProgress(courseId);
          console.log('[PROGRESS] 📊 Course progress:', {
            completed: progress.completedCount,
            total: progress.totalLessons,
            percentage: progress.completionPercentage
          });
          
          if (progress.completionPercentage === 100) {
            console.log('[PROGRESS] 🎉 Course is 100% complete! Tracking course completion...');
            window.analytics.trackCourseCompleted(courseId, courseName, 100, user.id);
          } else {
            // Track progress milestones (25%, 50%, 75%)
            console.log('[PROGRESS] 🔍 Checking for progress milestones...');
            const milestones = [25, 50, 75];
            const previousPercentage = progress.totalLessons > 0
              ? Math.round(((progress.completedCount - 1) / progress.totalLessons) * 100)
              : 0;
            console.log('[PROGRESS] 📊 Milestone check:', { previousPercentage, currentPercentage: progress.completionPercentage });
            
            for (const milestone of milestones) {
              if (previousPercentage < milestone && progress.completionPercentage >= milestone) {
                console.log(`[PROGRESS] 🎯 Milestone reached: ${milestone}%`);
                window.analytics.trackProgressMilestone(
                  courseId,
                  `${milestone}%`,
                  progress.completionPercentage,
                  user.id
                );
                break; // Only track one milestone at a time
              }
            }
          }
          console.log('[PROGRESS] ✅ Analytics tracking completed');
        } catch (analyticsError) {
          console.warn('[PROGRESS] ⚠️ Error tracking analytics (non-fatal):', analyticsError);
          // Don't throw - analytics errors shouldn't break progress tracking
        }
      } else if (!isNewCompletion) {
        console.log('[PROGRESS] ℹ️ Progress updated but not a new completion - skipping analytics');
      } else if (!window.analytics) {
        console.warn('[PROGRESS] ⚠️ Analytics module not available - skipping analytics');
      }

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
      const isNewCompletion = clampedPercentage === 100;
      if (isNewCompletion) {
        insertData.completed_at = new Date().toISOString();
        console.log('[PROGRESS] 🎉 Creating new record with 100% - marking as completed');
      }

      console.log('[PROGRESS] 📝 Creating new progress record:', { insertData, isNewCompletion });
      console.log('[PROGRESS] 📤 Database INSERT operation:', {
        table: 'user_progress',
        data: insertData
      });

      const { data, error } = await window.supabase
        .from('user_progress')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('[PROGRESS] ❌ Database INSERT error:', error);
        throw error;
      }
      console.log('[PROGRESS] ✅ Progress record created:', {
        recordId: data.id,
        progressPercentage: data.progress_percentage,
        completedAt: data.completed_at
      });

      // Track analytics if this is a new completion
      if (isNewCompletion && window.analytics) {
        console.log('[PROGRESS] 📊 Tracking analytics for new completion...');
        try {
          console.log('[PROGRESS] 🔍 Fetching course and lesson names for analytics...');
          const [courseData, lessonData] = await Promise.all([
            window.supabase.from('courses').select('title').eq('id', courseId).single(),
            window.supabase.from('lessons').select('title').eq('id', lessonId).single()
          ]);

          const courseName = courseData?.data?.title || 'Unknown Course';
          const lessonName = lessonData?.data?.title || 'Unknown Lesson';
          console.log('[PROGRESS] 📝 Course/Lesson names:', { courseName, lessonName });

          // Track lesson completion
          console.log('[PROGRESS] 📊 Calling analytics.trackLessonCompleted...');
          window.analytics.trackLessonCompleted(courseId, lessonId, courseName, lessonName, user.id);

          // Check if course is now complete and track milestone
          console.log('[PROGRESS] 🔍 Checking course completion status...');
          const progress = await getCourseProgress(courseId);
          console.log('[PROGRESS] 📊 Course progress:', {
            completed: progress.completedCount,
            total: progress.totalLessons,
            percentage: progress.completionPercentage
          });
          
          if (progress.completionPercentage === 100) {
            console.log('[PROGRESS] 🎉 Course is 100% complete! Tracking course completion...');
            window.analytics.trackCourseCompleted(courseId, courseName, 100, user.id);
          } else {
            // Track progress milestones (25%, 50%, 75%)
            console.log('[PROGRESS] 🔍 Checking for progress milestones...');
            const milestones = [25, 50, 75];
            for (const milestone of milestones) {
              if (progress.completionPercentage >= milestone) {
                console.log(`[PROGRESS] 🎯 Milestone reached: ${milestone}%`);
                window.analytics.trackProgressMilestone(
                  courseId,
                  `${milestone}%`,
                  progress.completionPercentage,
                  user.id
                );
                break; // Only track one milestone at a time
              }
            }
          }
          console.log('[PROGRESS] ✅ Analytics tracking completed');
        } catch (analyticsError) {
          console.warn('[PROGRESS] ⚠️ Error tracking analytics (non-fatal):', analyticsError);
          // Don't throw - analytics errors shouldn't break progress tracking
        }
      } else if (!isNewCompletion) {
        console.log('[PROGRESS] ℹ️ New record created but not at 100% - skipping analytics');
      } else if (!window.analytics) {
        console.warn('[PROGRESS] ⚠️ Analytics module not available - skipping analytics');
      }

      return data;
    }
  } catch (error) {
    // Handle RLS or authentication errors gracefully
    if (error.code === 'PGRST301' || error.status === 406 || error.message?.includes('permission')) {
      console.warn('[PROGRESS] ⚠️ Progress tracking blocked by RLS or permissions. User may not be authenticated or RLS policy may need adjustment.');
      console.warn('[PROGRESS] ⚠️ Error details:', { code: error.code, status: error.status, message: error.message });
      return null; // Return null instead of throwing to allow page to continue loading
    }
    console.error('[PROGRESS] ❌ Error updating lesson progress:', error);
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

