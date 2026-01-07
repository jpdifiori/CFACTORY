-- Migration: Add 'Carrusel' to content_type constraint
-- Date: 2026-01-07

-- 1. Drop the existing constraint
ALTER TABLE public.content_queue DROP CONSTRAINT IF EXISTS content_queue_content_type_check;

-- 2. Add the expanded constraint including 'Carrusel'
ALTER TABLE public.content_queue 
ADD CONSTRAINT content_queue_content_type_check 
CHECK (content_type IN (
    'Post', 
    'Reels', 
    'Story', 
    'Video', 
    'Landscape', 
    'Article', 
    'Carrusel',
    'Reel_Script', 
    'Blog_SEO', 
    'Push_Notification'
));
