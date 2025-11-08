# 📈 SCALING & EXPANSION GUIDE

**Version:** 10.0 ULTIMATE (Autonomous Operations Era)  
**Purpose:** Growth paths from 3-VPS base + Autonomous scaling with AI Agents  
**Timeline:** When to scale, how to scale, agent-driven decisions
**Updated:** 04/11/2025 - V10 with AI Agents + Observability scaling

---

## 🎯 OVERVIEW

Hệ thống được thiết kế để scale theo 6 directions:
1. **More Data** (knowledge graph grows - product + agent)
2. **More Processing** (parallel workloads + agent workers)
3. **More Intelligence** (better models, more MCPs, more Skills) ⭐
4. **More Skills** (domain expertise library) ⭐
5. **More Agents** (expand from 8 to 16+ agents) ⭐ V10
6. **More Users** (multi-tenant platform)

---

## 📊 CURRENT STATE (Week 0)

```yaml
Infrastructure V10:
  VPS1: 24GB RAM (Control + Observability)
  VPS2: 24GB RAM (All Databases)
  VPS3: 12GB RAM (Product AI + Agent AI)
  Total: 60GB RAM, 2.4TB storage

Data:
  Product:
    Neo4j: 21M triples (Internal: 2M, SuperApp: 19M)
    Qdrant: 10M vectors
    PostgreSQL: 4 databases
    Redis: Cache + Queue
  Agent: ⭐ NEW
    Neo4j: 1M triples (incident graph)
    Qdrant: 400k vectors
    PostgreSQL: 2 databases
    Redis: Queue

Capabilities:
  Heavy workloads: 10x parallel (agent-orchestrated)
  API calls: ~10k/day
  Cost: ~$5/day (AI models)
  Autonomous: 90% operations automated by 8 agents
  Observability: Full stack (Sentry, Loki, Tempo, Alerta)

Limits:
  Neo4j Product: Can grow to ~50M triples
  Neo4j Agent: Can grow to ~5M triples
  Qdrant Product: Can handle ~30M vectors
  Qdrant Agent: Can handle ~2M vectors
  Parallel: 10-20 concurrent tasks (agent-managed)
  Agents: 8 agents (can expand to 16+)
```

---

## 🚀 SCENARIO A: MORE DATA (Knowledge Growth)

### **When to Scale**

```yaml
Triggers:
  ☐ Neo4j SuperApp: >25M triples (approaching capacity)
  ☐ Qdrant: >20M vectors (performance degrading)
  ☐ PostgreSQL: >50GB data
  ☐ Disk usage: >70% on VPS1
  ☐ RAM usage: >85% sustained
  ☐ Query times: >200ms average
```

### **Scaling Options**

#### **Option A1: Upgrade VPS1 RAM (Fastest)**

**Action:**
```yaml
Upgrade: VPS1 from 30GB → 60GB RAM
Cost: +$15/month ($45 total for VPS1)
Timeline: 5-10 mins (reboot required)
Downtime: ~2 minutes

New Capacity:
  Neo4j: 50M → 100M+ triples
  Qdrant: 30M → 60M+ vectors
  Queries: Faster (more cache)
```

**How to Upgrade:**
```bash
# 1. Backup everything first
/opt/trm/scripts/backup.sh

# 2. On Contabo dashboard:
#    - Select VPS1
#    - Upgrade to 60GB RAM plan
#    - Confirm (billing adjusted)

# 3. Adjust Neo4j heap in docker-compose.yml
cd /opt/trm/neo4j
nano docker-compose.yml

# Change:
# NEO4J_dbms_memory_heap_max__size=16G → 32G
# NEO4J_dbms_memory_pagecache_size=16G → 24G

# 4. Restart
docker compose restart neo4j-superapp

# 5. Verify
docker exec neo4j-superapp cypher-shell -u neo4j -p "$NEO4J_PASSWORD" \
  "CALL dbms.listConfig() YIELD name, value 
   WHERE name CONTAINS 'memory' 
   RETURN name, value;"
```

**Cost Impact:**
```yaml
Before: $30/month VPS
After: $45/month VPS
Increase: +$15/month (+12.5% total budget)
```

---

#### **Option A2: Add Read Replicas (High Availability)**

**Action:**
```yaml
Add: VPS3 as Neo4j read replica
Cost: +$15/month
Timeline: 2-3 hours setup
Downtime: None

Benefits:
  - Distribute read queries (5-10x throughput)
  - High availability (if VPS1 fails)
  - Faster queries (load balancing)
```

