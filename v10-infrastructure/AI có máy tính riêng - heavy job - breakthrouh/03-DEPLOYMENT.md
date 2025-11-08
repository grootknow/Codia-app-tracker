# 🚀 DEPLOYMENT GUIDE - Complete Configs & Scripts

**Version:** 10.0 ULTIMATE (Autonomous Operations Era)  
**Purpose:** Production-ready configurations for 3-VPS + Observability + AI Agents  
**Usage:** Copy-paste directly to VPS
**Updated:** 04/11/2025 - V10 with Observability + 8 AI Agents

---

## 📋 OVERVIEW

File này chứa tất cả configs và scripts cần thiết để deploy, sẵn sàng copy-paste.

**Structure V10:**
```
/opt/trm/
# VPS1: Control + Observability
├── coolify/         (VPS1) - PaaS Manager
├── n8n/             (VPS1) - Automation
├── grafana/         (VPS1) ⭐ NEW - Dashboards
├── prometheus/      (VPS1) ⭐ NEW - Metrics
├── loki/            (VPS1) ⭐ NEW - Logs
├── sentry/          (VPS1) ⭐ NEW - Errors
├── tempo/           (VPS1) ⭐ NEW - Traces
├── alerta/          (VPS1) ⭐ NEW - Alert Hub
├── gitea/           (VPS1) ⭐ NEW - CI/CD
└── headscale/       (VPS1) ⭐ NEW - VPN

# VPS2: All Databases
├── neo4j/           (VPS2) - Product (2M + 19M) + Agent (1M)
├── qdrant/          (VPS2) - Product (10M) + Agent (400k)
├── postgresql/      (VPS2) - Product (4 DBs) + Agent (2 DBs)
└── redis/           (VPS2) - Product + Agent

# VPS3: Product AI + Agent AI
├── langgraph/       (VPS3) - Product + Agent (2 instances)
├── zep/             (VPS3) - Product + Agent (2 instances)
├── lobechat/        (VPS3) - Chat UI
├── skills/          (VPS3) - Agent Skills Library
├── agents/          (VPS3) ⭐ NEW - 8 AI Agents
└── mcps/            (VPS3) - MCP Gateways
```

---

## 🗄️ VPS1: DATABASES

### **1. Neo4j (Dual Instances)**

**File:** `/opt/trm/neo4j/docker-compose.yml`

```yaml
version: '3.8'

services:
  neo4j-internal:
    image: neo4j:5.15-community
    container_name: neo4j-internal
    restart: unless-stopped
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/ChangeThisPassword123!
      - NEO4J_PLUGINS=["apoc"]
      - NEO4J_dbms_memory_heap_max__size=8G
      - NEO4J_dbms_memory_pagecache_size=8G
      - NEO4J_dbms_security_procedures_unrestricted=apoc.*
      - NEO4J_dbms_security_procedures_allowlist=apoc.*
    volumes:
      - ./data/internal:/data
      - ./logs/internal:/logs
      - ./import:/import
    healthcheck:
      test: ["CMD", "cypher-shell", "-u", "neo4j", "-p", "ChangeThisPassword123!", "RETURN 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - trm-network

  neo4j-superapp:
    image: neo4j:5.15-community
    container_name: neo4j-superapp
    restart: unless-stopped
    ports:
      - "7475:7474"
      - "7688:7687"
    environment:
      - NEO4J_AUTH=neo4j/ChangeThisPassword123!
      - NEO4J_PLUGINS=["apoc", "neosemantics"]
      - NEO4J_dbms_memory_heap_max__size=16G
      - NEO4J_dbms_memory_pagecache_size=16G
      - NEO4J_dbms_security_procedures_unrestricted=apoc.*,n10s.*
      - NEO4J_dbms_security_procedures_allowlist=apoc.*,n10s.*
    volumes:
      - ./data/superapp:/data
      - ./logs/superapp:/logs
      - ./import:/import
    healthcheck:
      test: ["CMD", "cypher-shell", "-u", "neo4j", "-p", "ChangeThisPassword123!", "RETURN 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - trm-network

networks:
  trm-network:
    driver: bridge
```

**File:** `/opt/trm/neo4j/.env`

```bash
NEO4J_PASSWORD=ChangeThisPassword123!
NEO4J_INTERNAL_HEAP=8G
NEO4J_SUPERAPP_HEAP=16G
```

---

