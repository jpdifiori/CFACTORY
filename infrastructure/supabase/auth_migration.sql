-- SQL Migration: Multi-tenancy & Auth
-- Run this in your Supabase SQL Editor

-- 1. Create Profile Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  account_type TEXT CHECK (account_type IN ('Person', 'Company')),
  company_name TEXT,
  industry TEXT,
  job_title TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Add user_id to existing tables
ALTER TABLE public.project_master ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.content_strategy ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.content_queue ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Update RLS Policies
-- First, drop anonymous policies (clean up any previous liberal policies)
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.project_master;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.content_strategy;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.campaigns;
DROP POLICY IF EXISTS "Allow all operations for anon" ON public.content_queue;

-- Create Secure Policies
CREATE POLICY "Users can manage their own projects" ON public.project_master FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own strategy" ON public.content_strategy FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own queue" ON public.content_queue FOR ALL USING (auth.uid() = user_id);

-- Profile specific policies
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
