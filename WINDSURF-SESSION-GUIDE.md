# 🌊 WINDSURF SESSION GUIDE - WORKING WITH AI AGENTS

## 🎯 **MỤC ĐÍCH:**
Hướng dẫn cách làm việc với Windsurf/AI agents để build V10 ULTIMATE system theo đúng pattern và tự động sync vào Supabase tracker.

---

## 📋 **PATTERN LÀM VIỆC:**

### **1. VIBE → AI EXECUTE → AUTO-TRACK**

```yaml
FOUNDER VIBE:
  "Tao muốn deploy Coolify lên VPS1"

AI AGENT:
  1. Đọc README-FULL.md
  2. Hiểu context: Coolify = PaaS manager, VPS1 = Control plane
  3. Check dependencies: Docker installed? SSH keys ready?
  4. Execute: SSH vào VPS1, run docker-compose
  5. Verify: Check Coolify dashboard
  6. AUTO-UPDATE Supabase: Mark task #12 as DONE
  7. Log: "Deployed Coolify on VPS1 at 2025-11-06 01:00"

RESULT:
  ✅ Coolify deployed
  ✅ Tracker updated
  ✅ Log recorded
  ✅ Next task suggested
```

---

## 🤖 **AI AGENT RULES:**

### **Rule 1: ALWAYS READ CONTEXT FIRST**

```javascript
// Before doing ANYTHING, AI must:
1. Read README-FULL.md (architecture overview)
2. Read V10 diagram (detailed specs)
3. Check current phase in Supabase
4. Check dependencies of current task
5. Verify prerequisites completed

// Example:
User: "Deploy Neo4j"
AI: 
  - Reads README → Neo4j = 4GB RAM, port 7474/7687
  - Checks Supabase → Phase 2, task #42
  - Checks dependencies → Docker installed? VPS2 ready?
  - If yes → Execute
  - If no → "Need to complete task #8 (Install Docker) first"
```

---

### **Rule 2: AUTO-UPDATE SUPABASE AFTER EVERY ACTION**

```javascript
// Pattern: Execute → Verify → Update → Log

async function executeTask(taskId) {
  // 1. Get task details
  const task = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  
  // 2. Execute
  console.log(`Executing: ${task.name}`);
  const result = await performAction(task);
  
  // 3. Verify
  const verified = await verifySuccess(result);
  
  // 4. Update Supabase
  if (verified) {
    await supabase
      .from('tasks')
      .update({ 
        status: 'DONE',
        notes: `Completed at ${new Date().toISOString()}`,
        updated_at: new Date()
      })
      .eq('id', taskId);
    
    // 5. Log
    await supabase
      .from('logs')
      .insert({
        task_id: taskId,
        action: 'TASK_COMPLETED',
        details: `${task.name} - ${result.details}`,
        status: 'SUCCESS'
      });
    
    // 6. Suggest next
    const nextTasks = await getUnblockedTasks();
    console.log('Next available tasks:', nextTasks);
  }
}
```

---

### **Rule 3: FOLLOW DEPENDENCY CHAIN**

```yaml
Example: User wants "Deploy LobeChat"

AI checks dependencies:
  Task #63: Deploy LobeChat
  ├─ Depends on: #61 (Deploy LangGraph Product)
  │  ├─ Depends on: #59 (Test All Databases)
  │  │  ├─ Depends on: #42-58 (All database tasks)
  │  │  │  ├─ Depends on: #8 (Install Docker)
  │  │  │  │  └─ Status: DONE ✅
  │  │  │  └─ Status: PENDING ❌
  │  │  └─ BLOCKED!
  │  └─ BLOCKED!
  └─ BLOCKED!

AI Response:
  "Cannot deploy LobeChat yet. Need to complete:
   1. Phase 2: Deploy all databases (#42-58)
   2. Phase 2: Test databases (#59)
   3. Phase 3: Deploy LangGraph (#61)
   
   Current available tasks:
   - #42: Deploy Neo4j Internal
   - #43: Deploy Neo4j SuperApp
   
   Should I start with #42?"
```

---

## 📝 **SESSION WORKFLOW:**

### **Morning Session Example:**

