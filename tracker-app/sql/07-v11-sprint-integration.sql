-- 07-v11-sprint-integration.sql

-- 1. Create the sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project_id UUID -- Assuming a multi-project setup in the future
);

-- 2. Add sprint_id to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL;

-- 3. Add some initial sample sprints for development
INSERT INTO sprints (name, start_date, end_date)
VALUES
  ('Sprint 1: Foundation', '2025-11-01 00:00:00+07', '2025-11-14 23:59:59+07'),
  ('Sprint 2: Gantt UX', '2025-11-15 00:00:00+07', '2025-11-28 23:59:59+07'),
  ('Sprint 3: AI Integration', '2025-11-29 00:00:00+07', '2025-12-12 23:59:59+07');

-- 4. Create a view to easily get tasks with sprint info
CREATE OR REPLACE VIEW tasks_with_sprints AS
SELECT 
  t.*,
  s.name as sprint_name,
  s.start_date as sprint_start_date,
  s.end_date as sprint_end_date
FROM tasks t
LEFT JOIN sprints s ON t.sprint_id = s.id;

-- Notify Supabase of the new view
NOTIFY pgrst, 'reload schema';
