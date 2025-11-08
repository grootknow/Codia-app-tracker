# 🚀 CODIA TRACKER - DATABASE-FIRST SYSTEM

## ✅ **MỌI THỨ Ở TRONG DATABASE**

```yaml
Tracker App: https://codia-tracker-h9d0dvqvu-kakaholigan-6270s-projects.vercel.app
Database: Supabase (pmqocxdtypxobihxusqj)
Source: V10-FINAL-PRODUCTION-backup/diagrams/ (READ-ONLY reference)
```

---

## 📊 **DATABASE STRUCTURE**

### **Main Tables:**
```sql
entities          -- RootKnow Inc.
  └─ persons      -- 2 founders
       └─ person_devices  -- 8 devices

account_providers -- Google, GitHub, Contabo, etc.
  └─ accounts     -- 135 accounts
       └─ account_dependencies  -- Who pays/authenticates who

infrastructure_nodes  -- VPS1, VPS2, VPS3
  └─ services    -- 35+ apps

equipment         -- $20K media gear

phases            -- 6 phases
  └─ tasks        -- 177 tasks
       └─ parent_id (tree structure)
       └─ depends_on (dependencies)
```

### **Smart Views:**
```sql
task_tree          -- Hierarchical task view with depth
task_dependencies  -- Shows depends_on with names
tracker_app_data   -- Everything for app in ONE query
```

### **Functions:**
```sql
get_task_context(task_id)  -- Full context JSON
generate_claude_md()       -- Auto-gen CLAUDE.md
```

---

## 🎯 **HOW TO USE**

### **1. Query Tasks (with tree structure):**
```sql
-- See hierarchy
SELECT 
    REPEAT('  ', depth) || name as tree,
    status,
    assigned_to
FROM task_tree
WHERE phase_id = 0;

-- Result:
-- 0.1 Create All Accounts
--   0.1.1 Contabo Account
--   0.1.2 Cloudflare Account
-- 0.2 Domain & DNS Setup
--   0.2.1 Register Domain
```

### **2. Update Tasks:**
```sql
-- Mark task done
UPDATE tasks 
SET status = 'DONE', 
    completed_at = NOW(),
    actual_hours = 0.5
WHERE name = '0.1.1 Contabo Account';

-- Changes reflect in tracker app immediately (real-time)
```

### **3. Get Full Context:**
```sql
SELECT get_task_context(
    (SELECT id FROM tasks WHERE name = '0.1.1 Contabo Account')
);

-- Returns JSON with:
-- - Task details
-- - Parent task
-- - Child tasks
-- - Dependencies
-- - Who it blocks
-- - Full tree path
```

### **4. For Tracker App:**
```sql
-- App uses this ONE view for everything
SELECT * FROM tracker_app_data;

-- Has all fields:
-- - name, description, status
-- - phase_name, parent_name
-- - assigned_to, assigned_type
-- - depends_on_names
-- - depth, full_path
-- - child_count, blocking_count
```

---

## 📁 **FILE STRUCTURE**

```
e:/tạo document cho hoạch định thiết kế vps/
├─ CLAUDE.md                    ← THIS (auto-generated from DB)
├─ README.md                    ← THIS  
├─ START-HERE.md                ← Quick start guide
├─ V10-FINAL-PRODUCTION-backup/
│  └─ diagrams/                 ← READ-ONLY reference
│     ├─ 00-TRM-MASTER-V10-ULTIMATE-FULL.mmd
│     ├─ 00-V10-MASTER-DATA-MAP.mmd
│     ├─ 11-V10-ENTITY-ACCOUNT-STRUCTURE.mmd
│     └─ 12-V10-MEDIA-CONTENT-PRODUCTION.mmd
│
└─ tạo document cho hoạch hoạch định thiết kế vps/
   └─ codia-tracker-app/        ← React app
```

**NO MORE .md SPAM!** Everything in database.

---

## 🔗 **PARENT-CHILD RELATIONSHIPS**

```sql
-- Example: Phase 0 tree
0.1 Create All Accounts (parent_id = NULL)
├─ 0.1.1 Contabo Account (parent_id = 0.1)
├─ 0.1.2 Cloudflare Account (parent_id = 0.1)
└─ 0.1.3 GitHub Account (parent_id = 0.1)

0.2 Domain & DNS Setup (parent_id = NULL)
├─ 0.2.1 Register Domain (parent_id = 0.2)
├─ 0.2.2 Point to Cloudflare (parent_id = 0.2)
└─ 0.2.3 Create DNS Records (parent_id = 0.2)
```

**Query to see this:**
```sql
SELECT * FROM task_tree WHERE phase_id = 0;
```

---

## ⚡ **DEPENDENCIES (depends_on)**

```sql
-- Example dependencies
Task: "1.1.2 Setup Coolify on VPS1"
depends_on: [1, 15, 20]  -- Array of task IDs

-- To see names:
SELECT 
    name,
    depends_on_names
FROM tracker_app_data
WHERE name LIKE '%Coolify%';

-- Result:
-- name: Setup Coolify on VPS1
-- depends_on_names: {
--   "0.1.1 Contabo Account",
--   "0.4.1 Generate SSH Keys",
--   "1.1.1 Order VPS1"
-- }
```

---

## 🤖 **ASSIGNEES**

```sql
-- Tasks assigned to humans vs AI
SELECT 
    assigned_type,
    assigned_to,
    COUNT(*) as task_count
FROM tasks
GROUP BY assigned_type, assigned_to
ORDER BY task_count DESC;

-- Result:
-- AI | DevOps Agent | 80 tasks
-- HUMAN | FOUNDER | 50 tasks
-- AI | Compliance Agent | 10 tasks
```

---

## 📈 **PROGRESS TRACKING**

```sql
-- Overall progress
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END) as done,
    ROUND(
        SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100,
        2
    ) as completion_pct
FROM tasks;

-- By phase
SELECT 
    p.name,
    COUNT(t.id) as total,
    SUM(CASE WHEN t.status = 'DONE' THEN 1 ELSE 0 END) as done
FROM phases p
LEFT JOIN tasks t ON p.id = t.phase_id
GROUP BY p.id, p.name
ORDER BY p.order_index;
```

---

## 🛠️ **UPDATE CLAUDE.md**

CLAUDE.md is auto-generated from `project_context` table:

```sql
-- View current content
SELECT * FROM project_context ORDER BY order_index;

-- Update a section
UPDATE project_context 
SET content = '# New workflow
1. Do this
2. Then that'
WHERE section = 'workflow';

-- Regenerate file
SELECT generate_claude_md();
-- Copy output to CLAUDE.md
```

---

## 🎯 **NEXT ACTION**

```bash
# 1. Open tracker app
https://codia-tracker-h9d0dvqvu-kakaholigan-6270s-projects.vercel.app

# 2. Start Phase 0, task 0.1.1
# 3. Update in Supabase when done:
UPDATE tasks SET status = 'DONE' WHERE name = '0.1.1 Contabo Account';

# 4. Move to next task
# App shows next task automatically
```

---

**🎯 DATABASE-FIRST. NO MORE .md FILES!**

**Everything you need is in:**
1. **Tracker App** (UI)
2. **Supabase Database** (data)
3. **V10 Diagrams** (reference only)
4. **CLAUDE.md** (this file, auto-generated)
