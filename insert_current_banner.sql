-- =====================================================
-- Insert Current Banner Data into Database
-- =====================================================
-- This script inserts the current banner content from
-- index.html into the website_banners table
-- =====================================================
-- Run this AFTER running backoffice_setup.sql
-- =====================================================

-- Insert the current homepage announcement banner
INSERT INTO website_banners (
  banner_key,
  badge_text,
  text,
  link_url,
  link_text,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'homepage-announcement',
  'NEW',
  'Check out our new Reports feature: Get insights on product management trends and analytics',
  '/reports.html',
  NULL, -- Link text not specified in current banner (arrow icon used instead)
  true,
  NOW(),
  NOW()
)
ON CONFLICT (banner_key) 
DO UPDATE SET
  badge_text = EXCLUDED.badge_text,
  text = EXCLUDED.text,
  link_url = EXCLUDED.link_url,
  link_text = EXCLUDED.link_text,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify the banner was inserted/updated
SELECT 
  banner_key,
  badge_text,
  text,
  link_url,
  link_text,
  is_active,
  created_at,
  updated_at
FROM website_banners
WHERE banner_key = 'homepage-announcement';
