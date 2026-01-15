# PMHelp Back-Office System - Implementation Plan

## 🎯 Overview

**Purpose:** Build a private internal back-office system for PMHelp team members to manage analytics, user tracking, and marketing content without developer intervention.

**Key Requirements:**
- Separate from public website (not linked on pmhelp.co)
- Accessible only to internal team members (PMHelp/company access)
- Deploy to Netlify URL for initial review
- Priority: Functionality > Design
- Three main sections: Analytics Dashboard, Users Management, Marketing/Banner Management

---

## 🏗️ Architecture & Tech Stack

### Recommended Stack
- **Frontend:** HTML, CSS (existing Webflow styles), Vanilla JavaScript
- **Backend:** Supabase (already in use)
- **Authentication:** Supabase Auth with role-based access (`role = 'admin'` or `role = 'team'`)
- **Deployment:** Netlify (separate site from main website)
- **Domain:** Eventually `backoffice.pmhelp.co` (subdomain)

### Database Structure (Leverages Existing Schema)

**Existing Tables:**
- `profiles` (users with roles: student, admin, instructor)
- `courses` (course catalog)
- `lessons` (individual lessons)
- `user_progress` (user learning progress)
- `course_feedback` (user feedback)

**New Tables Needed:**
- `website_banners` (marketing banner content)

---

## 📋 Implementation Phases

### Phase 1: Setup & Authentication (Days 1-2)

#### 1.1 Project Structure
```
backoffice/
├── index.html                 # Main dashboard (tab navigation)
├── login.html                 # Admin login page
├── css/
│   ├── backoffice.css        # Custom backoffice styles
│   └── normalize.css         # Reset styles
├── js/
│   ├── auth.js               # Backoffice authentication
│   ├── analytics.js          # Analytics dashboard logic
│   ├── users.js              # User management logic
│   ├── marketing.js          # Banner management logic
│   └── api/
│       ├── analytics-api.js  # Analytics queries
│       ├── users-api.js      # User queries
│       └── banners-api.js    # Banner CRUD operations
└── _redirects                # Netlify redirects for auth
```

#### 1.2 Authentication Setup

**Supabase RLS Policies for Backoffice Access:**

```sql
-- Create admin/team role check function
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id
    AND role IN ('admin', 'team', 'instructor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policy: Only admins can view all users
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (is_admin(auth.uid()));

-- RLS Policy: Admins can view all user progress
CREATE POLICY "Admins can view all progress"
ON user_progress FOR SELECT
USING (is_admin(auth.uid()));
```

**JavaScript Authentication:**

```javascript
// js/auth.js - Backoffice Authentication
class BackofficeAuth {
  async requireAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    
    // Check if user has admin/team role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!profile || !['admin', 'team', 'instructor'].includes(profile.role)) {
      alert('Access denied. Admin access required.');
      await supabase.auth.signOut();
      window.location.href = 'login.html';
      return null;
    }
    
    return session;
  }
}
```

#### 1.3 Login Page (`login.html`)
- Simple email/password form
- Uses Supabase Auth
- Redirects to dashboard after successful login
- Shows error message if user doesn't have admin/team role

---

### Phase 2: Analytics Dashboard Tab (Days 3-4)

#### 2.1 Database Query Functions

**Key Metrics Queries:**

```javascript
// js/api/analytics-api.js

class AnalyticsAPI {
  // Total Users
  async getTotalUsers() {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    return count || 0;
  }

  // New Users Over Time (daily/weekly)
  async getNewUsersOverTime(period = 'weekly') {
    const interval = period === 'daily' ? '1 day' : '7 days';
    const { data } = await supabase
      .rpc('get_new_users_over_time', { 
        time_interval: interval 
      });
    return data;
  }

  // Course Completion Rates
  async getCourseCompletionRates() {
    const { data } = await supabase
      .rpc('get_course_completion_rates');
    return data;
  }

  // Overall Statistics
  async getOverallStats() {
    return {
      totalUsers: await this.getTotalUsers(),
      activeUsers: await this.getActiveUsers(30), // Last 30 days
      totalCourses: await this.getTotalCourses(),
      totalCompletions: await this.getTotalCompletions()
    };
  }
}
```

**Supabase SQL Functions:**

