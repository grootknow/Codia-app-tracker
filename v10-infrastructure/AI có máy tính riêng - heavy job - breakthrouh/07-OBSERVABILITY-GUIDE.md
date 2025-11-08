# 👁️ OBSERVABILITY GUIDE - Complete Monitoring Stack

**Version:** 10.0 ULTIMATE  
**Last Updated:** 04/11/2025  
**Status:** Production-Ready  
**Purpose:** Complete guide for Sentry, Loki, Tempo, Prometheus, Grafana, Alerta

---

## 🎯 OVERVIEW

V10 ULTIMATE includes **Complete Observability Stack** on VPS1 (24GB RAM). This provides full visibility into system health, performance, and issues.

**The Stack:**
1. **Grafana** - Dashboards and visualization
2. **Prometheus** - Metrics collection (3 VPS)
3. **Loki** - Log aggregation
4. **Promtail** - Log shipping (on all VPS)
5. **Sentry** - Error tracking and alerting
6. **Tempo** - Distributed tracing
7. **Alerta** - Alert hub and triage

**Total RAM:** 8GB on VPS1

---

## 📊 ARCHITECTURE

```yaml
VPS1 (Observability Stack):
  Grafana (1GB):
    - Port: 3000
    - Dashboards for all metrics
    - Connects to: Prometheus, Loki, Tempo
  
  Prometheus (2GB):
    - Port: 9090
    - Scrapes metrics from 3 VPS
    - Retention: 30 days
  
  Loki (2GB):
    - Port: 3100
    - Aggregates logs from 3 VPS
    - Retention: 14 days
  
  Promtail (200MB):
    - Runs on all 3 VPS
    - Ships logs to Loki
  
  Sentry (1GB):
    - Port: 9000
    - Error tracking
    - Integrates with Slack
  
  Tempo (1GB):
    - Port: 3200
    - Distributed tracing
    - Retention: 7 days
  
  Alerta (800MB):
    - Port: 8080
    - Alert aggregation
    - Auto-triage by Alert Agent
```

---

## 🚀 DEPLOYMENT

### **Step 1: Deploy Grafana**
```bash
cd /opt/trm/grafana
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=ChangeMe123!
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - monitoring

volumes:
  grafana-data:

networks:
  monitoring:
    driver: bridge
EOF

docker compose up -d
```

### **Step 2: Deploy Prometheus**
```bash
cd /opt/trm/prometheus
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - monitoring

volumes:
  prometheus-data:

networks:
  monitoring:
    driver: bridge
EOF

# Create config
cat > prometheus.yml <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # VPS1 targets
  - job_name: 'vps1-node'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'vps1-docker'
    static_configs:
      - targets: ['localhost:9323']
  
  # VPS2 targets (databases)
  - job_name: 'vps2-neo4j'
    static_configs:
      - targets: ['VPS2_IP:2004']
  
  - job_name: 'vps2-postgres'
    static_configs:
      - targets: ['VPS2_IP:9187']
  
  # VPS3 targets (AI)
  - job_name: 'vps3-langgraph'
    static_configs:
      - targets: ['VPS3_IP:8000']
EOF

docker compose up -d
```

### **Step 3: Deploy Loki**
```bash
cd /opt/trm/loki
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  loki:
    image: grafana/loki:latest
    container_name: loki
    restart: unless-stopped
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - loki-data:/loki
    networks:
      - monitoring

volumes:
  loki-data:

networks:
  monitoring:
    driver: bridge
EOF

docker compose up -d
```

### **Step 4: Deploy Promtail (on all VPS)**
```bash
# Run on VPS1, VPS2, VPS3
cd /opt/trm/promtail
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    restart: unless-stopped
    volumes:
      - ./promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yml
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
EOF

# Create config
cat > promtail-config.yml <<EOF
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://VPS1_IP:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*log
  
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        target_label: 'container'
EOF

docker compose up -d
```

### **Step 5: Deploy Sentry**
```bash
cd /opt/trm/sentry

# Use official Sentry self-hosted
git clone https://github.com/getsentry/self-hosted.git
cd self-hosted
./install.sh

# Follow prompts, set admin password
# Start Sentry
docker compose up -d
```

### **Step 6: Deploy Tempo**
```bash
cd /opt/trm/tempo
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  tempo:
    image: grafana/tempo:latest
    container_name: tempo
    restart: unless-stopped
    ports:
      - "3200:3200"
      - "4317:4317"  # OTLP gRPC
      - "4318:4318"  # OTLP HTTP
    command: [ "-config.file=/etc/tempo.yaml" ]
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
      - tempo-data:/tmp/tempo
    networks:
      - monitoring

volumes:
  tempo-data:

networks:
  monitoring:
    driver: bridge
EOF

# Create config
cat > tempo.yaml <<EOF
server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        grpc:
        http:

storage:
  trace:
    backend: local
    local:
      path: /tmp/tempo/traces
    wal:
      path: /tmp/tempo/wal
EOF

docker compose up -d
```

