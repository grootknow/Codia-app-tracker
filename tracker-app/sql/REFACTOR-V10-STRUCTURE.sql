-- ========================================
-- V10 STRUCTURE REFACTOR - ONE-TIME FIX
-- Date: Nov 7, 2025
-- Purpose: Fix Phase 6 placement + Add missing tasks
-- ========================================

-- STEP 1: DELETE PHASE 6 (Wrong placement)
-- ========================================
DELETE FROM tasks WHERE phase_id = 6;
DELETE FROM phases WHERE id = 6;

-- STEP 2: ADD AI ENHANCEMENT TOOLS TO PHASE 3
-- ========================================
-- Phase 3 is "AI Brain & Apps" - Enhancement tools belong HERE, not after Media!

-- 3.7 Token Optimization (TOON) - CRITICAL for cost savings from DAY 1
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, order_index) VALUES
('3.7 Token Optimization (TOON)', 'Reduce AI API costs by 30-50% using TOON format instead of JSON', 3, 'PENDING', 'CRITICAL', 8, 'HUMAN', 'FOUNDER', 'group', 17);

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, order_index) VALUES
((SELECT id FROM tasks WHERE name = '3.7 Token Optimization (TOON)'),
 '3.7.1 Install TOON Library', 'pip install toon on VPS3', 3, 'PENDING', 'CRITICAL', 0.5, 'HUMAN', 'FOUNDER', 1),

((SELECT id FROM tasks WHERE name = '3.7 Token Optimization (TOON)'),
 '3.7.2 Create TOON Utilities', 'Build encoding/decoding wrappers for LangGraph', 3, 'PENDING', 'CRITICAL', 2, 'HUMAN', 'FOUNDER', 2),

((SELECT id FROM tasks WHERE name = '3.7 Token Optimization (TOON)'),
 '3.7.3 Update LangGraph Prompts', 'Convert system prompts from JSON to TOON', 3, 'PENDING', 'CRITICAL', 3, 'HUMAN', 'FOUNDER', 3),

((SELECT id FROM tasks WHERE name = '3.7 Token Optimization (TOON)'),
 '3.7.4 Update Agent Communication', 'Convert inter-agent messages to TOON', 3, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', 4),

((SELECT id FROM tasks WHERE name = '3.7 Token Optimization (TOON)'),
 '3.7.5 Monitor Token Savings', 'Setup Grafana dashboard for token tracking', 3, 'PENDING', 'MEDIUM', 1, 'AI', 'Documentation Agent', 5);

-- 3.8 Document Processing MCPs - CRITICAL for RAG pipeline
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, order_index) VALUES
('3.8 Document Processing MCPs', 'Production-grade doc-to-MD conversion for knowledge ingestion', 3, 'PENDING', 'CRITICAL', 12, 'HUMAN', 'FOUNDER', 'group', 18);

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, order_index) VALUES
((SELECT id FROM tasks WHERE name = '3.8 Document Processing MCPs'),
 '3.8.1 Install Markitdown', 'pip install markitdown[all] on VPS2', 3, 'PENDING', 'HIGH', 0.5, 'HUMAN', 'FOUNDER', 1),

((SELECT id FROM tasks WHERE name = '3.8 Document Processing MCPs'),
 '3.8.2 Create Markitdown MCP', 'Build MCP server for PDF/Word/Excel conversion', 3, 'PENDING', 'HIGH', 3, 'HUMAN', 'FOUNDER', 2),

((SELECT id FROM tasks WHERE name = '3.8 Document Processing MCPs'),
 '3.8.3 Install Docling', 'pip install docling on VPS2 for advanced PDF parsing', 3, 'PENDING', 'HIGH', 0.5, 'HUMAN', 'FOUNDER', 3),

((SELECT id FROM tasks WHERE name = '3.8 Document Processing MCPs'),
 '3.8.4 Create Docling MCP', 'Build MCP for complex PDF with tables/formulas', 3, 'PENDING', 'HIGH', 3, 'HUMAN', 'FOUNDER', 4),