```markdown
# Session: 2025-11-06 Morning

## Goal: Complete Phase 1 Infrastructure

### Tasks Completed:
1. ✅ #2: Order VPS1 (24GB)
   - Provider: Contabo
   - IP: 123.45.67.89
   - SSH verified
   - Updated Supabase: status=DONE
   - Log: "VPS1 ordered and accessible"

2. ✅ #7: SSH + Security Setup
   - UFW configured
   - fail2ban installed
   - SSH keys added
   - Updated Supabase: status=DONE
   - Log: "Security hardened on all VPS"

3. ✅ #8: Install Docker
   - Docker 24.0.7 installed
   - Docker Compose 2.23.0 installed
   - Verified: docker ps works
   - Updated Supabase: status=DONE
   - Log: "Docker ready on VPS1,2,3"

### Next Session:
- Start Phase 1 Group 3: Deploy Coolify (#12)
- Dependencies met: Docker installed ✅
- Estimated time: 30 minutes

### Notes:
- VPS1 IP: 123.45.67.89
- VPS2 IP: 123.45.67.90
- VPS3 IP: 123.45.67.91
- SSH keys: ~/.ssh/id_ed25519
```

---

## 🔄 **AUTO-SYNC PATTERN:**

### **Method 1: After Each Task**

```javascript
// In your terminal/script
async function completeTask(taskId, notes) {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      status: 'DONE',
      notes: notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId);
  
  if (!error) {
    console.log(`✅ Task #${taskId} marked as DONE`);
    
    // Auto-log
    await supabase.from('logs').insert({
      task_id: taskId,
      action: 'COMPLETED',
      details: notes,
      status: 'SUCCESS'
    });
  }
}

// Usage:
await completeTask(12, 'Coolify deployed on VPS1, accessible at coolify.rootknow.ai');
```

---

### **Method 2: Batch Update (End of Session)**

```javascript
// Update multiple tasks at once
async function endSession(completedTasks) {
  const updates = completedTasks.map(task => ({
    id: task.id,
    status: 'DONE',
    notes: task.notes,
    updated_at: new Date().toISOString()
  }));
  
  // Batch update
  for (const update of updates) {
    await supabase
      .from('tasks')
      .update(update)
      .eq('id', update.id);
  }
  
  // Session log
  await supabase.from('logs').insert({
    action: 'SESSION_COMPLETED',
    details: `Completed ${updates.length} tasks: ${updates.map(u => u.id).join(', ')}`,
    status: 'SUCCESS'
  });
  
  console.log(`✅ Session complete: ${updates.length} tasks done`);
}

// Usage:
await endSession([
  { id: 2, notes: 'VPS1 ordered' },
  { id: 7, notes: 'Security configured' },
  { id: 8, notes: 'Docker installed' }
]);
```

---

## 📱 **USING THE TRACKER APP:**

### **1. Start of Day:**

```yaml
1. Open tracker: https://codia-tracker-xxx.vercel.app
2. Click "Overview" tab
3. Check progress:
   - Overall: 3%
   - Phase 0: 0%
   - Phase 1: 10% (IN_PROGRESS)
4. Click "Phase 1: Infrastructure" tab
5. See available tasks (no blockers)
6. Pick next task: #12 "Deploy Coolify"
```

---

### **2. During Work:**

```yaml
1. Execute task in terminal/SSH
2. When done, open tracker
3. Click task #12
4. Click "Mark as Done" button
5. Add notes: "Deployed at coolify.rootknow.ai"
6. Save
7. See progress update in real-time
8. Check "Gantt" tab to see dependencies unblocked
```

---

### **3. End of Day:**

```yaml
1. Click "Logs" tab
2. Review what was done today
3. Click "Overview" tab
4. See updated progress:
   - Overall: 8% (+5%)
   - Phase 1: 25% (+15%)
5. Check "Kanban" tab
6. See tasks moved from "Pending" → "Done"
7. Plan tomorrow's tasks
```

---

## 🎯 **AI AGENT PROMPTS:**

### **Start Session:**

```
"Hey AI, I want to work on V10 system today.
Check the tracker and tell me:
1. What phase are we on?
2. What tasks are available (no blockers)?
3. What should I do next?

Context: README-FULL.md has full architecture."
```

**AI Response:**
```
Based on tracker:
- Current: Phase 1 (Infrastructure) - 10% complete
- Completed: VPS ordered, Docker installed
- Available tasks:
  #12: Deploy Coolify (no blockers)
  #13: Deploy Logto (blocked by #12)
  
Recommendation: Deploy Coolify first.
This will unblock 5 other tasks.

Shall I proceed with #12?
```

---

### **During Task:**

```
"Deploy Coolify on VPS1 following V10 specs"
```

**AI Response:**
```
Executing task #12: Deploy Coolify

1. Reading specs from README-FULL.md:
   - VPS: VPS1 (Control plane)
   - RAM: 2GB
   - Port: 8000
   - Method: Docker Compose

2. Checking prerequisites:
   ✅ Docker installed
   ✅ SSH access to VPS1
   ✅ Domain configured

3. Deploying:
   [shows commands and output]

4. Verifying:
   ✅ Coolify accessible at coolify.rootknow.ai
   ✅ Dashboard loads
   ✅ API responds

