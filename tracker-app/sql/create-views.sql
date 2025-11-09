-- ============================================================================
-- CODIA TRACKER - DATABASE VIEWS
-- Fix: Create missing views that app depends on
-- ============================================================================

-- View 1: tasks_with_dependencies
-- Combines tasks with their phase info and dependencies
CREATE OR REPLACE VIEW tasks_with_dependencies AS
SELECT 
  t.*,
  p.name as phase_name,
  p.week_start,
  p.week_end,
  p.color as phase_color,
  -- Count dependencies
  CASE 
    WHEN t.blocking_dependencies IS NOT NULL 
    THEN array_length(t.blocking_dependencies, 1)
    ELSE 0
  END as dependency_count
FROM tasks t
LEFT JOIN phases p ON t.phase_id = p.id
ORDER BY t.phase_id, t.order_index;

-- View 2: tracker_app_data  
-- Main view for dashboard - combines all data
CREATE OR REPLACE VIEW tracker_app_data AS
SELECT 
  t.id,
  t.task_id,
  t.name,
  t.description,
  t.status,
  t.execution_status,
  t.phase_id,
  t.week,
  t.order_index,
  t.estimated_hours,
  t.actual_hours,
  t.progress_percentage,
  t.priority,
  t.assignee,
  t.start_date,
  t.due_date,
  t.started_at,
  t.completed_at,
  t.blocking_dependencies,
  t.notes,
  t.tags,
  t.created_at,
  t.updated_at,
  -- Phase info
  p.name as phase_name,
  p.week_start,
  p.week_end,
  p.status as phase_status,
  p.progress as phase_progress,
  p.color as phase_color,
  -- Computed fields
  CASE 
    WHEN t.status = 'DONE' THEN 'completed'
    WHEN t.status = 'IN_PROGRESS' THEN 'active'
    WHEN t.execution_status = 'BLOCKED' THEN 'blocked'
    ELSE 'pending'
  END as computed_status,
  -- Days info
  CASE 
    WHEN t.start_date IS NOT NULL AND t.due_date IS NOT NULL 
    THEN EXTRACT(DAY FROM (t.due_date - t.start_date))
    WHEN t.estimated_hours IS NOT NULL
    THEN CEIL(t.estimated_hours / 8.0)
    ELSE 3
  END as estimated_days,
  -- Is overdue
  CASE 
    WHEN t.due_date IS NOT NULL AND t.status != 'DONE' AND t.due_date < CURRENT_DATE
    THEN true
    ELSE false
  END as is_overdue,
  -- Sprint info (if exists)
  s.id as sprint_id,
  s.name as sprint_name,
  s.start_date as sprint_start,
  s.end_date as sprint_end
FROM tasks t
LEFT JOIN phases p ON t.phase_id = p.id
LEFT JOIN sprint_tasks st ON t.id = st.task_id
LEFT JOIN sprints s ON st.sprint_id = s.id
ORDER BY t.phase_id, t.order_index;

-- View 3: phase_progress_summary
-- Aggregate progress by phase
CREATE OR REPLACE VIEW phase_progress_summary AS
SELECT 
  p.id as phase_id,
  p.name as phase_name,
  p.week_start,
  p.week_end,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 END) as in_progress_tasks,
  COUNT(CASE WHEN t.status = 'PENDING' THEN 1 END) as pending_tasks,
  COUNT(CASE WHEN t.execution_status = 'BLOCKED' THEN 1 END) as blocked_tasks,
  ROUND(
    (COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(t.id), 0) * 100), 
    1
  ) as completion_percentage,
  SUM(t.estimated_hours) as total_estimated_hours,
  SUM(t.actual_hours) as total_actual_hours
FROM phases p
LEFT JOIN tasks t ON p.id = t.phase_id
GROUP BY p.id, p.name, p.week_start, p.week_end
ORDER BY p.order_index;

-- View 4: sprint_progress_summary
-- Aggregate progress by sprint
CREATE OR REPLACE VIEW sprint_progress_summary AS
SELECT 
  s.id as sprint_id,
  s.name as sprint_name,
  s.start_date,
  s.end_date,
  s.status as sprint_status,
  COUNT(st.task_id) as total_tasks,
  COUNT(CASE WHEN t.status = 'DONE' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.status = 'IN_PROGRESS' THEN 1 END) as in_progress_tasks,
  ROUND(
    (COUNT(CASE WHEN t.status = 'DONE' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(st.task_id), 0) * 100), 
    1
  ) as completion_percentage,
  SUM(t.estimated_hours) as total_estimated_hours,
  SUM(t.actual_hours) as total_actual_hours
FROM sprints s
LEFT JOIN sprint_tasks st ON s.id = st.sprint_id
LEFT JOIN tasks t ON st.task_id = t.id
GROUP BY s.id, s.name, s.start_date, s.end_date, s.status
ORDER BY s.start_date;

-- View 5: today_focus_tasks
-- Tasks that should be worked on today
CREATE OR REPLACE VIEW today_focus_tasks AS
SELECT 
  t.*,
  p.name as phase_name,
  p.color as phase_color,
  CASE 
    WHEN t.due_date < CURRENT_DATE THEN 'overdue'
    WHEN t.due_date = CURRENT_DATE THEN 'due_today'
    WHEN t.status = 'IN_PROGRESS' THEN 'active'
    WHEN t.execution_status = 'READY' AND t.status = 'PENDING' THEN 'ready'
    ELSE 'upcoming'
  END as focus_priority
FROM tasks t
LEFT JOIN phases p ON t.phase_id = p.id
WHERE 
  t.status != 'DONE'
  AND (
    t.status = 'IN_PROGRESS'
    OR t.due_date <= CURRENT_DATE + INTERVAL '3 days'
    OR (t.execution_status = 'READY' AND t.status = 'PENDING')
  )
ORDER BY 
  CASE 
    WHEN t.due_date < CURRENT_DATE THEN 1
    WHEN t.due_date = CURRENT_DATE THEN 2
    WHEN t.status = 'IN_PROGRESS' THEN 3
    ELSE 4
  END,
  t.priority DESC,
  t.due_date ASC
LIMIT 10;

-- Grant permissions
GRANT SELECT ON tasks_with_dependencies TO anon, authenticated;
GRANT SELECT ON tracker_app_data TO anon, authenticated;
GRANT SELECT ON phase_progress_summary TO anon, authenticated;
GRANT SELECT ON sprint_progress_summary TO anon, authenticated;
GRANT SELECT ON today_focus_tasks TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All views created successfully!';
  RAISE NOTICE '📊 Views: tasks_with_dependencies, tracker_app_data, phase_progress_summary, sprint_progress_summary, today_focus_tasks';
END $$;
