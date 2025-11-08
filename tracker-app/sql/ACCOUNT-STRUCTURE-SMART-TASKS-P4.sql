-- ============================================================================
-- PHASE 4: OPERATIONS - Alert Resolution + Metrics API + Dashboards (+18 tasks)
-- ============================================================================

-- Alert Resolution System (5 tasks)
INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('4.14 Alert Resolution System',
 'Agent-first alert handling with auto-fix. WHY: Founder gets alert fatigue - 100 alerts/day = ignored. SYSTEM: Alerts go to agents first, agents try to fix, escalate only if failed. WORKFLOW: Alert fires → Agent auto-fix (L0) → If failed agent escalates (L1) → If critical immediate (L2). LEARNING: Track resolution patterns, add new auto-fixes. BENEFIT: Founder sees 10% of alerts (only what agents cannot fix). COMPONENTS: Auto-fix handlers, escalation logic, resolution tracking.',
 'Pending', 4, NULL, 139);

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('4.14.1 Implement Auto-Fix Handlers',
 'Build agent resolution logic for common issues. HANDLERS: Container crashed → docker restart, Disk space low → cleanup old logs, High CPU → identify + optimize process, Service unreachable → check + restart, Backup failed → retry with logging. METHOD: Alert Commander receives alert → Matches alert type → Executes handler → Verifies fix → Updates alert status. CODE: Python handlers per alert type. TEST: Trigger fake alerts → Verify auto-resolution. METRICS: Track auto-fix success rate (target 80%).',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.14 Alert Resolution System'), 140),

('4.14.2 Configure Escalation Levels',
 'Define when agent escalates to founder. LEVELS: Severity 0 (auto-resolved, no alert): Container restart, log cleanup, cache clear. Severity 1 (agent tried, failed - founder review 1h): Deploy failed, backup failed, service degraded. Severity 2 (agent cannot handle - immediate): VPS down, database crashed, security breach. Severity 3 (agent needs approval - decision): Scale up needed, major config change, cost spike. ROUTING: S0 → Silent, S1 → Telegram info, S2 → Telegram critical + SMS if no response, S3 → Telegram with approval buttons.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.14 Alert Resolution System'), 141),

('4.14.3 Setup Resolution Learning',
 'Track successful resolutions to improve. SCHEMA: CREATE TABLE alert_resolutions (alert_id, alert_type, resolution_method, success BOOLEAN, duration_seconds, resolved_by). ANALYTICS: Which alert types auto-resolve well? Which always need human? Which handlers work best? LEARNING: If alert type X auto-resolved 50x → High confidence. If alert type Y always fails → Remove auto-fix, escalate immediately. SUGGESTIONS: "Container restart succeeds 95% of time, make it auto-approve?". BENEFIT: System gets smarter over time.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.14 Alert Resolution System'), 142),

('4.14.4 Test Alert Flow',
 'End-to-end alert resolution test. TESTS: 1) Trigger: Crash Grafana container → Agent auto-restarts → Alert cleared (S0, silent). 2) Trigger: Fill disk 95% → Agent cleanup fails → Escalates to founder (S1, Telegram). 3) Trigger: VPS unreachable → Agent cannot access → Immediate alert (S2, Telegram + SMS). 4) Trigger: Cost spike $500/day → Agent suggests scale down → Approval request (S3, Telegram buttons). VERIFY: Correct routing, timeouts work, logs captured. GOAL: 80% S0, 15% S1, 4% S2, 1% S3.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.14 Alert Resolution System'), 143),

('4.14.5 Monitor Alert Metrics',
 'Dashboard for alert reduction tracking. METRICS: Total alerts/day, Auto-resolved (S0) %, Escalated (S1) %, Critical (S2) %, Approval (S3) %, Resolution time (p50, p95), Founder intervention rate. GOAL: Reduce founder intervention from 100% to 10% within 3 months. CHART: Time series of alert volume + resolution breakdown. ALERT: If auto-resolve rate drops below 70% → Investigate why. LOCATION: Grafana alert dashboard panel.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.14 Alert Resolution System'), 144);

