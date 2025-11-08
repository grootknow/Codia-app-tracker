# 🔧 TROUBLESHOOTING GUIDE

**Version:** 10.0 ULTIMATE (Autonomous Operations Era)  
**Purpose:** Common issues for 3-VPS + Observability + AI Agents  
**Format:** Problem → Diagnosis → Fix (with Alerta integration)
**Updated:** 04/11/2025 - V10 with Observability + Agent troubleshooting

> **V10 Note**: Most issues are now auto-detected by Alerta and auto-fixed by Alert Agent (70% success rate)

---

## 🎯 QUICK DEBUG COMMANDS

```bash
# Check all containers status
docker ps -a

# View logs (last 50 lines)
docker logs --tail 50 <container-name>

# Follow logs in real-time
docker logs -f <container-name>

# Check container resource usage
docker stats

# Restart specific service
docker compose restart <service-name>

# Full restart (dangerous - use as last resort)
cd /opt/trm/<service>
docker compose down && docker compose up -d

# Check disk space
df -h

# Check memory
free -h

# Check network connectivity
ping <VPS_IP>
telnet <VPS_IP> <PORT>
```

---

## 🗄️ DATABASE ISSUES

### **Problem: Neo4j Won't Start**

**Symptoms:**
```
Container exits immediately
OR
Browser shows "ServiceUnavailable"
OR
Logs: "Unable to acquire lock"
```

**Diagnosis:**
```bash
# Check logs
docker logs neo4j-superapp

# Common errors:
# 1. "Address already in use" → Port conflict
# 2. "Unable to acquire lock" → Unclean shutdown
# 3. "Out of memory" → Heap too large
```

**Solutions:**

**Issue 1: Port Conflict**
```bash
# Check what's using port 7687
sudo lsof -i :7687

# Kill the process
sudo kill -9 <PID>

# Or change Neo4j port in docker-compose.yml
nano /opt/trm/neo4j/docker-compose.yml
# Change: "7687:7687" → "7690:7687"

docker compose restart
```

**Issue 2: Lock Files**
```bash
# Stop container
docker compose stop neo4j-superapp

# Remove lock file
cd /opt/trm/neo4j/data/superapp/databases/neo4j
rm -f store_lock

# Start container
docker compose start neo4j-superapp
```

**Issue 3: Out of Memory**
```bash
# Check available RAM
free -h

# If RAM < heap size set in docker-compose.yml, reduce heap:
nano /opt/trm/neo4j/docker-compose.yml

# Change:
# NEO4J_dbms_memory_heap_max__size=16G → 8G
# NEO4J_dbms_memory_pagecache_size=16G → 8G

docker compose restart neo4j-superapp
```

---

### **Problem: Neo4j Queries Very Slow (>1 second)**

**Symptoms:**
```
Queries take 2-10+ seconds
Browser UI sluggish
Timeouts in LangGraph
```

**Diagnosis:**
```cypher
# Check query plan (run in Neo4j Browser)
EXPLAIN MATCH (n:Entity {name: "example"}) RETURN n;

# Look for:
# - "NodeByLabelScan" (bad - full scan)
# - "NodeIndexSeek" (good - using index)
```

**Solutions:**

**Solution 1: Add Indexes**
```cypher
# Check existing indexes
SHOW INDEXES;

# Add index on frequently queried properties
CREATE INDEX entity_name IF NOT EXISTS 
FOR (e:Entity) ON (e.name);

CREATE INDEX company_name IF NOT EXISTS 
FOR (c:Company) ON (c.name);

CREATE INDEX person_email IF NOT EXISTS 
FOR (p:Person) ON (p.email);

# Verify index used
EXPLAIN MATCH (n:Entity {name: "example"}) RETURN n;
# Should show "NodeIndexSeek"
```

**Solution 2: Enable Query Caching**
```python
# In LangGraph agent.py
import redis
import hashlib
import json

redis_client = redis.Redis(
    host=VPS1_IP,
    port=6379,
    password=REDIS_PASSWORD,
    decode_responses=True
)

def query_neo4j_cached(cypher: str, params: dict = None, ttl: int = 3600):
    """Cache Neo4j queries in Redis"""
    # Create cache key
    cache_key = f"neo4j:{hashlib.md5(cypher.encode()).hexdigest()}"
    
    # Check cache
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Query Neo4j
    result = query_neo4j(cypher, params)
    
    # Store in cache (1 hour TTL)
    redis_client.setex(cache_key, ttl, json.dumps(result))
    
    return result
```