### **2. Qdrant**

**File:** `/opt/trm/qdrant/docker-compose.yml`

```yaml
version: '3.8'

services:
  qdrant:
    image: qdrant/qdrant:v1.7.4
    container_name: qdrant
    restart: unless-stopped
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./data:/qdrant/storage
      - ./config:/qdrant/config
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/"]
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - trm-network

networks:
  trm-network:
    external: true
```

**File:** `/opt/trm/qdrant/config/config.yaml`

```yaml
storage:
  storage_path: /qdrant/storage

service:
  max_request_size_mb: 100
  grpc_port: 6334
  http_port: 6333

cluster:
  enabled: false
```

---

### **3. PostgreSQL + TimescaleDB**

**File:** `/opt/trm/postgresql/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:2.13.0-pg16
    container_name: postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=ChangeThisPassword123!
      - POSTGRES_DB=trm_main
      - POSTGRES_INITDB_ARGS=--encoding=UTF8
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - ./data:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - trm-network

networks:
  trm-network:
    external: true
```

**File:** `/opt/trm/postgresql/init/01-create-databases.sql`

```sql
-- Create databases for different services
CREATE DATABASE zep_memory;
CREATE DATABASE lobechat;
CREATE DATABASE n8n;

-- Create user for applications
CREATE USER trm_app WITH PASSWORD 'ChangeThisPassword123!';
GRANT ALL PRIVILEGES ON DATABASE trm_main TO trm_app;
GRANT ALL PRIVILEGES ON DATABASE zep_memory TO trm_app;
GRANT ALL PRIVILEGES ON DATABASE lobechat TO trm_app;
GRANT ALL PRIVILEGES ON DATABASE n8n TO trm_app;

-- Enable TimescaleDB extension
\c trm_main;
CREATE EXTENSION IF NOT EXISTS timescaledb;

\c zep_memory;
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

---

### **4. Redis**

**File:** `/opt/trm/redis/docker-compose.yml`

```yaml
version: '3.8'

services:
  redis:
    image: redis:7.2-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: >
      redis-server
      --appendonly yes
      --requirepass ChangeThisPassword123!
      --maxmemory 2gb
      --maxmemory-policy allkeys-lru
    volumes:
      - ./data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "ChangeThisPassword123!", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    networks:
      - trm-network

networks:
  trm-network:
    external: true
```

**File:** `/opt/trm/redis/redis.conf`

```conf
# Redis Configuration
bind 0.0.0.0
protected-mode yes
port 6379
requirepass ChangeThisPassword123!

# Persistence
appendonly yes
appendfsync everysec

# Memory Management
maxmemory 2gb
maxmemory-policy allkeys-lru

# Security
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
```

---

## 🤖 VPS2: AI ORCHESTRATION

### **1. Zep Memory**

**File:** `/opt/trm/zep/docker-compose.yml`

```yaml
version: '3.8'

services:
  zep:
    image: ghcr.io/getzep/zep:latest
    container_name: zep
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - ZEP_MEMORY_STORE_TYPE=postgres
      - ZEP_MEMORY_STORE_CONNECTION_STRING=postgresql://postgres:ChangeThisPassword123!@${VPS1_IP}:5432/zep_memory?sslmode=disable
      - ZEP_GRAPHITI_ENABLED=true
      - ZEP_GRAPHITI_LLM_MODEL=claude-3-5-sonnet-20241022
      - ZEP_GRAPHITI_LLM_API_KEY=${ANTHROPIC_API_KEY}
      - ZEP_SERVER_PORT=8000
      - ZEP_LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - trm-network

networks:
  trm-network:
    driver: bridge
```

**File:** `/opt/trm/zep/.env`

```bash
VPS1_IP=<your-vps1-ip>
ANTHROPIC_API_KEY=<your-anthropic-key>
POSTGRES_PASSWORD=ChangeThisPassword123!
```

---

### **2. LobeChat**

**File:** `/opt/trm/lobechat/docker-compose.yml`

```yaml
version: '3.8'

