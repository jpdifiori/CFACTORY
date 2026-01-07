-- Premium Forge: Database Schema Updates

-- 1. Create premium_content_projects table
CREATE TABLE IF NOT EXISTS public.premium_content_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    project_id UUID REFERENCES public.project_master(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ebook', 'blog', 'whitepaper')),
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Generating', 'Completed', 'Error')),
    theme_id TEXT NOT NULL DEFAULT 'saas_modern',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Create content_chapters table
CREATE TABLE IF NOT EXISTS public.content_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    premium_project_id UUID REFERENCES public.premium_content_projects(id) ON DELETE CASCADE,
    chapter_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    content_markdown TEXT,
    content_html TEXT,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Generating', 'Completed', 'Error')),
    summary TEXT -- Used for context injection in sequential generation
);

-- 3. Create html_templates table (Optional: could also be a static config, but table allows dynamic updates)
CREATE TABLE IF NOT EXISTS public.html_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    css_variables_json JSONB NOT NULL,
    html_structure_wrapper TEXT NOT NULL, -- The base HTML with Tailwind classes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.premium_content_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.html_templates ENABLE ROW LEVEL SECURITY;

-- 5. Policies for premium_content_projects
CREATE POLICY "Users can manage their own premium projects"
    ON public.premium_content_projects
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Policies for content_chapters
CREATE POLICY "Users can manage chapters of their projects"
    ON public.content_chapters
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.premium_content_projects p
            WHERE p.id = premium_project_id AND p.user_id = auth.uid()
        )
    );

-- 7. Policies for html_templates (Read-only for all authenticated users)
CREATE POLICY "Templates are readable by all authenticated users"
    ON public.html_templates
    FOR SELECT
    TO authenticated
    USING (true);

-- 8. Storage bucket for Premium Forge PDFs
-- (Assuming the bucket creation via SQL might require higher privileges, 
-- but we include the policy just in case. Usually created via UI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('premium-forge-docs', 'premium-forge-docs', true);

CREATE POLICY "Authenticated users can upload PDFs"
    ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'premium-forge-docs');

CREATE POLICY "Public can view PDFs"
    ON storage.objects FOR SELECT TO public USING (bucket_id = 'premium-forge-docs');