**Setup Neo4j Replica:**

Create `/opt/trm/neo4j-replica/docker-compose.yml` on VPS3:

```yaml
version: '3.8'

services:
  neo4j-replica:
    image: neo4j:5.15-community
    container_name: neo4j-replica
    restart: unless-stopped
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/ChangeThisPassword123!
      - NEO4J_dbms_mode=READ_REPLICA
      - NEO4J_causal__clustering_initial__discovery__members=<VPS1_IP>:5000
      - NEO4J_dbms_memory_heap_max__size=16G
    volumes:
      - ./data:/data
    networks:
      - trm-network
```

Deploy:
```bash
# On VPS3
cd /opt/trm/neo4j-replica
docker compose up -d

# Configure LangGraph to route reads to replica
# Update agent.py:
# READ_REPLICAS = ["<VPS1_IP>", "<VPS3_IP>"]
# Use round-robin for read queries
```

---

#### **Option A3: Horizontal Sharding (Advanced)**

**When:** >100M triples, need extreme scale

**Action:**
```yaml
Setup: Shard Neo4j by entity type
  - VPS1: Companies, Products (50M)
  - VPS4: People, Organizations (50M)
  - VPS5: Events, Documents (50M)

Routing: LangGraph routes by entity type
Cost: +$30/month (2 new VPS)
Complexity: High (custom routing logic)
```

---

## ⚡ SCENARIO B: MORE PROCESSING (Heavy Workloads)

### **When to Scale**

```yaml
Triggers:
  ☐ Queue depth: >10 tasks waiting
  ☐ Task completion: >4 hours for heavy workloads
  ☐ CPU usage: >80% sustained on VPS2
  ☐ API rate limits: Hitting external MCP limits
  ☐ Founder blocked: Waiting for system frequently
```

### **Scaling Options**

#### **Option B1: GPU VPS for Video/ML (On-Demand)**

**Action:**
```yaml
Add: GPU VPS (on-demand, not 24/7)
Provider: Vast.ai, RunPod, Lambda Labs
Cost: ~$0.40-1.00/hour (only when needed)
Use: Video processing, local inference, image generation

When to use:
  - Processing >100 videos/day
  - Local LLM inference (Llama, Mistral)
  - Image generation (Stable Diffusion)
  - Cost arbitrage (vs TwelveLabs API)
```

**Setup GPU VPS (Vast.ai example):**

```yaml
1. Go to: https://vast.ai/
2. Filter:
   - GPU: RTX 3090 or better
   - VRAM: >24GB
   - Disk: >100GB
   - Location: Near your VPS

3. Rent on-demand (stop when not needed)

4. Install:
   - Docker
   - CUDA toolkit
   - TwelveLabs SDK (or alternatives)

5. Expose via API endpoint

6. Update LangGraph routing:
   - Heavy video tasks → GPU VPS
   - Light video tasks → TwelveLabs MCP
```

**Cost Example:**
```yaml
Scenario: Process 500 videos/day

Option 1 (TwelveLabs API):
  Cost: 500 × $0.30 = $150/day
  
Option 2 (GPU VPS on-demand):
  Processing: 500 videos / 50 per hour = 10 hours
  Cost: 10 × $0.60/hour = $6/day
  Savings: $144/day ($4,320/month!)

When GPU VPS makes sense:
  - >50 videos/day consistently
  - ROI: Immediate
```

---

#### **Option B2: Worker Nodes (Parallel Processing)**

**Action:**
```yaml
Add: VPS4-6 as worker nodes
Cost: +$45/month (3 × $15)
Timeline: 2-3 hours
Benefit: 5x → 25x parallel processing
```

**Architecture:**

```
┌──────────────────────────────────────┐
│  VPS2: LangGraph (Master)            │
│  - Receives tasks                     │
│  - Routes to workers                  │
│  - Aggregates results                 │
└──────────────────────────────────────┘
           ↓  ↓  ↓
┌─────────┐ ┌─────────┐ ┌─────────┐
│ VPS4    │ │ VPS5    │ │ VPS6    │
│ Worker  │ │ Worker  │ │ Worker  │
│ 5 tasks │ │ 5 tasks │ │ 5 tasks │
└─────────┘ └─────────┘ └─────────┘
  = 15 concurrent tasks total
```

**Setup Workers:**

Create `/opt/trm/worker/docker-compose.yml` on VPS4-6:

```yaml
version: '3.8'

services:
  celery-worker:
    image: python:3.11-slim
    container_name: celery-worker
    restart: unless-stopped
    environment:
      - CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@${VPS1_IP}:6379/0
      - CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@${VPS1_IP}:6379/0
    volumes:
      - ./tasks:/app/tasks
    command: celery -A tasks worker --loglevel=info --concurrency=5
    networks:
      - trm-network
```

**Update LangGraph to use Celery:**

```python
# In agent.py
from celery import Celery

celery_app = Celery(
    'tasks',
    broker=f'redis://:{REDIS_PASSWORD}@{VPS1_IP}:6379/0',
    backend=f'redis://:{REDIS_PASSWORD}@{VPS1_IP}:6379/0'
)

@celery_app.task
def heavy_task(task_type: str, data: dict):
    """Process heavy task on worker"""
    if task_type == "web_scraping":
        return scrape_web(data)
    elif task_type == "entity_extraction":
        return extract_entities(data)
    # ... etc

# Route heavy tasks to workers
def route_heavy_task(task_type: str, data: dict):
    """Route to Celery workers instead of processing locally"""
    result = heavy_task.apply_async(args=[task_type, data])
    return result.get(timeout=3600)  # Wait up to 1 hour
```

**Throughput Increase:**
```yaml
Before: 5 concurrent tasks
After: 15 concurrent tasks (3 workers × 5 each)
Example: Scrape 100k pages
  - Before: 20 hours
  - After: 7 hours (3x faster)
```

---

#### **Option B3: Cloud Burst (Hybrid)**

**Action:**
```yaml
Keep: VPS for baseline (predictable cost)
Add: AWS Lambda / Cloudflare Workers for spikes
Cost: Pay-per-use (AWS Lambda: 1M requests free/month)
Benefit: Handle sudden spikes without provisioning
```

**Setup AWS Lambda for Burst:**

```yaml
1. Create Lambda function:
   - Runtime: Python 3.11
   - Memory: 1024MB
   - Timeout: 15 minutes
   - Code: Entity extraction function

2. Expose via API Gateway:
   - REST API
   - Authentication: API key

3. Update LangGraph routing:
   def route_task(task_type, queue_depth):
       if queue_depth > 10:
           return "aws-lambda"  # Burst to cloud
       else:
           return "local-worker"  # Use VPS

4. Cost example:
   - Baseline: 1000 tasks/day → VPS ($0)
   - Spike: 10,000 tasks/day → Lambda ($5)
   - Total: $5 for spike day (vs $45/month extra VPS)
```

---

## 🧠 SCENARIO C: MORE INTELLIGENCE (Models & MCPs)

### **When to Scale**

```yaml
Triggers:
  ☐ Need specialized models (medical, legal, code)
  ☐ New data sources (LinkedIn, Twitter, APIs)
  ☐ Cost optimization (use cheaper models for simple tasks)
  ☐ Speed optimization (route to fastest model)
  ☐ New capabilities needed (voice, 3D, VR)
```

### **Scaling Options**

#### **Option C1: Add Models (Easy)**

**Current:** Claude 4.5, Grok 3, Gemini Flash

**Add:**
```yaml
Models to consider:
  - GPT-5 (when released): Superior reasoning
  - Llama 4 (local): Free, private
  - Mistral Large: Multilingual excellence
  - Cohere Command-R+: Enterprise features

Cost impact: Variable (pay-per-use)
Timeline: 5 mins (add API key, update routing)
```

**Add Model to LangGraph:**

```python
# In agent.py
from langchain_openai import ChatOpenAI
from langchain_community.llms import Ollama

# Add GPT-5
gpt5 = ChatOpenAI(model="gpt-5", api_key=os.getenv("OPENAI_API_KEY"))

# Add Llama 4 (local via Ollama on GPU VPS)
llama4 = Ollama(model="llama4:70b", base_url="http://<GPU_VPS_IP>:11434")

# Multi-model routing
def route_to_model(task_complexity: str):
    """Route based on complexity and cost"""
    if task_complexity == "simple":
        return gemini_flash  # $0.10/M tokens
    elif task_complexity == "medium":
        return claude_sonnet  # $3/$15/M tokens
    elif task_complexity == "complex":
        return gpt5  # $10/$30/M tokens (hypothetical)
    elif task_complexity == "bulk":
        return llama4  # Free (local)
```

---

#### **Option C2: Expand MCP Ecosystem**

**Current:** 8 MCPs (5 internal + 3 external)

**Add from Community (1000s available):**