```sql
-- Get new users over time
CREATE OR REPLACE FUNCTION get_new_users_over_time(time_interval INTERVAL)
RETURNS TABLE (
  period_start TIMESTAMP,
  new_users_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('day', created_at) as period_start,
    COUNT(*) as new_users_count
  FROM profiles
  WHERE created_at >= NOW() - INTERVAL '90 days'
  GROUP BY DATE_TRUNC('day', created_at)
  ORDER BY period_start;
END;
$$ LANGUAGE plpgsql;

-- Get course completion rates
CREATE OR REPLACE FUNCTION get_course_completion_rates()
RETURNS TABLE (
  course_id UUID,
  course_title TEXT,
  total_enrollments BIGINT,
  completed_count BIGINT,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as course_id,
    c.title as course_title,
    COUNT(DISTINCT up.user_id) as total_enrollments,
    COUNT(DISTINCT CASE WHEN up.progress_percentage = 100 THEN up.user_id END) as completed_count,
    ROUND(
      COUNT(DISTINCT CASE WHEN up.progress_percentage = 100 THEN up.user_id END)::NUMERIC /
      NULLIF(COUNT(DISTINCT up.user_id), 0) * 100,
      2
    ) as completion_rate
  FROM courses c
  LEFT JOIN user_progress up ON up.course_id = c.id
  WHERE c.is_published = true
  GROUP BY c.id, c.title
  ORDER BY completion_rate DESC;
END;
$$ LANGUAGE plpgsql;
```

#### 2.2 Analytics Dashboard UI

**HTML Structure:**
```html
<div class="tab-content" id="analytics-tab">
  <div class="stats-grid">
    <div class="stat-card">
      <h3>Total Users</h3>
      <p class="stat-value" id="total-users">-</p>
    </div>
    <div class="stat-card">
      <h3>Active Users (30d)</h3>
      <p class="stat-value" id="active-users">-</p>
    </div>
    <div class="stat-card">
      <h3>Total Courses</h3>
      <p class="stat-value" id="total-courses">-</p>
    </div>
    <div class="stat-card">
      <h3>Total Completions</h3>
      <p class="stat-value" id="total-completions">-</p>
    </div>
  </div>
  
  <div class="chart-section">
    <h3>New Users Over Time</h3>
    <div class="chart-controls">
      <button data-period="daily">Daily</button>
      <button data-period="weekly" class="active">Weekly</button>
    </div>
    <canvas id="users-chart"></canvas>
  </div>
  
  <div class="completion-rates">
    <h3>Course Completion Rates</h3>
    <table id="completion-table">
      <thead>
        <tr>
          <th>Course</th>
          <th>Enrollments</th>
          <th>Completions</th>
          <th>Completion Rate</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>
  
  <div class="placeholder-section">
    <h3>Certificate Generation (Coming Soon)</h3>
    <p>This section will track certificate generation statistics once implemented.</p>
  </div>
</div>
```

**Features:**
- Real-time statistics cards
- Line/bar chart for new users over time (use Chart.js or simple SVG)
- Table showing course completion rates
- Placeholder for certificate generation metrics

---

### Phase 3: Users Management Tab (Days 5-7)

#### 3.1 User Search & Display

