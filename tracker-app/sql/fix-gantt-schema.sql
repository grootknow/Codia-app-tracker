-- ============================================================================
-- FIX GANTT CHART PRO - Add missing columns and sample data
-- ============================================================================

-- 1. Add baseline columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_start_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_end_date DATE;

-- 2. Add blocking_dependencies column (for Gantt Pro)
-- Note: depends_on and blocked_by exist but Gantt Pro uses blocking_dependencies
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocking_dependencies JSONB DEFAULT '[]'::jsonb;

-- 3. Spread tasks across different dates (fix stacking issue)
-- Sample: Spread first 20 tasks across 20 days
WITH numbered_tasks AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM tasks
  LIMIT 20
)
UPDATE tasks t
SET 
  start_date = CURRENT_DATE + ((nt.rn - 1) * INTERVAL '1 day'),
  due_date = CURRENT_DATE + ((nt.rn - 1) * INTERVAL '1 day') + INTERVAL '3 days'
FROM numbered_tasks nt
WHERE t.id = nt.id;

-- 4. Add sample dependencies (create a chain)
-- Task 2 depends on Task 1, Task 3 depends on Task 2, etc.
WITH numbered_tasks AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn
  FROM tasks
  LIMIT 10
)
UPDATE tasks t
SET blocking_dependencies = jsonb_build_array(prev.id)
FROM numbered_tasks nt
JOIN numbered_tasks prev ON prev.rn = nt.rn - 1
WHERE t.id = nt.id AND nt.rn > 1;

-- 5. Set baseline for first 5 tasks (for baseline comparison demo)
WITH first_tasks AS (
  SELECT id, start_date, due_date
  FROM tasks
  WHERE start_date IS NOT NULL
  LIMIT 5
)
UPDATE tasks t
SET 
  baseline_start_date = ft.start_date,
  baseline_end_date = ft.due_date
FROM first_tasks ft
WHERE t.id = ft.id;

-- 6. Verify changes
SELECT 
  COUNT(*) as total_tasks,
  COUNT(DISTINCT start_date) as unique_dates,
  COUNT(*) FILTER (WHERE baseline_start_date IS NOT NULL) as with_baseline,
  COUNT(*) FILTER (WHERE jsonb_array_length(blocking_dependencies) > 0) as with_dependencies
FROM tasks;

-- Expected output:
-- total_tasks | unique_dates | with_baseline | with_dependencies
-- -----------|--------------|---------------|------------------
--     20+    |     20+      |       5       |        9