```yaml
Social Media:
  - twitter-mcp: Tweet, search, analyze
  - linkedin-mcp: Profile scraping, job posts
  - reddit-mcp: Subreddit monitoring

Development:
  - github-mcp: Repo analysis, code search
  - gitlab-mcp: CI/CD integration
  - docker-mcp: Container management

Business:
  - stripe-mcp: Payment data
  - shopify-mcp: E-commerce analytics
  - salesforce-mcp: CRM data

Design:
  - figma-mcp: Design file access
  - canva-mcp: Template generation
  - adobe-mcp: Creative suite integration

Cost: Mostly free (community MCPs)
Timeline: 10-30 mins per MCP
```

**Add MCP Example:**

```bash
# On VPS2
cd /opt/trm/mcps

# Clone community MCP
git clone https://github.com/community/twitter-mcp

# Deploy
cd twitter-mcp
docker compose up -d

# Update 1MCP aggregator config
nano /opt/trm/mcps/1mcp-aggregator/config.yaml
# Add:
#   - name: twitter-mcp
#     url: http://localhost:8010
#     description: Twitter integration

# Restart aggregator
cd /opt/trm/mcps/1mcp-aggregator
docker compose restart
```

---

#### **Option C3: Custom MCP Development**

**When:** Specific need không có trong community

**Example:** Custom ERP MCP for your company

```python
# /opt/trm/mcps/custom-erp-mcp/mcp.py
from fastmcp import FastMCP
import requests

mcp = FastMCP("custom-erp-mcp")

@mcp.tool()
def get_inventory(product_id: str) -> dict:
    """Get inventory level from company ERP"""
    response = requests.get(
        f"https://erp.company.com/api/inventory/{product_id}",
        headers={"Authorization": f"Bearer {ERP_API_KEY}"}
    )
    return response.json()

@mcp.tool()
def create_order(customer_id: str, items: list) -> dict:
    """Create order in ERP system"""
    # ... implementation
    pass

if __name__ == "__main__":
    mcp.run()
```

**Timeline:** 2-4 hours per custom MCP  
**Cost:** $0 (DIY) or outsource ($200-1000/MCP)

---

## 👥 SCENARIO D: MULTI-TENANT (Platform Mode)

### **When to Scale**

```yaml
Triggers:
  ☐ Want to serve external clients
  ☐ Offer AI services as product
  ☐ Share knowledge graph (with access control)
  ☐ Revenue from platform
```

### **Scaling Architecture**

```yaml
Current: Single tenant (founder only)

Multi-tenant Changes:
  ✅ User authentication (Auth0, Clerk)
  ✅ Tenant isolation (per-tenant databases)
  ✅ Billing & metering (Stripe)
  ✅ API rate limiting (per tenant)
  ✅ Usage dashboards
```

**Multi-Tenant Architecture:**

```
┌─────────────────────────────────────┐
│  API Gateway + Auth                  │
│  - Authenticate user                 │
│  - Route to tenant namespace         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Tenant Isolation Layer              │
│  - Tenant A → Namespace A            │
│  - Tenant B → Namespace B            │
└─────────────────────────────────────┘
              ↓
┌──────────────┬──────────────┬────────┐
│ Neo4j        │ Qdrant       │ Costs  │
│ Namespaces   │ Collections  │ Tracked│
└──────────────┴──────────────┴────────┘
```

**Implementation:**

1. **Add Authentication:**

```yaml
# Add to LobeChat & LangGraph
services:
  auth:
    image: supabase/gotrue:latest
    environment:
      - JWT_SECRET=your-secret
      - SITE_URL=https://yourdomain.com
```

2. **Tenant Isolation:**

```python
# In LangGraph agent.py
def get_tenant_context(api_key: str) -> dict:
    """Get tenant info from API key"""
    tenant = db.query("SELECT * FROM tenants WHERE api_key = ?", api_key)
    return {
        "tenant_id": tenant.id,
        "neo4j_namespace": f"tenant_{tenant.id}",
        "qdrant_collection": f"tenant_{tenant.id}_vectors",
        "usage_limits": tenant.plan_limits
    }

def query_neo4j_multi_tenant(tenant_ctx: dict, cypher: str):
    """Query Neo4j with tenant isolation"""
    # Prepend tenant namespace to all queries
    namespaced_cypher = f"""
    CALL {{
        USE graph.tenant_{tenant_ctx['tenant_id']}
        {cypher}
    }}
    """
    return neo4j.query(namespaced_cypher)
```

3. **Billing:**