((SELECT id FROM tasks WHERE name = '3.8 Document Processing MCPs'),
 '3.8.5 Create Doc Router', 'Smart routing: Markitdown vs Docling based on complexity', 3, 'PENDING', 'MEDIUM', 2, 'HUMAN', 'FOUNDER', 5),

((SELECT id FROM tasks WHERE name = '3.8 Document Processing MCPs'),
 '3.8.6 Test Document Formats', 'Verify PDF, DOCX, PPTX, Excel, images', 3, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', 6);

-- 3.9 Vision Enhancement (Modal) - For image-heavy workflows
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, order_index) VALUES
('3.9 Vision Enhancement (Modal GPU)', 'DeepSeek OCR for 10x token compression on vision tasks', 3, 'PENDING', 'MEDIUM', 8, 'HUMAN', 'FOUNDER', 'group', 19);

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, order_index) VALUES
((SELECT id FROM tasks WHERE name = '3.9 Vision Enhancement (Modal GPU)'),
 '3.9.1 Setup Modal Account', 'Create account and install CLI', 3, 'PENDING', 'MEDIUM', 1, 'HUMAN', 'FOUNDER', 1),

((SELECT id FROM tasks WHERE name = '3.9 Vision Enhancement (Modal GPU)'),
 '3.9.2 Create DeepSeek OCR Function', 'modal_deepseek_ocr.py with T4 GPU', 3, 'PENDING', 'MEDIUM', 4, 'HUMAN', 'FOUNDER', 2),

((SELECT id FROM tasks WHERE name = '3.9 Vision Enhancement (Modal GPU)'),
 '3.9.3 Deploy to Modal', 'Get serverless endpoint URL', 3, 'PENDING', 'MEDIUM', 1, 'HUMAN', 'FOUNDER', 3),

((SELECT id FROM tasks WHERE name = '3.9 Vision Enhancement (Modal GPU)'),
 '3.9.4 Create External MCP', 'Wrap Modal endpoint as MCP on VPS3', 3, 'PENDING', 'MEDIUM', 2, 'HUMAN', 'FOUNDER', 4),

((SELECT id FROM tasks WHERE name = '3.9 Vision Enhancement (Modal GPU)'),
 '3.9.5 Test Vision Compression', 'Process 20 images, measure token savings', 3, 'PENDING', 'MEDIUM', 1.5, 'HUMAN', 'FOUNDER', 5);

-- STEP 3: ADD AGENT TRAINING TO PHASE 4 (Operations)
-- ========================================
-- Phase 4 is "Integration & Operations" - Agent optimization belongs here!

-- 4.11 Agent Training Pipeline (Modal)
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, order_index) VALUES
('4.11 Agent Training Pipeline', 'RL-based training for continuous agent optimization', 4, 'PENDING', 'MEDIUM', 16, 'HUMAN', 'FOUNDER', 'group', 31);

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, order_index) VALUES
((SELECT id FROM tasks WHERE name = '4.11 Agent Training Pipeline'),
 '4.11.1 Install Agent Lightning', 'pip install agentlightning locally', 4, 'PENDING', 'MEDIUM', 0.5, 'HUMAN', 'FOUNDER', 1),

((SELECT id FROM tasks WHERE name = '4.11 Agent Training Pipeline'),
 '4.11.2 Create Training Function', 'agent_training.py with A100 GPU on Modal', 4, 'PENDING', 'MEDIUM', 6, 'HUMAN', 'FOUNDER', 2),

((SELECT id FROM tasks WHERE name = '4.11 Agent Training Pipeline'),
 '4.11.3 Setup Logging Pipeline', 'Collect agent interactions for training data', 4, 'PENDING', 'MEDIUM', 3, 'AI', 'Developer Agent', 3),

