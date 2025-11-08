# 🔐 PERMISSION MATRIX - V10 AGENTS

**Purpose:** Define what each AI agent can/cannot do  
**Last Updated:** Nov 7, 2025  
**Location:** /opt/trm/docs/permissions/

---

## 📋 PERMISSION LEVELS

```yaml
L0 (READ):
  - Query databases
  - List resources
  - Check status
  - View logs
  Risk: NONE

L1 (SAFE WRITE):
  - Restart services
  - Update configs (staging)
  - Deploy to staging
  - Run tests
  Risk: LOW (staging only)

L2 (PRODUCTION WRITE):
  - Deploy to production
  - Database migrations
  - DNS changes
  - User management
  Risk: MEDIUM (requires approval)

L3 (CRITICAL):
  - Delete databases
  - Modify permissions
  - Access credentials
  - Financial transactions
  Risk: HIGH (manual only)

DENY:
  - Explicitly forbidden
  - Always rejected
```

---

## 🤖 AGENT #1: DevOps Commander

**Role:** Infrastructure & deployment automation

| Action | Level | Notes |
|--------|-------|-------|
| docker ps | L0 | List containers |
| docker restart | L0 | Safe restart |
| docker logs | L0 | View logs |
| docker-compose up | L1 | Deploy staging |
| deploy staging | L1 | Staging environment |
| deploy production | L2 | Requires approval |
| docker system prune | L1 | Cleanup |
| edit docker-compose.yml | L1 | Config changes |
| DB write | **DENY** | No direct DB access |
| delete volumes | **DENY** | Data loss risk |

**Approval Required:** Production deployments (L2)

---

## 🤖 AGENT #2: Database Guardian

**Role:** Database management & optimization

| Action | Level | Notes |
|--------|-------|-------|
| SELECT queries | L0 | Read-only |
| EXPLAIN ANALYZE | L0 | Query planning |
| CREATE INDEX | L1 | Staging optimization |
| ALTER TABLE (staging) | L1 | Schema changes |
| ALTER TABLE (prod) | L2 | Requires approval |
| CREATE USER | L2 | User provisioning |
| DROP USER | L2 | Requires approval |
| VACUUM | L1 | Maintenance |
| pg_dump (backup) | L1 | Automated backups |
| DROP TABLE | **DENY** | Too risky |
| DELETE FROM (prod) | **DENY** | Data loss risk |

**Approval Required:** Production schema changes, user management

---

## 🤖 AGENT #3: Code Generator

**Role:** Generate & refactor code

| Action | Level | Notes |
|--------|-------|-------|
| Read codebase | L0 | Analyze code |
| Generate functions | L0 | Code suggestions |
| Write to /tmp | L1 | Temporary files |
| Create PR | L1 | GitHub integration |
| Merge PR | L2 | Requires approval |
| git push main | **DENY** | Protected branch |
| npm publish | **DENY** | Package publishing |
| Access secrets | **DENY** | No credential access |

**Approval Required:** Merging to main branch

---

## 🤖 AGENT #4: Content Writer

**Role:** Generate content & documentation

| Action | Level | Notes |
|--------|-------|-------|
| Read documents | L0 | Research |
| Generate drafts | L0 | Content creation |
| Save to /drafts | L1 | Draft storage |
| Publish to blog | L2 | Requires approval |
| Social media post | L2 | Requires approval |
| Edit published content | L2 | Requires approval |
| Delete published | **DENY** | Prevent accidents |
| Access analytics | L0 | View metrics |

**Approval Required:** All publishing actions

---

## 🤖 AGENT #5: Visual Designer

**Role:** Generate images & videos

| Action | Level | Notes |
|--------|-------|-------|
| Generate image | L0 | Stable Diffusion |
| Edit image | L1 | Adjustments |
| Save to /media | L1 | Media storage |
| Publish to CDN | L2 | Requires approval |
| Delete from CDN | **DENY** | Prevent data loss |
| Access paid APIs | L1 | Within budget |
| Exceed budget | **DENY** | Cost control |

**Approval Required:** CDN publishing, high-cost operations

---

## 🤖 AGENT #6: Research Agent

**Role:** Information gathering & analysis

| Action | Level | Notes |
|--------|-------|-------|
| Web scraping | L0 | Public data |
| API calls (free) | L0 | Public APIs |
| API calls (paid) | L1 | Within budget |
| Save research | L1 | Knowledge base |
| Database INSERT | L1 | Structured data |
| Perplexity API | L0 | Research tool |
| Access credentials | **DENY** | No auth access |
| Financial data | **DENY** | Sensitive info |

**Approval Required:** Paid API usage

---

## 🤖 AGENT #7: Testing Agent

**Role:** Automated testing & QA

