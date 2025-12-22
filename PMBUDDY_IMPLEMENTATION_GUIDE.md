# PM Buddy Implementation Guide - Step by Step

## 🎯 Overview

This guide breaks down what **YOU** need to do (Supabase setup) vs what **I** will do (code implementation) to implement PM Buddy.

---

## ✅ PHASE 1: Supabase Database Setup (YOU DO THIS)

### Step 1.1: Create `pm_buddy_applications` Table

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste this entire SQL script:

```sql
-- =====================================================
-- PM Buddy Applications Table
-- =====================================================
-- Stores mentee and mentor applications
-- =====================================================

CREATE TABLE IF NOT EXISTS pm_buddy_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Application type
  type TEXT NOT NULL CHECK (type IN ('mentee', 'mentor')),
  
  -- Basic information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  
  -- Professional details
  industry TEXT,
  experience_level TEXT,
  
  -- Goals (stored as array)
  goals TEXT[],
  
  -- Additional information
  additional_info TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'matched')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Link to user account (optional - can be NULL for anonymous submissions)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_pm_buddy_type ON pm_buddy_applications(type);
CREATE INDEX IF NOT EXISTS idx_pm_buddy_status ON pm_buddy_applications(status);
CREATE INDEX IF NOT EXISTS idx_pm_buddy_user_id ON pm_buddy_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_pm_buddy_email ON pm_buddy_applications(email);

-- =====================================================
-- Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE pm_buddy_applications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies
-- =====================================================

-- Policy 1: Anyone can submit applications (anonymous or authenticated)
CREATE POLICY "Anyone can submit applications"
  ON pm_buddy_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON pm_buddy_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 3: Service role can do everything (for admin dashboard later)
CREATE POLICY "Service role full access"
  ON pm_buddy_applications
  FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- Trigger to update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_pm_buddy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pm_buddy_applications_updated_at
  BEFORE UPDATE ON pm_buddy_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_pm_buddy_updated_at();
```

4. Click **Run** (or press `Ctrl+Enter`)
5. Verify success: You should see "Success. No rows returned"

### Step 1.2: Verify Table Creation

1. Go to **Supabase Dashboard** → **Table Editor**
2. Look for `pm_buddy_applications` in the list
3. Click on it to view the structure
4. Verify these columns exist:
   - `id` (uuid)
   - `type` (text)
   - `full_name` (text)
   - `email` (text)
   - `linkedin_url` (text)
   - `industry` (text)
   - `experience_level` (text)
   - `goals` (text[])
   - `additional_info` (text)
   - `status` (text)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)
   - `user_id` (uuid)

### Step 1.3: Test Insert Permission

1. In **Table Editor** → `pm_buddy_applications`
2. Click **Insert row**
3. Fill in:
   - `type`: `mentee`
   - `full_name`: `Test User`
   - `email`: `test@example.com`
   - `linkedin_url`: `https://linkedin.com/in/test`
   - `status`: `pending`
4. Click **Save**
5. ✅ If it saves successfully, RLS is working correctly
6. Delete the test row after verification

---

## ✅ PHASE 2: Domain & Redirect Updates (YOU DO THIS)

### Step 2.1: Update Edge Function Environment Variable

1. Go to **Supabase Dashboard** → **Edge Functions**
2. Find `auth-email-handler` function
3. Click on it → Go to **Settings** tab
4. Find **Secrets** section
5. Look for `SIT_URL` secret:
   - If it exists: Click **Edit** → Change value to `https://www.pmhelp.co`
   - If it doesn't exist: Click **Add Secret** → Name: `SIT_URL`, Value: `https://www.pmhelp.co`
6. Click **Save**

**Note:** The Edge Function code already uses this variable (line 9 in `index.ts`), so once you update it, all email redirects will use the new domain.

### Step 2.2: Update Supabase Auth Redirect URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Update **Site URL**:
   - Current: `https://transcendent-sprinkles-8cd7b5.netlify.app` (or similar)
   - New: `https://www.pmhelp.co`
3. Update **Redirect URLs** (add these if not present):
   ```
   https://www.pmhelp.co/**
   https://www.pmhelp.co/auth/confirm.html
   https://www.pmhelp.co/reset-password.html
   ```
