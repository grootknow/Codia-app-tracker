-- Migration: Add timestamp precision for hour-level Gantt drag
-- Version: v12
-- Date: 2025-11-10

-- Step 1: Add new TIMESTAMP columns
ALTER TABLE tasks 
  ADD COLUMN start_datetime TIMESTAMP WITH TIME ZONE,
  ADD COLUMN due_datetime TIMESTAMP WITH TIME ZONE;

-- Step 2: Migrate existing DATE data to TIMESTAMP (set time to 00:00:00)
UPDATE tasks 
SET 
  start_datetime = start_date::TIMESTAMP WITH TIME ZONE,
  due_datetime = due_date::TIMESTAMP WITH TIME ZONE
WHERE start_date IS NOT NULL OR due_date IS NOT NULL;

-- Step 3: Drop old DATE columns (after verifying migration)
-- UNCOMMENT AFTER TESTING:
-- ALTER TABLE tasks DROP COLUMN start_date;
-- ALTER TABLE tasks DROP COLUMN due_date;

-- Step 4: Rename new columns to original names (after dropping old ones)
-- UNCOMMENT AFTER TESTING:
-- ALTER TABLE tasks RENAME COLUMN start_datetime TO start_date;
-- ALTER TABLE tasks RENAME COLUMN due_datetime TO due_date;

-- For now, keep both columns for safety
-- App will use start_datetime/due_datetime first, fallback to start_date/due_date

COMMENT ON COLUMN tasks.start_datetime IS 'Task start date and time with hour precision for Gantt drag';
COMMENT ON COLUMN tasks.due_datetime IS 'Task due date and time with hour precision for Gantt drag';
