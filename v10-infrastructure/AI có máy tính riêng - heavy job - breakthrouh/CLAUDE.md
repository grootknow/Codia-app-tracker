# TRM AI CÓ MÁY TÍNH - Context for AI Assistants

**Project:** Production-Ready AI System với VPS  
**Version:** 7.0 (Agent Skills Era)  
**Last Updated:** 17/10/2025  
**Purpose:** Internal productivity system thay thế 5-10 nhân sự
**Latest:** [Anthropic Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) (Oct 16, 2025)

---

## 🎯 PROJECT VISION & CAPABILITIES

### **What We're Building**
**4-tier infinitely expandable cognitive runtime:** ⭐ (Updated Oct 2025)
- **Tầng 4 (AI Core)**: Pluggable models (Claude 4,5 → Chatgpt 5, Grok → Grok 4 fast, swap anytime)
- **Tầng 3 (Agent Skills)**: Procedural knowledge (HOW to do things) ⭐ NEW
- **Tầng 2 (MCPs)**: Unlimited tools (5 → 50 → 200 → 1000s, plug & play)
- **Tầng 1 (VPS)**: Elastic scaling (2 → 10 VPS, +GPU, +workers, hybrid cloud)

**Core Capabilities (Broad, Not Rigid):**
- ✅ **Mass Content**: Any format/scale (1 page → 10k pages, books → docs → marketing → education)
- ✅ **Mass Data**: Any source/scale (100 → 1M pages, web → APIs → databases → media)
- ✅ **Mass Media**: Any format/depth (1 → 100k videos, visual → audio → semantic → intelligence)
- ✅ **Autonomous ops**: Daily briefs, content gen, monitoring (24/7)
- ✅ **Infinite expansion**: +1 MCP = +1 capability, +1 VPS = +capacity, +1 model = +intelligence
- ✅ **Knowledge compounds**: Every task adds value forever (not depletes)

**NOT temporary solution:**
- ❌ Không phải "automation scripts"
- ❌ Không phải "chatbot nâng cao"  
- ✅ Là **infrastructure foundation** cho tất cả future products
- ✅ **Platform** monetizable (APIs, services, consulting)

### **Why This System Exists**

```yaml
Gap Without System:
  Problem: Solo founder cần 13 people ($76k/month)
    - 2 Research analysts: $10k/month
    - 2 Content writers: $8k/month
    - 2 Data engineers: $12k/month
    - 2 Video editors: $6k/month
    - 5 Developers: $40k/month
  
  Reality: Still slow, limited capacity, turnover

With This System:
  Solution: $125/month (610x cheaper!)
    - Replace all 13 people
    - 10x human capacity
    - Exponential scaling (10x work = +10% cost)
    - Knowledge compounds forever
  
  ROI: Save $75,875/month, immediate payback
  
  Strategic Value:
    - Knowledge graph: Years to replicate
    - Tool library: Proprietary advantage
    - Permanent competitive lead
```

### **System Evolution (Weeks not Months)**

```yaml
Week 0 (Deploy Xong):
  Infrastructure: 2 VPS, databases migrated, all MCPs operational
  Capabilities: Heavy + light workloads 24/7 (broad, not limited)
  Replace: 5-13 people immediately
  
Week 1:
  Learning: Knowledge doubled, 50+ MCPs created, cache 40% hit
  Speed: 2x faster (patterns learned), 30-40% cost reduction
  Output: 100+ reports, 10k+ pages, 1000+ hours media
  SuperApp: 70% data/tech ready
  
Week 2+:
  Transform: Personal AI → Platform foundation
  Revenue: APIs ($1k-10k/mo), reports ($500-5k), projects ($5k-50k)
  Scale: Hybrid VPS + cloud, multi-tenant
  Moat: Knowledge + tools + speed (unbeatable)
  
Architecture Philosophy:
  ✅ 4-tier infinite expansion (AI + Skills + MCPs + VPS) ⭐
  ✅ Skills teach HOW (workflows, best practices)
  ✅ MCPs provide WHAT (tools, data sources)
  ✅ Swap models anytime (Sonnet 4 → Opus 5)
  ✅ Add MCPs = add capabilities (instant)
  ✅ Add Skills = add expertise (instant)
  ✅ Scale VPS elastically (+$15 per node)
  ✅ Knowledge + Skills compound forever
```

