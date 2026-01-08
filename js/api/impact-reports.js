// =====================================================
// Impact Reports API
// =====================================================
// Functions for managing impact reports and downloads
// =====================================================

/**
 * Get all published reports from database
 * @returns {Promise<Array>} - Array of published reports with PDF URLs
 */
async function getPublishedReports() {
  console.log('[REPORTS] 📚 Fetching published reports...');
  
  if (!window.supabaseClient) {
    console.error('[REPORTS] ❌ Supabase client not available');
    return [];
  }
  
  try {
    const { data, error } = await window.supabaseClient
      .from('impact_reports')
      .select('*')
      .eq('is_published', true)
      .order('year', { ascending: false }); // Newest first
    
    if (error) {
      console.error('[REPORTS] ❌ Error fetching reports:', error);
      throw error;
    }
    
    console.log('[REPORTS] ✅ Found', data?.length || 0, 'published reports');
    
    // Add full PDF URL to each report
    const reportsWithUrls = (data || []).map(report => ({
      ...report,
      pdfUrl: getReportPdfUrl(report.pdf_file_name)
    }));
    
    
    return reportsWithUrls;
  } catch (error) {
    console.error('[REPORTS] ❌ Error fetching reports:', error);
    return [];
  }
}


/**
 * Get single report by ID from database
 * @param {string} reportId - Report UUID
 * @returns {Promise<Object|null>} - Report object with PDF URL or null if not found
 */
async function getReportById(reportId) {
  console.log('[REPORTS] 🔍 Fetching report by ID:', reportId);
  
  if (!window.supabaseClient) {
    console.error('[REPORTS] ❌ Supabase client not available');
    return null;
  }
  
  if (!reportId) {
    console.error('[REPORTS] ❌ Report ID is required');
    return null;
  }
  
  try {
    const { data, error } = await window.supabaseClient
      .from('impact_reports')
      .select('*')
      .eq('id', reportId)
      .eq('is_published', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[REPORTS] ⚠️ Report not found:', reportId);
        return null;
      }
      console.error('[REPORTS] ❌ Error fetching report:', error);
      throw error;
    }
    
    if (!data) {
      console.warn('[REPORTS] ⚠️ Report not found:', reportId);
      return null;
    }
    
    console.log('[REPORTS] ✅ Report found:', data.title);
    
    // Add full PDF URL
    return {
      ...data,
      pdfUrl: getReportPdfUrl(data.pdf_file_name)
    };
  } catch (error) {
    console.error('[REPORTS] ❌ Error fetching report:', error);
    return null;
  }
}

/**
 * Get PDF download URL from Supabase Storage
 * @param {string} pdfFileName - File name in storage (e.g., "annual-impact-report-2025.pdf")
 * @returns {string|null} - Full URL to PDF file or null if filename is invalid
 */
