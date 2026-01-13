# PMHelp Back-Office - Next Steps Guide

## 📋 Current Status

✅ **Completed:**
- File structure created (all 17 files)
- HTML, CSS, and JavaScript code written
- Authentication flow implemented
- UI components and interactions implemented
- No linter errors
- SQL setup script created (`backoffice_setup.sql`)
- Next steps guide created (this file)

⚠️ **Pending (User Action Required):**
- **SQL database setup** - Script ready, needs to be executed in Supabase
- **Set admin users** - SQL instructions provided, needs execution
- **Testing authentication and functionality** - Waiting for database setup
- **Main website banner integration** - Optional, can be done later

📝 **Note:** The SQL setup script (`backoffice_setup.sql`) has been created and is ready to run. All SQL statements needed for the backoffice are in this file.

---

## 🎯 Next Steps (In Order)

### Step 1: Execute SQL Setup Script ⚠️ **REQUIRED**

**File:** `backoffice_setup.sql`

**Instructions:**
1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the `backoffice_setup.sql` file in this repository
3. Copy the **entire contents** of the file
4. Paste into Supabase SQL Editor
5. Click **Run** (or press F5)
6. Verify there are no errors

**What this script does:**
- ✅ Updates `is_admin()` function to support 'admin', 'team', and 'instructor' roles
- ✅ Creates `website_banners` table for banner management
- ✅ Creates analytics SQL functions (`get_new_users_over_time`, `get_course_completion_rates`)
- ✅ Sets up RLS policies for banner access
- ✅ Ensures admin access policies for profiles and user_progress

**Verification:**
After running the script, verify:
- `website_banners` table exists (check Tables in Supabase)
- Functions exist (check Functions in Supabase)
- No errors in SQL Editor output

---

### Step 2: Set Admin Users ⚠️ **REQUIRED**

**Who can access the backoffice:**
- Users with `role = 'admin'` in the `profiles` table
- Users with `role = 'team'` in the `profiles` table
- Users with `role = 'instructor'` in the `profiles` table

**Option A: Via SQL (Recommended)**

1. Open Supabase Dashboard → SQL Editor
2. Run this SQL (replace emails with actual admin emails):

```sql
-- Set admin users (replace emails with actual admin email addresses)
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN (
    'your-email@pmhelp.co',  -- Replace with your email
    'green@pmhelp.co'        -- Replace with Green's email
  )
);
```

3. Verify the update worked:

```sql
SELECT 
  p.id,
  p.full_name,
  au.email,
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.role IN ('admin', 'team', 'instructor');
```

**Option B: Via Supabase Dashboard**

1. Go to **Authentication** → **Users**
2. Find your user account
3. Note the User UUID
4. Go to **Table Editor** → **profiles**
5. Find your user row (match the UUID)
6. Edit the `role` field and change it to `'admin'`
7. Save

---

### Step 3: Test Authentication Locally ⚠️ **RECOMMENDED**

**Before deploying, test locally:**

1. **Check if backoffice folder exists:**
   - Look for `backoffice/` folder in your project root
   - If it doesn't exist, the other AI may have created it elsewhere or you need to ask them

2. **Test login:**
   - Open `backoffice/login.html` in your browser
   - Try logging in with an admin account
   - Verify you're redirected to `backoffice/index.html`
   - Verify the dashboard loads

3. **Test non-admin access:**
   - Try logging in with a regular user account
   - Verify access is denied
   - Verify user is redirected back to login

4. **Check browser console:**
   - Look for any JavaScript errors
   - Look for Supabase connection errors
   - Look for RLS policy errors

**Common Issues:**
- ❌ "Access denied" → User role not set to 'admin'/'team'/'instructor'
- ❌ "Table not found" → SQL script not executed
- ❌ "Function not found" → SQL script not executed
- ❌ CORS errors → Check Supabase URL/key configuration

---

### Step 4: Test Dashboard Functionality ⚠️ **RECOMMENDED**

**After authentication works:**

1. **Analytics Tab:**
   - Verify stats load (total users, active users, etc.)
   - Check for errors in console
   - Verify charts/data tables display

2. **Users Tab:**
   - Test user search functionality
   - Verify user details display
   - Check that user progress shows correctly

3. **Marketing Tab:**
   - Test banner form
   - Create a test banner
   - Verify banner saves successfully
   - Test banner activation/deactivation

---

### Step 5: Deploy to Netlify ⚠️ **REQUIRED FOR REVIEW**

