-- CODIA Tracker Supabase Setup
-- Run this SQL in Supabase SQL Editor

-- Create phases table
CREATE TABLE phases (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  week_start INT,
  week_end INT,
  status TEXT DEFAULT 'PENDING',
  progress INT DEFAULT 0,
  kpi TEXT,
  deliverable TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  phase_id INT REFERENCES phases(id) ON DELETE CASCADE,
  week INT,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  date_start DATE,
  date_end DATE,
  notes TEXT,
  blocked_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create logs table
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  action TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'SUCCESS'
);

-- Insert Phase 1
INSERT INTO phases (name, week_start, week_end, status, progress, kpi, deliverable)
VALUES (
  'Phase 1: Infrastructure',
  1,
  4,
  'IN_PROGRESS',
  50,
  '99.9% uptime, <100ms latency',
  'Hệ thống sống, chuẩn, liên thông'
);

-- Insert Phase 2
INSERT INTO phases (name, week_start, week_end, status, progress, kpi, deliverable)
VALUES (
  'Phase 2: Capabilities',
  5,
  7,
  'PENDING',
  0,
  '8 agents deployable, 145 MCP tools callable',
  'Fleet ready'
);

-- Insert Phase 3
INSERT INTO phases (name, week_start, week_end, status, progress, kpi, deliverable)
VALUES (
  'Phase 3: Operations',
  8,
  10,
  'PENDING',
  0,
  '5+ workflows 24/7, zero manual intervention',
  'Flights departing'
);

-- Insert Phase 1 Tasks (Week 1-2)
INSERT INTO tasks (phase_id, week, name, status, notes, blocked_by)
VALUES
  (1, 1, 'Order VPS1 (24GB)', 'DONE', 'Contabo, Singapore', NULL),
  (1, 1, 'Order VPS2 (24GB)', 'DONE', 'Contabo, Singapore', NULL),
  (1, 2, 'Order VPS3 (12GB)', 'IN_PROGRESS', 'Waiting for provisioning', NULL),
  (1, 2, 'Order VPS4 (8GB) - Optional', 'PENDING', 'Can skip for now', NULL),
  (1, 2, 'Wait for provisioning', 'IN_PROGRESS', 'ETA 2025-11-06', NULL),
  (1, 2, 'Save IPs to Notion', 'PENDING', 'Create database with IPs', 'VPS provisioning');

-- Insert Phase 1 Tasks (Week 3)
INSERT INTO tasks (phase_id, week, name, status, notes, blocked_by)
VALUES
  (1, 3, 'Install Headscale on VPS1', 'PENDING', 'VPN control plane', 'VPS1 ready'),
  (1, 3, 'Install Tailscale on all VPS', 'PENDING', 'VPN clients', 'VPS provisioning'),
  (1, 3, 'Test connectivity', 'PENDING', 'Ping all servers', 'Tailscale setup'),
  (1, 3, 'Setup firewall rules', 'PENDING', 'Allow necessary ports', 'Networking setup');

-- Insert Phase 1 Tasks (Week 4)
INSERT INTO tasks (phase_id, week, name, status, notes, blocked_by)
VALUES
  (1, 4, 'Deploy Coolify on VPS1', 'PENDING', 'Container orchestration', 'VPS1 ready'),
  (1, 4, 'Deploy Databases on VPS2', 'PENDING', 'PostgreSQL, Neo4j, LanceDB, Redis', 'VPS2 ready'),
  (1, 4, 'Deploy Monitoring on VPS1', 'PENDING', 'Grafana, Prometheus, Loki, Sentry, Tempo, Alerta', 'VPS1 ready'),
  (1, 4, 'Test everything works', 'PENDING', 'Verify all services running', 'Services deployment');

-- Insert Phase 2 Tasks (Week 5)
INSERT INTO tasks (phase_id, week, name, status, notes, blocked_by)
VALUES
  (2, 5, 'Deploy LangGraph + Zep', 'PENDING', 'AI orchestration + memory', 'Phase 1 complete'),
  (2, 5, 'Setup LobeChat UI', 'PENDING', 'Chat interface', 'Phase 1 complete'),
  (2, 5, 'Deploy MCP Gateway (145 tools)', 'PENDING', 'Tool orchestration', 'Phase 1 complete'),
  (2, 5, 'Test: Agent can call tools', 'PENDING', 'Integration test', 'Week 5 tasks');

