// =====================================================
// Report Detail Page
// =====================================================
// Handles the report detail/download page functionality
// =====================================================

let currentReport = null;

/**
 * Initialize report detail page
 */
async function initializeReportDetailPage() {
  console.log('[REPORT DETAIL] 🚀 Initializing report detail page...');
  
  // Get report ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const reportId = urlParams.get('report');
  
  if (!reportId) {
    console.error('[REPORT DETAIL] ❌ No report ID in URL');
    showError('No report specified. Please select a report from the reports page.');
    return;
  }
  
  // Load report data
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

/**
 * Fetch report data from database
 * @param {string} reportId - Report UUID
 */
async function loadReportData(reportId) {
  const loadingEl = document.getElementById('report-detail-loading');
  const errorEl = document.getElementById('report-detail-error');
  const contentEl = document.getElementById('report-detail-content');
  
  try {
    // Show loading state
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    
    // Fetch report from API
    if (!window.ImpactReportsAPI) {
      console.error('[REPORT DETAIL] ❌ ImpactReportsAPI not available');
      showError('Reports API not available. Please refresh the page.');
      return;
    }
    
    const report = await window.ImpactReportsAPI.getReportById(reportId);
    
    if (!report) {
      console.error('[REPORT DETAIL] ❌ Report not found:', reportId);
      showError('Report not found. Please check the URL and try again.');
      return;
    }
    
    currentReport = report;
    
    // Hide loading state
    if (loadingEl) loadingEl.style.display = 'none';
    
    // Render report details
    renderReportDetails(report);
    
    // Show content
    if (contentEl) contentEl.style.display = 'block';
    
  } catch (error) {
    console.error('[REPORT DETAIL] ❌ Error loading report:', error);
    showError('Failed to load report. Please try again later.');
  }
}

/**
 * Render report details on page
 * @param {Object} report - Report data object
 */
function renderReportDetails(report) {
  console.log('[REPORT DETAIL] 📄 Rendering report:', report.title);
  
  // Update page title
  if (report.title) {
    document.title = `${report.title} - PMHelp`;
  }
  
  // Update breadcrumb
  const breadcrumbTitle = document.getElementById('report-breadcrumb-title');
  if (breadcrumbTitle) {
    breadcrumbTitle.textContent = report.title || 'Report';
  }
  
  // Update cover image
  const coverImg = document.getElementById('report-detail-cover');
  if (coverImg) {
    coverImg.src = report.cover_image_url || 'images/reports/default-report-cover.png';
    coverImg.alt = report.title || 'Report cover';
  }
  
  // Update title
  const titleEl = document.getElementById('report-detail-title');
  if (titleEl) {
    titleEl.textContent = report.title || 'Untitled Report';
  }
  
  // Update year
  const yearEl = document.getElementById('report-detail-year');
  if (yearEl) {
    yearEl.textContent = report.year ? `Year: ${report.year}` : '';
  }
  
  // Update description
  const descEl = document.getElementById('report-detail-description');
  if (descEl) {
    descEl.textContent = report.description || 'No description available.';
  }
  
  // Attach event listener to download button
  const downloadBtn = document.getElementById('report-detail-download-btn');
  if (downloadBtn) {
    // Remove any existing listeners
    downloadBtn.replaceWith(downloadBtn.cloneNode(true));
    const newDownloadBtn = document.getElementById('report-detail-download-btn');
    newDownloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showDownloadModal();
    });
    console.log('[REPORT DETAIL] ✅ Download button event listener attached');
  }
}

/**
 * Show download modal
 */
function showDownloadModal() {
  console.log('[REPORT DETAIL] 📥 Showing download modal');
  
  const modal = document.getElementById('download-modal-overlay');
  if (!modal) {
    console.error('[REPORT DETAIL] ❌ Modal element not found');
    return;
  }
  
  // Track analytics event
  if (window.analytics && currentReport) {
    window.analytics.trackEvent('report_download_started', {
      report_id: currentReport.id,
      report_title: currentReport.title
    });
  }
  
  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
  
  // Focus on first input
  const nameInput = document.getElementById('download-name');
  if (nameInput) {
    setTimeout(() => nameInput.focus(), 100);
  }
}

/**
 * Hide download modal
 */
