// =====================================================
// Supabase Configuration
// =====================================================
// Initialize Supabase client for the PMHelp website
// =====================================================

// Supabase configuration
// TODO: Replace with your actual Supabase project URL and anon key
const SUPABASE_URL = "https://igiemqicokpdyhunldtq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ThX8P9WuihzoUTbbt14_-w_dCJSTnza";

// Initialize Supabase client globally
// Note: Requires Supabase CDN to be loaded first in HTML
if (typeof supabase !== 'undefined') {
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Export globally for use across all scripts
  window.supabaseClient = supabaseClient;
  
  // Also export as 'supabase' for convenience
  window.supabase = supabaseClient;
  
  console.log('Supabase client initialized successfully');
} else {
  console.error('Supabase CDN not loaded. Make sure to include the Supabase script before this file.');
}

