# Google Analytics Testing Guide

## Overview
This guide helps you test and verify that all analytics events are being tracked correctly in Google Analytics.

## Analytics ID
- **GA4 Property ID**: `G-F1EPZTB3XC`

## How to Access Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property (ID: G-F1EPZTB3XC)
3. Navigate to **Reports** → **Realtime** to see events as they happen
4. Navigate to **Reports** → **Engagement** → **Events** to see historical event data

## Testing Events in Real-Time

### 1. Open Browser Console
- Press `F12` or `Right-click` → `Inspect` → `Console` tab
- Look for logs prefixed with `[ANALYTICS]` to see what's being tracked

### 2. Check dataLayer
In the browser console, type:
```javascript
window.dataLayer
```
This shows all analytics events that have been sent to Google Analytics.

## Tracked Events

### 1. Page Views
**Event**: Automatic page view tracking
**When**: Every time a page loads
**How to Test**:
- Navigate to any page on the site
- Check console for: `[ANALYTICS] 📄 Tracking page view`
- In GA4: Go to **Realtime** → Should see page views

### 2. Lesson Viewed
**Event**: `lesson_viewed`
**When**: User opens a lesson page
**Parameters**:
- `course_id`: Course UUID
- `course_name`: Course title
- `lesson_id`: Lesson UUID
- `lesson_name`: Lesson title

**How to Test**:
- Open any lesson page (e.g., `detail_course-lesson.html?course=...&lesson=...`)
- Check console for: `[ANALYTICS] 📊 Tracking event: lesson_viewed`
- In GA4: **Realtime** → **Events** → Look for `lesson_viewed`

### 3. Lesson Completed
**Event**: `lesson_completed`
**When**: User completes a lesson (reaches 100%)
**Parameters**:
- `course_id`: Course UUID
- `lesson_id`: Lesson UUID
- `course_name`: Course title
- `lesson_name`: Lesson title
- `user_id`: Hashed user ID

**How to Test - Video Lesson**:
1. Open a video lesson
2. Play the video until it ends
3. Check console for: `[ANALYTICS] 🎓 Tracking lesson completion`
4. In GA4: **Realtime** → **Events** → Look for `lesson_completed`

**How to Test - Article Lesson**:
1. Open an article lesson
2. Scroll down to 55% or more
3. Check console for: `[ANALYTICS] 🎓 Tracking lesson completion`
4. In GA4: **Realtime** → **Events** → Look for `lesson_completed`

### 4. Course Completed
**Event**: `course_completed`
**When**: User completes all lessons in a course (100% course completion)
**Parameters**:
- `course_id`: Course UUID
- `course_name`: Course title
- `completion_percentage`: 100
- `user_id`: Hashed user ID

**How to Test**:
1. Complete all lessons in a course
2. When the last lesson is completed, this event fires
3. Check console for: `[ANALYTICS] 🎉 Tracking course completion`
4. In GA4: **Realtime** → **Events** → Look for `course_completed`

### 5. Progress Milestone
**Event**: `progress_milestone`
**When**: User reaches 25%, 50%, or 75% course completion
**Parameters**:
- `course_id`: Course UUID
- `milestone`: "25%" or "50%" or "75%"
- `completion_percentage`: Actual percentage (e.g., 25, 50, 75)
- `user_id`: Hashed user ID

**How to Test**:
1. Complete lessons in a course
2. When you reach 25%, 50%, or 75% of the course, this event fires
3. Check console for: `[ANALYTICS] 🎯 Tracking progress milestone`
4. In GA4: **Realtime** → **Events** → Look for `progress_milestone`
5. Check the `milestone` parameter to see which milestone was reached

### 6. Course Interaction
**Event**: `course_interaction`
**When**: User clicks "Start Course" or "Continue Course" button
**Parameters**:
- `course_id`: Course UUID
- `course_name`: Course title
- `action`: "start_course" or "continue_course"
- `user_id`: Hashed user ID

**How to Test**:
1. Go to a course detail page
2. Click "Start Course" or "Continue Course" button
3. Check console for: `[ANALYTICS] 📊 Tracking event: course_interaction`
4. In GA4: **Realtime** → **Events** → Look for `course_interaction`

### 7. Newsletter Subscription
**Event**: `newsletter_subscribed`
**When**: User subscribes to newsletter
**Parameters**:
- `email_domain`: Email domain (e.g., "gmail.com")

**How to Test**:
1. Subscribe to the newsletter
2. Check console for: `[ANALYTICS] 📊 Tracking event: newsletter_subscribed`
3. In GA4: **Realtime** → **Events** → Look for `newsletter_subscribed`

## Debugging in Google Analytics

### Real-Time View
1. Go to **Reports** → **Realtime**
2. You should see:
   - Active users
   - Events by event name
   - Top pages
   - Events in the last 30 minutes

### Event Details
1. Go to **Reports** → **Engagement** → **Events**
2. Click on any event name to see:
   - Event count
   - Parameters
   - User breakdown

### DebugView (Recommended for Testing)
1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
2. Enable it while testing
3. Go to **Admin** → **DebugView** in GA4
4. See events in real-time with full parameter details

## Console Logging

All analytics events are logged to the browser console with the `[ANALYTICS]` prefix:

- `🚀 Initializing Google Analytics...` - Analytics is being initialized
- `📄 Tracking page view` - Page view event
- `📊 Tracking event: [event_name]` - Custom event being tracked
- `✅ Event tracked successfully` - Event was sent to GA4
- `📋 Latest dataLayer entry` - Shows the last event sent to dataLayer

## Common Issues

### Events Not Showing in GA4
1. **Check Analytics ID**: Verify `G-F1EPZTB3XC` is correct
2. **Check Console**: Look for `[ANALYTICS]` logs to see if events are being tracked
3. **Check dataLayer**: Run `window.dataLayer` in console to see events
4. **Wait Time**: Real-time view can take 30-60 seconds to update
5. **Ad Blockers**: Disable ad blockers as they may block GA4

### Events Missing Parameters
1. Check console logs - they show all parameters being sent
2. Verify user is authenticated (some events require user ID)
3. Check that course/lesson data is being fetched correctly

## Testing Checklist

- [ ] Page views are tracked on all pages
- [ ] Lesson viewed event fires when opening a lesson
- [ ] Lesson completed event fires when video ends
- [ ] Lesson completed event fires when article is scrolled to 55%+
- [ ] Course completed event fires when all lessons are done
- [ ] Progress milestone events fire at 25%, 50%, 75%
- [ ] Course interaction events fire on button clicks
- [ ] Newsletter subscription event fires on subscribe
- [ ] All events show correct parameters in GA4
- [ ] User IDs are hashed (not showing real UUIDs)

## Next Steps

1. Test each event type using the guide above
2. Verify events appear in GA4 Real-Time view
3. Check event parameters are correct
4. Create custom reports in GA4 for your specific needs
5. Set up conversions/goals for important events (lesson_completed, course_completed)