services:
  lobechat:
    image: lobehub/lobe-chat:latest
    container_name: lobechat
    restart: unless-stopped
    ports:
      - "3210:3210"
    environment:
      # Database
      - DATABASE_URL=postgresql://postgres:ChangeThisPassword123!@${VPS1_IP}:5432/lobechat?sslmode=disable
      
      # API Keys
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - XAI_API_KEY=${XAI_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      
      # Features
      - NEXT_PUBLIC_MCP_ENABLED=true
      - NEXT_PUBLIC_ARTIFACTS_ENABLED=true
      - NEXT_PUBLIC_THINKING_ENABLED=true
      
      # Server
      - PORT=3210
      - HOSTNAME=0.0.0.0
    volumes:
      - ./data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3210/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - trm-network

networks:
  trm-network:
    external: true
```

**File:** `/opt/trm/lobechat/.env`

```bash
VPS1_IP=<your-vps1-ip>
OPENAI_API_KEY=<your-openai-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
XAI_API_KEY=<your-xai-key>
GOOGLE_API_KEY=<your-google-key>
```

---

### **3. n8n**

**File:** `/opt/trm/n8n/docker-compose.yml`

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      # Auth
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=ChangeThisPassword123!
      
      # Server
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://${VPS2_IP}:5678/
      
      # Database
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=${VPS1_IP}
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=ChangeThisPassword123!
      
      # Execution
      - EXECUTIONS_MODE=regular
      - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
      - EXECUTIONS_DATA_SAVE_ON_ERROR=all
      
      # Timezone
      - GENERIC_TIMEZONE=Asia/Ho_Chi_Minh
    volumes:
      - ./data:/home/node/.n8n
      - ./workflows:/home/node/.n8n/workflows
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - trm-network

networks:
  trm-network:
    external: true
```

**File:** `/opt/trm/n8n/.env`

```bash
VPS1_IP=<your-vps1-ip>
VPS2_IP=<your-vps2-ip>
N8N_HOST=<your-domain-or-ip>
```

---

### **4. LangGraph Orchestrator**

**File:** `/opt/trm/langgraph/docker-compose.yml`

```yaml
version: '3.8'

services:
  langgraph:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: langgraph
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      # API Keys
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - XAI_API_KEY=${XAI_API_KEY}
      
      # VPS IPs
      - VPS1_IP=${VPS1_IP}
      - VPS2_IP=${VPS2_IP}
      
      # Database Passwords
      - NEO4J_PASSWORD=${NEO4J_PASSWORD}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      
      # MCP Aggregator
      - MCP_AGGREGATOR_URL=http://localhost:9000
      
      # Zep Memory
      - ZEP_API_URL=http://localhost:8000
    volumes:
      - ./agent.py:/app/agent.py
      - ./tools:/app/tools
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - trm-network

networks:
  trm-network:
    external: true
```

**File:** `/opt/trm/langgraph/Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run application
CMD ["python", "-m", "uvicorn", "agent:app", "--host", "0.0.0.0", "--port", "8080"]
```

**File:** `/opt/trm/langgraph/requirements.txt`

```
# LangChain & LangGraph
langgraph>=0.2.28
langchain>=0.3.0
langchain-anthropic>=0.3.0
langchain-openai>=0.2.0
langchain-core>=0.3.0

# FastAPI & Server
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
pydantic>=2.9.0

# Database Clients
neo4j>=5.15.0
psycopg2-binary>=2.9.9
redis>=5.0.0
qdrant-client>=1.7.0

# Utilities
python-dotenv>=1.0.0
requests>=2.32.0
aiohttp>=3.10.0
tenacity>=8.2.3

# Logging
loguru>=0.7.2
```

**File:** `/opt/trm/langgraph/.env`

```bash
VPS1_IP=<your-vps1-ip>
VPS2_IP=<your-vps2-ip>

# API Keys
ANTHROPIC_API_KEY=<your-anthropic-key>
OPENAI_API_KEY=<your-openai-key>
XAI_API_KEY=<your-xai-key>

# Database Passwords
NEO4J_PASSWORD=ChangeThisPassword123!
POSTGRES_PASSWORD=ChangeThisPassword123!
REDIS_PASSWORD=ChangeThisPassword123!
```

---

## 🔧 DEPLOYMENT SCRIPTS

### **1. VPS Setup Script**

**File:** `/opt/trm/scripts/setup-vps.sh`

```bash
#!/bin/bash
# Setup VPS from scratch

set -e

echo "🚀 Starting VPS setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential tools
echo "🛠️ Installing essential tools..."
sudo apt install -y \
    curl \
    wget \
    git \
    htop \
    ncdu \
    ufw \
    fail2ban \
    unzip \
    vim

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw --force enable

# Start fail2ban
echo "🛡️ Starting fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create directory structure
echo "📁 Creating directory structure..."
sudo mkdir -p /opt/trm
sudo chown -R $USER:$USER /opt/trm

echo "✅ VPS setup complete!"
echo "⚠️ Please logout and login again for docker group to take effect"
```

---

### **2. Database Deployment Script**

**File:** `/opt/trm/scripts/deploy-databases.sh`

```bash
#!/bin/bash
# Deploy all databases on VPS1

set -e

echo "🗄️ Deploying databases on VPS1..."

# Neo4j
echo "📊 Deploying Neo4j..."
cd /opt/trm/neo4j
docker compose up -d
echo "Waiting for Neo4j to start..."
sleep 30

# Qdrant
echo "🔍 Deploying Qdrant..."
cd /opt/trm/qdrant
docker compose up -d
sleep 10

# PostgreSQL
echo "🐘 Deploying PostgreSQL..."
cd /opt/trm/postgresql
docker compose up -d
sleep 15

# Redis
echo "⚡ Deploying Redis..."
cd /opt/trm/redis
docker compose up -d
sleep 5

# Verify all services
echo "✅ Verifying services..."
docker ps

echo "🎉 All databases deployed successfully!"
```

---

### **3. AI Layer Deployment Script**

**File:** `/opt/trm/scripts/deploy-ai-layer.sh`

```bash
#!/bin/bash
# Deploy AI orchestration layer on VPS2

set -e

echo "🤖 Deploying AI layer on VPS2..."

# Load environment variables
if [ -f /opt/trm/.env ]; then
    export $(cat /opt/trm/.env | xargs)
fi

# Zep Memory
echo "🧠 Deploying Zep Memory..."
cd /opt/trm/zep
docker compose up -d
sleep 10

# LobeChat
echo "💬 Deploying LobeChat..."
cd /opt/trm/lobechat
docker compose up -d
sleep 10

# n8n
echo "⚙️ Deploying n8n..."
cd /opt/trm/n8n
docker compose up -d
sleep 10

# LangGraph
echo "🕸️ Deploying LangGraph..."
cd /opt/trm/langgraph
docker compose build
docker compose up -d
sleep 15

# Verify
echo "✅ Verifying AI services..."
curl -f http://localhost:8000/healthz || echo "⚠️ Zep not ready yet"
curl -f http://localhost:3210/api/health || echo "⚠️ LobeChat not ready yet"
curl -f http://localhost:5678/ || echo "⚠️ n8n not ready yet"
curl -f http://localhost:8080/health || echo "⚠️ LangGraph not ready yet"

echo "🎉 AI layer deployed successfully!"
```

---

### **4. Backup Script**

**File:** `/opt/trm/scripts/backup.sh`

```bash
#!/bin/bash
# Backup all databases

set -e

BACKUP_DIR="/opt/trm/backups"
DATE=$(date +%Y%m%d_%H%M%S)
VPS1_IP="${VPS1_IP:-localhost}"

mkdir -p "$BACKUP_DIR"

echo "💾 Starting backup process..."

# Backup Neo4j Internal
echo "📊 Backing up Neo4j Internal..."
docker exec neo4j-internal neo4j-admin database dump neo4j \
    --to-path=/backups --overwrite-destination=true
docker cp neo4j-internal:/backups/neo4j.dump \
    "$BACKUP_DIR/neo4j-internal-$DATE.dump"

# Backup Neo4j SuperApp
echo "📊 Backing up Neo4j SuperApp..."
docker exec neo4j-superapp neo4j-admin database dump neo4j \
    --to-path=/backups --overwrite-destination=true
docker cp neo4j-superapp:/backups/neo4j.dump \
    "$BACKUP_DIR/neo4j-superapp-$DATE.dump"

# Backup PostgreSQL
echo "🐘 Backing up PostgreSQL..."
docker exec postgres pg_dumpall -U postgres > "$BACKUP_DIR/postgres-$DATE.sql"

# Backup Redis
echo "⚡ Backing up Redis..."
docker exec redis redis-cli -a "$REDIS_PASSWORD" --rdb /data/dump.rdb SAVE
docker cp redis:/data/dump.rdb "$BACKUP_DIR/redis-$DATE.rdb"

# Compress backups
echo "🗜️ Compressing backups..."
cd "$BACKUP_DIR"
tar -czf "backup-$DATE.tar.gz" *-$DATE.*
rm -f *-$DATE.dump *-$DATE.sql *-$DATE.rdb

# Upload to Backblaze B2 (optional)
if command -v rclone &> /dev/null; then
    echo "☁️ Uploading to Backblaze B2..."
    rclone copy "backup-$DATE.tar.gz" b2:trm-backups/
fi

# Keep only last 30 days
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +30 -delete

echo "✅ Backup complete: backup-$DATE.tar.gz"
```

---

### **5. Health Check Script**

**File:** `/opt/trm/scripts/health-check.sh`

```bash
#!/bin/bash
# Check health of all services

echo "🏥 Running health check..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check function
check_service() {
    local name=$1
    local url=$2
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name is healthy"
        return 0
    else
        echo -e "${RED}✗${NC} $name is DOWN"
        return 1
    fi
}

# VPS1 Services
echo -e "\n📍 VPS1 Services:"
check_service "Neo4j Internal" "http://localhost:7474"
check_service "Neo4j SuperApp" "http://localhost:7475"
check_service "Qdrant" "http://localhost:6333"
check_service "PostgreSQL" "localhost:5432" # Special check
check_service "Redis" "localhost:6379" # Special check

# VPS2 Services
echo -e "\n📍 VPS2 Services:"
check_service "Zep Memory" "http://localhost:8000/healthz"
check_service "LobeChat" "http://localhost:3210"
check_service "n8n" "http://localhost:5678"
check_service "LangGraph" "http://localhost:8080/health"

# Docker stats
echo -e "\n📊 Docker Container Stats:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Disk usage
echo -e "\n💾 Disk Usage:"
df -h / | tail -1

# Memory usage
echo -e "\n🧠 Memory Usage:"
free -h | grep Mem

echo -e "\n✅ Health check complete!"
```

Make all scripts executable:
```bash
chmod +x /opt/trm/scripts/*.sh
```

---

## 🔐 ENVIRONMENT TEMPLATE

**File:** `/opt/trm/.env.template`

```bash
# Copy this to .env and fill in your values
# cp .env.template .env

# VPS IPs
VPS1_IP=YOUR_VPS1_IP
VPS2_IP=YOUR_VPS2_IP

# Database Passwords (CHANGE THESE!)
NEO4J_PASSWORD=ChangeThisPassword123!
POSTGRES_PASSWORD=ChangeThisPassword123!
REDIS_PASSWORD=ChangeThisPassword123!

# API Keys
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
XAI_API_KEY=xai-xxxxx
GOOGLE_API_KEY=xxxxx

# External MCPs
APIFY_API_KEY=apify_api_xxxxx
TWELVELABS_API_KEY=tlk_xxxxx
PERPLEXITY_API_KEY=pplx-xxxxx
REPLICATE_API_TOKEN=r8_xxxxx

# Cloudflare R2
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=trm-media

# Notion
NOTION_API_KEY=secret_xxxxx

# Telegram (for alerts)
TELEGRAM_BOT_TOKEN=xxxxx
TELEGRAM_CHAT_ID=xxxxx

# Optional
N8N_HOST=n8n.yourdomain.com
LOBECHAT_HOST=lobechat.yourdomain.com
```

---

## 📝 DEPLOYMENT CHECKLIST

```yaml
Pre-deployment:
  ☐ Fill in .env file with all credentials
  ☐ Review all docker-compose.yml files
  ☐ Update firewall rules (ufw)
  ☐ Test SSH key access

VPS1 Deployment:
  ☐ Run setup-vps.sh
  ☐ Copy all configs to /opt/trm/
  ☐ Run deploy-databases.sh
  ☐ Verify: docker ps (all containers running)
  ☐ Import Neo4j 19M triples

VPS2 Deployment:
  ☐ Run setup-vps.sh
  ☐ Copy all configs to /opt/trm/
  ☐ Run deploy-ai-layer.sh
  ☐ Verify: curl health endpoints

Post-deployment:
  ☐ Run health-check.sh
  ☐ Setup cron for backup.sh (daily 2am)
  ☐ Configure n8n workflows
  ☐ Test end-to-end workflow
  ☐ Monitor logs for 24 hours
```

---

**Document Version:** 1.0  
**Last Updated:** 11/10/2025  
**Total Files:** 20+ config files + 5 automation scripts

🚀 **Ready to deploy!**
