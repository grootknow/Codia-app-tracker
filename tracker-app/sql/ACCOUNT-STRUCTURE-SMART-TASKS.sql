-- ============================================================================
-- ACCOUNT STRUCTURE - SMART TASKS (Production with AI Autonomy)
-- ============================================================================
-- Based on: DEEP-ARCHITECTURE-ANALYSIS.md
-- Philosophy: Build for AI to expand, not just for founder to operate
-- Total: 39 new tasks across Phase 1-4
-- ============================================================================

-- ============================================================================
-- PHASE 1: FOUNDATION - Permission System & Email Integration (+8 tasks)
-- ============================================================================

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('1.14 Permission & Approval System', 
 'Setup dynamic permission system for AI agents. WHY: Agents need flexible permissions, not hardcoded ✅❌. SYSTEM: 3 levels (L0 auto, L1 approval, L2 dangerous + 2FA). WORKFLOW: Agent tries action → System checks level → If L1/L2 send Telegram approval → Founder approves → Agent executes. LEARNING: Track approvals → Suggest auto-rules. BENEFIT: Start restrictive, become autonomous over time. COMPONENTS: Permission registry (PostgreSQL), Telegram bot, approval tracking, auto-rule engine.',
 'Pending', 1, NULL, 114);

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('1.14.1 Define Permission Levels',
 'Create permission level definitions (L0, L1, L2). LEVELS: L0 Safe (auto-execute: read logs, restart containers, backups), L1 Approval (deploy staging, modify configs, create users), L2 Dangerous (production deploy, DB DROP, delete backups + 2FA). STORE: permission_levels table with action patterns. EXAMPLE: "docker restart *" = L0, "docker rm prod-*" = L2. OUTPUT: Permission matrix per agent.',
 'Pending', 1, (SELECT id FROM tasks WHERE name = '1.14 Permission & Approval System'), 115),

('1.14.2 Build Approval Workflow',
 'Implement Telegram approval bot. API: POST /api/permissions/request {agent, action, reason}. FLOW: 1) Agent requests action 2) System checks level 3) If L1/L2 create approval request 4) Send Telegram with [✅ Approve] [❌ Deny] buttons 5) Founder clicks 6) System executes or blocks 7) Log decision. TECH: Python + python-telegram-bot + PostgreSQL approval queue. TEST: DevOps Commander requests production deploy → Approval works.',
 'Pending', 1, (SELECT id FROM tasks WHERE name = '1.14 Permission & Approval System'), 116),

('1.14.3 Setup Approval Tracking',
 'Create approval history database. SCHEMA: CREATE TABLE approval_history (id, agent, action, level, requested_at, decided_at, decision, decided_by, reason). ANALYTICS: Track approval patterns, common requests, denial reasons. AUTO-RULE SUGGESTIONS: If action approved 10x → Suggest "Auto-approve this?". AUDIT: Full trail of every permission request. RETENTION: Keep forever for compliance.',
 'Pending', 1, (SELECT id FROM tasks WHERE name = '1.14 Permission & Approval System'), 117),

('1.14.4 Document Permission Matrix',
 'Create permission matrix documentation. FORMAT: Markdown table per agent with actions + levels. EXAMPLE: DevOps Commander: docker restart (L0), deploy staging (L1), deploy prod (L2), DB write (DENY). LOCATION: /opt/trm/docs/permissions/. UPDATE: Auto-generate from permission_levels table. BENEFIT: Founder knows what each agent can do. REVIEW: Monthly audit of permission changes.',
 'Pending', 1, (SELECT id FROM tasks WHERE name = '1.14 Permission & Approval System'), 118);

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('1.15 Agent Email Integration',
 'Setup agent-first email routing. WHY: Emails should go to agents first, not just founder inbox. SYSTEM: Email webhook → Email Router Agent → Classify → Route to agent or founder. BENEFIT: Agents handle routine emails (billing alerts, service notifications), founder only gets important ones. COMPONENTS: Email webhook (Postmark/SendGrid), Email Router Agent, classification rules, founder copy for important emails.',
 'Pending', 1, NULL, 119);

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('1.15.1 Setup Email Webhook',
 'Configure email forwarding to agent API. PROVIDER: Postmark or SendGrid inbound parse. CONFIG: *@rootknow.com → POST /api/email-received {to, from, subject, body, attachments}. PARSING: Extract sender, recipient, content, links. STORAGE: Store raw email in PostgreSQL emails table. SECURITY: Verify webhook signature. TEST: Send email to devops@rootknow.com → Webhook receives.',
 'Pending', 1, (SELECT id FROM tasks WHERE name = '1.15 Agent Email Integration'), 120),

