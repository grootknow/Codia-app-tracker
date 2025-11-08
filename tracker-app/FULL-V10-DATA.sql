-- ============================================================================
-- V10 ULTIMATE TRACKER - FULL DATA WITH PARENT-CHILD HIERARCHY
-- ============================================================================
-- Source: 00-TRM-MASTER-V10-ULTIMATE-FULL.mmd
-- Date: 2025-11-06
-- ============================================================================

-- Clean slate
TRUNCATE TABLE logs, tasks, phases RESTART IDENTITY CASCADE;

-- ============================================================================
-- PHASES (4 phases)
-- ============================================================================
INSERT INTO phases (name, description, status, progress, kpi, deliverable, order_index) VALUES
  (
    'Phase 1: VPS Infrastructure', 
    '3-4 VPS setup với Coolify, Traefik, Monitoring, Automation, Real-time, DevOps, MCP Gateway',
    'IN_PROGRESS',
    10,
    '99.9% uptime, <100ms latency, 3-4 VPS ready',
    'Hệ thống sống, chuẩn, liên thông - Control + Monitor + Automation ready',
    1
  ),
  (
    'Phase 2: Databases & Lakehouse',
    'Product DBs (12GB): Neo4j x2, LanceDB, PostgreSQL, Redis, NocoDB | Agent DBs (4.8GB): Neo4j, LanceDB, PostgreSQL, Redis | Lakehouse (2.2GB): DuckDB, Airbyte, dbt, Unstructured.io, Iceberg',
    'PENDING',
    0,
    '22M triples, 10.4M vectors, 100% data ownership, Lakehouse ready',
    'Data foundation complete - All databases + Lakehouse operational',
    2
  ),
  (
    'Phase 3: AI Brain & Apps',
    'Product AI (6GB): LangGraph, Zep, LobeChat, Skills Library, WebSocket | Agent AI (3GB): LangGraph Agent, Zep Agent, 8 Agents | Code Execution (8GB): K3s, SkyPilot, Python/JS/Multi pods',
    'PENDING',
    0,
    '8 agents deployable, 145 MCP tools callable, Code execution 300ms',
    'AI capabilities ready - Product AI + Agent AI + Code Execution operational',
    3
  ),
  (
    'Phase 4: Integration & Operations',
    '8 AI Agents working together, 24/7 automation, Monitoring + alerts live, Backup + DR tested, 90% automation, 70% self-healing',
    'PENDING',
    0,
    '90% automation, 70% self-healing, <1min incident response, 99.9% uptime',
    'System fully autonomous - V10 ULTIMATE ready for production',
    4
  );

-- ============================================================================
-- PHASE 1: VPS INFRASTRUCTURE (Hierarchical structure)
-- ============================================================================

-- GROUP 1: VPS Provisioning
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, ram_usage, order_index) VALUES
  (1, NULL, '1. VPS Provisioning', 'Order và setup 3-4 VPS từ Contabo', 'IN_PROGRESS', 'group', NULL, 1),
  (1, 1, '1.1 Order VPS1 (24GB)', 'Contabo VPS M SSD, Singapore, Ubuntu 24.04 - Control + Monitoring', 'DONE', 'task', '24GB', 2),
  (1, 1, '1.2 Order VPS2 (24GB)', 'Contabo VPS M SSD, Singapore, Ubuntu 24.04 - All Databases', 'DONE', 'task', '24GB', 3),
  (1, 1, '1.3 Order VPS3 (12GB)', 'Contabo VPS S SSD, Singapore, Ubuntu 24.04 - Product + Agent AI', 'IN_PROGRESS', 'task', '12GB', 4),
  (1, 1, '1.4 Order VPS4 (8GB) - Optional', 'Contabo VPS XS SSD, Singapore, Ubuntu 24.04 - Code Execution (SkyPilot)', 'PENDING', 'task', '8GB', 5);

-- GROUP 2: Basic Setup
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, order_index) VALUES
  (1, NULL, '2. Basic Setup (All VPS)', 'SSH, Security, Docker installation', 'PENDING', 'group', ARRAY[2,3,4], 6),
  (1, 6, '2.1 SSH + Security Setup', 'UFW firewall, fail2ban, SSH keys, non-root user', 'PENDING', 'task', ARRAY[2,3,4], 7),
  (1, 6, '2.2 Install Docker', 'Docker + Docker Compose on all VPS', 'PENDING', 'task', ARRAY[7], 8),
  (1, 6, '2.3 Setup Cloudflare R2', 'Create bucket trm-media, get credentials for backup', 'PENDING', 'task', NULL, 9),
  (1, 6, '2.4 Setup Headscale VPN', 'VPN mesh network for secure internal communication', 'PENDING', 'task', ARRAY[8], 10);