**Solution 3: Optimize Query**
```cypher
# BAD (full scan):
MATCH (n) WHERE n.name = "example" RETURN n;

# GOOD (uses index):
MATCH (n:Entity {name: "example"}) RETURN n;

# BAD (Cartesian product):
MATCH (a:Person), (b:Company) 
WHERE a.company_name = b.name RETURN a, b;

# GOOD (directed relationship):
MATCH (a:Person)-[:WORKS_AT]->(b:Company) RETURN a, b;
```

---

### **Problem: Qdrant Search Returns Wrong Results**

**Symptoms:**
```
Semantic search returns irrelevant documents
OR
Search returns empty results
```

**Diagnosis:**
```python
# Check collection exists
curl http://localhost:6333/collections

# Check vector dimensions
curl http://localhost:6333/collections/text_embeddings

# Should show:
# "size": <number of vectors>
# "vectors": {"size": 1536, ...}  # OpenAI embedding size
```

**Solutions:**

**Solution 1: Verify Embedding Dimensions**
```python
# Ensure consistent embedding model
from openai import OpenAI

client = OpenAI(api_key=OPENAI_API_KEY)

# ALWAYS use same model for embedding
MODEL = "text-embedding-3-large"  # 1536 dimensions

def embed_text(text: str) -> list[float]:
    response = client.embeddings.create(
        model=MODEL,
        input=text
    )
    return response.data[0].embedding

# If you change models, recreate collection:
# curl -X DELETE http://localhost:6333/collections/text_embeddings
# Then re-index all documents
```

**Solution 2: Improve Search Query**
```python
# BAD (short query, vague):
query = "AI"  # Too generic

# GOOD (longer query, specific):
query = "artificial intelligence agents using LangGraph for workflow orchestration"

# Search with filters
qdrant.search(
    collection_name="text_embeddings",
    query_vector=embed_text(query),
    query_filter={
        "must": [
            {"key": "category", "match": {"value": "technology"}},
            {"key": "created_at", "range": {"gte": "2024-01-01"}}
        ]
    },
    limit=10
)
```

---

### **Problem: PostgreSQL Connection Failed**

**Symptoms:**
```
FATAL: password authentication failed
OR
could not connect to server
OR
connection refused
```

**Diagnosis:**
```bash
# Check if PostgreSQL running
docker ps | grep postgres

# Check logs
docker logs postgres

# Test connection from VPS2
psql -h <VPS1_IP> -U postgres -d trm_main
# Enter password when prompted
```

**Solutions:**

**Solution 1: Password Incorrect**
```bash
# Reset password
docker exec -it postgres psql -U postgres

# In psql:
ALTER USER postgres WITH PASSWORD 'NewPassword123!';
\q

# Update .env files with new password
nano /opt/trm/zep/.env
nano /opt/trm/lobechat/.env
nano /opt/trm/n8n/.env

# Restart services
docker compose restart
```

**Solution 2: Firewall Blocking**
```bash
# On VPS1, check firewall
sudo ufw status

# Allow PostgreSQL from VPS2
sudo ufw allow from <VPS2_IP> to any port 5432
sudo ufw reload

# Test from VPS2
telnet <VPS1_IP> 5432
# Should connect
```

**Solution 3: PostgreSQL Not Listening**
```bash
# Check PostgreSQL listening address
docker exec postgres cat /var/lib/postgresql/data/postgresql.conf | grep listen_addresses

# Should be: listen_addresses = '*'

# If not, fix in docker-compose.yml:
nano /opt/trm/postgresql/docker-compose.yml

# Add to environment:
- POSTGRES_HOST_AUTH_METHOD=md5

# Restart
docker compose restart postgres
```

---

## 🤖 AI ORCHESTRATION ISSUES

### **Problem: LangGraph Returns Errors**

