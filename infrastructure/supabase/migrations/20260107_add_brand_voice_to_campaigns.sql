-- Migration to add brand_voice to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS brand_voice text;

-- Add a comment to describe the column
COMMENT ON COLUMN campaigns.brand_voice IS 'Override for the project global brand voice at the campaign level.';
