-- PRODUCTION-READY SCHEMA FIXES
-- Purpose: Make database truly practical for real project management
-- Date: Nov 9, 2025

-- ========================================
-- 1. ADD BASELINE COLUMNS (Plan vs Actual)
-- ========================================
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_start_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_end_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS baseline_hours DECIMAL(10,2);

-- Populate baseline from current values (initial plan)
UPDATE tasks 
SET baseline_start_date = start_date,
    baseline_end_date = due_date,
    baseline_hours = estimated_hours
WHERE start_date IS NOT NULL 
  AND baseline_start_date IS NULL;

-- ========================================
-- 2. ADD BLOCKING_DEPENDENCIES (Standardize)
-- ========================================
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocking_dependencies JSONB DEFAULT '[]'::jsonb;

-- Migrate depends_on to blocking_dependencies
UPDATE tasks 
SET blocking_dependencies = depends_on
WHERE depends_on IS NOT NULL 
  AND blocking_dependencies = '[]'::jsonb;

-- ========================================
-- 3. ADD PRACTICAL WORK MANAGEMENT FIELDS
-- ========================================

-- Time tracking
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_spent_hours DECIMAL(10,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_worked_at TIMESTAMP;

-- Blocking & Issues
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocker_resolved_at TIMESTAMP;

-- Quality & Review
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5);

-- Effort & Complexity (Real estimation)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS story_points INTEGER;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_complexity TEXT CHECK (actual_complexity IN ('trivial', 'easy', 'medium', 'hard', 'expert'));

-- Recurrence (Recurring tasks)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT; -- 'daily', 'weekly', 'monthly'
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS next_recurrence_date DATE;

-- Tags & Categories (Better organization)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- ========================================
-- 4. ADD INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_phase_id ON tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_blocked ON tasks(is_blocked);
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- ========================================
-- 5. ADD VIEWS FOR COMMON QUERIES
-- ========================================

-- Active tasks (not done, not blocked)
CREATE OR REPLACE VIEW active_tasks AS
SELECT * FROM tasks
WHERE status != 'DONE' 
  AND (is_blocked = false OR is_blocked IS NULL)
ORDER BY priority DESC, due_date ASC;

-- Blocked tasks (need attention)
CREATE OR REPLACE VIEW blocked_tasks AS
SELECT * FROM tasks
WHERE is_blocked = true
ORDER BY created_at DESC;

-- Overdue tasks (critical)
CREATE OR REPLACE VIEW overdue_tasks AS
SELECT * FROM tasks
WHERE status != 'DONE'
  AND due_date < CURRENT_DATE
ORDER BY due_date ASC;

-- Tasks needing review
CREATE OR REPLACE VIEW review_queue AS
SELECT * FROM tasks
WHERE needs_review = true
  AND reviewed_at IS NULL
ORDER BY completed_at DESC;

-- My tasks (for current user - placeholder)
CREATE OR REPLACE VIEW my_tasks AS
SELECT * FROM tasks
WHERE assigned_type = 'HUMAN'
  AND status != 'DONE'
ORDER BY priority DESC, due_date ASC;

-- ========================================
-- 6. ADD TRIGGERS FOR AUTOMATION
-- ========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-set completed_at when status = DONE
CREATE OR REPLACE FUNCTION auto_set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'DONE' AND OLD.status != 'DONE' THEN
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS auto_complete_tasks ON tasks;
CREATE TRIGGER auto_complete_tasks
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_completed_at();

-- Auto-set started_at when status changes to IN_PROGRESS
CREATE OR REPLACE FUNCTION auto_set_started_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'IN_PROGRESS' AND OLD.status = 'PENDING' AND NEW.started_at IS NULL THEN
        NEW.started_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS auto_start_tasks ON tasks;
CREATE TRIGGER auto_start_tasks
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION auto_set_started_at();

-- ========================================
-- 7. ADD COMMENTS FOR DOCUMENTATION
-- ========================================
COMMENT ON COLUMN tasks.baseline_start_date IS 'Original planned start date (for variance analysis)';
COMMENT ON COLUMN tasks.baseline_end_date IS 'Original planned end date (for variance analysis)';
COMMENT ON COLUMN tasks.baseline_hours IS 'Original estimated hours (for effort variance)';
COMMENT ON COLUMN tasks.time_spent_hours IS 'Actual time spent on task (for time tracking)';
COMMENT ON COLUMN tasks.is_blocked IS 'Whether task is blocked by external factors';
COMMENT ON COLUMN tasks.blocked_reason IS 'Reason why task is blocked';
COMMENT ON COLUMN tasks.needs_review IS 'Whether completed task needs review/approval';
COMMENT ON COLUMN tasks.quality_score IS 'Quality rating 1-5 after review';
COMMENT ON COLUMN tasks.story_points IS 'Agile story points for effort estimation';
COMMENT ON COLUMN tasks.tags IS 'Flexible tags for categorization and filtering';

-- ========================================
-- VERIFICATION
-- ========================================
SELECT 'Schema migration completed successfully!' as status;
SELECT COUNT(*) as total_tasks FROM tasks;
SELECT COUNT(*) as tasks_with_baseline FROM tasks WHERE baseline_start_date IS NOT NULL;
SELECT COUNT(*) as blocked_tasks FROM tasks WHERE is_blocked = true;
