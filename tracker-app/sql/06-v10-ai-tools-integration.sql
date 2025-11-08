-- Phase 6: V10 AI Tools 2025 Integration
-- Date: Nov 7, 2025
-- Purpose: Track implementation of 6 new AI tools into V10 infrastructure

-- Create Phase 6
INSERT INTO phases (id, name, description, order_index) VALUES
(6, 'Phase 6: AI Tools 2025', 'Integration of TOON, Markitdown, Docling, DeepSeek OCR, Agent Lightning, and HRM into V10 infrastructure for cost optimization and enhanced capabilities', 6);

-- ========================================
-- WEEK 1: CORE TOKEN OPTIMIZATION
-- ========================================

-- 6.1 TOON Integration (Priority: CRITICAL)
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, is_milestone, milestone_description) VALUES
('6.1 TOON Integration', '30-50% token cost savings by replacing JSON with TOON format', 6, 'PENDING', 'CRITICAL', 12, 'HUMAN', 'FOUNDER', 'milestone', true, 'Replace JSON with TOON across all LangGraph prompts and agent communications to achieve 30-50% token cost reduction');

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, depends_on) VALUES
((SELECT id FROM tasks WHERE name = '6.1 TOON Integration'),
 '6.1.1 Install TOON Library', 'pip install toon on VPS3 Product AI and Agent AI', 6, 'PENDING', 'CRITICAL', 0.5, 'HUMAN', 'FOUNDER', NULL),

