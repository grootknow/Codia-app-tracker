-- ============================================
-- COMPLETE AI-DRIVEN TRACKER DATABASE SCHEMA
-- No hardcode, all data-driven, fully connected
-- ============================================

-- ============================================
-- 1. SPRINTS TABLE (Scrum Workflow)
-- ============================================
CREATE TABLE IF NOT EXISTS sprints (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  goal TEXT,
  status TEXT DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  planned_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  total_estimated_hours DECIMAL(10,2) DEFAULT 0,
  total_actual_hours DECIMAL(10,2) DEFAULT 0,
  velocity DECIMAL(10,2), -- Tasks completed / duration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add sprint_id to tasks if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'sprint_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN sprint_id BIGINT REFERENCES sprints(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_dates ON sprints(start_date, end_date);

-- ============================================
-- 2. AI ANALYSIS RESULTS (Persistent AI Insights)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_analysis_results (
  id BIGSERIAL PRIMARY KEY,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('CRITICAL_PATH', 'VELOCITY', 'RISK', 'COMPLETION_ESTIMATE')),
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Critical Path Analysis
  critical_path_tasks INTEGER[], -- Array of task IDs on critical path
  critical_path_duration_hours DECIMAL(10,2),
  critical_path_duration_days DECIMAL(10,2),
  
  -- Velocity Analysis
  velocity_tasks_per_day DECIMAL(10,2),
  velocity_hours_per_day DECIMAL(10,2),
  velocity_trend TEXT CHECK (velocity_trend IN ('UP', 'STABLE', 'DOWN')),
  velocity_calculation_period_days INTEGER,
  
  -- Completion Estimate
  estimated_completion_date DATE,
  estimated_days_remaining INTEGER,
  confidence_level TEXT CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),
  
  -- Full analysis data (JSON)
  full_analysis JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_type_date ON ai_analysis_results(analysis_type, analysis_date DESC);

-- ============================================
-- 3. AI IDENTIFIED RISKS (Dynamic Risk Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_risks (
  id BIGSERIAL PRIMARY KEY,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('BLOCKED_TASKS', 'HIGH_COMPLEXITY', 'STUCK_TASKS', 'DEPENDENCY_CHAIN', 'RESOURCE_OVERLOAD')),
  severity TEXT NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'IGNORED')),
  
  -- Risk details
  title TEXT NOT NULL,
  description TEXT,
  affected_task_ids INTEGER[],
  affected_task_count INTEGER,
  
  -- Impact
  estimated_delay_days DECIMAL(10,2),
  impact_description TEXT,
  
  -- Resolution
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  resolution_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_risks_status ON ai_risks(status);
CREATE INDEX IF NOT EXISTS idx_ai_risks_severity ON ai_risks(severity);
CREATE INDEX IF NOT EXISTS idx_ai_risks_type ON ai_risks(risk_type);

-- ============================================
-- 4. AI RECOMMENDATIONS (Actionable Suggestions)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id BIGSERIAL PRIMARY KEY,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('CRITICAL_PATH', 'UNBLOCK', 'WORKLOAD_BALANCE', 'SPRINT_PLANNING', 'RESOURCE_ALLOCATION')),
  priority TEXT NOT NULL CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPLIED', 'REJECTED', 'EXPIRED')),
  
  -- Recommendation details
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action TEXT NOT NULL, -- What action to take
  impact_description TEXT,
  
  -- Related data
  suggested_task_ids INTEGER[],
  suggested_changes JSONB, -- Specific changes to apply
  
  -- Application tracking
  applied_at TIMESTAMP WITH TIME ZONE,
  applied_by TEXT,
  application_result JSONB,
  
  -- Rejection tracking
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by TEXT,
  rejection_reason TEXT,
  
  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority ON ai_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(recommendation_type);

-- ============================================
-- 5. HUMAN FEEDBACK (Training AI)
-- ============================================
CREATE TABLE IF NOT EXISTS human_feedback (
  id BIGSERIAL PRIMARY KEY,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('RECOMMENDATION', 'RISK_ASSESSMENT', 'SPRINT_SUGGESTION', 'TASK_PRIORITY')),
  
  -- What was AI's suggestion
  ai_suggestion_id BIGINT, -- References ai_recommendations.id or ai_risks.id
  ai_suggestion_data JSONB,
  
  -- What Human did
  human_action TEXT NOT NULL CHECK (human_action IN ('ACCEPTED', 'REJECTED', 'MODIFIED', 'IGNORED')),
  human_changes JSONB, -- What Human changed
  
  -- Feedback details
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_comment TEXT,
  
  -- Context
  task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
  sprint_id BIGINT REFERENCES sprints(id) ON DELETE SET NULL,
  
  -- Tracking
  created_by TEXT NOT NULL, -- 'FOUNDER', 'AI_AGENT', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_human_feedback_type ON human_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_human_feedback_action ON human_feedback(human_action);
CREATE INDEX IF NOT EXISTS idx_human_feedback_rating ON human_feedback(feedback_rating);

-- ============================================
-- 6. AI LEARNING METRICS (Track AI Improvement)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_learning_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('RECOMMENDATION_ACCURACY', 'RISK_PREDICTION', 'SPRINT_SUGGESTION', 'VELOCITY_FORECAST')),
  
  -- Metrics
  total_suggestions INTEGER DEFAULT 0,
  accepted_suggestions INTEGER DEFAULT 0,
  rejected_suggestions INTEGER DEFAULT 0,
  modified_suggestions INTEGER DEFAULT 0,
  
  -- Accuracy
  accuracy_percentage DECIMAL(5,2),
  avg_feedback_rating DECIMAL(3,2),
  
  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Detailed data
  metrics_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_learning_metrics_type ON ai_learning_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_ai_learning_metrics_period ON ai_learning_metrics(period_start, period_end);

