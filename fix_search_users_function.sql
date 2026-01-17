-- =====================================================
-- Fix search_users_by_email_or_name Function
-- =====================================================
-- This fixes the type mismatch error where the function
-- returns VARCHAR(255) but should return TEXT
-- =====================================================

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS search_users_by_email_or_name(text);

-- Recreate the function with correct return types
-- IMPORTANT: Replace this with the actual function definition you have
-- The key is to ensure all TEXT columns are cast to TEXT (not VARCHAR)
CREATE OR REPLACE FUNCTION search_users_by_email_or_name(search_term text)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    au.email::text,  -- Cast to TEXT explicitly
    p.full_name::text,  -- Cast to TEXT explicitly
    p.role::text,  -- Cast to TEXT explicitly
    p.created_at
  FROM profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE 
    (p.full_name ILIKE '%' || search_term || '%')
    OR (au.email ILIKE '%' || search_term || '%')
  ORDER BY p.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Note: Adjust the function definition above based on:
-- 1. What columns you actually need to return
-- 2. The actual search logic you want
-- 3. Make sure ALL text columns use ::text cast
-- =====================================================