### **Step 7: Deploy Alerta**
```bash
cd /opt/trm/alerta
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  alerta:
    image: alerta/alerta-web:latest
    container_name: alerta
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://alerta:password@postgres:5432/alerta
      - AUTH_REQUIRED=True
      - ADMIN_USERS=admin@trm.ai
      - SECRET_KEY=ChangeThisSecretKey123!
    depends_on:
      - postgres
    networks:
      - monitoring
  
  postgres:
    image: postgres:15
    container_name: alerta-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=alerta
      - POSTGRES_USER=alerta
      - POSTGRES_PASSWORD=password
    volumes:
      - alerta-db:/var/lib/postgresql/data
    networks:
      - monitoring

volumes:
  alerta-db:

networks:
  monitoring:
    driver: bridge
EOF

docker compose up -d
```

---

## 📊 GRAFANA DASHBOARDS

### **Dashboard 1: System Overview**
```yaml
Panels:
  - CPU usage (all 3 VPS)
  - Memory usage (all 3 VPS)
  - Disk usage (all 3 VPS)
  - Network I/O
  - Container status

Alerts:
  - CPU > 80% for 5 min
  - Memory > 90% for 5 min
  - Disk > 85%
```

### **Dashboard 2: Database Health**
```yaml
Panels:
  - Neo4j query latency (p50, p95, p99)
  - Qdrant search latency
  - PostgreSQL connections
  - Redis hit rate
  - Database sizes

Alerts:
  - Query latency > 100ms (p95)
  - Connections > 80% max
  - Hit rate < 90%
```

### **Dashboard 3: AI Performance**
```yaml
Panels:
  - LangGraph task duration
  - AI model API latency
  - Token usage (Claude, Grok, Gemini)
  - Agent success rate
  - MCP call latency

Alerts:
  - Task duration > 30s
  - API latency > 5s
  - Success rate < 95%
```

### **Dashboard 4: Agent Operations**
```yaml
Panels:
  - Agent uptime (8 agents)
  - Task success rate per agent
  - Response time per agent
  - Error rate per agent
  - Resource usage per agent

Alerts:
  - Agent down > 5 min
  - Success rate < 90%
  - Response time > 30s
```

---

## 🚨 ALERTING

### **Alert Rules (Prometheus)**
```yaml
groups:
  - name: system
    rules:
      - alert: HighCPU
        expr: cpu_usage > 80
        for: 5m
        annotations:
          summary: "High CPU on {{ $labels.instance }}"
      
      - alert: HighMemory
        expr: memory_usage > 90
        for: 5m
        annotations:
          summary: "High memory on {{ $labels.instance }}"
      
      - alert: DiskFull
        expr: disk_usage > 85
        for: 1m
        annotations:
          summary: "Disk almost full on {{ $labels.instance }}"
```

### **Alert Routing (Alerta)**
```yaml
Routes:
  Critical:
    - Slack #alerts channel
    - Alert Agent (auto-fix)
    - Email to admin
  
  Warning:
    - Slack #monitoring channel
    - Alert Agent (investigate)
  
  Info:
    - Grafana only
```

---

## 📈 METRICS TO TRACK

### **System Metrics**
```yaml
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network I/O (MB/s)
- Container count
- Container restarts
```

### **Database Metrics**
```yaml
- Query latency (ms)
- Connections (count)
- Cache hit rate (%)
- Database size (GB)
- Replication lag (ms)
```

### **AI Metrics**
```yaml
- Task duration (s)
- API latency (ms)
- Token usage (count)
- Success rate (%)
- Error rate (%)
- Cost per task ($)
```

### **Agent Metrics**
```yaml
- Agent uptime (%)
- Task success rate (%)
- Response time (s)
- Auto-fix rate (%)
- Escalation rate (%)
```

---

## 🔧 TROUBLESHOOTING

### **Prometheus Not Scraping**
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check Prometheus logs
docker logs prometheus --tail 50

# Verify network connectivity
ping VPS2_IP
telnet VPS2_IP 2004
```

### **Loki Not Receiving Logs**
```bash
# Check Promtail status
docker logs promtail --tail 50

# Test Loki API
curl http://localhost:3100/ready

# Check Loki logs
docker logs loki --tail 50
```

### **Grafana Dashboard Not Loading**
```bash
# Check Grafana logs
docker logs grafana --tail 50

# Verify data sources
# Grafana UI → Configuration → Data Sources

# Test queries manually
# Grafana UI → Explore
```

---

## 📚 RESOURCES

- **Grafana Docs**: https://grafana.com/docs/
- **Prometheus Docs**: https://prometheus.io/docs/
- **Loki Docs**: https://grafana.com/docs/loki/
- **Sentry Docs**: https://docs.sentry.io/
- **Tempo Docs**: https://grafana.com/docs/tempo/
- **Alerta Docs**: https://docs.alerta.io/

---

**Status**: Full observability stack deployed! 👁️
