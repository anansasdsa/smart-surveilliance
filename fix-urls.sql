-- Fix the URLs in theft_alerts table by removing trailing question marks
-- This will fix the 400 errors when trying to display images

UPDATE theft_alerts 
SET snapshot_path = TRIM(TRAILING '?' FROM snapshot_path)
WHERE snapshot_path LIKE '%?';

-- Verify the fix
SELECT id, snapshot_path FROM theft_alerts ORDER BY timestamp DESC; 