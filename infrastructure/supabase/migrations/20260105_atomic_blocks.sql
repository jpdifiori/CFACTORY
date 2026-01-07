-- Migration: Atomic Block System for MassGenix Premium Content OS

-- 1. Create content_blocks table
CREATE TABLE IF NOT EXISTS public.content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    project_id UUID REFERENCES public.premium_content_projects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.content_chapters(id) ON DELETE CASCADE,
    index INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Hero', 'FeatureSplit', 'MultiColumn', 'Quote', 'DeepText', 'CTA', 'Gallery')),
    content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    image_url TEXT,
    html_override TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Generating', 'Completed', 'Error'))
);

-- 2. Add design_config to premium_content_projects if it doesn't exist (already there from previous prototype but ensuring)
-- ALTER TABLE public.premium_content_projects ADD COLUMN IF NOT EXISTS design_config JSONB DEFAULT '{}'::jsonb;

-- 3. Add token_cost and marketplace_meta to premium_content_projects
ALTER TABLE public.premium_content_projects 
ADD COLUMN IF NOT EXISTS token_cost INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS marketplace_meta JSONB DEFAULT '{}'::jsonb;

-- 4. DISABLE RLS for debugging (confirming if it's an RLS issue)
ALTER TABLE public.content_blocks DISABLE ROW LEVEL SECURITY;

-- 5. Full Grants to all roles
GRANT ALL ON TABLE public.content_blocks TO anon, authenticated, postgres, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 6. Indices for performance
CREATE INDEX IF NOT EXISTS idx_content_blocks_project_id ON public.content_blocks(project_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_chapter_id ON public.content_blocks(chapter_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_index ON public.content_blocks(index);
