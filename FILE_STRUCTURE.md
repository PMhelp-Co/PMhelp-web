# PMHelp Website - Complete File Structure

## 📁 Updated Project Structure

```
zubbies/
│
├── 📄 HTML PAGES
│   ├── index.html                          [EXISTING]
│   ├── learn.html                          [EXISTING - NEEDS UPDATES]
│   ├── blog.html                           [EXISTING - NEEDS UPDATES]
│   ├── about-us.html                       [EXISTING]
│   ├── community.html                      [EXISTING]
│   ├── privacy-policy.html                 [EXISTING]
│   ├── terms-and-condition.html            [EXISTING]
│   ├── style-guide.html                    [EXISTING]
│   ├── 401.html                            [EXISTING]
│   │
│   ├── 🔐 AUTHENTICATION PAGES (NEW)
│   ├── signin.html                         [NEW]
│   ├── signup.html                         [NEW]
│   ├── forgot-password.html                [NEW]
│   ├── reset-password.html                 [NEW]
│   ├── dashboard.html                      [NEW - Optional user dashboard]
│   │
│   ├── 📚 DETAIL PAGES (EXISTING - NEEDS UPDATES)
│   ├── detail_course.html                  [EXISTING - NEEDS UPDATES]
│   ├── detail_course-lesson.html           [EXISTING - NEEDS UPDATES]
│   ├── detail_blog.html                    [EXISTING - NEEDS UPDATES]
│   ├── detail_author.html                  [EXISTING - NEEDS UPDATES]
│   ├── detail_content-sources.html         [EXISTING - NEEDS UPDATES]
│   ├── detail_stakeholders.html             [EXISTING - NEEDS UPDATES]
│   ├── detail_tags.html                    [EXISTING - NEEDS UPDATES]
│   └── detail_testimonials.html            [EXISTING - NEEDS UPDATES]
│
├── 📂 css/
│   ├── normalize.css                       [EXISTING]
│   ├── webflow.css                         [EXISTING]
│   ├── zubbies-dandy-site.webflow.css      [EXISTING]
│   └── auth.css                            [NEW - Auth page styles]
│
├── 📂 js/
│   ├── webflow.js                          [EXISTING]
│   │
│   ├── 🔧 CORE CONFIGURATION (NEW)
│   ├── supabase-config.js                  [NEW - Supabase client setup]
│   │
│   ├── 🔐 AUTHENTICATION (NEW)
│   ├── auth.js                             [NEW - Sign in/up/out functions]
│   ├── auth-state.js                       [NEW - Auth state management]
│   ├── header-auth.js                      [NEW - Update header based on auth]
│   └── route-guard.js                      [NEW - Protect routes]
│   │
│   ├── 📊 PROGRESS TRACKING (NEW)
│   └── progress.js                         [NEW - User progress functions]
│   │
│   ├── 🛠️ UTILITIES (NEW)
│   ├── utils/
│   │   ├── url-params.js                   [NEW - URL parameter handling]
│   │   ├── form-validation.js              [NEW - Form validation helpers]
│   │   ├── date-format.js                  [NEW - Date formatting]
│   │   └── error-handler.js                [NEW - Error handling utilities]
│   │
│   ├── 🌐 API FUNCTIONS (NEW)
│   ├── api/
│   │   ├── courses.js                      [NEW - Course data fetching]
│   │   ├── lessons.js                      [NEW - Lesson data fetching]
│   │   ├── blog.js                         [NEW - Blog post data fetching]
│   │   ├── authors.js                      [NEW - Author data fetching]
│   │   ├── users.js                        [NEW - User profile functions]
│   │   ├── progress.js                     [NEW - Progress tracking API]
│   │   ├── feedback.js                     [NEW - Feedback submission]
│   │   ├── content-sources.js              [NEW - Content sources data]
│   │   ├── testimonials.js                 [NEW - Testimonials data]
│   │   └── tags.js                         [NEW - Tags data]
│   │
│   └── 📄 PAGE-SPECIFIC SCRIPTS (NEW)
│   └── pages/
│       ├── learn-page.js                   [NEW - learn.html logic]
│       ├── course-detail-page.js           [NEW - detail_course.html logic]
│       ├── lesson-page.js                  [NEW - detail_course-lesson.html logic]
│       ├── blog-page.js                    [NEW - blog.html logic]
│       ├── blog-detail-page.js             [NEW - detail_blog.html logic]
│       ├── signin-page.js                  [NEW - signin.html logic]
│       ├── signup-page.js                  [NEW - signup.html logic]
│       └── dashboard-page.js               [NEW - dashboard.html logic]
│
├── 📂 images/
│   ├── [All existing images]               [EXISTING]
│   ├── icons/
│   │   ├── user-icon.svg                   [NEW - User icon]
│   │   ├── logout-icon.svg                 [NEW - Logout icon]
│   │   └── loading-spinner.svg             [NEW - Loading spinner]
│   └── placeholders/
│       └── avatar-placeholder.png          [NEW - Default avatar]
│
├── 📂 fonts/
│   └── [All existing fonts]                 [EXISTING]
│
├── 📂 components/                          [NEW - Reusable components]
│   ├── loading-spinner.html                [NEW - Loading component]
│   ├── error-message.html                  [NEW - Error component]
│   ├── user-menu.html                      [NEW - User dropdown menu]
│   └── breadcrumbs.html                   [NEW - Breadcrumb navigation]
│
├── 📂 config/                              [NEW - Configuration files]
│   ├── .env.example                       [NEW - Environment variables template]
│   └── constants.js                       [NEW - App constants]
│
├── 📄 README.md                            [EXISTING - Update with new info]
├── 📄 PROJECT_PLAN.md                      [NEW - Development plan]
├── 📄 FILE_STRUCTURE.md                    [NEW - This file]
└── 📄 .gitignore                          [NEW - Git ignore file]
```