-- GROUP 3: VPS1 - Infrastructure Core (5.8GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (1, NULL, '3. VPS1 - Infrastructure Core', 'Coolify, Logto, Vaultwarden, Core PostgreSQL, Headscale, Kopia', 'PENDING', 'group', ARRAY[8], NULL, 11),
  (1, 11, '3.1 Deploy Coolify', 'PaaS Manager - Container orchestration platform', 'PENDING', 'task', ARRAY[8], '2GB', '8000', 12),
  (1, 11, '3.2 Deploy Logto', 'SSO/Identity provider', 'PENDING', 'task', ARRAY[12], '1GB', '3001-3002', 13),
  (1, 11, '3.3 Deploy Vaultwarden', 'Secrets Manager', 'PENDING', 'task', ARRAY[12], '500MB', '8200', 14),
  (1, 11, '3.4 Deploy Core PostgreSQL', 'Operational database', 'PENDING', 'task', ARRAY[8], '2GB', '5432', 15),
  (1, 11, '3.5 Deploy Headscale', 'VPN Mesh control plane', 'PENDING', 'task', ARRAY[10], '200MB', '8080', 16),
  (1, 11, '3.6 Deploy Kopia', 'Backup tool to R2', 'PENDING', 'task', ARRAY[9,12], '500MB', '51515', 17);

-- GROUP 4: VPS1 - Observability Stack (8GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (1, NULL, '4. VPS1 - Observability Stack', 'Grafana, Prometheus, Loki, Tempo, Sentry, Alerta', 'PENDING', 'group', ARRAY[12], NULL, 18),
  (1, 18, '4.1 Deploy Grafana', 'Dashboards visualization', 'PENDING', 'task', ARRAY[12], '1GB', '3000', 19),
  (1, 18, '4.2 Deploy Prometheus', 'Metrics collection from 3 VPS', 'PENDING', 'task', ARRAY[12], '2GB', '9090', 20),
  (1, 18, '4.3 Deploy Loki', 'Log aggregation', 'PENDING', 'task', ARRAY[12], '2GB', '3100', 21),
  (1, 18, '4.4 Deploy Promtail', 'Log shipper', 'PENDING', 'task', ARRAY[21], '200MB', '9080', 22),
  (1, 18, '4.5 Deploy Sentry', 'Error tracking', 'PENDING', 'task', ARRAY[12], '1GB', '9000', 23),
  (1, 18, '4.6 Deploy Tempo', 'Distributed tracing', 'PENDING', 'task', ARRAY[12], '1GB', '3200', 24),
  (1, 18, '4.7 Deploy Alerta', 'Alert hub - aggregate all alerts', 'PENDING', 'task', ARRAY[20], '800MB', '8200', 25);

-- GROUP 5: VPS1 - Automation (800MB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (1, NULL, '5. VPS1 - Automation', 'Windmill workflow automation', 'PENDING', 'group', ARRAY[12], NULL, 26),
  (1, 26, '5.1 Deploy Windmill', 'Code-first automation - Python/TS/Go/Rust', 'PENDING', 'task', ARRAY[12], '800MB', '8000', 27);

-- GROUP 6: VPS1 - Real-time & Dashboard (1.3GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (1, NULL, '6. VPS1 - Real-time & Dashboard', 'Supabase Realtime, Reflex Dashboard', 'PENDING', 'group', ARRAY[12], NULL, 28),
  (1, 28, '6.1 Deploy Supabase Realtime', 'WebSocket sync - Broadcast + Presence', 'PENDING', 'task', ARRAY[12], '500MB', '4000', 29),
  (1, 28, '6.2 Deploy Reflex Dashboard', 'Python real-time UI - AI-generated dashboards', 'PENDING', 'task', ARRAY[12,29], '800MB', '3000', 30);

-- GROUP 7: VPS1 - DevOps & Security (2.4GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (1, NULL, '7. VPS1 - DevOps & Security', 'Gitea Actions, Trivy, Zot Registry, Watchtower, Infisical, Falco, Uptime Kuma', 'PENDING', 'group', ARRAY[12], NULL, 31),
  (1, 31, '7.1 Deploy Gitea Actions', 'CI/CD pipeline', 'PENDING', 'task', ARRAY[12], '1GB', '3001', 32),
  (1, 31, '7.2 Deploy Trivy', 'Security scanner', 'PENDING', 'task', ARRAY[12], '500MB', 'on-demand', 33),
  (1, 31, '7.3 Deploy Zot Registry', 'Docker registry', 'PENDING', 'task', ARRAY[12], '500MB', '5000', 34),
  (1, 31, '7.4 Deploy Watchtower', 'Auto-updater', 'PENDING', 'task', ARRAY[12], '200MB', NULL, 35),
  (1, 31, '7.5 Deploy Infisical', 'Secrets for machines', 'PENDING', 'task', ARRAY[12], '500MB', '8080', 36),
  (1, 31, '7.6 Deploy Falco', 'Runtime security', 'PENDING', 'task', ARRAY[12], '300MB', '8765', 37),
  (1, 31, '7.7 Deploy Uptime Kuma', 'Status page', 'PENDING', 'task', ARRAY[12], '200MB', '3001', 38);

-- GROUP 8: VPS1 - MCP Gateway (1GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (1, NULL, '8. VPS1 - MCP Gateway', 'ContextForge - IBM MCP Gateway with 145+ tools', 'PENDING', 'group', ARRAY[12], NULL, 39),
  (1, 39, '8.1 Deploy ContextForge Core', 'REST→MCP + gRPC→MCP, Multi-tenant, RBAC, Federation, OpenTelemetry', 'PENDING', 'task', ARRAY[12], '1GB', '8500', 40);

-- ============================================================================
-- PHASE 2: DATABASES & LAKEHOUSE (Hierarchical structure)
-- ============================================================================

-- GROUP 9: VPS2 - Product Databases (12GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (2, NULL, '9. VPS2 - Product Databases', 'Neo4j x2, LanceDB, PostgreSQL, Redis, NocoDB', 'PENDING', 'group', ARRAY[8], NULL, 41),
  (2, 41, '9.1 Deploy Neo4j Internal', '2M triples - Internal knowledge graph', 'PENDING', 'task', ARRAY[8], '4GB', '7474,7687', 42),
  (2, 41, '9.2 Deploy Neo4j SuperApp', '19M triples - Biggest database', 'PENDING', 'task', ARRAY[8], '4GB', '7475,7688', 43),
  (2, 41, '9.3 Deploy LanceDB Product', '10M vectors - Embedded vector database', 'PENDING', 'task', ARRAY[8], '500MB', '6333', 44),
  (2, 41, '9.4 Deploy PostgreSQL App', 'App database for Zep, NocoDB', 'PENDING', 'task', ARRAY[8], '2GB', '5432', 45),
  (2, 41, '9.5 Deploy Redis Product', 'Cache + Queue + Pub/Sub', 'PENDING', 'task', ARRAY[8], '1.5GB', '6379', 46),
  (2, 41, '9.6 Deploy NocoDB', 'No-code database UI', 'PENDING', 'task', ARRAY[45], '1GB', '8080', 47);

-- GROUP 10: VPS2 - Agent Databases (4.8GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (2, NULL, '10. VPS2 - Agent Databases', 'Neo4j Agent, LanceDB Agent, PostgreSQL Agent, Redis Agent', 'PENDING', 'group', ARRAY[8], NULL, 48),
  (2, 48, '10.1 Deploy Neo4j Agent', '1M triples - Incident graph', 'PENDING', 'task', ARRAY[8], '2GB', '7476,7689', 49),
  (2, 48, '10.2 Deploy LanceDB Agent', '400k vectors - Embedded', 'PENDING', 'task', ARRAY[8], '300MB', '6334', 50),
  (2, 48, '10.3 Deploy PostgreSQL Agent', 'Agent state/logs database', 'PENDING', 'task', ARRAY[8], '1GB', '5433', 51),
  (2, 48, '10.4 Deploy Redis Agent', 'Agent task queue', 'PENDING', 'task', ARRAY[8], '1.5GB', '6380', 52);

-- GROUP 11: VPS2 - Lakehouse & ETL (2.2GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (2, NULL, '11. VPS2 - Lakehouse & ETL', 'DuckDB, Airbyte, dbt, Unstructured.io, Iceberg', 'PENDING', 'group', ARRAY[42,45], NULL, 53),
  (2, 53, '11.1 Deploy DuckDB', 'Analytics engine - 100x faster than PostgreSQL', 'PENDING', 'task', ARRAY[42,45], '500MB', '8080', 54),
  (2, 53, '11.2 Deploy Airbyte', 'ETL pipelines - 300+ connectors', 'PENDING', 'task', ARRAY[42,45], '500MB', '8000', 55),
  (2, 53, '11.3 Deploy dbt', 'Data transform - SQL-based', 'PENDING', 'task', ARRAY[54], '200MB', '8080', 56),
  (2, 53, '11.4 Deploy Unstructured.io', 'Document ETL - PDF/Word extraction', 'PENDING', 'task', ARRAY[55], '500MB', '8000', 57),
  (2, 53, '11.5 Deploy Iceberg', 'Table format - Time travel', 'PENDING', 'task', ARRAY[54], '500MB', NULL, 58);

-- GROUP 12: Test All Databases
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, order_index) VALUES
  (2, NULL, '12. Test All Databases', 'Verify connectivity, performance, backups', 'PENDING', 'task', ARRAY[42,43,44,45,46,47,49,50,51,52,54,55,56,57,58], 59);

-- ============================================================================
-- PHASE 3: AI BRAIN & APPS (Hierarchical structure)
-- ============================================================================

-- GROUP 13: VPS3 - Product AI (6GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (3, NULL, '13. VPS3 - Product AI', 'LangGraph, Zep, LobeChat, Skills Library, WebSocket', 'PENDING', 'group', ARRAY[59], NULL, 60),
  (3, 60, '13.1 Deploy LangGraph Product', 'User AI orchestration - MCP client to ContextForge', 'PENDING', 'task', ARRAY[59,40], '2GB', '8001', 61),
  (3, 60, '13.2 Deploy Zep Product', 'User conversation memory', 'PENDING', 'task', ARRAY[61], '2GB', '8002', 62),
  (3, 60, '13.3 Deploy LobeChat', 'Chat interface', 'PENDING', 'task', ARRAY[61,62], '1GB', '3210', 63),
  (3, 60, '13.4 Setup Skills Library', '100+ workflows documented', 'PENDING', 'task', ARRAY[61], '500MB', NULL, 64),
  (3, 60, '13.5 Deploy WebSocket', 'Real-time communication', 'PENDING', 'task', ARRAY[61,29], '200MB', '8888', 65);

-- GROUP 14: VPS3 - Product Apps (2GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (3, NULL, '14. VPS3 - Product Apps', 'MetaMCP, Postiz', 'PENDING', 'group', ARRAY[61], NULL, 66),
  (3, 66, '14.1 Deploy MetaMCP', 'MCP management UI', 'PENDING', 'task', ARRAY[61,40], '1GB', '8003', 67),
  (3, 66, '14.2 Deploy Postiz', 'Social media scheduler', 'PENDING', 'task', ARRAY[61], '500MB', '5000', 68);

-- GROUP 15: VPS3 - Agent AI (3GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, port, order_index) VALUES
  (3, NULL, '15. VPS3 - Agent AI', 'LangGraph Agent, Zep Agent, 8 Agents', 'PENDING', 'group', ARRAY[59], NULL, 69),
  (3, 69, '15.1 Deploy LangGraph Agent', 'Agent orchestrator - MCP client to ContextForge', 'PENDING', 'task', ARRAY[59,40], '1GB', '8100', 70),
  (3, 69, '15.2 Deploy Zep Agent', 'Agent memory', 'PENDING', 'task', ARRAY[70], '500MB', '8101', 71),
  (3, 69, '15.3 Deploy 8 AI Agents', 'DevOps, Data, Alert, Finance, Doc, Compliance, Test, Learning (190MB each)', 'PENDING', 'task', ARRAY[70,71], '1.5GB', NULL, 72);

-- GROUP 16: VPS4 - Code Execution (8GB)
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, ram_usage, order_index) VALUES
  (3, NULL, '16. VPS4 - Code Execution', 'K3s, SkyPilot, Python/JS/Multi pods', 'PENDING', 'group', ARRAY[5,8], NULL, 73),
  (3, 73, '16.1 Deploy K3s', 'Lightweight Kubernetes', 'PENDING', 'task', ARRAY[5,8], '500MB', NULL, 74),
  (3, 73, '16.2 Deploy SkyPilot Control', 'Code execution orchestrator', 'PENDING', 'task', ARRAY[74], '500MB', '8600', 75),
  (3, 73, '16.3 Setup Code Execution Pods', 'Python, JS, Multi-lang pods with session pooling', 'PENDING', 'task', ARRAY[75], '7GB', NULL, 76),
  (3, 73, '16.4 Setup Persistent Volumes', 'Data survives restarts, session state preserved', 'PENDING', 'task', ARRAY[75], '1GB', NULL, 77);

-- ============================================================================
-- PHASE 4: INTEGRATION & OPERATIONS (Hierarchical structure)
-- ============================================================================

-- GROUP 17: Connect AI to Infrastructure
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, order_index) VALUES
  (4, NULL, '17. Connect AI to Infrastructure', 'Connect Product AI + Agent AI to all databases and services', 'PENDING', 'group', ARRAY[61,70], NULL, 78),
  (4, 78, '17.1 Connect Product AI to Databases', 'LangGraph Product → Neo4j, LanceDB, PostgreSQL, Redis', 'PENDING', 'task', ARRAY[61,42,43,44,45,46], 79),
  (4, 78, '17.2 Connect Agent AI to Databases', 'LangGraph Agent → Neo4j Agent, LanceDB Agent, PostgreSQL Agent, Redis Agent', 'PENDING', 'task', ARRAY[70,49,50,51,52], 80),
  (4, 78, '17.3 Connect AI to MCP Gateway', 'Both AI systems → ContextForge → 145+ MCP tools', 'PENDING', 'task', ARRAY[61,70,40], 81),
  (4, 78, '17.4 Connect Product AI to Code Execution', 'LangGraph Product → SkyPilot → Python/JS pods', 'PENDING', 'task', ARRAY[61,75,76], 82);

-- GROUP 18: Configure 8 AI Agents
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, order_index) VALUES
  (4, NULL, '18. Configure 8 AI Agents', 'Setup workflows for each agent', 'PENDING', 'group', ARRAY[72,81], NULL, 83),
  (4, 83, '18.1 Configure DevOps Agent', 'Auto-deploy via Coolify, manage Headscale', 'PENDING', 'task', ARRAY[72,12,16], 84),
  (4, 83, '18.2 Configure Monitor Agent', 'Watch metrics via Grafana, Prometheus', 'PENDING', 'task', ARRAY[72,19,20], 85),
  (4, 83, '18.3 Configure Incident Agent', 'Auto-fix issues, self-healing', 'PENDING', 'task', ARRAY[72,25], 86),
  (4, 83, '18.4 Configure Cost Agent', 'Optimize resources, track spending', 'PENDING', 'task', ARRAY[72,20], 87),
  (4, 83, '18.5 Configure Security Agent', 'Scan vulnerabilities via Trivy', 'PENDING', 'task', ARRAY[72,33], 88),
  (4, 83, '18.6 Configure Backup Agent', 'Manage backups via Kopia', 'PENDING', 'task', ARRAY[72,17], 89),
  (4, 83, '18.7 Configure Docs Agent', 'Update documentation, generate reports', 'PENDING', 'task', ARRAY[72,32], 90),
  (4, 83, '18.8 Configure Optimize Agent', 'Performance tuning, resource optimization', 'PENDING', 'task', ARRAY[72,20], 91);

-- GROUP 19: Test & Verify
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, order_index) VALUES
  (4, NULL, '19. Test & Verify System', 'End-to-end testing', 'PENDING', 'group', ARRAY[84,85,86,87,88,89,90,91], NULL, 92),
  (4, 92, '19.1 Test All Agents', 'Verify 90% automation, 70% self-healing', 'PENDING', 'task', ARRAY[84,85,86,87,88,89,90,91], 93),
  (4, 92, '19.2 Test Monitoring & Alerts', 'Verify all metrics, logs, traces, alerts working', 'PENDING', 'task', ARRAY[19,20,21,23,24,25], 94),
  (4, 92, '19.3 Test Backup & Recovery', 'Verify backups working, test restore', 'PENDING', 'task', ARRAY[17,89], 95),
  (4, 92, '19.4 Test Code Execution', 'Verify Python/JS/Multi-lang execution', 'PENDING', 'task', ARRAY[76,82], 96),
  (4, 92, '19.5 Load Testing', 'Stress test system under load', 'PENDING', 'task', ARRAY[93,94,95,96], 97);

-- GROUP 20: Launch V10 ULTIMATE
INSERT INTO tasks (phase_id, parent_id, name, description, status, task_type, depends_on, order_index) VALUES
  (4, NULL, '20. Launch V10 ULTIMATE', 'System fully autonomous, ready for production', 'PENDING', 'task', ARRAY[97], 98);

-- ============================================================================
-- INITIAL LOG
-- ============================================================================
INSERT INTO logs (action, details, status) VALUES
  ('PROJECT_INITIALIZED', 'V10 ULTIMATE tracker initialized with 98 tasks (20 groups, 78 tasks) across 4 phases with parent-child hierarchy', 'SUCCESS');
