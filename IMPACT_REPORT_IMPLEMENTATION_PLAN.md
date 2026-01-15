# Impact Report Feature - Implementation Plan

## 📋 Overview

This document outlines the step-by-step plan to implement a new public-facing "Impact Report" feature on the PMHelp website, inspired by the reference design but fully adapted to PMHelp's design system, branding, and UI components.

---

## 🎯 Requirements Summary

1. **New Public-Facing Impact Report Page**
   - Display available impact reports in a grid layout
   - Allow visitors to view and download reports
   - Collect name and email during download process
   - Store download data in separate database table (not students/users)

2. **Navigation Updates**
   - Add "Resources" dropdown menu in main navigation
   - "Resources" contains: "Reports" and "Blog" as sub-items
   - Dropdown design should match avatar/user sub menu style
   - Replace current "Blog" link with "Resources" dropdown

3. **Footer Updates**
   - Add "Reports" link to footer navigation

4. **Design Requirements**
   - Use PMHelp's existing header and footer
   - Match PMHelp design system and branding
   - Fully responsive design
   - Smooth animations and hover effects
   - Accessible and scrollable

5. **Backend Integration**
   - Create database table for report downloads
   - API functions to save download requests
   - Analytics tracking for downloads

---

## 📝 Step-by-Step Implementation Plan

### **Phase 1: Database Setup**

#### Step 1.1: Create Database Table
- **File:** `database_schema.sql` (update)
- **Action:** Add new table `impact_report_downloads`
- **Schema:**
  ```sql
  CREATE TABLE impact_report_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    report_title TEXT NOT NULL,
    report_year INTEGER,
    downloaded_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  -- Indexes
  CREATE INDEX idx_report_downloads_email ON impact_report_downloads(email);
  CREATE INDEX idx_report_downloads_date ON impact_report_downloads(downloaded_at DESC);
  
  -- RLS Policies
  ALTER TABLE impact_report_downloads ENABLE ROW LEVEL SECURITY;
  
  -- Public can insert (for downloads)
  CREATE POLICY "Public can submit download requests"
  ON impact_report_downloads FOR INSERT
  WITH CHECK (true);
  
  -- Admins can read all
  CREATE POLICY "Admins can read all downloads"
  ON impact_report_downloads FOR SELECT
  USING (is_admin());
  ```

#### Step 1.2: Create Impact Reports Metadata Table
- **File:** `database_schema.sql` (update)
- **Action:** Add table to store report metadata (title, description, PDF file path, etc.)
- **Schema:**
  ```sql
  CREATE TABLE impact_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    description TEXT,
    cover_image_url TEXT, -- Can be local path or CDN URL
    pdf_file_name TEXT NOT NULL, -- File name in Supabase Storage (e.g., "annual-impact-report-2025.pdf")
    published_at TIMESTAMP,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  
  -- Indexes
  CREATE INDEX idx_reports_published ON impact_reports(is_published);
  CREATE INDEX idx_reports_year ON impact_reports(year DESC);
  
  -- RLS Policies
  ALTER TABLE impact_reports ENABLE ROW LEVEL SECURITY;
  
  -- Public can read published reports
  CREATE POLICY "Public can read published reports"
  ON impact_reports FOR SELECT
  USING (is_published = true);
  
  -- Admins can manage all reports
  CREATE POLICY "Admins can manage reports"
  ON impact_reports FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
  ```

#### Step 1.3: Set Up Supabase Storage Bucket
- **Action:** Create storage bucket for impact reports in Supabase Dashboard
- **Bucket Name:** `impact-reports`
- **Access Level:** Public (so anyone can download)
- **Purpose:** Store PDF files for impact reports

**Storage Setup Steps:**
1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `impact-reports`
4. Public: **Yes** (enable public access)
5. Click "Create bucket"