((SELECT id FROM tasks WHERE name = '4.11 Agent Training Pipeline'),
 '4.11.4 Prepare Training Dataset', 'Format logs into Agent Lightning format', 4, 'PENDING', 'MEDIUM', 2, 'HUMAN', 'FOUNDER', 4),

((SELECT id FROM tasks WHERE name = '4.11 Agent Training Pipeline'),
 '4.11.5 Run First Training', 'Train Documentation Agent with collected data', 4, 'PENDING', 'MEDIUM', 2, 'HUMAN', 'FOUNDER', 5),

((SELECT id FROM tasks WHERE name = '4.11 Agent Training Pipeline'),
 '4.11.6 A/B Test Results', 'Compare optimized vs baseline performance', 4, 'PENDING', 'MEDIUM', 2, 'HUMAN', 'FOUNDER', 6),

((SELECT id FROM tasks WHERE name = '4.11 Agent Training Pipeline'),
 '4.11.7 Schedule Weekly Training', 'Cron job for continuous optimization', 4, 'PENDING', 'LOW', 0.5, 'AI', 'Developer Agent', 7);

-- 4.12 Cost Monitoring & Optimization
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, order_index) VALUES
('4.12 Cost Monitoring & Optimization', 'Track and optimize Modal GPU + AI API costs', 4, 'PENDING', 'HIGH', 6, 'AI', 'Cost-Optimizer Agent', 'group', 32);

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, order_index) VALUES
((SELECT id FROM tasks WHERE name = '4.12 Cost Monitoring & Optimization'),
 '4.12.1 Setup Modal Cost Dashboard', 'Grafana tracking for GPU usage', 4, 'PENDING', 'HIGH', 2, 'AI', 'Cost-Optimizer Agent', 1),

((SELECT id FROM tasks WHERE name = '4.12 Cost Monitoring & Optimization'),
 '4.12.2 Setup Token Usage Dashboard', 'Track TOON savings vs JSON baseline', 4, 'PENDING', 'HIGH', 2, 'AI', 'Cost-Optimizer Agent', 2),

((SELECT id FROM tasks WHERE name = '4.12 Cost Monitoring & Optimization'),
 '4.12.3 Cost Alerts', 'Alert if Modal >$50/mo or tokens spike', 4, 'PENDING', 'HIGH', 1, 'AI', 'Cost-Optimizer Agent', 3),

((SELECT id FROM tasks WHERE name = '4.12 Cost Monitoring & Optimization'),
 '4.12.4 Generate Monthly Report', 'Cost breakdown + savings achieved', 4, 'PENDING', 'MEDIUM', 1, 'AI', 'Documentation Agent', 4);

-- STEP 4: ADD MISSING PHASE 3 TASKS
-- ========================================

-- 3.10 MCPs Integration & Testing
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, order_index) VALUES
('3.10 MCPs Integration & Testing', 'Integrate all MCPs with LangGraph and test end-to-end', 3, 'PENDING', 'CRITICAL', 8, 'HUMAN', 'FOUNDER', 'group', 20);

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, order_index) VALUES
((SELECT id FROM tasks WHERE name = '3.10 MCPs Integration & Testing'),
 '3.10.1 Register All MCPs', 'Add all MCPs to LangGraph config', 3, 'PENDING', 'CRITICAL', 2, 'HUMAN', 'FOUNDER', 1),

((SELECT id FROM tasks WHERE name = '3.10 MCPs Integration & Testing'),
 '3.10.2 Test Each MCP', 'Verify functionality of each tool', 3, 'PENDING', 'HIGH', 4, 'HUMAN', 'FOUNDER', 2),

((SELECT id FROM tasks WHERE name = '3.10 MCPs Integration & Testing'),
 '3.10.3 Test Agent Workflows', 'End-to-end testing with real tasks', 3, 'PENDING', 'CRITICAL', 2, 'HUMAN', 'FOUNDER', 3);

