-- =============================================================================
-- WIPE ALL ACCOUNTS – Start afresh
-- =============================================================================
-- Run this in Supabase Dashboard → SQL Editor.
-- This deletes ALL user accounts, profiles, and transactions.
-- data_packages (bundle catalog) are NOT deleted.
-- =============================================================================

-- 1. Delete all transactions (they reference profiles)
DELETE FROM public.transactions;

-- 2. Break profile self-reference (referred_by) so we can delete all profiles
UPDATE public.profiles SET referred_by = NULL;

-- 3. Delete all profiles (they reference auth.users)
DELETE FROM public.profiles;

-- 4. Delete all auth users (this removes every account)
DELETE FROM auth.users;

-- Done. All accounts and their data are removed. New signups will work from scratch.
