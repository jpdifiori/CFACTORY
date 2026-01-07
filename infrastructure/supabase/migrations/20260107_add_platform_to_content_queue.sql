-- Add social_platform column to content_queue
ALTER TABLE content_queue ADD COLUMN IF NOT EXISTS social_platform TEXT;

-- Update existing records to have a default value if needed (optional)
-- UPDATE content_queue SET social_platform = 'Instagram' WHERE social_platform IS NULL;