-- Insert Phase 2 Tasks (Week 6)
INSERT INTO tasks (phase_id, week, name, status, notes, blocked_by)
VALUES
  (2, 6, 'Setup K3s cluster', 'PENDING', 'Kubernetes orchestration', 'Phase 1 complete'),
  (2, 6, 'Deploy SkyPilot', 'PENDING', 'Code execution framework', 'Phase 1 complete'),
  (2, 6, 'Code execution sandboxes', 'PENDING', 'Safe code execution', 'K3s setup'),
  (2, 6, 'Test: Run Python/JS safely', 'PENDING', 'Integration test', 'Week 6 tasks');

-- Insert Phase 2 Tasks (Week 7)
INSERT INTO tasks (phase_id, week, name, status, notes, blocked_by)
VALUES
  (2, 7, 'Deploy Stable Diffusion (if needed)', 'PENDING', 'Image generation', 'Phase 1 complete'),
  (2, 7, 'Setup FFmpeg processors', 'PENDING', 'Video processing', 'Phase 1 complete'),
  (2, 7, 'Integrate external APIs', 'PENDING', 'OpenAI, Anthropic, etc', 'Phase 1 complete'),
  (2, 7, 'Test: Generate text/image/video', 'PENDING', 'Integration test', 'Week 7 tasks');

-- Insert Phase 3 Tasks (Week 8)
INSERT INTO tasks (phase_id, week, name, status, notes, blocked_by)
VALUES
  (3, 8, 'Code Generator Agent active', 'PENDING', 'Generate boilerplate, components, APIs', 'Phase 2 complete'),
  (3, 8, 'Testing Agent active', 'PENDING', 'Run tests, security scans', 'Phase 2 complete'),
  (3, 8, 'DevOps Agent active', 'PENDING', 'Auto-deploy, monitor, scale', 'Phase 2 complete'),
  (3, 8, 'Data Agent active', 'PENDING', 'ETL pipelines, sync databases', 'Phase 2 complete');

-- Insert Phase 3 Tasks (Week 9)
INSERT INTO tasks (phase_id, week, name, status, notes, blocked_by)
VALUES
  (3, 9, 'Content Writer Agent active', 'PENDING', 'Generate blog posts, social media', 'Phase 2 complete'),
  (3, 9, 'Visual Designer Agent active', 'PENDING', 'Generate images, infographics', 'Phase 2 complete'),
  (3, 9, 'Video Producer Agent active', 'PENDING', 'Text-to-video, auto-edit', 'Phase 2 complete'),
  (3, 9, 'Research Agent active', 'PENDING', 'Market research, competitor analysis', 'Phase 2 complete');

-- Insert Phase 3 Tasks (Week 10)
INSERT INTO tasks (phase_id, week, name, status, notes, blocked_by)
VALUES
  (3, 10, '8 agents working together', 'PENDING', 'Full orchestration', 'Week 8-9 tasks'),
  (3, 10, '24/7 automation active', 'PENDING', 'Continuous operation', 'Week 8-9 tasks'),
  (3, 10, 'Monitoring + alerts live', 'PENDING', 'Full observability', 'Week 8-9 tasks'),
  (3, 10, 'Backup + DR tested', 'PENDING', 'Disaster recovery verification', 'Week 8-9 tasks');

-- Insert initial log
INSERT INTO logs (action, details, status)
VALUES ('PROJECT_INITIALIZED', 'CODIA Platform tracker initialized', 'SUCCESS');

-- Enable RLS (Row Level Security) - Optional but recommended
ALTER TABLE phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo - restrict in production)
CREATE POLICY "Enable read access for all users" ON phases FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON logs FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Enable insert for all users" ON logs FOR INSERT WITH CHECK (true);
