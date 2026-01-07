-- Migration: Update content_queue content_type constraint to support new platform types
-- Date: 2026-01-07

-- 1. Drop the existing restricted constraint
ALTER TABLE public.content_queue DROP CONSTRAINT IF EXISTS content_queue_content_type_check;

-- 2. Add the expanded constraint including all types used in the Generation Hub
ALTER TABLE public.content_queue 
ADD CONSTRAINT content_queue_content_type_check 
CHECK (content_type IN (
    'Post', 
    'Reels', 
    'Story', 
    'Video', 
    'Landscape', 
    'Article', 
    'Reel_Script', 
    'Blog_SEO', 
    'Push_Notification'
));

-- 3. Ensure permissions are correct
GRANT ALL ON TABLE public.content_queue TO authenticated, service_role;
