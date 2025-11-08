-- Create sprints table for Scrum workflow
CREATE TABLE IF NOT EXISTS sprints (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal TEXT,
  planned_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add sprint_id to tasks table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'sprint_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN sprint_id BIGINT REFERENCES sprints(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster sprint queries
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprints_dates ON sprints(start_date, end_date);

-- Create function to update sprint stats
CREATE OR REPLACE FUNCTION update_sprint_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update planned_tasks count
  UPDATE sprints
  SET planned_tasks = (
    SELECT COUNT(*) FROM tasks WHERE sprint_id = NEW.sprint_id
  )
  WHERE id = NEW.sprint_id;
  
  -- Update completed_tasks count
  UPDATE sprints
  SET completed_tasks = (
    SELECT COUNT(*) FROM tasks WHERE sprint_id = NEW.sprint_id AND status = 'DONE'
  )
  WHERE id = NEW.sprint_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update sprint stats
DROP TRIGGER IF EXISTS trigger_update_sprint_stats ON tasks;
CREATE TRIGGER trigger_update_sprint_stats
AFTER INSERT OR UPDATE OF sprint_id, status ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_sprint_stats();

-- Grant permissions
GRANT ALL ON sprints TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE sprints_id_seq TO anon, authenticated;

COMMENT ON TABLE sprints IS 'Scrum sprints for agile workflow planning';
COMMENT ON COLUMN sprints.name IS 'Sprint name (e.g., Sprint 2025-01-15)';
COMMENT ON COLUMN sprints.goal IS 'Sprint goal - what we want to achieve';
COMMENT ON COLUMN sprints.planned_tasks IS 'Number of tasks planned for this sprint';
COMMENT ON COLUMN sprints.completed_tasks IS 'Number of tasks completed in this sprint';