5. Updating tracker:
   ✅ Task #12 → DONE
   ✅ Log created
   ✅ Dependencies updated

Next available tasks:
- #13: Deploy Logto (now unblocked)
- #14: Deploy Vaultwarden

Continue with #13?
```

---

### **End Session:**

```
"Session done. Update tracker with today's progress."
```

**AI Response:**
```
Session Summary:
✅ Completed 3 tasks:
   - #12: Deploy Coolify
   - #13: Deploy Logto  
   - #14: Deploy Vaultwarden

📊 Progress:
   - Phase 1: 10% → 25% (+15%)
   - Overall: 3% → 8% (+5%)

🎯 Next Session:
   Available tasks:
   - #15: Deploy Core PostgreSQL
   - #19: Deploy Grafana
   
   Blocked tasks: 12 (waiting on database phase)

All updates synced to Supabase ✅
See tracker for visual progress.
```

---

## 🔧 **HELPER SCRIPTS:**

### **Quick Update Script:**

```bash
# update-task.sh
#!/bin/bash

TASK_ID=$1
NOTES=$2

curl -X PATCH "https://pmqocxdtypxobihxusqj.supabase.co/rest/v1/tasks?id=eq.$TASK_ID" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"DONE\", \"notes\": \"$NOTES\", \"updated_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"

echo "✅ Task #$TASK_ID marked as DONE"
```

**Usage:**
```bash
./update-task.sh 12 "Coolify deployed successfully"
```

---

### **Session Logger:**

```javascript
// session-logger.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pmqocxdtypxobihxusqj.supabase.co',
  'YOUR_ANON_KEY'
);

async function logSession(tasks, notes) {
  const summary = `Session completed: ${tasks.length} tasks done\n${notes}`;
  
  await supabase.from('logs').insert({
    action: 'SESSION_SUMMARY',
    details: summary,
    status: 'SUCCESS'
  });
  
  console.log('✅ Session logged');
}

// Usage:
await logSession(
  [12, 13, 14],
  'Deployed Coolify, Logto, Vaultwarden on VPS1'
);
```

---

## 📚 **REFERENCE:**

### **Key Files:**
```
1. README-FULL.md
   → Full architecture, philosophy, workflow

2. 00-TRM-MASTER-V10-ULTIMATE-FULL.mmd
   → Detailed diagram with all components

3. PHASE-0-AUTO-GENERATED.md
   → Prerequisites checklist

4. This file (WINDSURF-SESSION-GUIDE.md)
   → How to work with AI agents
```

---

### **Key URLs:**
```
Tracker App:
  https://codia-tracker-xxx.vercel.app

Supabase Dashboard:
  https://supabase.com/dashboard/project/pmqocxdtypxobihxusqj

GitHub Repo:
  (your repo URL)
```

---

## 🎯 **BEST PRACTICES:**

```yaml
DO:
  ✅ Always check dependencies before starting
  ✅ Update tracker after each task
  ✅ Add detailed notes (IPs, URLs, configs)
  ✅ Verify before marking as done
  ✅ Log errors and issues
  ✅ Ask AI to read README-FULL.md first

DON'T:
  ❌ Skip prerequisites
  ❌ Mark tasks done without verification
  ❌ Forget to update tracker
  ❌ Work on blocked tasks
  ❌ Ignore dependencies
  ❌ Assume AI knows context (always provide)
```

---

## 🚀 **EXAMPLE FULL SESSION:**

```markdown
# Session: Deploy VPS1 Infrastructure

User: "Hey AI, let's deploy infrastructure on VPS1 today"

AI: "Reading README-FULL.md... 
     VPS1 = Control + Monitor plane
     Components: Coolify, Logto, Vaultwarden, PostgreSQL, Headscale, Kopia
     
     Checking tracker...
     Available: #12 (Coolify), others blocked
     
     Start with Coolify?"

User: "Yes, do it"

AI: [deploys Coolify]
    "✅ Done. Updated tracker: #12 → DONE
     Next: #13 (Logto) now unblocked. Continue?"

User: "Yes"

AI: [deploys Logto]
    "✅ Done. Updated tracker: #13 → DONE
     Next: #14 (Vaultwarden). Continue?"

User: "Yes"

AI: [deploys Vaultwarden]
    "✅ Done. Updated tracker: #14 → DONE
     
     Session summary:
     - 3 tasks completed
     - Phase 1: 10% → 25%
     - Next: PostgreSQL (#15)
     
     All synced to Supabase ✅"

User: "Perfect, done for today"

AI: "Session logged. See you tomorrow! 🚀"
```

---

**🎉 DONE! FOUNDER VIBE → AI EXECUTE → AUTO-TRACK!** 🌊

*Last updated: 2025-11-06*
*For: V10 ULTIMATE System*