('1.15.2 Create Email Router Agent',
 'Build email classification and routing agent. LOGIC: 1) Receive email webhook 2) Classify type (devops, finance, support, spam) using LLM 3) Route: devops → DevOps Commander, finance → Finance Tracker, support → queue for P2, spam → archive 4) Agent processes email 5) Copy to founder if important. CLASSIFICATION: Use Claude with examples. ROUTING: PostgreSQL routing_rules table. LEARNING: Track which agent handled email best.',
 'Pending', 1, (SELECT id FROM tasks WHERE name = '1.15 Agent Email Integration'), 121),

('1.15.3 Configure Routing Rules',
 'Setup email routing logic per type. RULES: devops@rootknow.com → DevOps Commander (auto), finance@rootknow.com → Finance Tracker (auto), support@rootknow.com → Support queue (manual for P1), hello@rootknow.com → Classify then route, admin@rootknow.com → Founder always. IMPORTANCE: Bill > $100 = important, security alerts = important, newsletters = not important. FOUNDER COPY: Important emails also sent to hung@rootknow.com. UPDATE: Rules stored in DB, editable via API.',
 'Pending', 1, (SELECT id FROM tasks WHERE name = '1.15 Agent Email Integration'), 122),

('1.15.4 Test Email Flow',
 'End-to-end email routing test. TESTS: 1) Send billing alert → Finance Tracker receives + logs cost 2) Send server down alert → DevOps Commander receives + checks status 3) Send spam → Archived, not forwarded 4) Send important email → Agent + founder both get copy 5) Founder replies → Agent sees "founder handled". METRICS: Track email handling time, agent success rate, founder intervention rate. GOAL: 80% emails handled by agents.',
 'Pending', 1, (SELECT id FROM tasks WHERE name = '1.15 Agent Email Integration'), 123);

-- ============================================================================
-- PHASE 2: DATABASES - User Provisioning System (+6 tasks)
-- ============================================================================

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('2.8 Database User Provisioning',
 'Build self-service DB user management. WHY: Agents should create DB users when needed, not manual. SYSTEM: User registry + provisioning API + auto-expiry. WORKFLOW: Agent requests user → Approval if restricted → System creates user in PG/Neo4j/Redis → Store in registry + Vaultwarden → Return connection string → Auto-delete after expiry. BENEFIT: Scalable (1000 users OK), secure (time-limited), auditable (full log). COMPONENTS: db_user_registry table, User Provisioning Agent, Vaultwarden integration.',
 'Pending', 2, NULL, 124);

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('2.8.1 Create User Registry',
 'Database schema for user tracking. SCHEMA: CREATE TABLE db_user_registry (username TEXT PRIMARY KEY, role TEXT, permissions JSONB, created_by TEXT, created_at TIMESTAMP, expires_at TIMESTAMP, status TEXT, connection_string TEXT). ROLES: app, agent, founder, readonly, temp. PERMISSIONS: JSON with allowed operations. EXAMPLE: {"read": ["public.*"], "write": ["logs.*"]}. INDEXES: On username, role, status, expires_at. BENEFIT: Central registry of all DB users.',
 'Pending', 2, (SELECT id FROM tasks WHERE name = '2.8 Database User Provisioning'), 125),