**User Search API:**
```javascript
// js/api/users-api.js

class UsersAPI {
  // Search users by email
  async searchUsersByEmail(email) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        created_at,
        role
      `)
      .ilike('full_name', `%${email}%`)
      .or(`email.ilike.%${email}%`)
      .limit(50);
    
    return data || [];
  }

  // Get detailed user information
  async getUserDetails(userId) {
    const { data: user } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get last login (from auth.users metadata)
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const lastLogin = authUser?.user?.last_sign_in_at;

    // Get enrolled courses with progress
    const { data: progress } = await supabase
      .from('user_progress')
      .select(`
        course_id,
        course:courses(title, slug),
        progress_percentage,
        updated_at,
        lesson:lessons(id, title)
      `)
      .eq('user_id', userId);

    // Calculate overall progress
    const overallProgress = this.calculateOverallProgress(progress);

    return {
      ...user,
      lastLogin,
      enrolledCourses: progress,
      overallProgress
    };
  }

  // Calculate overall learning progress
  calculateOverallProgress(progressData) {
    if (!progressData || progressData.length === 0) return 0;
    
    const totalProgress = progressData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0);
    return Math.round(totalProgress / progressData.length);
  }
}
```

#### 3.2 User Details UI

**HTML Structure:**
```html
<div class="tab-content" id="users-tab">
  <div class="search-section">
    <input 
      type="email" 
      id="user-search-input" 
      placeholder="Search by email or name..."
      autocomplete="off"
    />
    <button id="search-btn">Search</button>
  </div>
  
  <div id="search-results" class="search-results"></div>
  
  <div id="user-details" class="user-details" style="display: none;">
    <h2>User Details</h2>
    <div class="user-info-grid">
      <div class="info-item">
        <label>Name:</label>
        <span id="detail-name">-</span>
      </div>
      <div class="info-item">
        <label>Email:</label>
        <span id="detail-email">-</span>
      </div>
      <div class="info-item">
        <label>Signup Date:</label>
        <span id="detail-signup">-</span>
      </div>
      <div class="info-item">
        <label>Last Login:</label>
        <span id="detail-last-login">-</span>
      </div>
      <div class="info-item">
        <label>Overall Progress:</label>
        <span id="detail-overall-progress">-</span>
      </div>
    </div>
    
    <div class="enrolled-courses">
      <h3>Enrolled Courses</h3>
      <table id="courses-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Progress</th>
            <th>Last Activity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
    
    <div class="action-buttons">
      <button class="btn-warning" id="flag-inactive-btn">Flag as Inactive</button>
      <button class="btn-primary" id="send-email-btn">Send Follow-up Email</button>
    </div>
  </div>
</div>
```

**Features:**
- Email/name search functionality
- Display user details: signup date, last login, overall progress
- List of enrolled courses with individual progress percentages
- Visual indicators for inactive users (no login in 30+ days)
- Buttons for team actions (flag inactive, send follow-up email)

---

### Phase 4: Marketing/Banner Management Tab (Days 8-9)

#### 4.1 Database Schema for Banners

**New Table:**
```sql
CREATE TABLE website_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_key TEXT UNIQUE NOT NULL, -- e.g., 'homepage-announcement'
  title TEXT,
  text TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  badge_text TEXT, -- e.g., 'NEW'
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy: Only admins can manage banners
CREATE POLICY "Admins can manage banners"
ON website_banners FOR ALL
USING (is_admin(auth.uid()));

-- Index for active banners lookup
CREATE INDEX idx_banners_active ON website_banners(is_active, start_date, end_date);
```

#### 4.2 Banner Management API

```javascript
// js/api/banners-api.js

class BannersAPI {
  // Get all banners
  async getAllBanners() {
    const { data } = await supabase
      .from('website_banners')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  // Get active banner by key
  async getActiveBanner(bannerKey) {
    const { data } = await supabase
      .from('website_banners')
      .select('*')
      .eq('banner_key', bannerKey)
      .eq('is_active', true)
      .single();
    return data;
  }

  // Create/Update banner
  async saveBanner(bannerData) {
    const { data: session } = await supabase.auth.getSession();
    
    if (bannerData.id) {
      // Update existing
      const { data } = await supabase
        .from('website_banners')
        .update({
          ...bannerData,
          updated_at: new Date().toISOString()
        })
        .eq('id', bannerData.id)
        .select()
        .single();
      return data;
    } else {
      // Create new
      const { data } = await supabase
        .from('website_banners')
        .insert({
          ...bannerData,
          created_by: session.user.id
        })
        .select()
        .single();
      return data;
    }
  }

  // Delete banner
  async deleteBanner(bannerId) {
    const { error } = await supabase
      .from('website_banners')
      .delete()
      .eq('id', bannerId);
    return !error;
  }
}
```

#### 4.3 Banner Management UI

**HTML Structure:**
```html
<div class="tab-content" id="marketing-tab">
  <h2>Website Banner Management</h2>
  <p class="subtitle">Update website banners without developer intervention</p>
  
  <div class="banners-list">
    <div class="banner-item" data-banner-key="homepage-announcement">
      <div class="banner-header">
        <h3>Homepage Announcement Banner</h3>
        <span class="badge-active" id="status-badge">Active</span>
      </div>
      
      <form id="banner-form">
        <input type="hidden" id="banner-id" />
        <input type="hidden" id="banner-key" value="homepage-announcement" />
        