```python
# Track usage per tenant
def track_usage(tenant_id: str, operation: str, cost: float):
    """Track API usage for billing"""
    db.execute("""
        INSERT INTO usage_logs (tenant_id, operation, cost, timestamp)
        VALUES (?, ?, ?, NOW())
    """, [tenant_id, operation, cost])
    
    # Check if over plan limit
    total = db.query_value("""
        SELECT SUM(cost) FROM usage_logs 
        WHERE tenant_id = ? AND 
              timestamp > DATE_SUB(NOW(), INTERVAL 1 MONTH)
    """, [tenant_id])
    
    if total > tenant.plan_limit:
        raise RateLimitError(f"Tenant {tenant_id} over plan limit")
```

**Revenue Model:**

```yaml
Plans:
  Starter ($49/mo):
    - 10k Neo4j queries/month
    - 1k Qdrant searches/month
    - 100 heavy workloads/month
    - Email support
  
  Professional ($199/mo):
    - 100k Neo4j queries
    - 10k Qdrant searches
    - 1k heavy workloads
    - Priority support
  
  Enterprise ($999/mo):
    - Unlimited queries
    - Unlimited searches
    - Unlimited workloads
    - Dedicated support
    - Custom MCPs

Cost to serve:
  - Infrastructure: $125/month (baseline)
  - Per tenant overhead: ~$10-20/month
  - Margin: 60-80% on Starter/Pro plans
```

---

## 💰 COST ANALYSIS BY SCENARIO

```yaml
Current State (Baseline):
  Monthly: $125
  Daily: ~$4-5
  
Scenario A (More Data):
  Option A1 (Upgrade RAM): +$15/mo (+12%)
  Option A2 (Add replica): +$15/mo (+12%)
  Option A3 (Sharding): +$30/mo (+24%)

Scenario B (More Processing):
  Option B1 (GPU on-demand): $0-200/mo (variable)
  Option B2 (Workers): +$45/mo (+36%)
  Option B3 (Cloud burst): $0-50/mo (spikes only)

Scenario C (More Intelligence):
  Option C1 (Models): +$0-100/mo (API costs)
  Option C2 (MCPs): $0 (community)
  Option C3 (Custom MCPs): $0 (DIY)

Scenario D (Multi-tenant):
  Infrastructure: +$50-100/mo (scale for multiple tenants)
  Revenue: $49-999/mo per tenant
  Net: Positive after 3-5 tenants

Aggressive Scaling (All scenarios):
  Cost: ~$400/mo
  Capacity: 10x baseline
  Revenue potential: $2k-10k/mo (multi-tenant)
  ROI: 5-25x
```

---

## 🎯 DECISION TREE

```yaml
Problem: Slow queries?
  → Scenario A: Upgrade VPS1 RAM

Problem: Long queue times?
  → Scenario B: Add workers or GPU VPS

Problem: Need new capabilities?
  → Scenario C: Add models or MCPs

Problem: Want revenue?
  → Scenario D: Go multi-tenant

Problem: Cost too high?
  → Optimize: Use cheaper models, cache more, batch requests
```

---

## 📝 SCALING CHECKLIST

```yaml
Before Scaling:
  ☐ Identify bottleneck (CPU, RAM, disk, API limits?)
  ☐ Measure current performance (queries/sec, latency)
  ☐ Calculate ROI (cost vs benefit)
  ☐ Backup everything
  ☐ Test scaling in staging (if possible)

During Scaling:
  ☐ Schedule maintenance window
  ☐ Notify users (if multi-tenant)
  ☐ Execute scaling plan
  ☐ Monitor closely (logs, metrics)

After Scaling:
  ☐ Verify performance improvement
  ☐ Update documentation
  ☐ Monitor costs (daily for 1 week)
  ☐ Optimize further if needed
```

---

## 🔮 FUTURE ROADMAP

```yaml
Month 1-2:
  → Optimize current setup
  → Add 5-10 community MCPs
  → Fine-tune model routing

Month 3-6:
  → Scale data (upgrade RAM if needed)
  → Add GPU VPS for cost arbitrage
  → Explore multi-tenant (beta)

Month 6-12:
  → Launch multi-tenant platform
  → Expand to 5-10 tenants
  → Build custom MCPs marketplace
  → Revenue: $5k-20k/month

Year 2+:
  → Distributed system (multi-region)
  → 100+ tenants
  → Enterprise features
  → Revenue: $50k-200k/month
```

---

**Document Version:** 1.0  
**Last Updated:** 11/10/2025  
**Scaling Paths:** 4 scenarios, 10+ options

🚀 **Scale when ready, not before!**
