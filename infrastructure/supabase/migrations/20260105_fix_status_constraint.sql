-- Migration: Update content_blocks status constraint
-- Adding 'ProcessingImage' to the allowed statuses

-- 1. Drop existing constraint
ALTER TABLE public.content_blocks DROP CONSTRAINT IF EXISTS content_blocks_status_check;

-- 2. Add updated constraint
ALTER TABLE public.content_blocks 
ADD CONSTRAINT content_blocks_status_check 
CHECK (status IN ('Pending', 'Generating', 'Completed', 'Error', 'ProcessingImage'));

-- 3. Confirm RLS and Permissions are still active (just in case)
GRANT ALL ON TABLE public.content_blocks TO authenticated, service_role;