('2.8.2 Build User Provisioning Agent',
 'API for creating DB users programmatically. API: POST /api/db-users/create {username, role, permissions, expires_at, database}. LOGIC: 1) Check approval level (temp users L1) 2) If needed send approval request 3) Create user in PostgreSQL: CREATE USER 4) Grant permissions: GRANT SELECT ON public.* 5) Store in registry 6) Store password in Vaultwarden /db-users/{username} 7) Return connection string. TECH: Python + psycopg2 for PG, py2neo for Neo4j, redis-py for Redis. SECURITY: Password auto-generated (32 chars random).',
 'Pending', 2, (SELECT id FROM tasks WHERE name = '2.8 Database User Provisioning'), 126),

('2.8.3 Create Initial Users',
 'Provision initial DB users via API. USERS: PostgreSQL (6): postgres (superuser, manual), product_app (rw, permanent), agent_orchestrator (rw, permanent), agent_readonly (r, permanent), founder_admin (all, permanent), founder_readonly (r, permanent). Neo4j (3): neo4j (admin), product_app (rw), agent_readonly (r). Redis (3): default (admin), app (rw), agent (r). METHOD: Call provisioning API for each. STORE: Credentials in Vaultwarden /phase2/db-users/. TEST: Connect with each user.',
 'Pending', 2, (SELECT id FROM tasks WHERE name = '2.8 Database User Provisioning'), 127),

('2.8.4 Setup Auto-Expiry',
 'Automatic cleanup of expired users. CRON: Daily job checks db_user_registry.expires_at. LOGIC: If expires_at < NOW() AND status = active → 1) Revoke permissions 2) DROP USER 3) Update status = expired 4) Delete from Vaultwarden 5) Log deletion. ALERT: Weekly report of expired users to founder. EXCEPTION: Permanent users (expires_at = NULL) never deleted. BENEFIT: Security - temp users auto-cleanup.',
 'Pending', 2, (SELECT id FROM tasks WHERE name = '2.8 Database User Provisioning'), 128),

('2.8.5 Test User Self-Provisioning',
 'End-to-end user creation test. SCENARIO: Agent needs temp readonly access to finance table. TEST: 1) Agent calls API: POST /api/db-users/create {username: "agent_finance_temp", role: "temp", permissions: {"read": ["finance.*"]}, expires_at: "+24h"} 2) System creates approval request 3) Founder approves 4) User created in PostgreSQL 5) Agent gets connection string 6) Agent connects and queries finance table 7) After 24h user auto-deleted. VERIFY: User can only read finance, cannot write, cannot read other tables.',
 'Pending', 2, (SELECT id FROM tasks WHERE name = '2.8 Database User Provisioning'), 129),

('2.8.6 Document User Workflow',
 'User provisioning documentation. CONTENT: 1) How to request user (API examples) 2) Permission levels per role 3) Approval process 4) Auto-expiry mechanism 5) Troubleshooting (connection refused, permission denied). FORMAT: Markdown in /opt/trm/docs/db-users/. EXAMPLES: Common scenarios with curl commands. UPDATE: Auto-generate API reference from OpenAPI spec. BENEFIT: Agents can self-serve, founder knows the flow.',
 'Pending', 2, (SELECT id FROM tasks WHERE name = '2.8 Database User Provisioning'), 130);

-- ============================================================================
-- PHASE 3: AI & APPS - Service Account Management (+7 tasks)
-- ============================================================================

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('3.13 Service Account Management',
 'Logto OAuth service accounts + credential workflow. WHY: Each service/agent needs auth, not shared credentials. SYSTEM: 14 Logto service accounts (6 apps + 8 agents) with OAuth client credentials. WORKFLOW: Create Logto app → Get client_id/secret → Store in Vaultwarden with scoping → Agent requests credential → Approval → Agent gets temp access. BENEFIT: Each service isolated, revocable, auditable. SCOPING: /public/ (auto), /restricted/ (approval), /founder-only/ (never).',
 'Pending', 3, NULL, 131);

INSERT INTO tasks (name, description, status, phase_id, parent_id, order_index) VALUES
('3.13.1 Create Logto App Accounts',
 'Register 6 application service accounts. APPS: langgraph-product@service (OAuth, scopes: app.data.*), langgraph-agent@service (scopes: agent.orchestrate), lobechat@service (scopes: chat.*, user.profile), postiz@service (scopes: social.post), grafana@service (scopes: metrics.read), windmill@service (scopes: admin.*). METHOD: Logto admin UI → Create application → OAuth client credentials → Copy client_id/secret. STORE: Vaultwarden /service-accounts/{app}/logto. TEST: Each app can authenticate.',
 'Pending', 3, (SELECT id FROM tasks WHERE name = '3.13 Service Account Management'), 132),