| Action | Level | Notes |
|--------|-------|-------|
| Run unit tests | L0 | Local testing |
| Run integration tests | L1 | Staging tests |
| Deploy test env | L1 | Test infrastructure |
| Load testing | L1 | Performance tests |
| Security scans | L1 | Vulnerability checks |
| Modify prod tests | **DENY** | Staging only |
| Delete test data | L1 | Cleanup |
| Access prod DB | **DENY** | Test data only |

**Approval Required:** None (testing only)

---

## 🤖 AGENT #8: Data Agent

**Role:** Data pipeline & analytics

| Action | Level | Notes |
|--------|-------|-------|
| Query analytics | L0 | Read dashboards |
| Run ETL jobs | L1 | Data processing |
| Update schemas | L2 | Requires approval |
| Backup data | L1 | Automated backups |
| Restore data | L2 | Requires approval |
| Delete records | **DENY** | Data loss risk |
| Export sensitive | **DENY** | Security risk |

**Approval Required:** Schema changes, data restoration

---

## 📊 PERMISSION SUMMARY

| Agent | L0 (Read) | L1 (Safe) | L2 (Prod) | L3 (Critical) | DENY |
|-------|-----------|-----------|-----------|---------------|------|
| DevOps Commander | ✅ | ✅ | ✅ | ❌ | 2 |
| Database Guardian | ✅ | ✅ | ✅ | ❌ | 2 |
| Code Generator | ✅ | ✅ | ✅ | ❌ | 3 |
| Content Writer | ✅ | ✅ | ✅ | ❌ | 1 |
| Visual Designer | ✅ | ✅ | ✅ | ❌ | 2 |
| Research Agent | ✅ | ✅ | ❌ | ❌ | 2 |
| Testing Agent | ✅ | ✅ | ❌ | ❌ | 2 |
| Data Agent | ✅ | ✅ | ✅ | ❌ | 2 |

---

## 🔐 APPROVAL WORKFLOW

### L2 Actions (Requires Approval):
```yaml
1. Agent detects L2 action
2. INSERT INTO ai_approval_requests:
   - task_id
   - agent_name
   - action
   - risk_level: 'medium'
   - reason
   - impact
3. Notify founder (Telegram/Email)
4. Founder reviews in tracker app
5. Approve/Reject
6. If approved → Execute
7. If rejected → Log + notify agent
```

### DENY Actions:
```yaml
1. Agent attempts DENY action
2. Immediate rejection
3. Log security event
4. Notify founder
5. No execution
```

---

## 📝 DATABASE SCHEMA

```sql
CREATE TABLE IF NOT EXISTS permission_levels (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(100) NOT NULL,
  action VARCHAR(200) NOT NULL,
  level VARCHAR(10) NOT NULL CHECK (level IN ('L0', 'L1', 'L2', 'L3', 'DENY')),
  description TEXT,
  requires_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(agent_name, action)
);

-- Example entries
INSERT INTO permission_levels (agent_name, action, level, requires_approval) VALUES
('DevOps Commander', 'docker restart', 'L0', false),
('DevOps Commander', 'deploy production', 'L2', true),
('DevOps Commander', 'DB write', 'DENY', false);
```

---

## 🔄 AUTO-GENERATION

**Script:** `/opt/trm/scripts/generate-permission-matrix.sh`

```bash
#!/bin/bash
# Auto-generate permission matrix from database

psql -h localhost -U postgres -d trm -c "
SELECT 
  agent_name,
  action,
  level,
  CASE WHEN requires_approval THEN '✅' ELSE '❌' END as approval
FROM permission_levels
ORDER BY agent_name, level, action
" > /opt/trm/docs/permissions/PERMISSION-MATRIX-AUTO.md

echo "Permission matrix generated at $(date)"
```

**Cron:** Daily at 2 AM
```cron
0 2 * * * /opt/trm/scripts/generate-permission-matrix.sh
```

---

## 🔍 AUDIT & REVIEW

**Monthly Audit:**
- [ ] Review all L2 approvals
- [ ] Check DENY attempts
- [ ] Verify no permission creep
- [ ] Update docs if needed

**Security Events:**
- DENY attempts logged
- L2 approvals tracked
- Anomaly detection
- Founder notifications

---

## ⚠️ SECURITY NOTES

**Principle of Least Privilege:**
- Start with L0 (read-only)
- Escalate only when needed
- Never give L3 to agents
- Regular permission audits

**Protection Mechanisms:**
- L2+ requires approval
- DENY = hard block
- All actions logged
- Real-time monitoring

**Founder Override:**
- Can manually execute any action
- Approval queue in tracker app
- Emergency access via SSH

---

**Status:** ✅ Matrix defined for 8 agents  
**Next:** Implement permission checking in agent runtime  
**Review:** Monthly audit + security events
