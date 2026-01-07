-- Migration: Add SmartText Overlay fields to content systems
-- Tables: content_queue, content_blocks

-- 1. Update content_queue (Campaign Posts)
ALTER TABLE public.content_queue 
ADD COLUMN IF NOT EXISTS overlay_text_content TEXT,
ADD COLUMN IF NOT EXISTS overlay_style_json JSONB DEFAULT '{}'::jsonb;

-- 2. Update content_blocks (Premium Studio Blocks)
ALTER TABLE public.content_blocks
ADD COLUMN IF NOT EXISTS overlay_text_content TEXT,
ADD COLUMN IF NOT EXISTS overlay_style_json JSONB DEFAULT '{}'::jsonb;

-- 3. Update RLS/Grants (Ensuring visibility)
GRANT ALL ON TABLE public.content_queue TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.content_blocks TO anon, authenticated, postgres, service_role;
