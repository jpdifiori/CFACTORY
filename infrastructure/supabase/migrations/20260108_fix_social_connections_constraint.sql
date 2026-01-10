-- Add unique constraint for upsert functionality
ALTER TABLE social_connections
ADD CONSTRAINT social_connections_project_platform_id_key UNIQUE (project_id, platform, platform_id);