---

## 🏗️ ARCHITECTURE SUMMARY

### **2 VPS Contabo (30GB RAM each)**

**VPS1 - Databases:**
- Neo4j (2M + 19M triples)
- Qdrant (10M vectors)
- PostgreSQL + TimescaleDB
- Redis cluster

**VPS2 - AI Orchestration:**
- **LangGraph** (cognitive orchestrator - AI brain for reasoning & decisions)
- **Agent Skills Library** (/opt/trm/skills/) ⭐ NEW
- **n8n** (system glue - monitoring, scheduling, webhooks, NOT AI reasoning)
- Zep Memory (temporal KG, deduplication)
- 1MCP Aggregator
- Internal MCPs: neo4j, postgres, filesystem, shell, notion
- Coolify + Apps (NocoDB, Postiz, etc.)
- **LobeChat UI** (chat interface cho founder)

**Role Separation:**
```yaml
LangGraph (Cognitive):
  - Multi-step reasoning
  - Task planning & decomposition
  - MCP routing decisions
  - Human-in-loop checkpoints
  - Learning from outcomes

n8n (Operational):
  - VPS health monitoring
  - Scheduled backups, cleanups
  - File sync (VPS ↔ R2 ↔ Notion)
  - Webhooks (Notion → trigger LangGraph)
  - API cost tracking
  
Workflow: n8n triggers → LangGraph processes → n8n executes mundane tasks
```

### **External Services**
- Cloudflare R2 (media storage, free egress)
- Apify MCP (web scraping, 5000+ actors)
- TwelveLabs MCP (video understanding)
- Perplexity API (web search)
- Replicate API (ML models on-demand)

---

## 🛠️ TECH STACK

### **Core Technologies**
```yaml
AI/ML:
  - LangGraph (orchestration, ReAct loops)
  - Agent Skills (procedural knowledge, workflows) ⭐ NEW
  - Zep (memory với Graphiti temporal KG)
  - Claude 4.5 Sonnet, Grok 2, Gemini Flash (multi-model routing)
  - OpenAI text-embedding-3-large (embeddings)

Databases:
  - Neo4j 5.x + neosemantics/n10s (RDF support)
  - Qdrant (vector database)
  - PostgreSQL 16 + TimescaleDB
  - Redis 7.x

MCP:
  - 1MCP (aggregator)
  - FastMCP (Python framework)
  - Apify MCP (external scraping)
  - TwelveLabs MCP (external video)

Apps:
  - Coolify (self-hosted PaaS)
  - NocoDB (PostgreSQL UI)
  - n8n (workflow automation)
  - Postiz (social media)
  - LobeChat (chat UI)

Storage:
  - Cloudflare R2 (S3-compatible, free egress)
  - Backblaze B2 (backup)

UI:
  - LobeChat (Next.js-based, MCP support, modern UI)
  - Notion (primary interface cho founder)
```

### **Programming Languages**
- **Python 3.11+**: LangGraph, MCPs, automation
- **TypeScript/Node.js**: LobeChat, n8n workflows
- **Bash**: System scripts, deployment
- **Cypher**: Neo4j queries
- **SQL**: PostgreSQL queries

---

## 📁 PROJECT STRUCTURE

```
PRODUCTION-DOCS-V7-WITH-SKILLS/
├── CLAUDE.md (THIS FILE - context for AI)
├── 00-PROJECT-OVERVIEW.md (4-tier vision)
├── 01-ARCHITECTURE.md (detailed 4-tier architecture)
├── 02-IMPLEMENTATION-GUIDE.md (step-by-step 14 days)
├── 03-DEPLOYMENT.md (VPS setup, configs)
├── 04-SCALING-EXPANSION.md (growth paths)
├── 05-TROUBLESHOOTING.md (common issues)
├── 06-AGENT-SKILLS-GUIDE.md (Skills documentation) ⭐ NEW
├── configs/
│   ├── docker-compose.yml (per service)
│   ├── neo4j.conf
│   ├── qdrant.yaml
│   ├── zep.yaml
│   └── lobechat.env
├── scripts/
│   ├── setup-vps.sh
│   ├── deploy-databases.sh
│   ├── deploy-ai-layer.sh
│   └── backup.sh
└── templates/
    ├── notion-databases/
    ├── n8n-workflows/
    └── mcp-configs/
```

