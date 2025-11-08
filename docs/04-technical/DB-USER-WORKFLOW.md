# 👥 DATABASE USER PROVISIONING WORKFLOW

**Purpose:** Self-service user creation for AI agents and applications  
**Last Updated:** Nov 7, 2025  
**Location:** /opt/trm/docs/db-users/

---

## 🎯 OVERVIEW

AI agents and applications can request database users via API. This workflow handles:
- User creation with specific permissions
- Auto-expiry for temporary access
- Approval for sensitive permissions
- Audit logging

---

## 📋 USER REQUEST PROCESS

### 1. Request User via API

**Endpoint:** `POST /api/v1/db/users/request`

**Example: Read-only Agent User**
```bash
curl -X POST https://api.xknow.site/v1/db/users/request \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "database": "postgresql_product",
    "username": "agent_researcher_ro",
    "role": "agent_readonly",
    "expires_hours": 24,
    "reason": "Research agent needs to query products table",
    "requested_by": "DevOps Commander"
  }'
```

**Response:**
```json
{
  "request_id": "req_abc123",
  "status": "pending_approval",
  "estimated_time": "5 minutes",
  "approval_required": false,
  "message": "Read-only access auto-approved. Creating user..."
}
```

---

### 2. Check Request Status

```bash
curl -X GET https://api.xknow.site/v1/db/users/request/req_abc123 \
  -H "Authorization: Bearer $AGENT_TOKEN"
```

**Response (Approved):**
```json
{
  "request_id": "req_abc123",
  "status": "completed",
  "user": {
    "username": "agent_researcher_ro",
    "database": "postgresql_product",
    "host": "vps2.xknow.site",
    "port": 5432,
    "expires_at": "2025-11-08T12:23:00Z"
  },
  "credentials": {
    "password": "temp_pwd_xyz789",
    "connection_string": "postgresql://agent_researcher_ro:temp_pwd_xyz789@vps2.xknow.site:5432/product_db"
  }
}
```

---

## 🔐 PERMISSION LEVELS & ROLES

### PostgreSQL Roles

| Role | Permissions | Auto-Approve | Notes |
|------|-------------|--------------|-------|
| `agent_readonly` | SELECT only | ✅ Yes | Safe, no writes |
| `agent_writer` | SELECT, INSERT, UPDATE | ⚠️ Review | Requires reason |
| `app_user` | Full table access | ⚠️ Review | Application users |
| `admin` | DDL, user mgmt | ❌ Manual | Founder only |

### Neo4j Roles

| Role | Permissions | Auto-Approve | Notes |
|------|-------------|--------------|-------|
| `reader` | MATCH queries | ✅ Yes | Graph traversal |
| `writer` | CREATE, MERGE | ⚠️ Review | Graph updates |
| `admin` | Schema changes | ❌ Manual | Founder only |

### Redis Roles

| Role | Permissions | Auto-Approve | Notes |
|------|-------------|--------------|-------|
| `readonly` | GET, SCAN | ✅ Yes | Read cache |
| `readwrite` | GET, SET, DEL | ⚠️ Review | Cache updates |
| `admin` | CONFIG | ❌ Manual | Founder only |

---

## ✅ APPROVAL PROCESS

### Auto-Approved (Instant)
- Read-only access to any database
- Short duration (< 24 hours)
- Agent authenticated

### Review Required (5-30 min)
- Write access
- Long duration (> 24 hours)
- Production database
- Inserts approval request → Founder reviews in tracker app

### Manual Only (Founder SSH)
- Admin/superuser access
- Schema changes
- User management
- No API available

---

## ⏱️ AUTO-EXPIRY MECHANISM

### How It Works
```yaml
1. User created with expiry timestamp
2. Cron job runs every hour: /opt/trm/scripts/expire-db-users.sh
3. Checks users with expires_at < NOW()
4. Revokes permissions
5. Drops user
6. Logs action
```

### Expiry Options
- **Default:** 24 hours
- **Short-term:** 1-8 hours (testing)
- **Long-term:** 7-30 days (applications, requires approval)
- **Permanent:** No expiry (manual creation only)

### Extension
```bash
curl -X POST https://api.xknow.site/v1/db/users/extend \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -d '{
    "username": "agent_researcher_ro",
    "extend_hours": 24,
    "reason": "Need more time for analysis"
  }'
```

---

## 🛠️ COMMON SCENARIOS

### Scenario 1: Agent Needs Read Access
```bash
# Request
curl -X POST https://api.xknow.site/v1/db/users/request \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -d '{
    "database": "postgresql_product",
    "role": "agent_readonly",
    "expires_hours": 12
  }'

# Response: Auto-approved, user created
# Use connection string immediately
```

### Scenario 2: Application User (Write Access)
```bash
# Request
curl -X POST https://api.xknow.site/v1/db/users/request \
  -H "Authorization: Bearer $APP_TOKEN" \
  -d '{
    "database": "postgresql_product",
    "username": "lobechat_app",
    "role": "app_user",
    "expires_hours": 720,
    "reason": "LobeChat production user"
  }'

# Response: Pending approval
# Founder reviews in tracker app
# Approve → User created with 30-day expiry
```