**Symptoms:**
```
"Tool execution failed"
OR
"Timeout after 60 seconds"
OR
"API rate limit exceeded"
```

**Diagnosis:**
```bash
# Check LangGraph logs
docker logs langgraph

# Common errors:
# 1. "Anthropic API key invalid" → Wrong key
# 2. "429 Rate Limit" → Too many requests
# 3. "Timeout" → External MCP not responding
```

**Solutions:**

**Issue 1: API Key Invalid**
```bash
# Verify API key works
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'

# If error, regenerate key at: https://console.anthropic.com/

# Update .env
nano /opt/trm/langgraph/.env
# ANTHROPIC_API_KEY=sk-ant-xxx (new key)

docker compose restart langgraph
```

**Issue 2: Rate Limits**
```python
# Add retry logic with backoff
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=60)
)
def call_claude_with_retry(messages):
    """Call Claude with automatic retry on rate limits"""
    try:
        return llm.invoke(messages)
    except Exception as e:
        if "429" in str(e):
            logger.warning("Rate limited, retrying...")
            raise  # Will retry
        else:
            raise  # Won't retry
```

**Issue 3: External MCP Timeout**
```python
# Increase timeout for slow MCPs
import httpx

# Create client with longer timeout
http_client = httpx.Client(timeout=300.0)  # 5 minutes

# Use in MCP calls
response = http_client.post(
    f"{MCP_AGGREGATOR_URL}/tools/apify-mcp/scrape",
    json={"url": url},
    timeout=300
)
```

---

### **Problem: Zep Memory Not Persisting**

**Symptoms:**
```
Agent forgets previous conversations
OR
"Session not found" error
```

**Diagnosis:**
```bash
# Check Zep logs
docker logs zep

# Test Zep API
curl http://localhost:8000/healthz
# Should return: {"status":"ok"}

# Check if PostgreSQL reachable
docker exec zep ping <VPS1_IP>
```

**Solutions:**

**Solution 1: Database Connection**
```bash
# Verify Zep can connect to PostgreSQL
docker logs zep | grep -i "postgres"

# If "connection refused", check:
# 1. VPS1 PostgreSQL running
# 2. Firewall allows VPS2 → VPS1:5432
# 3. Correct password in zep/.env

# Fix connection string in docker-compose.yml:
nano /opt/trm/zep/docker-compose.yml

# Ensure format:
# postgresql://postgres:PASSWORD@VPS1_IP:5432/zep_memory?sslmode=disable

docker compose restart zep
```

**Solution 2: Session Management**
```python
# Always use consistent session IDs
from zep_python import ZepClient

zep = ZepClient(base_url="http://localhost:8000")

# Create session if not exists
def get_or_create_session(user_id: str):
    session_id = f"user_{user_id}"
    
    try:
        session = zep.memory.get_session(session_id)
    except:
        # Session doesn't exist, create it
        session = zep.memory.add_session(
            session_id=session_id,
            user_id=user_id,
            metadata={"created_at": datetime.now().isoformat()}
        )
    
    return session

# Use in agent
session = get_or_create_session(user_id="founder")
memory = zep.memory.get(session.session_id, limit=10)
```

---

### **Problem: LobeChat Can't Connect**

**Symptoms:**
```
"Failed to load"
OR
White screen
OR
"Network error"
```

**Diagnosis:**
```bash
# Check if LobeChat running
curl http://localhost:3210

# Check logs
docker logs lobechat

# Check database connection
docker exec lobechat env | grep DATABASE_URL
```

**Solutions:**

**Solution 1: Database Migration**
```bash
# LobeChat needs database tables created
docker exec lobechat npm run db:migrate

# If error, recreate database:
ssh trm@<VPS1_IP>
docker exec postgres psql -U postgres -c "DROP DATABASE lobechat;"
docker exec postgres psql -U postgres -c "CREATE DATABASE lobechat;"

# Restart LobeChat
docker compose restart lobechat

# Wait for migration (check logs)
docker logs -f lobechat
# Should see: "Database migration complete"
```