4. Click **Save**

### Step 2.3: Test Email Redirects (Optional but Recommended)

After updating the above:
1. Try signing up a new account
2. Check the confirmation email
3. Verify the link points to `https://www.pmhelp.co/auth/confirm.html` (not Netlify URL)
4. Try password reset
5. Verify the reset link points to `https://www.pmhelp.co/reset-password.html`

---

## ✅ PHASE 3: What I Will Implement (AFTER YOU COMPLETE PHASES 1-2)

Once you confirm Phases 1-2 are done, I will:

### 3.1: Create `pmbuddy.html` Page
- ✅ Match the reference design from `https://pmhelp-pm-buddy.lovable.app`
- ✅ Use your existing header structure (Learn, About Us, Community, Blog, PM Buddy, Donate, Sign In)
- ✅ Convert Tailwind classes to your Webflow CSS classes
- ✅ Include both "Become a Mentee" and "Become a Mentor" forms
- ✅ Add proper form validation
- ✅ Add success/error message handling

### 3.2: Create `js/api/pmbuddy.js`
- ✅ `submitApplication(type, formData)` - Submit mentee/mentor applications to Supabase
- ✅ `getApplications(type, userId)` - Get user's applications (optional, for future use)

### 3.3: Create `js/pages/pmbuddy-page.js`
- ✅ Handle form submissions
- ✅ Toggle between mentee/mentor forms
- ✅ Show success/error messages
- ✅ Handle goal selection (multi-select buttons)
- ✅ Form validation

### 3.4: Update Navigation
- ✅ Fix PM Buddy link in header (currently `href="#"`)
- ✅ Point to `pmbuddy.html` in all header instances

### 3.5: Verify Redirect URLs in Code
- ✅ Check `js/auth.js` (should already use `window.location.origin`)
- ✅ Verify Edge Function uses `SIT_URL` env var (already done)

---

## 📋 Form Fields Reference (From Reference Site)

### Mentee Form Fields:
1. **Full Name** (text, required)
2. **Email** (email, required)
3. **LinkedIn Profile URL** (url, required)
4. **Industry/Field** (dropdown, required)
   - Options: Technology, Finance, Healthcare, Marketing, Design, Education, Other
5. **Experience Level** (dropdown, required)
   - Options: Student, Entry, Mid, Senior
6. **Goals** (multi-select buttons, at least one required)
   - Options: Strategy & Vision, Data Analysis & Metrics, User Research & Customer Insights, Roadmap Planning, Stakeholder Management, Technical Skills, Market Research, Team Leadership, Product Design & UX, Go-to-Market Strategy, Agile & Scrum, Competitive Analysis, Other
7. **Submit Button**

### Mentor Form Fields:
- Same as mentee (we can add mentor-specific fields later if needed)

---

## ✅ Quick Checklist (Before Asking Me to Code)

Before you tell me "ready to code", make sure:

- [ ] `pm_buddy_applications` table created in Supabase
- [ ] RLS policies working (can insert as anonymous)
- [ ] Edge Function `SIT_URL` secret updated to `https://www.pmhelp.co`
- [ ] Supabase Auth redirect URLs include `https://www.pmhelp.co/**`
- [ ] Tested: Can insert a row into `pm_buddy_applications` manually
- [ ] (Optional) Tested: Email redirects point to `www.pmhelp.co`

---

## 🚀 Next Steps

1. **Complete Phase 1** (create Supabase table) - ~5 minutes
2. **Complete Phase 2** (update domain/redirects) - ~5 minutes
3. **Tell me when done** - I'll implement all the frontend code
4. **Test together** - We'll verify everything works

---

## 📝 Notes

- The table allows anonymous submissions (no login required)
- Users can optionally link their application to their account if logged in
- Status field allows future admin approval workflow
- Goals are stored as an array (PostgreSQL array type)
- All timestamps are automatically managed

---

## ❓ Questions?

If you need clarification on any step, ask me before proceeding. Once you complete Phases 1-2, just say "ready for Phase 3" and I'll implement everything!