### Scenario 3: Temporary Testing User
```bash
# Request
curl -X POST https://api.xknow.site/v1/db/users/request \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -d '{
    "database": "neo4j_product",
    "role": "reader",
    "expires_hours": 2,
    "reason": "Testing graph queries"
  }'

# Response: Auto-approved
# User auto-expires after 2 hours
```

---

## 🚨 TROUBLESHOOTING

### Error: "Connection refused"
```
ERROR: could not connect to server: Connection refused
```

**Causes:**
- Database not running
- Wrong host/port
- Firewall blocking

**Fix:**
```bash
# Check database status
docker ps | grep postgres

# Check firewall
sudo ufw status

# Test connection
psql -h vps2.xknow.site -p 5432 -U postgres -c "SELECT 1"
```

---

### Error: "Permission denied"
```
ERROR: permission denied for table products
```

**Causes:**
- User has wrong role
- Permissions not granted yet
- User expired

**Fix:**
```bash
# Check user permissions
psql -U postgres -c "SELECT * FROM pg_user WHERE usename='agent_researcher_ro'"

# Check role grants
psql -U postgres -c "\du agent_researcher_ro"

# Re-grant if needed
psql -U postgres -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO agent_readonly"
```

---

### Error: "User already exists"
```
ERROR: role "agent_researcher_ro" already exists
```

**Causes:**
- Previous user not cleaned up
- Expiry script failed

**Fix:**
```bash
# Drop old user
psql -U postgres -c "DROP USER IF EXISTS agent_researcher_ro"

# Re-request via API
curl -X POST ...
```

---

### Error: "Authentication failed"
```
ERROR: password authentication failed for user "agent_researcher_ro"
```

**Causes:**
- Wrong password
- Password expired
- User revoked

**Fix:**
```bash
# Check user status
curl -X GET https://api.xknow.site/v1/db/users/status/agent_researcher_ro

# If expired, request new user
curl -X POST https://api.xknow.site/v1/db/users/request ...
```

---

## 📊 API REFERENCE

### Endpoints

```yaml
POST /api/v1/db/users/request
  - Create user request
  - Auth: Bearer token (agent/app)
  - Body: { database, username?, role, expires_hours?, reason? }
  - Response: { request_id, status, ... }

GET /api/v1/db/users/request/:id
  - Check request status
  - Auth: Bearer token
  - Response: { request_id, status, user?, credentials? }

POST /api/v1/db/users/extend
  - Extend user expiry
  - Auth: Bearer token
  - Body: { username, extend_hours, reason }
  - Response: { new_expires_at }

GET /api/v1/db/users/status/:username
  - Check user status
  - Auth: Bearer token
  - Response: { username, active, expires_at, permissions }

DELETE /api/v1/db/users/:username
  - Revoke user (emergency)
  - Auth: Bearer token (admin)
  - Response: { success: true }

GET /api/v1/db/users/list
  - List all users
  - Auth: Bearer token (admin)
  - Response: { users: [...] }
```

---

## 🔄 AUTO-GENERATION

**Generate from OpenAPI spec:**
```bash
# Generate API docs
/opt/trm/scripts/generate-api-docs.sh

# Output: /opt/trm/docs/db-users/API-REFERENCE.md
```

**Update:** Run after any API changes

---

## 📝 DATABASE SCHEMA

```sql
CREATE TABLE IF NOT EXISTS db_user_requests (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(50) UNIQUE NOT NULL,
  database VARCHAR(100) NOT NULL,
  username VARCHAR(100),
  role VARCHAR(50) NOT NULL,
  expires_hours INTEGER DEFAULT 24,
  reason TEXT,
  requested_by VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  approved_by VARCHAR(100),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  credentials_hash TEXT,
  revoked BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS db_user_audit (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  database VARCHAR(100),
  performed_by VARCHAR(100),
  timestamp TIMESTAMP DEFAULT NOW(),
  details JSONB
);
```

---

## 🎯 BENEFITS

**For Agents:**
- Self-service access
- No waiting for founder
- Auto-cleanup
- Secure credentials

**For Founder:**
- Audit trail
- Approval control
- Auto-expiry (no stale users)
- Security by default

**For System:**
- Least privilege principle
- Temporary access
- Trackable requests
- Automated cleanup

---

## 🔒 SECURITY NOTES

**Best Practices:**
- Always use shortest necessary expiry
- Provide clear reason for requests
- Use read-only when possible
- Rotate credentials regularly

**Red Flags:**
- Permanent users (except apps)
- Admin requests from agents
- No reason provided
- Repeated failed auth

**Monitoring:**
- All requests logged
- Failed auth tracked
- Expiry alerts
- Permission changes audited

---

**Status:** ✅ Workflow documented with API examples  
**Next:** Implement API endpoints  
**Cron:** `/opt/trm/scripts/expire-db-users.sh` hourly
