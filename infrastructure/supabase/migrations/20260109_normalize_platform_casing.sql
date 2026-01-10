-- Migration: Normalize Platform Casing to Lowercase
-- Description: Updates existing records to ensure platform names are consistent (lowercase) for n8n integration.

-- 1. Update content_queue
UPDATE content_queue 
SET social_platform = LOWER(social_platform::text)
WHERE social_platform IS NOT NULL;

-- 2. Update social_connections
UPDATE social_connections 
SET platform = LOWER(platform::text)::social_platform
WHERE platform IS NOT NULL;
