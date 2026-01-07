-- Enable RLS on all core tables
ALTER TABLE project_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_strategy ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to ensure a clean slate
DROP POLICY IF EXISTS "Users can only see their own projects" ON project_master;
DROP POLICY IF EXISTS "Users can only insert their own projects" ON project_master;
DROP POLICY IF EXISTS "Users can only update their own projects" ON project_master;
DROP POLICY IF EXISTS "Users can only delete their own projects" ON project_master;

DROP POLICY IF EXISTS "Users can only see their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can only insert their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can only update their own campaigns" ON campaigns;
DROP POLICY IF EXISTS "Users can only delete their own campaigns" ON campaigns;

DROP POLICY IF EXISTS "Users can only see their own content" ON content_queue;
DROP POLICY IF EXISTS "Users can only insert their own content" ON content_queue;
DROP POLICY IF EXISTS "Users can only update their own content" ON content_queue;
DROP POLICY IF EXISTS "Users can only delete their own content" ON content_queue;

-- project_master Policies
CREATE POLICY "Users can only see their own projects" ON project_master
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own projects" ON project_master
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own projects" ON project_master
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own projects" ON project_master
    FOR DELETE USING (auth.uid() = user_id);

-- campaigns Policies
CREATE POLICY "Users can only see their own campaigns" ON campaigns
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own campaigns" ON campaigns
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own campaigns" ON campaigns
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own campaigns" ON campaigns
    FOR DELETE USING (auth.uid() = user_id);

-- content_queue Policies
CREATE POLICY "Users can only see their own content" ON content_queue
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own content" ON content_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own content" ON content_queue
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own content" ON content_queue
    FOR DELETE USING (auth.uid() = user_id);

-- content_strategy Policies
CREATE POLICY "Users can only see their own strategy" ON content_strategy
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can only insert their own strategy" ON content_strategy
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can only update their own strategy" ON content_strategy
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can only delete their own strategy" ON content_strategy
    FOR DELETE USING (auth.uid() = user_id);
