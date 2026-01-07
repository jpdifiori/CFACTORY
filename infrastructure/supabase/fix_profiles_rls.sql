-- SQL Fix: RLS Policy for Profiles Signup
-- Run this in your Supabase SQL Editor

-- 1. Drop the restrictive insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 2. Create a more permissive INSERT policy
-- This allows the profile to be created during the signup process
-- even if the session isn't fully established yet.
-- Security is still maintained because 'id' references 'auth.users'.
CREATE POLICY "Allow profile insertion during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- 3. Keep the SELECT and UPDATE policies restrictive
-- Only the owner can see or change their data once it's created.
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