-- ============================================
-- FUNCTIONS: Auto-update Sprint Stats
-- ============================================
CREATE OR REPLACE FUNCTION update_sprint_stats()
RETURNS TRIGGER AS $$
DECLARE
  sprint_record RECORD;
BEGIN
  -- Get sprint data
  SELECT id INTO sprint_record FROM sprints WHERE id = COALESCE(NEW.sprint_id, OLD.sprint_id);
  
  IF sprint_record.id IS NOT NULL THEN
    -- Update sprint statistics
    UPDATE sprints
    SET 
      planned_tasks = (
        SELECT COUNT(*) FROM tasks WHERE sprint_id = sprint_record.id
      ),
      completed_tasks = (
        SELECT COUNT(*) FROM tasks WHERE sprint_id = sprint_record.id AND status = 'DONE'
      ),
      total_estimated_hours = (
        SELECT COALESCE(SUM(estimated_hours), 0) FROM tasks WHERE sprint_id = sprint_record.id
      ),
      total_actual_hours = (
        SELECT COALESCE(SUM(actual_hours), 0) FROM tasks WHERE sprint_id = sprint_record.id
      ),
      updated_at = NOW()
    WHERE id = sprint_record.id;
    
    -- Calculate velocity if sprint is completed
    UPDATE sprints
    SET velocity = CASE 
      WHEN status = 'COMPLETED' AND (end_date - start_date) > 0 
      THEN completed_tasks::DECIMAL / (end_date - start_date + 1)
      ELSE NULL
    END
    WHERE id = sprint_record.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sprint_stats ON tasks;
CREATE TRIGGER trigger_update_sprint_stats
AFTER INSERT OR UPDATE OF sprint_id, status, estimated_hours, actual_hours ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_sprint_stats();

-- ============================================
-- FUNCTIONS: Log Human Feedback Automatically
-- ============================================
CREATE OR REPLACE FUNCTION log_recommendation_feedback()
RETURNS TRIGGER AS $$
BEGIN
  -- When recommendation status changes, log as feedback
  IF OLD.status = 'PENDING' AND NEW.status IN ('APPLIED', 'REJECTED') THEN
    INSERT INTO human_feedback (
      feedback_type,
      ai_suggestion_id,
      ai_suggestion_data,
      human_action,
      feedback_comment,
      created_by
    ) VALUES (
      'RECOMMENDATION',
      NEW.id,
      jsonb_build_object(
        'type', NEW.recommendation_type,
        'message', NEW.message,
        'suggested_task_ids', NEW.suggested_task_ids
      ),
      CASE WHEN NEW.status = 'APPLIED' THEN 'ACCEPTED' ELSE 'REJECTED' END,
      CASE WHEN NEW.status = 'REJECTED' THEN NEW.rejection_reason ELSE NULL END,
      COALESCE(NEW.applied_by, NEW.rejected_by, 'UNKNOWN')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_recommendation_feedback ON ai_recommendations;
CREATE TRIGGER trigger_log_recommendation_feedback
AFTER UPDATE OF status ON ai_recommendations
FOR EACH ROW
EXECUTE FUNCTION log_recommendation_feedback();

-- ============================================
-- VIEWS: Easy Data Access
-- ============================================

-- Active risks with task details
CREATE OR REPLACE VIEW active_risks_with_tasks AS
SELECT 
  r.*,
  array_agg(t.name) as affected_task_names
FROM ai_risks r
LEFT JOIN LATERAL unnest(r.affected_task_ids) task_id ON true
LEFT JOIN tasks t ON t.id = task_id
WHERE r.status = 'ACTIVE'
GROUP BY r.id;

-- Current sprint with stats
CREATE OR REPLACE VIEW current_sprint AS
SELECT * FROM sprints
WHERE status = 'ACTIVE'
  AND start_date <= CURRENT_DATE
  AND end_date >= CURRENT_DATE
ORDER BY start_date DESC
LIMIT 1;

-- AI performance summary
CREATE OR REPLACE VIEW ai_performance_summary AS
SELECT 
  metric_type,
  accuracy_percentage,
  avg_feedback_rating,
  total_suggestions,
  accepted_suggestions,
  period_start,
  period_end
FROM ai_learning_metrics
ORDER BY period_end DESC;

-- ============================================
-- PERMISSIONS
-- ============================================
GRANT ALL ON sprints TO anon, authenticated;
GRANT ALL ON ai_analysis_results TO anon, authenticated;
GRANT ALL ON ai_risks TO anon, authenticated;
GRANT ALL ON ai_recommendations TO anon, authenticated;
GRANT ALL ON human_feedback TO anon, authenticated;
GRANT ALL ON ai_learning_metrics TO anon, authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE sprints IS 'Scrum sprints for agile workflow - fully tracked';
COMMENT ON TABLE ai_analysis_results IS 'Persistent AI analysis results - no hardcode';
COMMENT ON TABLE ai_risks IS 'AI-identified risks - dynamic tracking';
COMMENT ON TABLE ai_recommendations IS 'AI recommendations - actionable suggestions';
COMMENT ON TABLE human_feedback IS 'Human feedback on AI suggestions - training data';
COMMENT ON TABLE ai_learning_metrics IS 'AI learning and improvement metrics';

COMMENT ON FUNCTION update_sprint_stats() IS 'Auto-update sprint statistics when tasks change';
COMMENT ON FUNCTION log_recommendation_feedback() IS 'Auto-log human feedback when recommendations are applied/rejected';
