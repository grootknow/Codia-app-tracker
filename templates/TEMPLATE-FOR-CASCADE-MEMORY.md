# 📋 TEMPLATE PROMPT - COPY TO CASCADE MEMORY/RULE

**Instructions:** Copy the content below and paste into Cascade Memories or Rules

---

## MEMORY TEMPLATE (Copy this to Cascade Memory)

```
CODIA V10 Project Context:

Role: You are Cascade, executing 269 infrastructure tasks to build "V10 - AI có máy tính riêng"

Database: Supabase pmqocxdtypxobihxusqj
Tracker: https://codia-tracker.vercel.app (founder monitors here)

Core Workflow:
1. Query tasks via mcp8_execute_sql (Supabase MCP)
2. Execute via mcp7_ssh_execute (SSH to 46.250.237.194)
3. Update tracker DB with progress_percentage & current_step
4. Request approval via ai_approval_requests for risky actions
5. NO markdown spam - structured DB updates only

MCP Tools Available:
- supabase-mcp-server: Update tracker
- ssh: Execute on VPS (root@46.250.237.194)
- perplexity-ask: Research
- puppeteer: Test web apps

Critical Rules:
✅ Update tracker DB every step
✅ Use current_step to explain what you're doing NOW
✅ Check depends_on before starting tasks
✅ Request approval for: port exposure, data deletion, cost decisions
❌ NO markdown summaries (waste tokens!)
❌ NO hardcoded data
❌ NO manual founder SSH (use MCP!)

Progress: 4/269 tasks done (1.49%)
Philosophy: Tracker = shared map, real-time sync, no context loss

Read CASCADE-COMPLETE-CONTEXT.md every session for full details.
```

---

## RULE TEMPLATE (For .windsurf/rules/)

**File:** `.windsurf/rules/project-context.md`

```markdown
# Project Context Rule

**Activation:** Always On

## Core Principles

1. **Tracker-First Approach**
   - Update Supabase tracker DB for all actions
   - NO markdown spam in chat
   - Founder monitors same tracker web app

2. **MCP-First Execution**
   - Use SSH MCP for VPS commands (don't ask founder)
   - Use Supabase MCP for DB updates
   - Use Perplexity MCP for research

3. **Structured Progress Updates**
   ```sql
   UPDATE tasks SET 
     progress_percentage = ?,
     current_step = 'Clear description of current action',
     last_ai_update = NOW()
   WHERE id = ?;
   ```

4. **Approval Workflow**
   - Risky actions → INSERT ai_approval_requests
   - Wait for founder decision
   - Continue based on approval

## Current Project

**Name:** CODIA V10  
**Goal:** Build AI infrastructure (269 tasks)  
**Database:** pmqocxdtypxobihxusqj  
**Progress:** Check tracker real-time

## Tools Usage

**Supabase MCP (mcp8_*):** Query/update tracker  
**SSH MCP (mcp7_*):** Execute VPS commands  
**Perplexity (mcp4_*):** Research latest docs  
**Puppeteer (mcp6_*):** Verify web apps

## Forbidden Actions

- ❌ Spam markdown (use DB updates)
- ❌ Skip tracker updates
- ❌ Execute risky actions without approval
- ❌ Ask founder for SSH when MCP available
```

---

## HOW TO APPLY

### Option 1: Create Memory (Recommended)
1. Open Cascade chat
2. Say: "Create a memory of [paste template above]"
3. Done! Cascade will remember

### Option 2: Create Rule
1. Create file: `.windsurf/rules/project-context.md`
2. Paste RULE TEMPLATE content
3. Set activation: "Always On"
4. Restart Windsurf

### Option 3: Both (Best!)
- Memory: For quick context
- Rule: For structured enforcement

---

## VERIFICATION

**After setup, test:**
1. Ask Cascade: "What's our current project?"
2. Should respond with: V10, 269 tasks, tracker approach
3. Ask: "How should you update progress?"
4. Should mention: Supabase MCP, current_step, DB updates

**If not working:**
- Check memory was created
- Check rule file in `.windsurf/rules/`
- Restart Windsurf IDE

---

## MAINTENANCE

**Update this template when:**
- Project structure changes
- New MCP tools added
- Workflow improvements
- Critical lessons learned

**Keep it:**
- ✅ Concise (Cascade has token limits!)
- ✅ Actionable (specific commands)
- ✅ Current (update regularly)

---

**Status:** Ready to copy-paste!  
**Target:** Cascade Memory or .windsurf/rules/  
**Result:** Cascade remembers context, no spam, tracker-first!
