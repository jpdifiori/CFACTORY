-- Migration: Re-enable RLS for content_blocks with robust policy
-- This fix ensures that the 42501 error remains resolved while maintaining security.

-- 1. Re-enable RLS
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can manage blocks of their projects" ON public.content_blocks;
DROP POLICY IF EXISTS "content_blocks_select_policy" ON public.content_blocks;
DROP POLICY IF EXISTS "content_blocks_insert_policy" ON public.content_blocks;
DROP POLICY IF EXISTS "content_blocks_update_policy" ON public.content_blocks;
DROP POLICY IF EXISTS "content_blocks_delete_policy" ON public.content_blocks;

-- 3. Create a single, explicit policy for all operations
-- Using explicit table aliases to avoid any ambiguity during EXISTS subquery
CREATE POLICY "content_blocks_owner_policy"
    ON public.content_blocks
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.premium_content_projects p
            WHERE p.id = content_blocks.project_id 
            AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.premium_content_projects p
            WHERE p.id = content_blocks.project_id 
            AND p.user_id = auth.uid()
        )
    );

-- 4. Ensure Service Role still has bypass (it usually does automatically, but good to be explicit)
ALTER TABLE public.content_blocks FORCE ROW LEVEL SECURITY;

-- 5. Final Grant confirmation
GRANT ALL ON TABLE public.content_blocks TO authenticated, service_role;
