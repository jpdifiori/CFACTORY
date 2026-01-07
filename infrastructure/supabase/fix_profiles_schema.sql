-- SQL Fix: Missing Columns in Profiles
-- Run this in your Supabase SQL Editor

-- 1. Ensure all expected columns exist in public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS account_type TEXT CHECK (account_type IN ('Person', 'Company')),
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Ensure RLS is enabled (safety check)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Force Refresh Schema Cache (if necessary)
-- Usually Supabase does this automatically on ALTER TABLE, 
-- but you can run this if the error persists:
-- NOTIFY pgrst, 'reload schema';