**Solution 2: API Keys Not Set**
```bash
# Verify API keys in environment
docker exec lobechat env | grep API_KEY

# If empty, update .env
nano /opt/trm/lobechat/.env

# Add all keys:
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
XAI_API_KEY=xai-xxx

docker compose restart lobechat
```

---

## 🔌 MCP ISSUES

### **Problem: MCP Not Responding**

**Symptoms:**
```
"MCP timeout"
OR
"Connection refused"
OR
Tool calls fail silently
```

**Diagnosis:**
```bash
# Check MCP status
docker ps | grep mcp

# Test MCP endpoint
curl http://localhost:8001/health  # neo4j-mcp
curl http://localhost:8002/health  # postgres-mcp
# etc.

# Check 1MCP aggregator
curl http://localhost:9000/mcps
# Should list all MCPs
```

**Solutions:**

**Solution 1: MCP Container Crashed**
```bash
# Find crashed container
docker ps -a | grep -i mcp

# Check why it crashed
docker logs <mcp-container-name>

# Common causes:
# 1. Import error → Missing dependency
# 2. Connection error → Can't reach database
# 3. Permission error → Volume mount issue

# Rebuild and restart
cd /opt/trm/mcps/<mcp-name>
docker compose build --no-cache
docker compose up -d
```

**Solution 2: Add Health Check**
```yaml
# In docker-compose.yml for each MCP
services:
  neo4j-mcp:
    # ... other config
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

---

### **Problem: External MCP (Apify) Failed**

**Symptoms:**
```
"Apify actor failed"
OR
"Web scraping timeout"
OR
"403 Forbidden"
```

**Diagnosis:**
```bash
# Check Apify API key valid
curl https://api.apify.com/v2/acts \
  -H "Authorization: Bearer $APIFY_API_KEY"

# Should return list of actors
```

**Solutions:**

**Solution 1: API Key Invalid**
```bash
# Regenerate at: https://console.apify.com/account/integrations

# Update in 1MCP aggregator config
nano /opt/trm/mcps/1mcp-aggregator/config.yaml

# Update APIFY_API_KEY

# Restart
docker compose restart mcp-aggregator
```

**Solution 2: Actor Selection**
```python
# Use correct Apify actor for task
actors = {
    "simple_scraping": "apify/web-scraper",
    "javascript_rendering": "apify/puppeteer-scraper",
    "google_search": "apify/google-search-scraper",
    "amazon_scraper": "apify/amazon-scraper"
}

# Don't use "web-scraper" for JavaScript sites
# Use "puppeteer-scraper" instead
```

**Solution 3: Handle Rate Limits**
```python
# Apify has rate limits, batch requests:
from time import sleep

def scrape_urls_batch(urls: list[str], batch_size: int = 10):
    """Scrape URLs in batches to avoid rate limits"""
    results = []
    
    for i in range(0, len(urls), batch_size):
        batch = urls[i:i+batch_size]
        
        # Process batch
        batch_results = apify_mcp.scrape_batch(batch)
        results.extend(batch_results)
        
        # Wait between batches (respect rate limits)
        if i + batch_size < len(urls):
            sleep(2)  # 2 seconds between batches
    
    return results
```

---

## 🚨 CRITICAL ISSUES

### **Problem: VPS Out of Disk Space**

**Symptoms:**
```
"No space left on device"
Docker can't start containers
Logs not writing
```

**Emergency Fix:**
```bash
# Check disk usage
df -h