**Instructions:**

1. **Create new Netlify site:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to your Git repository
   - OR use Netlify CLI: `netlify init`

2. **Configure build settings:**
   - **Base directory:** `backoffice` (if backoffice folder exists)
   - **Build command:** (leave empty - no build needed)
   - **Publish directory:** `backoffice` (or `.` if root)

3. **Environment variables (if needed):**
   - Supabase URL and keys should already be in the code (hardcoded)
   - If using environment variables, add them in Netlify Dashboard → Site settings → Environment variables

4. **Deploy:**
   - Push to Git (if using Git)
   - OR drag and drop the `backoffice/` folder to Netlify
   - Wait for deployment to complete

5. **Test deployed site:**
   - Visit the Netlify URL
   - Test login
   - Test all functionality
   - Verify everything works

6. **Share URL:**
   - Send the Netlify URL to your boss for review
   - Get feedback and make adjustments

---

### Step 6: Integrate Banner System with Main Website ⚠️ **OPTIONAL (Can be done later)**

**File to update:** `index.html` (main website)

**What needs to be added:**
- JavaScript code to fetch banner from Supabase
- Code to update banner content dynamically
- Code to handle banner visibility based on active status

**Location in plan:**
- See `BACKOFFICE_IMPLEMENTATION_PLAN.md` → Phase 4.4 "Integration with Main Website"
- Code snippet provided in the plan document

**Note:** This can be done after the backoffice is deployed and tested.

---

## 📝 Checklist

### Database Setup
- [ ] Run `backoffice_setup.sql` in Supabase SQL Editor
- [ ] Verify `website_banners` table exists
- [ ] Verify analytics functions exist
- [ ] Verify `is_admin()` function updated
- [ ] Set at least one admin user
- [ ] Verify admin user role in database

### Local Testing
- [ ] Locate backoffice folder
- [ ] Test login with admin account
- [ ] Test login with regular user (should be denied)
- [ ] Test Analytics tab loads
- [ ] Test Users tab loads
- [ ] Test Marketing tab loads
- [ ] Test banner creation/editing
- [ ] Check for console errors

### Deployment
- [ ] Create Netlify site
- [ ] Configure build settings
- [ ] Deploy backoffice
- [ ] Test deployed site
- [ ] Share URL with boss

### Integration (Optional)
- [ ] Add banner integration code to main website `index.html`
- [ ] Test banner displays on main website
- [ ] Test banner updates from backoffice reflect on main website

---

## 🔍 Troubleshooting

### SQL Script Errors

**Error: "function already exists"**
- This is OK - the script uses `CREATE OR REPLACE`
- Continue with the script

**Error: "table already exists"**
- If `website_banners` already exists, you can:
  - Drop it first: `DROP TABLE website_banners CASCADE;`
  - OR skip that part of the script

**Error: "policy already exists"**
- The script uses `CREATE POLICY IF NOT EXISTS` to avoid conflicts
- If you get this error, drop the policy first, then re-run

### Authentication Issues

**"Access denied" after login**
- Check user role in `profiles` table
- Must be 'admin', 'team', or 'instructor'
- Verify `is_admin()` function updated correctly

**"Table not found" errors**
- Verify SQL script ran successfully
- Check Tables in Supabase Dashboard
- Verify table names match exactly

### Function Errors

**"Function get_new_users_over_time does not exist"**
- Verify SQL script ran successfully
- Check Functions in Supabase Dashboard
- Re-run the function creation SQL

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs for SQL errors
3. Verify all SQL scripts executed successfully
4. Verify admin user role is set correctly
5. Check Supabase URL/key configuration in `js/supabase-config.js`

---

## 🎯 Priority Order

1. **Execute SQL setup script** (Step 1) - REQUIRED
2. **Set admin users** (Step 2) - REQUIRED
3. **Test authentication locally** (Step 3) - RECOMMENDED
4. **Test dashboard functionality** (Step 4) - RECOMMENDED
5. **Deploy to Netlify** (Step 5) - REQUIRED FOR REVIEW
6. **Integrate banner system** (Step 6) - OPTIONAL

---

**Estimated Time:**
- Steps 1-2: 10-15 minutes
- Steps 3-4: 30-60 minutes (testing)
- Step 5: 15-30 minutes (deployment)
- Step 6: 30-60 minutes (integration)

**Total: ~2-3 hours for complete setup and testing**