((SELECT id FROM tasks WHERE name = '6.1 TOON Integration'),
 '6.1.2 Create TOON Utilities', 'Build encoding/decoding wrapper functions for LangGraph integration', 6, 'PENDING', 'CRITICAL', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.1.1 Install TOON Library')]),

((SELECT id FROM tasks WHERE name = '6.1 TOON Integration'),
 '6.1.3 Update LangGraph Prompts', 'Convert system prompts from JSON to TOON format', 6, 'PENDING', 'CRITICAL', 4, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.1.2 Create TOON Utilities')]),

((SELECT id FROM tasks WHERE name = '6.1 TOON Integration'),
 '6.1.4 Update Agent Communication', 'Convert inter-agent messages to TOON format', 6, 'PENDING', 'HIGH', 3, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.1.2 Create TOON Utilities')]),

((SELECT id FROM tasks WHERE name = '6.1 TOON Integration'),
 '6.1.5 Test Token Reduction', 'Run 10 sample tasks and measure token savings', 6, 'PENDING', 'CRITICAL', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.1.3 Update LangGraph Prompts'), (SELECT id FROM tasks WHERE name = '6.1.4 Update Agent Communication')]),

((SELECT id FROM tasks WHERE name = '6.1 TOON Integration'),
 '6.1.6 Monitor & Document', 'Setup Grafana dashboard for token usage tracking', 6, 'PENDING', 'HIGH', 1.5, 'AI', 'Documentation Agent', ARRAY[(SELECT id FROM tasks WHERE name = '6.1.5 Test Token Reduction')]);

-- 6.2 Markitdown MCP (Priority: CRITICAL)
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, is_milestone, milestone_description) VALUES
('6.2 Markitdown MCP Integration', 'Production-grade document-to-Markdown conversion for RAG pipeline', 6, 'PENDING', 'CRITICAL', 8, 'HUMAN', 'FOUNDER', 'milestone', true, 'Deploy Markitdown as MCP server to handle PDF, Word, Excel, images conversion to clean Markdown for RAG ingestion');

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, depends_on) VALUES
((SELECT id FROM tasks WHERE name = '6.2 Markitdown MCP Integration'),
 '6.2.1 Install Markitdown', 'pip install markitdown[all] on VPS2/VPS3', 6, 'PENDING', 'CRITICAL', 0.5, 'HUMAN', 'FOUNDER', NULL),

((SELECT id FROM tasks WHERE name = '6.2 Markitdown MCP Integration'),
 '6.2.2 Create MCP Server', 'Build MCP wrapper for markitdown with HTTP endpoints', 6, 'PENDING', 'CRITICAL', 3, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.2.1 Install Markitdown')]),

((SELECT id FROM tasks WHERE name = '6.2 Markitdown MCP Integration'),
 '6.2.3 Add to MCP Config', 'Register markitdown-mcp in LangGraph configuration', 6, 'PENDING', 'HIGH', 0.5, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.2.2 Create MCP Server')]),

((SELECT id FROM tasks WHERE name = '6.2 Markitdown MCP Integration'),
 '6.2.4 Test Document Formats', 'Verify PDF, DOCX, PPTX, Excel, image conversions', 6, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.2.3 Add to MCP Config')]),

((SELECT id FROM tasks WHERE name = '6.2 Markitdown MCP Integration'),
 '6.2.5 Create Doc-Processing Skill', 'Build trm-doc-processing agent skill using markitdown', 6, 'PENDING', 'CRITICAL', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.2.4 Test Document Formats')]);

-- 6.3 Docling MCP (Priority: HIGH)
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, is_milestone, milestone_description) VALUES
('6.3 Docling MCP Integration', 'Advanced PDF understanding with 0% hallucination for complex documents', 6, 'PENDING', 'HIGH', 10, 'HUMAN', 'FOUNDER', 'milestone', true, 'Deploy Docling for production-grade PDF parsing with layout detection, table structure, formulas, and reading order for technical documents');

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, depends_on) VALUES
((SELECT id FROM tasks WHERE name = '6.3 Docling MCP Integration'),
 '6.3.1 Install Docling', 'pip install docling on VPS2 (CPU-only)', 6, 'PENDING', 'HIGH', 0.5, 'HUMAN', 'FOUNDER', NULL),

((SELECT id FROM tasks WHERE name = '6.3 Docling MCP Integration'),
 '6.3.2 Create MCP Server', 'Build Docling MCP wrapper with HTTP API', 6, 'PENDING', 'HIGH', 3, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.3.1 Install Docling')]),

((SELECT id FROM tasks WHERE name = '6.3 Docling MCP Integration'),
 '6.3.3 Implement Routing Logic', 'Create decision logic: Markitdown vs Docling based on complexity', 6, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.3.2 Create MCP Server'), (SELECT id FROM tasks WHERE name = '6.2.5 Create Doc-Processing Skill')]),

((SELECT id FROM tasks WHERE name = '6.3 Docling MCP Integration'),
 '6.3.4 Test Complex PDFs', 'Benchmark with technical papers, contracts, financial reports', 6, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.3.3 Implement Routing Logic')]),

((SELECT id FROM tasks WHERE name = '6.3 Docling MCP Integration'),
 '6.3.5 Create PDF-Analysis Skill', 'Build trm-pdf-analysis skill for specialized use cases', 6, 'PENDING', 'HIGH', 2.5, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.3.4 Test Complex PDFs')]);

-- ========================================
-- WEEK 2-3: MODAL INTEGRATION
-- ========================================

-- 6.4 DeepSeek OCR on Modal (Priority: HIGH)
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, is_milestone, milestone_description) VALUES
('6.4 DeepSeek OCR Modal Deployment', '10x token savings on vision tasks via GPU on-demand', 6, 'PENDING', 'HIGH', 12, 'HUMAN', 'FOUNDER', 'milestone', true, 'Deploy DeepSeek OCR as Modal serverless function (T4 GPU) to compress vision tokens by 10x for image-heavy workflows');

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, depends_on) VALUES
((SELECT id FROM tasks WHERE name = '6.4 DeepSeek OCR Modal Deployment'),
 '6.4.1 Setup Modal Account', 'Create Modal account and install CLI', 6, 'PENDING', 'HIGH', 1, 'HUMAN', 'FOUNDER', NULL),

((SELECT id FROM tasks WHERE name = '6.4 DeepSeek OCR Modal Deployment'),
 '6.4.2 Create Modal Function', 'Write modal_deepseek_ocr.py with T4 GPU config', 6, 'PENDING', 'HIGH', 4, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.4.1 Setup Modal Account')]),

((SELECT id FROM tasks WHERE name = '6.4 DeepSeek OCR Modal Deployment'),
 '6.4.3 Deploy to Modal', 'modal deploy modal_deepseek_ocr.py and get endpoint', 6, 'PENDING', 'HIGH', 1, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.4.2 Create Modal Function')]),

((SELECT id FROM tasks WHERE name = '6.4 DeepSeek OCR Modal Deployment'),
 '6.4.4 Create External MCP', 'Build MCP wrapper for Modal endpoint on VPS3', 6, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.4.3 Deploy to Modal')]),

((SELECT id FROM tasks WHERE name = '6.4 DeepSeek OCR Modal Deployment'),
 '6.4.5 Test Vision Tasks', 'Process 20 sample images and measure token compression', 6, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.4.4 Create External MCP')]),

((SELECT id FROM tasks WHERE name = '6.4 DeepSeek OCR Modal Deployment'),
 '6.4.6 Setup Cost Monitoring', 'Grafana dashboard for Modal GPU usage and costs', 6, 'PENDING', 'HIGH', 1, 'AI', 'Cost-Optimizer Agent', ARRAY[(SELECT id FROM tasks WHERE name = '6.4.5 Test Vision Tasks')]),

((SELECT id FROM tasks WHERE name = '6.4 DeepSeek OCR Modal Deployment'),
 '6.4.7 Create Vision-Analysis Skill', 'Build trm-vision-analysis skill using DeepSeek OCR', 6, 'PENDING', 'HIGH', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.4.5 Test Vision Tasks')]);

-- 6.5 Agent Lightning Training (Priority: MEDIUM)
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, is_milestone, milestone_description) VALUES
('6.5 Agent Lightning Training Pipeline', 'RL-based training for custom agent optimization', 6, 'PENDING', 'MEDIUM', 16, 'HUMAN', 'FOUNDER', 'milestone', true, 'Setup Modal A100-based training pipeline to optimize LangGraph agents using reinforcement learning for improved performance');

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, depends_on) VALUES
((SELECT id FROM tasks WHERE name = '6.5 Agent Lightning Training Pipeline'),
 '6.5.1 Install Agent Lightning', 'pip install agentlightning locally for testing', 6, 'PENDING', 'MEDIUM', 0.5, 'HUMAN', 'FOUNDER', NULL),

((SELECT id FROM tasks WHERE name = '6.5 Agent Lightning Training Pipeline'),
 '6.5.2 Create Modal Training Function', 'Write agent_training.py with A100 GPU config', 6, 'PENDING', 'MEDIUM', 6, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.5.1 Install Agent Lightning')]),

((SELECT id FROM tasks WHERE name = '6.5 Agent Lightning Training Pipeline'),
 '6.5.3 Setup Logging Pipeline', 'Collect agent interaction logs from VPS3 for training data', 6, 'PENDING', 'MEDIUM', 3, 'AI', 'Developer Agent', ARRAY[(SELECT id FROM tasks WHERE name = '6.5.2 Create Modal Training Function')]),

((SELECT id FROM tasks WHERE name = '6.5 Agent Lightning Training Pipeline'),
 '6.5.4 Prepare Training Dataset', 'Format logs into Agent Lightning training format', 6, 'PENDING', 'MEDIUM', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.5.3 Setup Logging Pipeline')]),

((SELECT id FROM tasks WHERE name = '6.5 Agent Lightning Training Pipeline'),
 '6.5.5 Run First Training Job', 'Train Documentation Agent with collected data', 6, 'PENDING', 'MEDIUM', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.5.4 Prepare Training Dataset')]),

((SELECT id FROM tasks WHERE name = '6.5 Agent Lightning Training Pipeline'),
 '6.5.6 Evaluate Improvements', 'A/B test optimized vs baseline agent performance', 6, 'PENDING', 'MEDIUM', 2, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.5.5 Run First Training Job')]),

((SELECT id FROM tasks WHERE name = '6.5 Agent Lightning Training Pipeline'),
 '6.5.7 Schedule Weekly Training', 'Setup cron job for weekly agent optimization runs', 6, 'PENDING', 'MEDIUM', 0.5, 'AI', 'Developer Agent', ARRAY[(SELECT id FROM tasks WHERE name = '6.5.6 Evaluate Improvements')]);

-- 6.6 HRM Research (Priority: LOW)
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to) VALUES
('6.6 HRM Research & Monitoring', 'Watch Hierarchical Reasoning Model development for future local inference', 6, 'PENDING', 'MEDIUM', 4, 'AI', 'Research Agent');

-- ========================================
-- WEEK 4: TESTING & OPTIMIZATION
-- ========================================

-- 6.7 Integration Testing & Metrics
INSERT INTO tasks (name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, task_type, is_milestone, milestone_description, depends_on) VALUES
('6.7 V10.1 Integration Complete', 'Full system testing and cost savings validation', 6, 'PENDING', 'CRITICAL', 16, 'HUMAN', 'FOUNDER', 'milestone', true, 'Validate all 6 tools integrated successfully with measurable cost savings and performance improvements', 
ARRAY[
  (SELECT id FROM tasks WHERE name = '6.1 TOON Integration'),
  (SELECT id FROM tasks WHERE name = '6.2 Markitdown MCP Integration'),
  (SELECT id FROM tasks WHERE name = '6.3 Docling MCP Integration'),
  (SELECT id FROM tasks WHERE name = '6.4 DeepSeek OCR Modal Deployment'),
  (SELECT id FROM tasks WHERE name = '6.5 Agent Lightning Training Pipeline')
]);

INSERT INTO tasks (parent_id, name, description, phase_id, status, priority, estimated_hours, assigned_type, assigned_to, depends_on) VALUES
((SELECT id FROM tasks WHERE name = '6.7 V10.1 Integration Complete'),
 '6.7.1 A/B Test TOON vs JSON', 'Measure actual token savings across 100 tasks', 6, 'PENDING', 'HIGH', 4, 'AI', 'Cost-Optimizer Agent', ARRAY[(SELECT id FROM tasks WHERE name = '6.1 TOON Integration')]),

((SELECT id FROM tasks WHERE name = '6.7 V10.1 Integration Complete'),
 '6.7.2 Benchmark Document Processing', 'Compare Markitdown vs Docling accuracy and speed', 6, 'PENDING', 'HIGH', 3, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.2 Markitdown MCP Integration'), (SELECT id FROM tasks WHERE name = '6.3 Docling MCP Integration')]),

((SELECT id FROM tasks WHERE name = '6.7 V10.1 Integration Complete'),
 '6.7.3 Monitor Modal Costs', 'Track GPU usage and ensure within $50/month budget', 6, 'PENDING', 'CRITICAL', 2, 'AI', 'Cost-Optimizer Agent', ARRAY[(SELECT id FROM tasks WHERE name = '6.4 DeepSeek OCR Modal Deployment')]),

((SELECT id FROM tasks WHERE name = '6.7 V10.1 Integration Complete'),
 '6.7.4 Test Agent Performance', 'Measure improved agent efficiency from training', 6, 'PENDING', 'MEDIUM', 3, 'HUMAN', 'FOUNDER', ARRAY[(SELECT id FROM tasks WHERE name = '6.5 Agent Lightning Training Pipeline')]),

((SELECT id FROM tasks WHERE name = '6.7 V10.1 Integration Complete'),
 '6.7.5 Generate Cost Report', 'Document actual savings vs projections ($540/year target)', 6, 'PENDING', 'CRITICAL', 2, 'AI', 'Documentation Agent', 
ARRAY[
  (SELECT id FROM tasks WHERE name = '6.7.1 A/B Test TOON vs JSON'),
  (SELECT id FROM tasks WHERE name = '6.7.3 Monitor Modal Costs')
]),

((SELECT id FROM tasks WHERE name = '6.7 V10.1 Integration Complete'),
 '6.7.6 Update Documentation', 'Document all new MCPs, skills, and Modal functions', 6, 'PENDING', 'HIGH', 4, 'AI', 'Documentation Agent', 
ARRAY[
  (SELECT id FROM tasks WHERE name = '6.7.2 Benchmark Document Processing'),
  (SELECT id FROM tasks WHERE name = '6.7.4 Test Agent Performance')
]),

((SELECT id FROM tasks WHERE name = '6.7 V10.1 Integration Complete'),
 '6.7.7 Create V10.1 Runbooks', 'Operational guides for new tools and troubleshooting', 6, 'PENDING', 'HIGH', 3, 'AI', 'Documentation Agent', ARRAY[(SELECT id FROM tasks WHERE name = '6.7.6 Update Documentation')]);

-- Summary tasks count for Phase 6
-- Total: 7 milestones, 38 subtasks = 45 tasks
-- Estimated time: 78 hours over 4 weeks
-- Cost savings target: $540/year = $45/month
