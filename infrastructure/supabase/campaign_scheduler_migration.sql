-- SQL Migration: Campaign Engine & Scheduler Upgrades
-- Run this in your Supabase SQL Editor

-- 1. Update Campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS duration_type TEXT DEFAULT 'Mensual' CHECK (duration_type IN ('Mensual', 'Trimestral', 'Anual')),
ADD COLUMN IF NOT EXISTS strategic_objective TEXT;

-- 2. Update Content Queue table
ALTER TABLE public.content_queue 
ADD COLUMN IF NOT EXISTS angle_type TEXT;

-- 3. Update Profiles table for user-level schedule configuration
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS schedule_config JSONB DEFAULT '{
  "workdays": { "count": 1, "hours": ["09:00"] },
  "weekends": { "count": 1, "hours": ["12:00"] }
}'::jsonb;

-- Comment: schedule_config stores the posting rhythm preferences.
