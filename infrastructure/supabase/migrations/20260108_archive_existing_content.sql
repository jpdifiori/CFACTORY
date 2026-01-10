-- Update the status of all existing content in the queue to 'Published'
-- This prevents the n8n workflow from picking up old/legacy content.

UPDATE content_queue
SET status = 'Published'
WHERE status != 'Published';