# Find large files
du -sh /opt/trm/* | sort -rh | head -10

# Clean Docker
docker system prune -af --volumes
# ⚠️ WARNING: This removes unused containers, images, volumes

# Clean logs
find /var/lib/docker/containers/ -name "*.log" -delete
journalctl --vacuum-time=7d

# Clean old backups
find /opt/trm/backups -name "*.tar.gz" -mtime +30 -delete

# If still full, emergency actions:
# 1. Stop non-critical services
# 2. Delete old Neo4j dumps
# 3. Move large files to R2
```

---

### **Problem: VPS Out of Memory**

**Symptoms:**
```
Containers being killed (OOM)
System slow/unresponsive
SSH lag
```

**Emergency Fix:**
```bash
# Check memory usage
free -h

# Find memory hog
docker stats --no-stream | sort -k 4 -h

# Emergency: Restart memory hog
docker compose restart <high-memory-service>

# Permanent fix options:
# 1. Reduce Neo4j heap size
# 2. Add swap file
# 3. Upgrade VPS RAM
```

**Add Swap File:**
```bash
# Create 8GB swap
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

---

### **Problem: Neo4j Data Corrupted**

**Symptoms:**
```
"Database is corrupted"
OR
Queries return wrong data
OR
Can't start Neo4j
```

**Recovery Steps:**

```bash
# STOP - Don't panic!
# You have backups (right?)

# Step 1: Stop Neo4j
docker compose stop neo4j-superapp

# Step 2: Verify backup exists
ls -lh /opt/trm/backups/
# Should see: neo4j-superapp-YYYYMMDD_HHMMSS.dump

# Step 3: Clear corrupted data
rm -rf /opt/trm/neo4j/data/superapp/*

# Step 4: Restore from backup
docker run --rm \
  -v /opt/trm/neo4j/data/superapp:/data \
  -v /opt/trm/backups:/backups \
  neo4j:5.15-community \
  neo4j-admin database load neo4j \
  --from-path=/backups \
  --overwrite-destination=true

# Step 5: Start Neo4j
docker compose start neo4j-superapp

# Step 6: Verify
docker logs -f neo4j-superapp
# Wait for "Started" message

# Step 7: Test query
docker exec neo4j-superapp cypher-shell -u neo4j -p "$NEO4J_PASSWORD" \
  "MATCH (n) RETURN count(n) as total LIMIT 1;"
```

---

## 🔍 MONITORING & PREVENTION

### **Setup Automated Monitoring**

**n8n Workflow: Health Check (Every 5 mins)**

```yaml
Workflow:
  1. Check docker ps
  2. Check disk space
  3. Check memory usage
  4. Check Neo4j query time
  5. If any issue: Send Telegram alert

Alert format:
  "⚠️ Alert: <issue>
   Service: <name>
   Impact: <severity>
   Action: <what to do>"
```

**Prometheus + Grafana (Optional Advanced)**

```bash
# Deploy monitoring stack
cd /opt/trm/monitoring

# docker-compose.yml:
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports: ["3000:3000"]
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

docker compose up -d

# Access: http://<VPS_IP>:3000
# Add Prometheus datasource
# Import Neo4j dashboard
```

---

## 📋 PREVENTIVE MAINTENANCE

```yaml
Daily:
  ☐ Check n8n alerts (Telegram)
  ☐ Review System Logs (Notion)
  ☐ Verify backups ran (check /opt/trm/backups/)

Weekly:
  ☐ Test backup restore (sample)
  ☐ Review slow queries (Neo4j, PostgreSQL)
  ☐ Check disk space trends
  ☐ Update Docker images (docker compose pull)

Monthly:
  ☐ Security audit (ufw status, fail2ban logs)
  ☐ Cost review (API usage, trends)
  ☐ Capacity planning (forecast needs)
  ☐ Test disaster recovery plan
```

---

## 🆘 EMERGENCY CONTACTS

```yaml
Self-Service:
  1. Check this troubleshooting guide first
  2. Search logs: docker logs <service>
  3. Check recent changes: git log (if using)

Community:
  - LangGraph: https://github.com/langchain-ai/langgraph/discussions
  - Neo4j: https://community.neo4j.com/
  - Qdrant: https://discord.gg/qdrant

Professional:
  - VPS Provider: Contabo support (for hardware issues)
  - Database DBA: If Neo4j corruption beyond recovery
  - DevOps Consultant: For architecture review
```

---

## 📚 USEFUL RESOURCES

- **Docker Debugging:** https://docs.docker.com/config/containers/logging/
- **Neo4j Performance:** https://neo4j.com/docs/operations-manual/current/performance/
- **PostgreSQL Tuning:** https://pgtune.leopard.in.ua/
- **LangGraph Debugging:** https://langchain-ai.github.io/langgraph/how-tos/debug/

---

**Document Version:** 1.0  
**Last Updated:** 11/10/2025  
**Issues Covered:** 20+ common problems with solutions

🔧 **Most issues are fixable in <15 minutes!**
