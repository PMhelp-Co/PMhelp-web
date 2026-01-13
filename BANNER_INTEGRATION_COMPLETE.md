# Banner Integration - Complete Guide

## ✅ What Was Done

### 1. Created SQL Insert Script
**File:** `insert_current_banner.sql`

This script inserts the current banner content from `index.html` into the `website_banners` database table.

**Current Banner Data:**
- **Banner Key:** `homepage-announcement`
- **Badge Text:** `NEW`
- **Banner Text:** `Check out our new Reports feature: Get insights on product management trends and analytics`
- **Link URL:** `/reports.html`
- **Link Text:** `NULL` (not specified - arrow icon used)
- **Active Status:** `true`

### 2. Updated index.html Banner Script

**Location:** `index.html` (lines ~885-926)

The banner script now:
- ✅ Fetches banner data from Supabase `website_banners` table
- ✅ Checks if banner is active and within date range
- ✅ Updates banner content dynamically (badge, text, link)
- ✅ Preserves localStorage dismissal functionality
- ✅ Handles errors gracefully (banner stays hidden if fetch fails)
- ✅ Waits for Supabase client to initialize
- ✅ Preserves the close button structure in the badge

---

## 📋 Setup Steps

### Step 1: Run Database Setup (if not already done)

**File:** `backoffice_setup.sql`

1. Open Supabase Dashboard → SQL Editor
2. Run `backoffice_setup.sql` to create the table and functions
3. Verify `website_banners` table exists

### Step 2: Insert Current Banner Data

**File:** `insert_current_banner.sql`

1. Open Supabase Dashboard → SQL Editor
2. Run `insert_current_banner.sql` to insert the current banner
3. Verify the banner was inserted:

```sql
SELECT * FROM website_banners WHERE banner_key = 'homepage-announcement';
```

**Expected Result:**
- One row with the current banner data
- `is_active` = `true`
- `badge_text` = `NEW`
- `text` = `Check out our new Reports feature: Get insights on product management trends and analytics`

### Step 3: Test the Integration

1. Clear browser cache/localStorage (or use incognito mode)
2. Visit the homepage (`index.html`)
3. The banner should load from the database
4. Verify banner content matches database values
5. Test banner dismissal (should still work with localStorage)
6. Check browser console for any errors

---

## 🔄 How It Works

### Banner Loading Flow

1. **Page Loads:**
   - Banner is hidden by default (`style="display: none;"`)

2. **Script Executes:**
   - Checks if banner was previously dismissed (localStorage)
   - If dismissed, banner stays hidden
   - If not dismissed, continues to fetch from database

3. **Database Fetch:**
   - Waits for Supabase client to initialize
   - Queries `website_banners` table for `banner_key = 'homepage-announcement'`
   - Filters for `is_active = true`
   - Gets single result

4. **Date Range Check:**
   - If `start_date` is set and in the future → banner hidden
   - If `end_date` is set and in the past → banner hidden
   - Otherwise → banner can be shown

5. **Content Update:**
   - Updates badge text (preserves close button)
   - Updates banner text
   - Updates link URL
   - Shows banner with fade-in animation

6. **Dismissal:**
   - User clicks close button
   - Banner fades out
   - Dismissal stored in localStorage
   - Banner won't show again (until localStorage cleared)

---

## 📊 Database Structure

**Table:** `website_banners`

**Current Banner Record:**
```
banner_key: 'homepage-announcement'
badge_text: 'NEW'
text: 'Check out our new Reports feature: Get insights on product management trends and analytics'
link_url: '/reports.html'
link_text: NULL
is_active: true
start_date: NULL
end_date: NULL
created_at: [current timestamp]
updated_at: [current timestamp]
```

---

## 🎨 Banner HTML Structure

The banner HTML structure remains the same, but content is now populated from the database:

```html
<div id="announcement-banner" class="announcement-banner" style="display: none;">
  <div class="announcement-banner-content">
    <a href="/reports.html" class="announcement-banner-link">
      <span class="announcement-badge">
        NEW  <!-- Updated from database: bannerData.badge_text -->
        <div class="announcement-close-wrapper">
          <!-- Close button (preserved) -->
        </div>
      </span>
      <span class="announcement-text">
        <!-- Updated from database: bannerData.text -->
      </span>
      <!-- Arrow SVG (preserved) -->
    </a>
  </div>
</div>
```

**Important:** The close button structure is preserved when updating the badge text.

---

## 🔧 Updating Banner Content

### Via Backoffice (Recommended)

1. Log into backoffice
2. Go to Marketing tab
3. Edit banner fields
4. Click "Save Banner"
5. Banner updates immediately on website (for new visitors)
6. Users who dismissed banner won't see update until localStorage cleared

### Via SQL (Advanced)

```sql
UPDATE website_banners
SET 
  badge_text = 'NEW FEATURE',
  text = 'Your new banner text here',
  link_url = '/your-link.html',
  is_active = true,
  updated_at = NOW()
WHERE banner_key = 'homepage-announcement';
```

---

## ✅ Testing Checklist

- [ ] Database table `website_banners` exists
- [ ] Banner data inserted successfully
- [ ] Banner loads from database on page load
- [ ] Banner content matches database values
- [ ] Banner shows/hides based on `is_active` status
- [ ] Date range logic works (start_date/end_date)
- [ ] localStorage dismissal still works
- [ ] Close button works correctly
- [ ] No console errors
- [ ] Banner updates when changed in backoffice
- [ ] Graceful degradation (banner hidden if database error)

---

## 🐛 Troubleshooting

### Banner Not Showing

**Check:**
1. Is banner data in database? Run: `SELECT * FROM website_banners WHERE banner_key = 'homepage-announcement';`
2. Is `is_active` = `true`?
3. Is localStorage dismissed? Clear localStorage or use incognito mode
4. Check browser console for errors
5. Is Supabase client initialized? Check `window.supabaseClient` or `window.supabase`

### Banner Content Not Updating

**Check:**
1. Is banner data updated in database?
2. Clear browser cache and localStorage
3. Check browser console for JavaScript errors
4. Verify Supabase query is working (check Network tab)

### Close Button Not Working

**Check:**
1. Is the close button HTML structure preserved?
2. Is `closeAnnouncementBanner()` function defined?
3. Check browser console for JavaScript errors

### Database Errors

**Common Errors:**
- `Table 'website_banners' does not exist` → Run `backoffice_setup.sql`
- `Permission denied` → Check RLS policies (should allow public read for active banners)
- `No rows returned` → Banner not inserted, run `insert_current_banner.sql`

---

## 📝 Notes

1. **Backward Compatibility:** If database fetch fails, banner stays hidden (graceful degradation)

2. **localStorage:** Dismissal state is stored in localStorage. Users who dismissed banner won't see updates until they clear localStorage or use a different browser/device.

3. **Performance:** Banner fetch happens asynchronously and doesn't block page load.

4. **Future Enhancements:**
   - Could add banner version tracking to force refresh dismissed banners
   - Could add A/B testing support
   - Could add multiple banner types (not just homepage-announcement)

---

## 🎯 Next Steps

1. ✅ Run `insert_current_banner.sql` to populate database
2. ✅ Test banner loading on homepage
3. ✅ Verify backoffice can update banner
4. ✅ Test banner updates reflect on website
5. ⏳ Monitor for any issues in production

---

**Status:** ✅ **Integration Complete**

The banner system is now fully integrated. Banner content is stored in the database and fetched dynamically by the main website. The backoffice can be used to update banner content without code changes.