---

## 🔧 COMMON COMMANDS

### **Docker Management**
```bash
# Start all services
docker-compose up -d

# View logs
docker logs -f <container-name>

# Restart service
docker-compose restart <service>

# Check health
docker ps
docker stats
```

### **Neo4j Cypher**
```cypher
# Query entities
MATCH (e:Entity) RETURN e LIMIT 10

# Create with MERGE (upsert, prevents duplicates)
MERGE (e:Entity {name: $name})
ON CREATE SET e.created_at = datetime()
SET e += $props
RETURN e

# Check relationships
MATCH (a)-[r]-(b) RETURN type(r), count(*) GROUP BY type(r)
```

### **Qdrant**
```python
# Search vectors
qdrant.search(
    collection_name="text_embeddings",
    query_vector=embedding,
    limit=10
)

# Upsert points (batch)
qdrant.upsert(
    collection_name="text_embeddings",
    points=[...]
)
```

### **R2 (S3-compatible)**
```python
# Upload to R2
s3.upload_file(
    Filename=local_path,
    Bucket="trm-media",
    Key=f"videos/{filename}"
)

# Get CDN URL
cdn_url = f"https://media.trm.ai/videos/{filename}"
```

---

## 🎨 CODE STYLE

### **Python**
```python
# Use async/await for I/O operations
async def process_task():
    result = await external_api_call()
    return result

# Type hints always
def query_neo4j(cypher: str, params: dict) -> list[dict]:
    return neo4j.query(cypher, params)

# Docstrings for functions
def route_mcp_task(task_type: str, data_size: int) -> str:
    """
    Route task to internal or external MCP based on type and size.
    
    Args:
        task_type: Type of task (web_scraping, video_processing, etc.)
        data_size: Size of data to process
        
    Returns:
        MCP endpoint name
    """
    pass

# Use context managers
async with graph_lock(f"entity:{name}"):
    # critical section
    pass
```

### **Error Handling**
```python
# Always handle external API errors
try:
    result = await apify_mcp.scrape(url)
except TimeoutError:
    logger.error("Apify timeout")
    # Retry logic or fallback
except Exception as e:
    logger.exception("Apify failed")
    raise

# Idempotent operations (use Redis status)
status = redis.get(f"task:{task_id}:status")
if status == "completed":
    return redis.get(f"task:{task_id}:result")
```

---

## ⚠️ IMPORTANT PATTERNS

### **1. Prevent Duplicates (Neo4j)**
```cypher
# ALWAYS use MERGE for entities, not CREATE
MERGE (e:Entity {name: $name})
ON CREATE SET e.created_at = datetime()
SET e += $props
```

### **2. Deduplication (Zep Memory)**
```python
# Zep's Graphiti handles deduplication automatically
zep.add_memory(
    session_id=f"user_{user_id}",
    messages=[{"role": "user", "content": content}]
)
# No manual deduplication needed
```

### **3. Idempotent Tasks**
```python
# Design operations to be safely retryable
class IdempotentTask:
    def __init__(self, task_id):
        self.task_id = task_id
    
    async def execute(self):
        # Check if already done
        status = redis.get(f"task:{self.task_id}:status")
        if status == "completed":
            return redis.get(f"task:{self.task_id}:result")
        
        # Mark in-progress
        redis.set(f"task:{self.task_id}:status", "in_progress")
        
        try:
            result = await self.do_work()
            redis.set(f"task:{self.task_id}:status", "completed")
            redis.set(f"task:{self.task_id}:result", result)
            return result
        except Exception as e:
            redis.set(f"task:{self.task_id}:status", "failed")
            raise
```