('3.13.2 Create Logto Agent Accounts',
 'Register 8 AI agent service accounts. AGENTS: devops-commander@service, data-orchestrator@service, alert-commander@service, finance-tracker@service, doc-writer@service, compliance-guardian@service, test-runner@service, system-learner@service. SCOPES: Per agent capabilities (devops: docker.*, github.*, alerts.*). METHOD: Same as apps. STORE: Vaultwarden /agents/{agent-name}/logto. TOKEN TTL: 1 hour, refresh 7 days. BENEFIT: Each agent has own identity.',
 'Pending', 3, (SELECT id FROM tasks WHERE name = '3.13 Service Account Management'), 133),

('3.13.3 Setup Credential Request Workflow',
 'API for agents to request credentials. API: POST /api/credentials/request {agent, credential_path, reason, duration}. LOGIC: 1) Check credential scope (public/restricted/founder-only) 2) If restricted → Send approval request 3) Founder approves → Create temp access token 4) Return credential (masked in logs) 5) After duration → Revoke access. SCOPING: /public/ = auto-grant, /restricted/ = approval, /founder-only/ = always deny. AUDIT: Every credential access logged with reason.',
 'Pending', 3, (SELECT id FROM tasks WHERE name = '3.13 Service Account Management'), 134),

('3.13.4 Store Credentials with Scoping',
 'Organize Vaultwarden with access scopes. FOLDERS: /credentials/public/ (GitHub repo URLs, public endpoints), /credentials/restricted/ (API keys, service passwords, OAuth secrets), /credentials/founder-only/ (master passwords, bank, personal). METADATA: Add custom field "scope" to each item (public/restricted/founder-only). BENEFIT: Clear boundaries, easy to audit. MIGRATION: Move existing credentials to appropriate folders.',
 'Pending', 3, (SELECT id FROM tasks WHERE name = '3.13 Service Account Management'), 135),

('3.13.5 Test Agent Credential Access',
 'End-to-end credential request test. SCENARIO: DevOps Commander needs GitHub PAT to deploy. TEST: 1) Agent calls API: POST /api/credentials/request {agent: "devops-commander", credential: "/restricted/github-pat", reason: "Deploy service X", duration: "1h"} 2) System checks: DevOps allowed GitHub access? Yes 3) System sends approval: "DevOps requests GitHub PAT for 1h to deploy X" 4) Founder approves 5) Agent gets PAT (valid 1h) 6) Agent uses PAT to deploy 7) After 1h access revoked. VERIFY: Agent cannot access /founder-only/, expired token rejected.',
 'Pending', 3, (SELECT id FROM tasks WHERE name = '3.13 Service Account Management'), 136),

('3.13.6 Setup Auto-Approval Rules',
 'Configure auto-approval patterns. RULES: DevOps Commander + GitHub PAT = auto-approve (always), Data Orchestrator + DB passwords = auto-approve (always), Any agent + bank credentials = always deny. LEARNING: Track approval history → Suggest new auto-rules. UI: Founder can view/edit rules. EXAMPLE: "You approved Docker API access for DevOps 15 times, auto-approve?" BENEFIT: Reduce approval fatigue, maintain security.',
 'Pending', 3, (SELECT id FROM tasks WHERE name = '3.13 Service Account Management'), 137),

('3.13.7 Document Access Control',
 'Service account and credential documentation. CONTENT: 1) List of all 14 service accounts 2) Scopes per account 3) Credential request API 4) Scoping rules (public/restricted/founder-only) 5) Auto-approval rules 6) Audit queries. FORMAT: Markdown + auto-generated from Logto. LOCATION: /opt/trm/docs/service-accounts/. BENEFIT: Clear understanding of who can access what.',
 'Pending', 3, (SELECT id FROM tasks WHERE name = '3.13 Service Account Management'), 138);

-- Done!
