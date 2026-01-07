-- SQL for Supabase SQL Editor (V2 - Safe Version)
-- Use this if the previous version gave "must be owner of table objects" error.

-- 1. Ensure the bucket exists and is public
-- If this fails, you can do it manually in the "Storage" tab -> "New Bucket" (name: project-images, public: true)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. CREATE POLICIES (Skip ALTER TABLE)
-- These commands only create policies if they don't already exist.

-- Policy: Allow authenticated users to UPLOAD (INSERT) images
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Allow authenticated uploads to project-images'
    ) THEN
        CREATE POLICY "Allow authenticated uploads to project-images"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'project-images');
    END IF;
END $$;

-- Policy: Allow public viewing of project-images
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Allow public viewing of project-images'
    ) THEN
        CREATE POLICY "Allow public viewing of project-images"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'project-images');
    END IF;
END $$;

-- Policy: Allow authenticated updates
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND policyname = 'Allow authenticated updates to project-images'
    ) THEN
        CREATE POLICY "Allow authenticated updates to project-images"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'project-images');
    END IF;
END $$;

/* 
  ALTERNATIVE: MANUAL FIX VIA UI (FOOLPROOF)
  If the SQL above still fails, follow these steps in the Supabase Dashboard:
  
  1. Go to "Storage" -> Select "project-images" (create it if it doesn't exist).
  2. Click "Configuration" -> "Policies".
  3. Under "Other policies under storage.objects", click "New policy".
  4. Choose "For full customization".
  5. Policy Name: "Allow Uploads"
     - Allowed Operations: INSERT
     - Target Role: authenticated
     - WITH CHECK: bucket_id = 'project-images'
  6. Create another policy: "Allow Select"
     - Allowed Operations: SELECT
     - Target Role: public
     - USING expression: bucket_id = 'project-images'
*/
