// =====================================================
// Reports Page
// =====================================================
// Handles the reports listing page functionality
// =====================================================

let allReports = [];

/**
 * Initialize reports page
 */
async function initializeReportsPage() {
  console.log('[REPORTS PAGE] 🚀 Initializing reports page...');
  
  // Track page view
  if (window.analytics) {
    window.analytics.trackPageView('/reports', 'Impact Reports');
  }
  
  // Fetch and render reports
  await renderReports();
}

/**
 * Fetch and render reports from database
 */
async function renderReports() {
  const reportsGrid = document.getElementById('reports-grid');
  const loadingEl = document.getElementById('reports-loading');
  const emptyEl = document.getElementById('reports-empty');
  
  if (!reportsGrid) {
    console.error('[REPORTS PAGE] ❌ Reports grid container not found');
    return;
  }
  
  try {
    // Show loading state
    if (loadingEl) loadingEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';
    
    // Clear existing reports (except loading/empty messages)
    const existingCards = reportsGrid.querySelectorAll('.report-card');
    existingCards.forEach(card => card.remove());
    
    // Fetch reports from API
    if (!window.ImpactReportsAPI) {
      console.error('[REPORTS PAGE] ❌ ImpactReportsAPI not available');
      showError('Reports API not available. Please refresh the page.');
      return;
    }
    
    const reports = await window.ImpactReportsAPI.getPublishedReports();
    allReports = reports || [];
    
    // Hide loading state
    if (loadingEl) loadingEl.style.display = 'none';
    
    if (!allReports || allReports.length === 0) {
      // Show empty state
      if (emptyEl) emptyEl.style.display = 'block';
      console.log('[REPORTS PAGE] ℹ️ No reports found');
      return;
    }
    
    // Hide empty state
    if (emptyEl) emptyEl.style.display = 'none';
    
    console.log('[REPORTS PAGE] ✅ Rendering', allReports.length, 'reports');
    
    // Render each report as a card
    allReports.forEach((report, index) => {
      const card = createReportCard(report, index);
      reportsGrid.appendChild(card);
    });
    
  } catch (error) {
    console.error('[REPORTS PAGE] ❌ Error rendering reports:', error);
    showError('Failed to load reports. Please try again later.');
    
    // Hide loading, show error
    if (loadingEl) loadingEl.style.display = 'none';
    if (emptyEl) {
      emptyEl.style.display = 'block';
      emptyEl.querySelector('.reports-empty-text').textContent = 'Failed to load reports. Please try again later.';
    }
  }
}

/**
 * Create a report card element
 * @param {Object} report - Report data object
 * @param {number} index - Index for animation delay
 * @returns {HTMLElement} - Report card element
 */
function createReportCard(report, index) {
  const card = document.createElement('a');
  card.href = `detail_report.html?report=${report.id}`;
  
  // First card gets special styling (featured/prominent)
  const isFirstCard = index === 0;
  card.className = isFirstCard ? 'report-card report-card-featured' : 'report-card';
  
  card.style.cssText = `
    text-decoration: none;
    color: inherit;
    display: block;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    animation: fadeInUp 0.5s ease forwards;
    animation-delay: ${index * 0.1}s;
  `;
  
  // Card container
  const cardInner = document.createElement('div');
  cardInner.className = 'report-card-inner';
  
  // Image container with hover overlay
  const imageContainer = document.createElement('div');
  imageContainer.className = 'report-card-image-container';
  
  const image = document.createElement('img');
  image.src = 'images/thumbnail.jpg';
  image.alt = report.title || 'Report cover';
  image.className = 'report-card-image';
  image.loading = 'lazy';
  
  // Hover overlay
  const overlay = document.createElement('div');
  overlay.className = 'report-card-overlay';
  overlay.innerHTML = '<div class="report-card-overlay-text">Click to view</div>';
  
  imageContainer.appendChild(image);
  imageContainer.appendChild(overlay);
  
  // Card content
  const content = document.createElement('div');
  content.className = 'report-card-content';
  
  const title = document.createElement('h3');
  title.className = 'report-card-title';
  title.textContent = report.title || 'Untitled Report';
  
  const year = document.createElement('div');
  year.className = 'report-card-year';
  year.textContent = report.year ? `Year: ${report.year}` : '';
  
  const description = document.createElement('p');
  description.className = 'report-card-description';
  description.textContent = report.description || 'No description available.';
  
  content.appendChild(title);
  if (report.year) {
    content.appendChild(year);
  }
  content.appendChild(description);
  
  cardInner.appendChild(imageContainer);
  cardInner.appendChild(content);
  card.appendChild(cardInner);
  
  // Add click handler
  card.addEventListener('click', (e) => {
    e.preventDefault();
    handleReportClick(report.id);
  });
  
  return card;
}

/**
 * Handle report card click
 * @param {string} reportId - Report ID
 */
function handleReportClick(reportId) {
  console.log('[REPORTS PAGE] 📄 Opening report:', reportId);
  
  // Track analytics
  if (window.analytics) {
    const report = allReports.find(r => r.id === reportId);
    if (report) {
      window.analytics.trackEvent('report_card_clicked', {
        report_id: reportId,
        report_title: report.title,
        report_year: report.year
      });
    }
  }
  
  // Navigate to detail page
  window.location.href = `detail_report.html?report=${reportId}`;
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
  const reportsGrid = document.getElementById('reports-grid');
  if (!reportsGrid) return;
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'reports-error';
  errorDiv.style.cssText = `
    text-align: center;
    padding: 40px 20px;
    color: var(--elements-webflow-library--neutral--600);
    font-family: Satoshi, sans-serif;
  `;
  errorDiv.textContent = message;
  
  reportsGrid.appendChild(errorDiv);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReportsPage);
} else {
  initializeReportsPage();
}

// Export for global access
window.ReportsPage = {
  initializeReportsPage,
  renderReports,
  handleReportClick
};

console.log('[REPORTS PAGE] ✅ Reports page module loaded');