-- Metrics API for Agents (5 tasks)
INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('4.15 Metrics API for Agents',
 'Programmatic metrics access for agents. WHY: Grafana is for humans (visual), agents need structured data (JSON). SYSTEM: Metrics API wraps Prometheus, provides current + historical + anomaly detection. USE CASE: Agent checks CPU → Sees high → Investigates → Finds slow query → Suggests index. BENEFIT: Agents can monitor and act autonomously. COMPONENTS: Metrics API server, agent query interface, anomaly detection, action triggers.',
 'Pending', 4, NULL, 145);

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('4.15.1 Design Metrics API',
 'RESTful API for metric queries. ENDPOINTS: GET /api/metrics/{service}/{metric} (current value), GET /api/metrics/{service}/{metric}/history (time series), GET /api/metrics/{service}/{metric}/anomalies (detect spikes), GET /api/metrics/compare (compare multiple services). RESPONSE: {"current": 87.3, "avg_1h": 65.2, "avg_24h": 45.1, "threshold": 80, "status": "high", "trend": "increasing", "anomaly": true}. AUTH: Logto JWT. RATE LIMIT: 100 req/min per agent. TECH: FastAPI + Prometheus query API.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.15 Metrics API for Agents'), 146),

('4.15.2 Implement Agent Query Interface',
 'Agent-friendly metric checking. SDK: Python client library for agents. EXAMPLE: metrics.get("vps3", "cpu") → MetricValue object with current, avg, threshold, is_high(). QUERIES: Pre-defined common checks (CPU high? Disk full? Memory leak?). CACHING: Redis cache for frequent queries (5 min TTL). BATCH: Allow multiple metrics in one call. BENEFIT: Agents can easily check system health.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.15 Metrics API for Agents'), 147),

('4.15.3 Create Agent Metric Rules',
 'Automated metric monitoring by agents. SCHEMA: CREATE TABLE agent_metric_rules (agent TEXT, metric TEXT, check_interval TEXT, threshold NUMERIC, action TEXT, enabled BOOLEAN). EXAMPLES: DevOps Commander checks CPU every 5 mins, if > 80% for 10 mins → Investigate. Data Orchestrator checks disk every 1 hour, if > 90% → Cleanup old backups. EXECUTION: Cron-like scheduler runs checks → If threshold exceeded → Trigger agent action. LOGS: All checks logged for audit.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.15 Metrics API for Agents'), 148),

('4.15.4 Setup Feedback Loops',
 'Closed-loop metric-driven actions. FLOW: 1) Agent detects high CPU via metrics API 2) Agent investigates: GET /api/metrics/vps3/processes → Finds Neo4j using 90% 3) Agent checks: What is Neo4j doing? → Slow query 4) Agent suggests: "Add index on user_id to speed up" 5) Founder approves (L1) 6) Agent creates index 7) Agent verifies: CPU drops to 45% 8) Agent logs: "Fixed high CPU by adding index". BENEFIT: Self-optimizing system. METRICS: Track actions taken, success rate, impact.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.15 Metrics API for Agents'), 149),

('4.15.5 Test Agent-Driven Actions',
 'End-to-end metrics → action test. SCENARIO: Simulate high memory usage. TEST: 1) Create memory leak in test container 2) Agent monitors memory via API 3) Agent detects: Memory 95% 4) Agent investigates: Which container? 5) Agent finds: test-container leak 6) Agent action: Restart test-container 7) Agent verifies: Memory drops to 60% 8) Agent logs resolution 9) Alert cleared. VERIFY: Full chain works, logs captured, founder notified only if action fails.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.15 Metrics API for Agents'), 150);

-- Grafana Dashboard Creation (8 tasks)
INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('4.16 Grafana Dashboard Creation',
 'Build 4 dashboards for founder + agent visibility. WHY: Founder needs visual overview, Tuấn needs finance view, agents need their activity view. DASHBOARDS: 1) System Overview (VPS health), 2) Finance Dashboard (costs, Tuấn access), 3) Media Dashboard (followers, views), 4) AI Agent Dashboard (agent activity). BENEFIT: Human visual + agent programmatic access to same data. DUAL INTERFACE: Grafana (human) + Metrics API (agent).',
 'Pending', 4, NULL, 151);

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('4.16.1 Design System Overview Dashboard',
 'VPS health + service status dashboard. PANELS: 1) VPS Health: CPU, RAM, Disk, Network (4 panels) 2) Service Status: 35 services up/down (table) 3) Database Metrics: PG, Neo4j, Qdrant, Redis (4 panels) 4) AI Agent Status: 8 agents live (table) 5) Backup Status: Last + next (stat) 6) Alerts: 🔴🟡🟢 counts (stat). REFRESH: 30s auto. DATA: Prometheus, Loki. PERMISSIONS: Hùng full, Tuấn view.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.16 Grafana Dashboard Creation'), 152),