function getReportPdfUrl(pdfFileName) {
  if (!pdfFileName) {
    console.warn('[REPORTS] ⚠️ PDF file name is required');
    return null;
  }
  
  // Get Supabase URL from client or use default
  const supabaseUrl = window.supabaseClient?.supabaseUrl || 
                      window.supabase?.supabaseUrl || 
                      'https://igiemqicokpdyhunldtq.supabase.co';
  
  const pdfUrl = `${supabaseUrl}/storage/v1/object/public/impact-reports/${pdfFileName}`;
  console.log('[REPORTS] 📄 Generated PDF URL:', pdfUrl);
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'impact-reports.js:getReportPdfUrl',message:'PDF URL generated',data:{pdfFileName,supabaseUrl,pdfUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  return pdfUrl;
}

/**
 * Save download request to database
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} reportTitle - Report title
 * @param {number} reportYear - Report year
 * @returns {Promise<Object>} - { data, error } object
 */
async function saveDownloadRequest(name, email, reportTitle, reportYear) {
  console.log('[REPORTS] 💾 Saving download request:', { name, email, reportTitle, reportYear });
  
  if (!window.supabaseClient) {
    console.error('[REPORTS] ❌ Supabase client not available');
    return { error: 'Database connection failed' };
  }
  
  // Validate inputs
  if (!name || !email || !reportTitle) {
    const error = 'Name, email, and report title are required';
    console.error('[REPORTS] ❌ Validation error:', error);
    return { error };
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    const error = 'Invalid email format';
    console.error('[REPORTS] ❌ Validation error:', error);
    return { error };
  }
  
  try {
    // Create the insert payload - MUST match database column names exactly
    const insertPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      report_title: reportTitle,  // Column name is report_title
      report_year: reportYear || null  // Column name is report_year
      // ❌ DO NOT include downloaded_at - it has a default value
      // ❌ DO NOT include created_at - it has a default value
      // ❌ DO NOT include id - it auto-generates
    };
    
    console.log('[REPORTS] 📤 Sending payload:', insertPayload);
    
    const { data, error } = await window.supabaseClient
      .from('impact_report_downloads')
      .insert(insertPayload)
     
    
    if (error) {
      console.error('[REPORTS] ❌ Database error:', error);
      console.error('[REPORTS] ❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('[REPORTS] ✅ Download request saved:', data);
    return { data, error: null };
    
  } catch (error) {
    console.error('[REPORTS] ❌ Error saving download request:', error);
    return { 
      data: null, 
      error: error.message || 'Failed to save download request' 
    };
  }
}

/**
 * Check if email already downloaded a specific report
 * @param {string} email - User's email
 * @param {string} reportTitle - Report title
 * @returns {Promise<boolean>} - True if already downloaded, false otherwise
 */
async function hasDownloadedReport(email, reportTitle) {
  if (!window.supabaseClient) {
    console.warn('[REPORTS] ⚠️ Supabase client not available');
    return false;
  }
  
  if (!email || !reportTitle) {
    return false;
  }
  
  try {
    const { data, error } = await window.supabaseClient
      .from('impact_report_downloads')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .eq('report_title', reportTitle)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('[REPORTS] ❌ Error checking download history:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('[REPORTS] ❌ Error checking download history:', error);
    return false;
  }
}

/**
 * Download PDF file from Supabase Storage
 * @param {string} pdfUrl - Full URL to PDF file
 * @param {string} filename - Filename for download (e.g., "annual-impact-report-2025.pdf")
 * @returns {Promise<Object>} - { success, error } object
 */
async function downloadReportPdf(pdfUrl, filename) {
  console.log('[REPORTS] 📥 Downloading PDF:', { pdfUrl, filename });
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'impact-reports.js:downloadReportPdf',message:'Function entry',data:{pdfUrl,filename},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  if (!pdfUrl) {
    const error = 'PDF URL is required';
    console.error('[REPORTS] ❌', error);
    return { success: false, error };
  }
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'impact-reports.js:downloadReportPdf',message:'Before fetch',data:{pdfUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(pdfUrl);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'impact-reports.js:downloadReportPdf',message:'After fetch',data:{ok:response.ok,status:response.status,statusText:response.statusText,contentType:response.headers.get('content-type')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    if (!response.ok) {
      const error = `Failed to download PDF: ${response.status} ${response.statusText}`;
      console.error('[REPORTS] ❌', error);
      return { success: false, error };
    }
    
    const blob = await response.blob();
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'impact-reports.js:downloadReportPdf',message:'Blob created',data:{blobSize:blob.size,blobType:blob.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'impact-report.pdf';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    console.log('[REPORTS] ✅ PDF downloaded successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('[REPORTS] ❌ Error downloading PDF:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'impact-reports.js:downloadReportPdf',message:'Catch block',data:{error:error?.message||String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return { success: false, error: error.message || 'Failed to download PDF' };
  }
}

// =====================================================
// Analytics Integration
// =====================================================

/**
 * Track report view in analytics
 * @param {string} reportId - Report ID
 * @param {string} reportTitle - Report title
 * @param {number} reportYear - Report year
 */
function trackReportViewed(reportId, reportTitle, reportYear) {
  if (!window.analytics) {
    console.warn('[REPORTS] ⚠️ Analytics not available');
    return;
  }
  
  try {
    window.analytics.trackEvent('report_viewed', {
      report_id: reportId,
      report_title: reportTitle,
      report_year: reportYear
    });
    console.log('[REPORTS] 📊 Analytics: report_viewed tracked');
  } catch (error) {
    console.error('[REPORTS] ❌ Error tracking report view:', error);
  }
}

/**
 * Track download started in analytics
 * @param {string} reportId - Report ID
 * @param {string} reportTitle - Report title
 */
function trackDownloadStarted(reportId, reportTitle) {
  if (!window.analytics) {
    console.warn('[REPORTS] ⚠️ Analytics not available');
    return;
  }
  
  try {
    window.analytics.trackEvent('report_download_started', {
      report_id: reportId,
      report_title: reportTitle
    });
    console.log('[REPORTS] 📊 Analytics: report_download_started tracked');
  } catch (error) {
    console.error('[REPORTS] ❌ Error tracking download started:', error);
  }
}

/**
 * Track report downloaded in analytics
 * @param {string} reportId - Report ID
 * @param {string} reportTitle - Report title
 * @param {number} reportYear - Report year
 */
function trackReportDownloaded(reportId, reportTitle, reportYear) {
  if (!window.analytics) {
    console.warn('[REPORTS] ⚠️ Analytics not available');
    return;
  }
  
  try {
    window.analytics.trackEvent('report_downloaded', {
      report_id: reportId,
      report_title: reportTitle,
      report_year: reportYear
    });
    console.log('[REPORTS] 📊 Analytics: report_downloaded tracked');
  } catch (error) {
    console.error('[REPORTS] ❌ Error tracking report download:', error);
  }
}

// =====================================================
// Export API
// =====================================================

window.ImpactReportsAPI = {
  getPublishedReports,
  getReportById,
  getReportPdfUrl,
  saveDownloadRequest,
  hasDownloadedReport,
  downloadReportPdf,
  trackReportViewed,
  trackDownloadStarted,
  trackReportDownloaded
};

console.log('[REPORTS] ✅ Impact Reports API initialized');