### **4. Route to External MCPs**
```python
# LangGraph routing logic
def route_mcp_task(task_type: str) -> str:
    """Route to internal vs external MCP"""
    
    # Internal MCPs (fast, <5ms)
    if task_type in ["neo4j_query", "postgres_query", "notion_read"]:
        return "internal-mcp"
    
    # External MCPs (specialized, pay-per-use)
    if task_type == "web_scraping":
        return "apify-mcp"  # 5000+ actors
    
    if task_type == "video_processing":
        return "twelvelabs-mcp"  # SOTA video understanding
    
    if task_type == "web_search":
        return "perplexity-mcp"  # Real-time with citations
    
    return "internal-mcp"  # Default
```

---

## 🎯 AGENT SKILLS PATTERNS ⭐ NEW (Oct 2025)

### **What Are Agent Skills?**
```yaml
Agent Skills = Procedural knowledge packaging
Format: Folder (SKILL.md + resources + scripts)
Purpose: Tell Claude HOW to do things
Loading: Progressive (3 levels: metadata → instructions → resources)

Official: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
```

### **Skills vs MCPs**
```yaml
Agent Skills (HOW):
  - Document workflows & best practices
  - Company-specific procedures
  - Quality standards & templates
  - Example: "HOW to write TRM research reports"
  
MCPs (WHAT):
  - Provide tools & data access
  - External APIs & databases
  - System operations
  - Example: "WHAT tools: Neo4j, Apify"

Together:
  User: "Research AI market"
  → LangGraph loads skill: trm-research-report (HOW)
  → Skill uses MCPs: neo4j, perplexity, apify (WHAT)
  → Output: TRM-standard research report
```

### **Using Skills in Code**
```python
from skills_loader import SkillsManager

# Initialize (at startup)
skills_mgr = SkillsManager()

# System prompt includes skill metadata (Level 1)
system_prompt = f"""
You have access to these skills:
{skills_mgr.get_metadata_for_prompt()}

When a task matches a skill, load it by reading the SKILL.md file.
"""

# Claude triggers skill (Level 2)
# By using filesystem tool to read: /opt/trm/skills/trm-research-report/SKILL.md

# Skill may reference additional files (Level 3)
# Claude reads them as needed: sources.md, analysis.md, etc.
```

### **Creating Skills**
```markdown
# Skill Structure
/opt/trm/skills/skill-name/
├── SKILL.md          # metadata + instructions
├── reference.md      # detailed docs
├── templates/        # output templates
└── scripts/          # executable code

# SKILL.md Format
---
name: skill-name
description: Brief description for Claude
tags: [category, domain]
---

# Skill Title

## When to Use
- Trigger condition 1
- Trigger condition 2

## Process
1. Step 1 (use neo4j-mcp)
2. Step 2 (see reference.md)
3. Step 3 (run scripts/analyze.py)

## Output
Format according to templates/report.md
```

### **Skills Best Practices**
```yaml
✅ DO:
  - Document successful workflows
  - Include examples (inputs/outputs)
  - Reference MCPs by name
  - Keep SKILL.md concise (1-2 KB)
  - Split large content to separate files
  - Version control in git

❌ DON'T:
  - Put everything in one file
  - Hardcode values (use params)
  - Skip examples
  - Forget to update when workflow changes
```

**Complete Guide:** See 06-AGENT-SKILLS-GUIDE.md

---

## 🚫 ANTI-PATTERNS (AVOID)

```yaml
❌ NEVER self-host heavy workloads:
  - FFmpeg video processing → Use TwelveLabs MCP
  - Web scraping clusters → Use Apify MCP
  - ML model inference → Use Replicate API
  - Large file storage → Use Cloudflare R2

❌ NEVER use CREATE in Neo4j:
  - Always use MERGE (prevents duplicates)

❌ NEVER block on long operations:
  - Use async/await
  - Return job_id, let n8n poll for completion

❌ NEVER hardcode paths/URLs:
  - Use environment variables
  - Store in Vaultwarden secrets

❌ NEVER skip error handling:
  - External APIs WILL fail
  - Always have retry logic or fallbacks
```

---

## 📝 WORKFLOW PATTERNS