function hideDownloadModal() {
  console.log('[REPORT DETAIL] ❌ Hiding download modal');
  
  const modal = document.getElementById('download-modal-overlay');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  // Reset form
  const form = document.getElementById('download-form');
  if (form) {
    form.reset();
  }
  
  // Reset submit button
  const submitBtn = document.getElementById('download-form-submit');
  if (submitBtn) {
    const btnText = submitBtn.querySelector('.submit-btn-text');
    const btnSpinner = submitBtn.querySelector('.submit-btn-spinner');
    if (btnText) btnText.style.display = 'inline';
    if (btnSpinner) btnSpinner.style.display = 'none';
    submitBtn.disabled = false;
  }
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
async function handleDownloadSubmit(event) {
  event.preventDefault();
  console.log('[REPORT DETAIL] 📥 Handling download submission');
  
  if (!currentReport) {
    console.error('[REPORT DETAIL] ❌ No report data available');
    alert('Report data not available. Please refresh the page.');
    return;
  }
  
  const nameInput = document.getElementById('download-name');
  const emailInput = document.getElementById('download-email');
  const submitBtn = document.getElementById('download-form-submit');
  const btnText = submitBtn?.querySelector('.submit-btn-text');
  const btnSpinner = submitBtn?.querySelector('.submit-btn-spinner');
  
  if (!nameInput || !emailInput) {
    console.error('[REPORT DETAIL] ❌ Form inputs not found');
    return;
  }
  
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  
  // Validate
  if (!name || !email) {
    alert('Please fill in all fields');
    return;
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }
  
  // Show loading state
  if (submitBtn) submitBtn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnSpinner) btnSpinner.style.display = 'inline-block';
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'report-detail-page.js:handleDownloadSubmit',message:'Before saveDownloadRequest call',data:{name,email,reportTitle:currentReport?.title,reportYear:currentReport?.year,hasSupabaseClient:!!window.supabaseClient,hasImpactReportsAPI:!!window.ImpactReportsAPI},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Try to save to database (non-blocking - download should proceed even if this fails)
    let saveResult = null;
    try {
      saveResult = await window.ImpactReportsAPI.saveDownloadRequest(
        name,
        email,
        currentReport.title,
        currentReport.year
      );
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'report-detail-page.js:handleDownloadSubmit',message:'After saveDownloadRequest call',data:{hasError:!!saveResult?.error,error:saveResult?.error,hasData:!!saveResult?.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      if (saveResult?.error) {
        console.warn('[REPORT DETAIL] ⚠️ Could not save download request to database (non-critical):', saveResult.error);
        // Continue with download anyway - database save is for analytics only
      }
    } catch (saveError) {
      console.warn('[REPORT DETAIL] ⚠️ Error saving download request (non-critical):', saveError);
      // Continue with download anyway
    }
    
    // Get PDF URL
    const pdfUrl = currentReport.pdfUrl;
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'report-detail-page.js:handleDownloadSubmit',message:'Before PDF download',data:{pdfUrl,pdfFileName:currentReport?.pdf_file_name,hasPdfUrl:!!pdfUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    if (!pdfUrl) {
      console.error('[REPORT DETAIL] ❌ PDF URL not available');
      alert('PDF URL not available. Please contact support.');
      
      // Reset button state
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnSpinner) btnSpinner.style.display = 'none';
      return;
    }
    
    // Download PDF
    const downloadResult = await window.ImpactReportsAPI.downloadReportPdf(
      pdfUrl,
      currentReport.pdf_file_name || `${currentReport.title.replace(/\s+/g, '-').toLowerCase()}.pdf`
    );
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6d18e1f8-8607-4ebb-8d26-4a8060383b13',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'report-detail-page.js:handleDownloadSubmit',message:'After PDF download',data:{success:downloadResult?.success,error:downloadResult?.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    if (!downloadResult.success) {
      console.error('[REPORT DETAIL] ❌ Error downloading PDF:', downloadResult.error);
      alert('Error downloading PDF. Please try again.');
      
      // Reset button state
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnSpinner) btnSpinner.style.display = 'none';
      return;
    }
    
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
    
  } catch (error) {
    console.error('[REPORT DETAIL] ❌ Error in download process:', error);
    alert('An error occurred. Please try again.');
    
    // Reset button state
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnSpinner) btnSpinner.style.display = 'none';
  }
}

/**
 * Show success message
 */
function showSuccessMessage() {
  const successEl = document.getElementById('download-success-message');
  if (successEl) {
    successEl.style.display = 'flex';
    
    // Hide after 3 seconds
    setTimeout(() => {
      successEl.style.display = 'none';
    }, 3000);
  }
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const loadingEl = document.getElementById('report-detail-loading');
  const errorEl = document.getElementById('report-detail-error');
  const contentEl = document.getElementById('report-detail-content');
  
  if (loadingEl) loadingEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'none';
  
  if (errorEl) {
    errorEl.style.display = 'block';
    const errorText = errorEl.querySelector('.report-detail-error-text');
    if (errorText) {
      errorText.textContent = message || 'An error occurred. Please try again.';
    }
  }
}

// Close modal when clicking overlay
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('download-modal-overlay');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideDownloadModal();
      }
    });
  }
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('download-modal-overlay');
      if (modal && modal.style.display === 'flex') {
        hideDownloadModal();
      }
    }
  });
  
  // Ensure download button has event listener (backup)
  const downloadBtn = document.getElementById('report-detail-download-btn');
  if (downloadBtn) {
    // Check if already has listener
    if (!downloadBtn.hasAttribute('data-listener-attached')) {
      downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof showDownloadModal === 'function') {
          showDownloadModal();
        } else {
          console.error('[REPORT DETAIL] ❌ showDownloadModal function not available');
        }
      });
      downloadBtn.setAttribute('data-listener-attached', 'true');
      console.log('[REPORT DETAIL] ✅ Backup download button event listener attached');
    }
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReportDetailPage);
} else {
  initializeReportDetailPage();
}

// Export for global access
window.ReportDetailPage = {
  initializeReportDetailPage,
  loadReportData,
  renderReportDetails,
  showDownloadModal,
  hideDownloadModal,
  handleDownloadSubmit,
  showSuccessMessage,
  showError
};

// Make functions globally available for onclick handlers
window.showDownloadModal = showDownloadModal;
window.hideDownloadModal = hideDownloadModal;
window.handleDownloadSubmit = handleDownloadSubmit;

console.log('[REPORT DETAIL] ✅ Report detail page module loaded');