**Storage Policies (SQL Editor):**
```sql
-- Allow public read access to impact reports
CREATE POLICY "Public can read impact reports"
ON storage.objects FOR SELECT
USING (bucket_id = 'impact-reports');

-- Allow admins to upload/manage reports
CREATE POLICY "Admins can upload impact reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'impact-reports'
  AND is_admin()
);

CREATE POLICY "Admins can update impact reports"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'impact-reports'
  AND is_admin()
);

CREATE POLICY "Admins can delete impact reports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'impact-reports'
  AND is_admin()
);
```

**How to Add a New Report:**
1. **Upload PDF to Storage:**
   - Go to Supabase Dashboard → Storage → `impact-reports` bucket
   - Click "Upload file"
   - Upload your PDF (e.g., `annual-impact-report-2025.pdf`)
   - Copy the file name (you'll need it for step 2)

2. **Add Report Metadata to Database:**
   - Go to Supabase Dashboard → Table Editor → `impact_reports` table
   - Click "Insert row"
   - Fill in:
     - `title`: "Annual Impact Report 2025"
     - `year`: 2025
     - `description`: "Empowering the underrepresented with free accessible resources..."
     - `cover_image_url`: "images/reports/annual-impact-report-2025-cover.png" (or upload to storage and use that URL)
     - `pdf_file_name`: "annual-impact-report-2025.pdf" (must match the file name in storage)
     - `published_at`: "2025-01-01" (or current date)
     - `is_published`: **true** (check this box to make it visible)
   - Click "Save"

**Storage URL Pattern:**
The system will automatically generate URLs like:
```
https://[PROJECT_ID].supabase.co/storage/v1/object/public/impact-reports/[pdf_file_name]
```

**Example:**
- If `pdf_file_name` = `annual-impact-report-2025.pdf`
- Storage URL = `https://igiemqicokpdyhunldtq.supabase.co/storage/v1/object/public/impact-reports/annual-impact-report-2025.pdf`

---

### **Phase 2: Backend API Functions**

#### Step 2.1: Create Impact Reports API Module
- **File:** `js/api/impact-reports.js` (NEW)
- **Purpose:** Handle all impact report operations
- **Functions:**
  ```javascript
  // Get all published reports from database
  async function getPublishedReports() {
    if (!window.supabaseClient) {
      console.error('[REPORTS] Supabase client not available');
      return [];
    }
    
    try {
      const { data, error } = await window.supabaseClient
        .from('impact_reports')
        .select('*')
        .eq('is_published', true)
        .order('year', { ascending: false }); // Newest first
      
      if (error) throw error;
      
      // Add full PDF URL to each report
      const reportsWithUrls = data.map(report => ({
        ...report,
        pdfUrl: getReportPdfUrl(report.pdf_file_name)
      }));
      
      return reportsWithUrls;
    } catch (error) {
      console.error('[REPORTS] Error fetching reports:', error);
      return [];
    }
  }
  
  // Get single report by ID from database
  async function getReportById(reportId) {
    if (!window.supabaseClient) {
      console.error('[REPORTS] Supabase client not available');
      return null;
    }
    
    try {
      const { data, error } = await window.supabaseClient
        .from('impact_reports')
        .select('*')
        .eq('id', reportId)
        .eq('is_published', true)
        .single();
      
      if (error) throw error;
      
      // Add full PDF URL
      return {
        ...data,
        pdfUrl: getReportPdfUrl(data.pdf_file_name)
      };
    } catch (error) {
      console.error('[REPORTS] Error fetching report:', error);
      return null;
    }
  }
  
  // Get PDF download URL from Supabase Storage
  function getReportPdfUrl(pdfFileName) {
    if (!pdfFileName) return null;
    
    // Get Supabase URL from config
    const supabaseUrl = window.supabaseClient?.supabaseUrl || 'https://igiemqicokpdyhunldtq.supabase.co';
    return `${supabaseUrl}/storage/v1/object/public/impact-reports/${pdfFileName}`;
  }
  
  // Save download request to database
  async function saveDownloadRequest(name, email, reportTitle, reportYear) {
    if (!window.supabaseClient) {
      console.error('[REPORTS] Supabase client not available');
      return { error: 'Database connection failed' };
    }
    
    try {
      const { data, error } = await window.supabaseClient
        .from('impact_report_downloads')
        .insert({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          report_title: reportTitle,
          report_year: reportYear,
          downloaded_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('[REPORTS] ✅ Download request saved:', data);
      return { data, error: null };
    } catch (error) {
      console.error('[REPORTS] ❌ Error saving download request:', error);
      return { data: null, error };
    }
  }
  
  // Check if email already downloaded (optional - prevent duplicates)
  async function hasDownloadedReport(email, reportTitle) {
    if (!window.supabaseClient) return false;
    
    try {
      const { data, error } = await window.supabaseClient
        .from('impact_report_downloads')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .eq('report_title', reportTitle)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('[REPORTS] Error checking download history:', error);
      return false;
    }
  }
  
  // Download PDF file from Supabase Storage
  async function downloadReportPdf(pdfUrl, filename) {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'impact-report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('[REPORTS] ✅ PDF downloaded successfully');
      return { success: true };
    } catch (error) {
      console.error('[REPORTS] ❌ Error downloading PDF:', error);
      return { success: false, error };
    }
  }
  
  // Export functions
  window.ImpactReportsAPI = {
    getPublishedReports,
    getReportById,
    getReportPdfUrl,
    saveDownloadRequest,
    hasDownloadedReport,
    downloadReportPdf
  };
  ```

#### Step 2.2: Integration with Analytics
- **File:** `js/api/impact-reports.js`
- **Action:** Add analytics tracking for downloads
- **Events:**
  - `report_viewed` - When user views report detail page
  - `report_download_started` - When download form is opened
  - `report_downloaded` - When download is completed

---

### **Phase 3: Navigation Updates**

#### Step 3.1: Create Resources Dropdown Component
- **File:** `js/resources-menu.js` (NEW)
- **Purpose:** Handle Resources dropdown menu (similar to user menu)
- **Features:**
  - Toggle dropdown on click
  - Close on outside click
  - Match user menu styling
  - Responsive behavior

#### Step 3.2: Update Header Navigation HTML
- **Files:** All HTML files (17 files)
- **Action:** Replace "Blog" link with "Resources" dropdown
- **Structure:**
  ```html
  <div class="resources-menu-container" style="position: relative;">
    <button class="resources-menu-button text-block-3 w-nav-link">
      Resources
      <svg class="dropdown-arrow">...</svg>
    </button>
    <div class="resources-dropdown-menu">
      <a href="reports.html" class="resources-menu-item">Reports</a>
      <a href="blog.html" class="resources-menu-item">Blog</a>
    </div>
  </div>
  ```

#### Step 3.3: Add Resources Menu Styling
- **File:** `css/zubbies-dandy-site.webflow.css` (or new CSS file)
- **Action:** Add styles matching user menu dropdown
- **Styles:**
  - Dropdown container (absolute positioning)
  - Menu items (hover effects, padding, colors)
  - Arrow icon animation
  - Mobile responsive styles

---

### **Phase 4: Footer Updates**

#### Step 4.1: Add Reports Link to Footer
- **Files:** All HTML files (17 files)
- **Action:** Add "Reports" link to footer navigation section
- **Location:** In the "Pmhelp" footer section, after "Blog" link
- **Code:**
  ```html
  <a href="reports.html" class="link-XX w-inline-block">
    <div class="footer-list-item-link-blog">Reports</div>
  </a>
  ```

---

### **Phase 5: Reports Listing Page**

#### Step 5.1: Create Reports Page HTML
- **File:** `reports.html` (NEW)
- **Structure:**
  - Use existing PMHelp header (via header-auth.js)
  - Hero section with title "Guides & Reports"
  - Grid layout for report cards
  - Use existing PMHelp footer

#### Step 5.2: Create Report Card Component
- **File:** `reports.html`
- **Design:**
  - Report cover image (aspect ratio 1:1.414 for A4)
  - Hover effects (lift, shadow, scale image)
  - "Click to download" overlay on hover
  - Report title, date, description
  - Gradient overlay on hover

#### Step 5.3: Create Reports Page JavaScript
- **File:** `js/pages/reports-page.js` (NEW)
- **Functions:**
  ```javascript
  // Initialize reports page
  async function initializeReportsPage() {
    // Fetch and render reports from database
    await renderReports();
    // Track page view
    if (window.analytics) {
      window.analytics.trackPageView('/reports', 'Impact Reports');
    }
  }
  
  // Fetch and render reports from database
  async function renderReports() {
    const reports = await window.ImpactReportsAPI?.getPublishedReports() || [];
    // Render report cards in grid
    // Each card links to detail_report.html?report=[reportId]
    // Use report.id, report.title, report.year, report.description, report.cover_image_url
  }
  
  // Handle report card click
  function handleReportClick(reportId) {
    window.location.href = `detail_report.html?report=${reportId}`;
  }
  
  // Filter reports by industry (if implemented)
  function filterReportsByIndustry(industry) {
    // Optional feature - filter reports if industry tags are added to config
  }
  ```

#### Step 5.4: Add Reports Page Styling
- **File:** `css/zubbies-dandy-site.webflow.css` (or new CSS)
- **Styles:**
  - Report card grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
  - Card hover animations
  - Image scaling effects
  - Gradient overlays
  - Typography matching PMHelp theme

---

### **Phase 6: Report Detail/Download Page**

#### Step 6.1: Create Report Detail Page HTML
- **File:** `detail_report.html` (NEW)
- **Structure:**
  - Use existing PMHelp header
  - Report cover image (large display)
  - Report title and metadata
  - Description
  - Download button (triggers modal/form)
  - Use existing PMHelp footer

#### Step 6.2: Create Download Modal/Form
- **File:** `detail_report.html` or separate component
- **Features:**
  - Modal overlay
  - Form with name and email fields
  - Validation
  - Submit button
  - Loading state
  - Success message
  - Auto-download PDF after submission

#### Step 6.3: Create Report Detail Page JavaScript
- **File:** `js/pages/report-detail-page.js` (NEW)
- **Functions:**
  ```javascript
  // Initialize report detail page
  async function initializeReportDetailPage() {
    // Get report ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('report');
    
    if (!reportId) {
      console.error('[REPORT DETAIL] No report ID in URL');
      return;
    }
    
    // Load report data from config
    await loadReportData(reportId);
    
    // Track page view
    if (window.analytics && currentReport) {
      window.analytics.trackEvent('report_viewed', {
        report_id: reportId,
        report_title: currentReport.title,
        report_year: currentReport.year
      });
    }
  }
  
  // Fetch report data from database
  async function loadReportData(reportId) {
    const report = await window.ImpactReportsAPI?.getReportById(reportId);
    if (!report) {
      console.error('[REPORT DETAIL] Report not found:', reportId);
      // Show error message to user
      return;
    }
    
    currentReport = report;
    // Render report details on page
    // Use report.title, report.year, report.description, report.cover_image_url, report.pdfUrl
    renderReportDetails(report);
  }
  
  // Show download modal
  function showDownloadModal() {
    // Show modal overlay and form
    // Track analytics event
    if (window.analytics && currentReport) {
      window.analytics.trackEvent('report_download_started', {
        report_id: currentReport.id,
        report_title: currentReport.title
      });
    }
  }
  
  // Hide download modal
  function hideDownloadModal() {
    // Hide modal overlay
    // Reset form
  }
  
  // Handle form submission
  async function handleDownloadSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('download-name').value.trim();
    const email = document.getElementById('download-email').value.trim();
    
    // Validate
    if (!name || !email) {
      alert('Please fill in all fields');
      return;
    }
    
    // Save to database
    const result = await window.ImpactReportsAPI.saveDownloadRequest(
      name,
      email,
      currentReport.title,
      currentReport.year
    );
    
    if (result.error) {
      console.error('[REPORT DETAIL] Error saving download:', result.error);
      alert('Error saving download request. Please try again.');
      return;
    }
    
    // Get PDF URL (already included in report object as pdfUrl)
    const pdfUrl = currentReport.pdfUrl;
    
    if (!pdfUrl) {
      alert('PDF URL not available. Please contact support.');
      return;
    }
    
    // Download PDF
    await window.ImpactReportsAPI.downloadReportPdf(pdfUrl, currentReport.pdf_file_name);
    
    // Track analytics
    if (window.analytics) {
      window.analytics.trackEvent('report_downloaded', {
        report_id: currentReport.id,
        report_title: currentReport.title,
        report_year: currentReport.year
      });
    }
    
    // Hide modal and show success message
    hideDownloadModal();
    showSuccessMessage();
  }
  
  // Track download in analytics (called from handleDownloadSubmit)
  function trackDownload(reportData, userData) {
    // Already handled in handleDownloadSubmit
  }
  ```

#### Step 6.4: Add Report Detail Page Styling
- **File:** `css/zubbies-dandy-site.webflow.css`
- **Styles:**
  - Modal overlay (backdrop blur)
  - Form styling (matching PMHelp theme)
  - Input field styles
  - Button styles
  - Responsive layout

---

### **Phase 7: Integration & Testing**

#### Step 7.1: Add Scripts to HTML Files
- **Files:** `reports.html`, `detail_report.html`
- **Action:** Add required scripts in correct order:
  ```html
  <!-- Supabase -->
  <script src="js/supabase-config.js"></script>
  <!-- Analytics -->
  <script src="js/analytics.js" defer></script>
  <!-- Auth -->
  <script src="js/auth.js"></script>
  <script src="js/auth-state.js"></script>
  <script src="js/header-auth.js"></script>
  <!-- Resources Menu -->
  <script src="js/resources-menu.js"></script>
  <!-- Reports API -->
  <script src="js/api/impact-reports.js"></script>
  <!-- Page Scripts -->
  <script src="js/pages/reports-page.js"></script>
  <!-- or -->
  <script src="js/pages/report-detail-page.js"></script>
  ```

#### Step 7.2: Test All Functionality
- **Checklist:**
  - [ ] Navigation dropdown works (desktop & mobile)
  - [ ] Reports page loads and displays reports
  - [ ] Report cards are clickable
  - [ ] Report detail page loads correctly
  - [ ] Download modal opens and closes
  - [ ] Form validation works
  - [ ] Download request saves to database
  - [ ] PDF downloads after form submission
  - [ ] Analytics events fire correctly
  - [ ] Footer link works
  - [ ] Responsive design works on all devices
  - [ ] Page is scrollable
  - [ ] All pages use PMHelp header/footer

#### Step 7.3: Error Handling
- **Add:**
  - Error messages for failed API calls
  - Loading states for async operations
  - Fallback UI if reports fail to load
  - Network error handling

---

### **Phase 8: Content & Assets**

#### Step 8.1: Prepare Report Assets
- **Action:** 
  - Create/obtain report cover images
  - Prepare PDF files for download
  - Upload to appropriate location (images folder or CDN)

#### Step 8.2: Add Sample Report Data
- **Action:**
  - Insert at least one report into `impact_reports` table
  - Include: title, year, description, cover_image_url, pdf_url
  - Set `is_published = true`

---

## 🎨 Design Specifications

### Color Scheme
- Use existing PMHelp colors from CSS variables
- Primary colors: `var(--untitled-ui--primary900)`, `var(--untitled-ui--primary600)`
- Background: `var(--untitled-ui--white)`
- Text: `var(--untitled-ui--primary900)`, `var(--elements-webflow-library--neutral--600)`

### Typography
- Headings: Satoshi font family (existing)
- Body: Satoshi font family
- Sizes: Match existing page styles

### Spacing
- Container: Use `brix---container-default` class
- Grid gaps: 8px mobile, 12px tablet, 16px desktop
- Card padding: Match existing card components

### Animations
- Hover lift: `translateY(-8px)` with `transition: all 0.3s ease`
- Shadow: Increase on hover
- Image scale: `scale(1.05)` on hover
- Fade in: Cards animate in on load

### Responsive Breakpoints
- Mobile: < 768px (1 column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

---

## 📁 File Structure

```
zubbies/
├── reports.html                          [NEW]
├── detail_report.html                    [NEW]
├── database_schema.sql                   [UPDATE - add impact_report_downloads and impact_reports tables]
├── css/
│   └── zubbies-dandy-site.webflow.css    [UPDATE - add report styles]
├── js/
│   ├── api/
│   │   └── impact-reports.js            [NEW]
│   ├── pages/
│   │   ├── reports-page.js              [NEW]
│   │   └── report-detail-page.js        [NEW]
│   └── resources-menu.js                 [NEW]
└── images/
    └── reports/                          [NEW FOLDER - optional, for cover images]
        ├── annual-impact-report-2025-cover.png
        └── [other report covers]

Supabase Database:
└── impact_reports                        [NEW TABLE]
    └── Stores: title, year, description, cover_image_url, pdf_file_name, is_published

Supabase Storage:
└── impact-reports/                       [NEW BUCKET]
    ├── annual-impact-report-2025.pdf
    └── [other PDF files]
```

---

## 🔄 Implementation Order

1. **Database Setup** (Phase 1)
   - Create tables
   - Set up RLS policies
   - Test with sample data

2. **Backend API** (Phase 2)
   - Create API module
   - Implement functions to read reports from database
   - Implement functions to get PDF URLs from Supabase Storage
   - Test database operations (for fetching reports and saving downloads)
   - Add analytics integration

3. **Navigation** (Phase 3)
   - Create dropdown component
   - Update all HTML files
   - Test dropdown functionality

4. **Footer** (Phase 4)
   - Add Reports link to all footers
   - Test navigation

5. **Reports Listing Page** (Phase 5)
   - Create HTML structure
   - Add JavaScript functionality
   - Style and make responsive

6. **Report Detail Page** (Phase 6)
   - Create HTML structure
   - Implement download modal
   - Add form handling
   - Style and make responsive

7. **Integration** (Phase 7)
   - Add scripts to pages
   - Test all functionality
   - Fix any issues

8. **Content** (Phase 8)
   - Upload PDF files to Supabase Storage bucket `impact-reports`
   - Add report metadata to `impact_reports` table via Supabase Dashboard
   - Add report cover images (optional - to images/reports/ or storage)
   - Final testing

---

## ✅ Success Criteria

- [ ] Reports page is publicly accessible
- [ ] Navigation dropdown works and matches user menu style
- [ ] Footer contains Reports link
- [ ] Report cards display correctly with hover effects
- [ ] Download form collects name and email
- [ ] Download data saves to database
- [ ] PDF downloads after form submission
- [ ] All pages use PMHelp header and footer
- [ ] Design matches PMHelp theme
- [ ] Fully responsive on all devices
- [ ] Analytics events fire correctly
- [ ] No console errors
- [ ] Accessible (keyboard navigation, screen readers)

---

## 🚀 Next Steps After Implementation

1. Add more reports as they become available
2. Consider adding report categories/filters
3. Add search functionality
4. Add report preview (first few pages)
5. Email notifications for new reports
6. Admin panel to manage reports

---

**Last Updated:** January 1, 2025  
**Status:** Ready for Implementation