-- 3.11 Skills Library Population
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, order_index) VALUES
('3.11 Skills Library Population', 'Create initial 20+ agent skills for TRM workflows', 3, 'PENDING', 'HIGH', 12, 'HUMAN', 'FOUNDER', 'group', 21);

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, order_index) VALUES
((SELECT id FROM tasks WHERE name = '3.11 Skills Library Population'),
 '3.11.1 Create trm-research-report', 'Skill for research report generation', 3, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', 1),

((SELECT id FROM tasks WHERE name = '3.11 Skills Library Population'),
 '3.11.2 Create trm-content-generation', 'Skill for TRM-style content', 3, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', 2),

((SELECT id FROM tasks WHERE name = '3.11 Skills Library Population'),
 '3.11.3 Create trm-data-analysis', 'Skill for data analysis workflows', 3, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', 3),

((SELECT id FROM tasks WHERE name = '3.11 Skills Library Population'),
 '3.11.4 Create trm-doc-processing', 'Skill using Markitdown/Docling', 3, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', 4),

((SELECT id FROM tasks WHERE name = '3.11 Skills Library Population'),
 '3.11.5 Document All Skills', 'Create SKILL.md for each', 3, 'PENDING', 'MEDIUM', 4, 'AI', 'Documentation Agent', 5);

-- STEP 5: ADD INTEGRATION VALIDATION TO PHASE 4
-- ========================================

-- 4.13 Integration Testing & Validation
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, order_index) VALUES
('4.13 Integration Testing & Validation', 'Comprehensive testing of all V10 components working together', 4, 'PENDING', 'CRITICAL', 16, 'HUMAN', 'FOUNDER', 'group', 33);

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, order_index) VALUES
((SELECT id FROM tasks WHERE name = '4.13 Integration Testing & Validation'),
 '4.13.1 Test Product AI Workflows', 'Verify LangGraph Product + MCPs + Skills', 4, 'PENDING', 'CRITICAL', 4, 'HUMAN', 'FOUNDER', 1),

((SELECT id FROM tasks WHERE name = '4.13 Integration Testing & Validation'),
 '4.13.2 Test Agent AI Workflows', 'Verify 8 agents + coordination', 4, 'PENDING', 'CRITICAL', 4, 'HUMAN', 'FOUNDER', 2),

((SELECT id FROM tasks WHERE name = '4.13 Integration Testing & Validation'),
 '4.13.3 Test Real-time Sync', 'WebSocket + Supabase real-time', 4, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', 3),

((SELECT id FROM tasks WHERE name = '4.13 Integration Testing & Validation'),
 '4.13.4 Load Testing', 'Test under concurrent user load', 4, 'PENDING', 'HIGH', 3, 'HUMAN', 'FOUNDER', 4),

((SELECT id FROM tasks WHERE name = '4.13 Integration Testing & Validation'),
 '4.13.5 Generate Test Report', 'Document all test results', 4, 'PENDING', 'MEDIUM', 3, 'AI', 'Documentation Agent', 5);

-- STEP 6: UPDATE TASK COUNTS & SUMMARY
-- ========================================

-- Summary of changes:
-- DELETED: Phase 6 (44 tasks)
-- ADDED to Phase 3: 
--   - 3.7 Token Optimization (5 subtasks)
--   - 3.8 Document Processing (6 subtasks) 
--   - 3.9 Vision Enhancement (5 subtasks)
--   - 3.10 MCPs Integration (3 subtasks)
--   - 3.11 Skills Library (5 subtasks)
--   Total: 5 groups + 24 subtasks = 29 tasks
--
-- ADDED to Phase 4:
--   - 4.11 Agent Training (7 subtasks)
--   - 4.12 Cost Monitoring (4 subtasks)
--   - 4.13 Integration Testing (5 subtasks)
--   Total: 3 groups + 16 subtasks = 19 tasks
--
-- NEW TOTALS:
--   Phase 3: 18 → 47 tasks (+29)
--   Phase 4: 31 → 50 tasks (+19)
--   TOTAL: 221 → 225 tasks (+4 net, -44 Phase 6, +48 new)
