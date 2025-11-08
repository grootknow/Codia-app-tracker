# CASCADE CONTEXT - CODIA V10 TRACKER

## PROJECT PURPOSE
**Tracker app = Tấm bản đồ chung** cho Founder + Cascade cùng nhìn
- Founder xem tracker web app để biết đang làm đến đâu
- Cascade (AI assistant) làm tasks, update tracker real-time
- Tránh AI spam markdown, mất liên thông giữa sessions

## CORE PHILOSOPHY
**CODIA = CODE + MEDIA + V10**
- V10 = "AI CÓ MÁY TÍNH RIÊNG" (own infrastructure, not rent AI)
- Replace 13 workers ($76k → $155/mo = 490x ROI)
- 269 tasks pending → Cascade sẽ execute từng task

## PROJECT STRUCTURE
```
├── codia-tracker-app/          # Web app (React + Vite + Supabase)
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── lib/               # Supabase client
│   │   └── App.jsx            # Main app
│   └── ...
├── V10-FINAL-PRODUCTION-backup/ # V10 project docs
└── *.md files                  # Analysis, architecture docs
```

## DATABASE SCHEMA (Supabase)
**Project ID:** `pmqocxdtypxobihxusqj`

**Main tables:**
- `phases` - 6 phases (0-5)
- `tasks` - 269 tasks total
  - Fields: name, description, status, phase_id, parent_id, depends_on
  - NEW: category, owner_role, progress_percentage, acceptance_criteria, verification_command
  - AI fields: ai_generated, requires_approval, current_step, last_ai_update
- `ai_execution_logs` - Cascade logs khi làm tasks (NO markdown spam!)
- `ai_approval_requests` - Cascade request approval từ founder
- `task_checklists` - Sub-items per task
- `task_comments` - Discussion threads

**Current status:**
- 269 tasks total
- 4 DONE, 3 IN_PROGRESS, 262 PENDING
- Progress: 1.49%

## KEY REQUIREMENTS

### For Cascade (YOU):
1. **Update tracker when working:**
   - Start task → INSERT ai_execution_logs (status='started')
   - Progress → UPDATE tasks (progress_percentage, current_step)
   - Complete → UPDATE tasks (status='DONE', completed_at=NOW())
   - Log structured data, NOT markdown spam!

2. **Request approval for risky actions:**
   - INSERT ai_approval_requests (action, risk_level, reason)
   - Wait for founder decision
   - Proceed based on approval

3. **Maintain context across sessions:**
   - Read this file first every session
   - Check tracker for current progress
   - Update memories when learning important context

### For Founder:
- View progress at: https://codia-tracker.vercel.app
- Approve Cascade requests via tracker
- Monitor real-time updates

## TECH STACK
**Frontend:** React 18 + Vite + TailwindCSS + Lucide icons
**Backend:** Supabase (PostgreSQL + real-time subscriptions)
**Deployment:** Vercel
**IDE:** Windsurf (VSCode fork with Cascade AI)

## CURRENT PRIORITIES
1. Execute 269 pending tasks (Phase 0-5)
2. Update tracker real-time when doing each task
3. Build V10 infrastructure (3 VPS + databases + AI stack)

## CONTEXT RETENTION STRATEGY
- **This file** (`.windsurf/cascade.md`) = Always-on context
- **Memories** = Auto-generated important context (workspace-specific)
- **Tracker DB** = Single source of truth for progress
- **NO** spamming markdown summaries in chat!

## API ENDPOINTS (to be used)
```
Supabase Project: pmqocxdtypxobihxusqj
URL: https://pmqocxdtypxobihxusqj.supabase.co

# Insert execution log
INSERT INTO ai_execution_logs (task_id, agent_name, action, status, current_step) 
VALUES (?, 'Cascade', ?, 'started', ?);

# Update task progress
UPDATE tasks SET progress_percentage = ?, current_step = ?, last_ai_update = NOW() 
WHERE id = ?;

# Mark task done
UPDATE tasks SET status = 'DONE', completed_at = NOW(), progress_percentage = 100 
WHERE id = ?;
```

## AVOIDING CONTEXT LOSS
**Problem:** Cascade forgets context between sessions
**Solutions:**
1. ✅ Read this file first (always-on context)
2. ✅ Query tracker DB for current state
3. ✅ Create memories for important decisions
4. ✅ Log to DB, not markdown
5. ✅ Founder sees same data in tracker web app

## FORBIDDEN ACTIONS
- ❌ NO spam markdown summaries (waste tokens, lose sync)
- ❌ NO hardcode fake data (8 agents don't exist yet!)
- ❌ NO making decisions without checking tracker first
- ❌ NO creating tasks without logging to DB