---

## 📋 Detailed File Descriptions

### 🔐 Authentication Pages

#### `signin.html`
- User sign-in form
- Email/password authentication
- "Forgot password" link
- Link to signup page
- Redirects to dashboard or intended page after login

#### `signup.html`
- User registration form
- Email/password signup
- Profile information collection
- Terms acceptance checkbox
- Redirects to dashboard after signup

#### `forgot-password.html`
- Password reset request form
- Sends reset email via Supabase

#### `reset-password.html`
- Password reset form (accessed via email link)
- New password confirmation

#### `dashboard.html` (Optional)
- User profile overview
- Enrolled courses list
- Progress tracking
- Completed courses
- Account settings

---

### 🔧 Core JavaScript Files

#### `js/supabase-config.js`
```javascript
// Supabase client initialization
// Contains: SUPABASE_URL, SUPABASE_ANON_KEY
// Exports: supabase client instance
```

#### `js/auth.js`
```javascript
// Authentication functions
// - signIn(email, password)
// - signUp(email, password, metadata)
// - signOut()
// - resetPassword(email)
// - updatePassword(newPassword)
```

#### `js/auth-state.js`
```javascript
// Auth state management
// - checkAuthState()
// - getCurrentUser()
// - onAuthStateChange(callback)
// - isAuthenticated()
```

#### `js/header-auth.js`
```javascript
// Updates header based on auth state
// - updateHeaderAuthUI()
// - showUserMenu()
// - hideUserMenu()
```

#### `js/route-guard.js`
```javascript
// Route protection
// - requireAuth()
// - redirectIfAuthenticated()
// - protectRoute()
```

#### `js/progress.js`
```javascript
// Progress tracking
// - markLessonComplete(lessonId)
// - getCourseProgress(courseId)
// - getUserProgress()
// - updateProgressPercentage()
```

---

### 🛠️ Utility Files

#### `js/utils/url-params.js`
```javascript
// URL parameter utilities
// - getURLParam(name)
// - getSlugFromURL()
// - buildURLWithParams(base, params)
```

#### `js/utils/form-validation.js`
```javascript
// Form validation helpers
// - validateEmail(email)
// - validatePassword(password)
// - validateRequired(field)
```

#### `js/utils/date-format.js`
```javascript
// Date formatting
// - formatDate(date)
// - formatRelativeTime(date)
// - formatDateTime(date)
```

#### `js/utils/error-handler.js`
```javascript
// Error handling
// - handleAPIError(error)
// - showErrorMessage(message)
// - logError(error)
```

---

### 🌐 API Files

#### `js/api/courses.js`
```javascript
// Course data functions
// - getAllCourses()
// - getCourseBySlug(slug)
// - getCourseById(id)
// - getCourseLessons(courseId)
// - getCourseLearningObjectives(courseId)
```

#### `js/api/lessons.js`
```javascript
// Lesson data functions
// - getLessonBySlug(courseSlug, lessonSlug)
// - getLessonById(id)
// - getNextLesson(currentLessonId, courseId)
// - getPreviousLesson(currentLessonId, courseId)
```

#### `js/api/blog.js`
```javascript
// Blog functions
// - getAllBlogPosts()
// - getBlogPostBySlug(slug)
// - getRelatedPosts(postId, limit)
// - getPostsByTag(tagSlug)
```

#### `js/api/authors.js`
```javascript
// Author functions
// - getAuthorBySlug(slug)
// - getAuthorById(id)
// - getAuthorPosts(authorId)
```

