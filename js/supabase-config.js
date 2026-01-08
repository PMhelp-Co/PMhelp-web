// =====================================================
// Supabase Configuration
// =====================================================
// Initialize Supabase client for the PMHelp website
// =====================================================

// Supabase configuration
const SUPABASE_URL = "https://igiemqicokpdyhunldtq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnaWVtcWljb2twZHlodW5sZHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzUyODMsImV4cCI6MjA4MDUxMTI4M30.ofycauABgKV1kO9npWlaN9Hk6SZXtQm8F3lVro0xK9w";

// Initialize Supabase client globally
// Note: Requires Supabase CDN to be loaded first in HTML
if (typeof supabase !== 'undefined') {
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Export globally for use across all scripts
  window.supabaseClient = supabaseClient;
  
  // Also export as 'supabase' for convenience
  window.supabase = supabaseClient;

  // Prevent "flash of unauth CTAs" on page navigation:
  // if a session/token exists in localStorage, hide unauth header CTAs immediately via CSS.
  try {
    const hasToken = !!localStorage.getItem('supabase.auth.token');
    const hasSession = !!localStorage.getItem('supabase.auth.session');
    if (hasToken || hasSession) {
      document.documentElement.classList.add('auth-has-session');
    }
  } catch (_) {
    // ignore (e.g. storage blocked)
  }
  
  console.log('Supabase client initialized successfully');
} else {
  console.error('Supabase CDN not loaded. Make sure to include the Supabase script before this file.');
}