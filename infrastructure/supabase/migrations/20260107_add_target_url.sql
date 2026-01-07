-- Add target_url to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_url TEXT;

-- Update content_queue to optionally store the landing URL if needed, 
-- but usually campaign-level is enough.