#### `js/api/users.js`
```javascript
// User profile functions
// - getUserProfile(userId)
// - updateUserProfile(userId, data)
// - uploadAvatar(file)
```

#### `js/api/progress.js`
```javascript
// Progress API
// - saveProgress(userId, courseId, lessonId)
// - getProgress(userId, courseId)
// - getCompletedLessons(userId, courseId)
```

#### `js/api/feedback.js`
```javascript
// Feedback submission
// - submitCourseFeedback(courseId, feedbackData)
// - getCourseFeedback(courseId)
```

---

### 📄 Page-Specific Scripts

#### `js/pages/learn-page.js`
- Fetches all courses
- Populates course cards dynamically
- Handles "Start module" button clicks
- Filters and sorting (if needed)

#### `js/pages/course-detail-page.js`
- Reads course slug from URL
- Fetches course data
- Populates course information
- Fetches and displays lessons
- Handles "Start course" button
- Submits feedback form

#### `js/pages/lesson-page.js`
- Reads course and lesson slugs from URL
- Fetches lesson data
- Displays lesson content
- Shows curriculum sidebar
- Handles next/previous navigation
- Tracks lesson completion
- Updates progress

#### `js/pages/blog-page.js`
- Fetches all blog posts
- Populates blog post cards
- Handles pagination
- Filters by tags/categories

#### `js/pages/blog-detail-page.js`
- Reads blog post slug from URL
- Fetches blog post data
- Displays post content
- Shows related articles
- Handles social sharing

#### `js/pages/signin-page.js`
- Handles sign-in form submission
- Validates input
- Shows error messages
- Redirects after successful login

#### `js/pages/signup-page.js`
- Handles sign-up form submission
- Validates input
- Creates user profile
- Shows error messages

#### `js/pages/dashboard-page.js`
- Fetches user data
- Displays enrolled courses
- Shows progress for each course
- Handles account settings

---

### 📂 Additional Directories

#### `components/`
Reusable HTML components that can be included in pages:
- Loading spinners
- Error messages
- User menu dropdown
- Breadcrumb navigation

#### `config/`
Configuration files:
- `.env.example` - Template for environment variables
- `constants.js` - App-wide constants (API endpoints, etc.)

---

## 🔗 File Dependencies

### HTML Pages → JavaScript Files

**All Pages:**
- `js/supabase-config.js` (loaded first)
- `js/auth-state.js` (for auth checks)
- `js/header-auth.js` (for header updates)

**Authentication Pages:**
- `signin.html` → `js/pages/signin-page.js`
- `signup.html` → `js/pages/signup-page.js`
- `forgot-password.html` → `js/auth.js`

**Content Pages:**
- `learn.html` → `js/pages/learn-page.js` + `js/api/courses.js`
- `detail_course.html` → `js/pages/course-detail-page.js` + `js/api/courses.js` + `js/api/lessons.js`
- `detail_course-lesson.html` → `js/pages/lesson-page.js` + `js/api/lessons.js` + `js/progress.js`
- `blog.html` → `js/pages/blog-page.js` + `js/api/blog.js`
- `detail_blog.html` → `js/pages/blog-detail-page.js` + `js/api/blog.js`

**Protected Pages:**
- All detail pages → `js/route-guard.js` (if requiring authentication)

---

## 📦 CDN Dependencies

Add to HTML `<head>` or before closing `</body>`:

```html
<!-- Supabase JS Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- jQuery (if still needed for Webflow) -->
<script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js"></script>
```

---

## 🎯 Implementation Order

1. **Phase 1:** Create `js/supabase-config.js` and basic structure
2. **Phase 2:** Create authentication files (`auth.js`, `auth-state.js`, etc.)
3. **Phase 3:** Create utility files (`url-params.js`, etc.)
4. **Phase 4:** Create API files (one at a time, starting with `courses.js`)
5. **Phase 5:** Create page-specific scripts
6. **Phase 6:** Update HTML pages to include new scripts

---

## 📝 Notes

- **NEW** = File needs to be created
- **EXISTING** = File already exists, may need updates
- **NEEDS UPDATES** = Existing file that requires modifications
- All new JavaScript files should follow ES6+ syntax
- Use async/await for all API calls
- Include error handling in all API functions
- Add JSDoc comments to all functions

---

## 🔄 Migration Checklist

- [ ] Create all new directories
- [ ] Create all new JavaScript files (start with core, then utilities, then API, then pages)
- [ ] Create authentication HTML pages
- [ ] Update existing HTML pages with new script tags
- [ ] Test each file as it's created
- [ ] Update `.gitignore` to exclude sensitive files
- [ ] Create `.env.example` template