### **Heavy Workload Pattern**
```yaml
1. Receive task from founder (via Notion or LobeChat)
2. LangGraph analyzes task
3. Route to appropriate MCP:
   - Internal: neo4j, postgres, filesystem
   - External: Apify, TwelveLabs, Perplexity
4. External MCP processes (may take minutes)
5. Store results:
   - Raw data → PostgreSQL
   - Vectors → Qdrant
   - Relationships → Neo4j
   - Files → Cloudflare R2
6. Update Notion Files Registry
7. Notify founder (Telegram)
```

### **Memory Management**
```yaml
1. Every interaction → Zep Memory
2. Zep Graphiti automatically:
   - Extracts facts
   - Detects duplicates
   - Resolves contradictions
   - Links entities
3. Query Zep for context (temporal KG)
4. LangGraph uses Zep context for decisions
```

---

## 🎯 TESTING CHECKLIST

When making changes, verify:

```yaml
☐ Neo4j queries use MERGE (not CREATE)
☐ External API calls have error handling
☐ Operations are idempotent (can retry safely)
☐ Async functions use await
☐ Type hints present
☐ Docstrings for public functions
☐ Environment variables (no hardcoded secrets)
☐ Logging at appropriate levels
☐ Memory operations go through Zep
☐ Files uploaded to R2 (not VPS disk)
```

---

## 💰 COST AWARENESS

```yaml
Budget: $125±25/month

High-cost operations:
  - Claude 4.5 Sonnet: $3/M input, $15/M output
  - TwelveLabs video: $0.10-0.50/video
  - Apify scraping: ~$0.002/page

Optimization tips:
  - Use Gemini Flash for simple tasks ($0.50/M)
  - Cache frequent Neo4j queries (Redis)
  - Batch embeddings (OpenAI)
  - Async parallel external MCP calls
  - Monitor costs daily (n8n automation)
```

---

## 🔗 USEFUL LINKS

### **Agent Skills (NEW - Oct 2025)** ⭐
- **Anthropic Blog**: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- **Skills Docs**: https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview
- **Skills GitHub**: https://github.com/anthropics/skills
- **Skills Cookbook**: https://github.com/anthropics/claude-cookbooks/tree/main/skills
- **Notion Example**: https://www.notion.com/help/notion-mcp

### **Core Technologies**
- **Anthropic Context Engineering**: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **LangGraph Docs**: https://langchain-ai.github.io/langgraph/
- **Zep Memory**: https://www.getzep.com/
- **MCP Spec**: https://modelcontextprotocol.io/

### **External Services**
- **Apify MCP**: https://mcp.apify.com/
- **TwelveLabs**: https://www.twelvelabs.io/
- **LobeChat**: https://github.com/lobehub/lobe-chat
- **Cloudflare R2**: https://developers.cloudflare.com/r2/

---

## 🤖 FOR AI ASSISTANTS

When implementing features:

1. **Read docs in order**:
   - CLAUDE.md (this file - context)
   - 06-AGENT-SKILLS-GUIDE.md (NEW - skills framework) ⭐
   - 01-ARCHITECTURE.md (4-tier design)
   - 02-IMPLEMENTATION-GUIDE.md (deployment steps)

2. **Follow key patterns**:
   - Use Agent Skills for workflows (HOW)
   - Use MCPs for tools (WHAT)
   - MERGE not CREATE in Neo4j
   - Idempotent operations
   - Route heavy work to external MCPs

3. **Agent Skills workflow**:
   - Check if skill exists for task
   - Load skill (progressive disclosure)
   - Follow skill's documented workflow
   - Use MCPs referenced in skill
   - Format output per skill template

4. **Update tracking**:
   - Notion Files Registry (new files)
   - Skills library (successful workflows)
   - Test locally first

5. **Ask for clarification** if requirements unclear

**IMPORTANT**: This is a production system serving a solo founder. Prioritize:
- ✅ Reliability > Features
- ✅ Skills + MCPs > Reinventing
- ✅ External APIs > Self-hosting
- ✅ Simple > Complex
- ✅ Cost-effective > Perfect
- ✅ Documented workflows > Ad-hoc solutions ⭐ NEW

---

**Document Version:** 7.0 (Agent Skills Era)  
**Last Context Update:** 17/10/2025  
**Major Update:** Added Agent Skills framework (4-tier architecture)  
**Next Review:** After Skills deployment (Week 2)
