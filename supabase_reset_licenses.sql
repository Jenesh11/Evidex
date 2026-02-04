-- =====================================================
-- RESET TEST LICENSE CODES
-- Run this in Supabase SQL Editor to make test codes usable again
-- =====================================================

-- 1. Reset all codes ending in '-TEST' to unused state
UPDATE public.license_codes 
SET 
  is_used = false, 
  used_by = null, 
  used_at = null 
WHERE code LIKE '%-TEST';

-- 2. Verify the reset
SELECT code, is_used, plan_type 
FROM public.license_codes 
WHERE code LIKE '%-TEST'
ORDER BY code;

-- Quick Reference of Available Codes:
-- STARTER-1M-TEST
-- STARTER-6M-TEST
-- PRO-1M-TEST
-- PRO-6M-TEST
-- PRO-LIFETIME-TEST
