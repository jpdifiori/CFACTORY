-- Create platform enum
DO $$ BEGIN
    CREATE TYPE social_platform AS ENUM ('instagram', 'facebook', 'linkedin', 'twitter', 'tiktok');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create connection status enum
DO $$ BEGIN
    CREATE TYPE connection_status AS ENUM ('active', 'expired', 'error');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create social_connections table
CREATE TABLE IF NOT EXISTS social_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES project_master(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform social_platform NOT NULL,
    account_name TEXT,
    platform_id TEXT,
    encrypted_token TEXT NOT NULL,
    token_expiry TIMESTAMP WITH TIME ZONE,
    status connection_status DEFAULT 'active',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add safety_zones to project_master
ALTER TABLE project_master ADD COLUMN IF NOT EXISTS safety_zones JSONB DEFAULT '{}'::jsonb;

-- Enable RLS
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own project connections"
    ON social_connections FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own project connections"
    ON social_connections FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own project connections"
    ON social_connections FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own project connections"
    ON social_connections FOR DELETE
    USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_connections_updated_at
    BEFORE UPDATE ON social_connections
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