('4.16.2 Create Finance Dashboard',
 'Cost tracking for Tuấn + financial oversight. PANELS: 1) Monthly Costs: Infra $65, Software $227, Media $400 (bar chart) 2) Revenue [P2]: YouTube, sponsorships (when monetized) 3) Transactions: Last 30 days table 4) Budget Tracking: $2000 budget, $X spent, $Y remaining (gauge) 5) Cost Trends: 6 months line chart 6) Top Expenses: Top 10 (table). DATA SOURCE: Finance Tracker Agent → PostgreSQL finance tables. REFRESH: 15 mins. ACCESS: Tuấn full, Hùng view.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.16 Grafana Dashboard Creation'), 153),

('4.16.3 Create Media Dashboard',
 'Social media analytics for content performance. PANELS: 1) Channel Metrics: YouTube (subs, views, watch time), TikTok (followers, views), Instagram, LinkedIn, Twitter (followers) 2) Content Pipeline: Videos in production, scheduled, published this week 3) Engagement: Likes, comments, shares, engagement rate % 4) Top Content: Top 5 videos by views 5) Growth: Follower growth 30 days 6) Revenue [P2]: Ad revenue, sponsorships. DATA: Postiz + Platform APIs. REFRESH: Hourly. ACCESS: Hùng full.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.16 Grafana Dashboard Creation'), 154),

('4.16.4 Create AI Agent Dashboard',
 'Real-time agent activity tracking. PANELS: 1) Agent Status: 8 agents (DevOps, Data, Alert, Finance, Doc, Compliance, Test, System) with status 🟢🟡🔴 2) Current Tasks: What each agent doing now (table) 3) Today Completed: Tasks per agent (bar) 4) Error Rates: Errors per agent (line) 5) Agent Metrics: Total tasks, success rate, avg response time 6) Real-time Logs: Log stream filtered by agent. DATA: LangGraph Agent metrics + Loki logs. REFRESH: 10s. ACCESS: Hùng full.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.16 Grafana Dashboard Creation'), 155),

('4.16.5 Setup Data Sources',
 'Connect Grafana to all data backends. SOURCES: 1) Prometheus (metrics) → http://prometheus:9090 2) Loki (logs) → http://loki:3100 3) PostgreSQL (finance data) → postgres://vps2:5432/finance 4) PostgreSQL (agent data) → postgres://vps2:5433/agent. CREDENTIALS: Service accounts from Vaultwarden. TEST: Each data source connected. QUERIES: Test queries return data. PERMISSIONS: Data source access per dashboard.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.16 Grafana Dashboard Creation'), 156),

('4.16.6 Configure Dashboard Permissions',
 'Role-based dashboard access. ROLES: Admin (Hùng - full access all), Finance (Tuấn - full finance, view others), Agent (agents - view their dashboard). DASHBOARDS: System Overview (Admin, Finance view), Finance Dashboard (Finance full, Admin view), Media Dashboard (Admin only), Agent Dashboard (Admin, Agent view). METHOD: Grafana teams + permissions. FOLDERS: /Founder/ (admin only), /Finance/ (Tuấn + admin), /Agents/ (agents + admin). TEST: Login as Tuấn → Can edit finance, view others.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.16 Grafana Dashboard Creation'), 157),

('4.16.7 Test Dashboard Updates',
 'Verify real-time data flow. TESTS: 1) Restart service → System Overview shows status change within 30s 2) Add transaction → Finance Dashboard updates within 15 mins 3) Agent completes task → Agent Dashboard shows in 10s 4) Publish video → Media Dashboard updates within 1 hour. VERIFY: All panels update, no stale data, correct time ranges. PERFORMANCE: Dashboard loads in <2s. MOBILE: Test responsive layout.',
 'Pending', 4, (SELECT id FROM tasks WHERE name = '4.16 Grafana Dashboard Creation'), 158);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total New Tasks: 39
-- Phase 1: 8 tasks (Permission system + Email integration)
-- Phase 2: 6 tasks (DB user provisioning)
-- Phase 3: 7 tasks (Service accounts + credential workflow)
-- Phase 4: 18 tasks (Alert resolution + Metrics API + Dashboards)
-- 
-- Philosophy: Production path with AI autonomy from day 1
-- Benefit: System can grow intelligently without manual scaling
-- ============================================================================