        <div class="form-group">
          <label>Badge Text (e.g., "NEW", "FEATURED"):</label>
          <input type="text" id="badge-text" placeholder="NEW" />
        </div>
        
        <div class="form-group">
          <label>Banner Text:</label>
          <textarea id="banner-text" rows="2" required></textarea>
        </div>
        
        <div class="form-group">
          <label>Link URL:</label>
          <input type="url" id="link-url" placeholder="https://pmhelp.co/reports" />
        </div>
        
        <div class="form-group">
          <label>Active Status:</label>
          <label class="toggle-switch">
            <input type="checkbox" id="is-active" checked />
            <span class="slider"></span>
          </label>
        </div>
        
        <div class="form-group">
          <label>Start Date (optional):</label>
          <input type="datetime-local" id="start-date" />
        </div>
        
        <div class="form-group">
          <label>End Date (optional):</label>
          <input type="datetime-local" id="end-date" />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">Save Banner</button>
          <button type="button" class="btn-secondary" id="preview-btn">Preview</button>
          <button type="button" class="btn-danger" id="delete-btn">Delete</button>
        </div>
      </form>
    </div>
  </div>
  
  <div class="preview-section" id="preview-section" style="display: none;">
    <h3>Preview</h3>
    <div id="banner-preview"></div>
  </div>
</div>
```

**Features:**
- Simple form to update banner text, link, badge text
- Toggle to activate/deactivate banner
- Optional date range for banner display
- Preview functionality to see how banner looks
- Delete functionality
- Save changes instantly (no developer needed)

#### 4.4 Integration with Main Website

**Update `index.html` on main website to fetch banner from Supabase:**

```javascript
// Add to main website's index.html
async function loadAnnouncementBanner() {
  const { data: banner } = await supabase
    .from('website_banners')
    .select('*')
    .eq('banner_key', 'homepage-announcement')
    .eq('is_active', true)
    .single();
  
  if (banner && isBannerActive(banner)) {
    updateBannerContent(banner);
    document.getElementById('announcement-banner').style.display = 'block';
  }
}

function isBannerActive(banner) {
  const now = new Date();
  if (banner.start_date && new Date(banner.start_date) > now) return false;
  if (banner.end_date && new Date(banner.end_date) < now) return false;
  return true;
}

function updateBannerContent(banner) {
  if (banner.badge_text) {
    document.querySelector('.announcement-badge').textContent = banner.badge_text;
  }
  document.querySelector('.announcement-text').textContent = banner.text;
  if (banner.link_url) {
    document.querySelector('.announcement-banner-link').href = banner.link_url;
  }
}
```

---

### Phase 5: UI/UX Polish & Testing (Days 10-11)

#### 5.1 Styling
- Simple, functional design (priority: usability over aesthetics)
- Responsive layout (works on tablets/laptops)
- Clear navigation between tabs
- Loading states for async operations
- Error handling and user feedback

#### 5.2 Key Features
- Tab navigation (Analytics, Users, Marketing)
- Loading indicators
- Error messages
- Success confirmations
- Data refresh buttons
- Export functionality (CSV for user data, analytics)

---

### Phase 6: Security & Deployment (Days 12-13)

#### 6.1 Security Measures

**RLS Policies (Already outlined above):**
- Only users with `role = 'admin'` or `role = 'team'` can access
- All queries respect RLS policies
- Banners table: Admin-only write access

**Additional Security:**
- Environment variables for Supabase keys (not hardcoded)
- CORS configuration on Supabase
- Rate limiting on sensitive endpoints
- Audit logging for admin actions (optional future enhancement)

#### 6.2 Deployment Configuration

**Netlify Configuration (`netlify.toml`):**
```toml
[build]
  publish = "backoffice"
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  SUPABASE_URL = "https://igiemqicokpdyhunldtq.supabase.co"
  SUPABASE_ANON_KEY = "your-anon-key"
  
# Protect with Netlify Identity or basic auth (optional)
# [plugins]
#   package = "@netlify/plugin-lighthouse"
```

**Environment Variables:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key (public, safe for client-side)

**Deployment Steps:**
1. Create separate Netlify site for backoffice
2. Point to `backoffice/` directory
3. Configure environment variables
4. Deploy and share URL with boss for review
5. Once approved, configure subdomain `backoffice.pmhelp.co`

---

## 📊 Database Queries Needed

### Analytics Queries

```sql
-- Active users (last 30 days)
SELECT COUNT(DISTINCT id) 
FROM profiles 
WHERE updated_at >= NOW() - INTERVAL '30 days';

-- Total course completions
SELECT COUNT(*) 
FROM user_progress 
WHERE progress_percentage = 100;

-- User inactivity detection
SELECT 
  p.id,
  p.full_name,
  p.created_at as signup_date,
  au.last_sign_in_at as last_login,
  CASE 
    WHEN au.last_sign_in_at < NOW() - INTERVAL '30 days' THEN 'Inactive'
    WHEN au.last_sign_in_at < NOW() - INTERVAL '14 days' THEN 'At Risk'
    ELSE 'Active'
  END as status
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE p.role = 'student'
ORDER BY au.last_sign_in_at DESC NULLS LAST;
```

---

## 🔐 Access Control Implementation

### Step 1: Create Admin/Team Users

```sql
-- Set specific users as admin
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN (
    'admin1@pmhelp.co',
    'admin2@pmhelp.co',
    'green@pmhelp.co'
  )
);
```

### Step 2: Backoffice Auth Check

```javascript
// On every page load
const auth = new BackofficeAuth();
const session = await auth.requireAuth();
if (!session) return; // Redirects to login
```

---

## 📝 File Structure Summary

```
backoffice/
├── index.html                    # Main dashboard
├── login.html                    # Admin login
├── 401.html                      # Unauthorized page
├── css/
│   └── backoffice.css           # Backoffice styles
├── js/
│   ├── auth.js                  # Authentication
│   ├── analytics.js             # Analytics tab logic
│   ├── users.js                 # Users tab logic
│   ├── marketing.js             # Marketing tab logic
│   └── api/
│       ├── analytics-api.js     # Analytics queries
│       ├── users-api.js         # User queries
│       └── banners-api.js       # Banner CRUD
└── _redirects                   # Netlify config
```

---

## ✅ Testing Checklist

- [ ] Admin login works
- [ ] Non-admin users are blocked
- [ ] Analytics dashboard loads correctly
- [ ] User search returns accurate results
- [ ] User details display correctly
- [ ] Banner form saves successfully
- [ ] Banner updates reflect on main website
- [ ] Responsive design works on tablet/laptop
- [ ] Error handling works (network errors, etc.)
- [ ] RLS policies prevent unauthorized access

---

## 🚀 Deployment Checklist

- [ ] Create separate Netlify site
- [ ] Configure environment variables
- [ ] Deploy to Netlify URL
- [ ] Test all functionality on deployed site
- [ ] Share URL with boss for review
- [ ] Fix any issues based on feedback
- [ ] Configure subdomain `backoffice.pmhelp.co` (after approval)

---

## 📈 Future Enhancements (Post-MVP)

- Email integration for follow-up emails
- Advanced analytics charts (Chart.js library)
- Export functionality (CSV/PDF reports)
- Certificate generation tracking
- Bulk user actions
- Banner A/B testing
- Activity logs/audit trail
- Team member management (invite/remove admins)

---

## ⚠️ Important Notes

1. **Separate Deployment:** This is a completely separate site from the main PMHelp website. It should not be linked anywhere on pmhelp.co.

2. **Access Control:** Only users with `role = 'admin'` or `role = 'team'` in the `profiles` table can access the backoffice.

3. **RLS Policies:** All database queries must respect Row Level Security policies to prevent unauthorized data access.

4. **Banner Integration:** The main website needs a small update to fetch banner content from Supabase instead of hardcoded values.

5. **Netlify Deployment:** Deploy to a random Netlify URL first for review. Once approved, configure the subdomain.

---

## 🎯 Success Criteria

- ✅ Boss can access backoffice with admin credentials
- ✅ Analytics dashboard shows accurate metrics
- ✅ Users can be searched and their progress viewed
- ✅ Non-technical team members (Green) can update banners without developer help
- ✅ All functionality works on deployed Netlify site
- ✅ System is secure and only accessible to authorized team members

---

**Estimated Timeline:** 12-13 days
**Priority:** High (Internal operations tool)
**Dependencies:** Supabase setup, existing database schema, Netlify account
