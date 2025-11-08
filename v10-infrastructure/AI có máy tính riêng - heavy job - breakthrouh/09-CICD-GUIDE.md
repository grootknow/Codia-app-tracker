# 🚀 CI/CD GUIDE - Gitea Actions + Trivy Security

**Version:** 10.0 ULTIMATE  
**Last Updated:** 04/11/2025  
**Status:** Production-Ready  
**Purpose:** Complete CI/CD pipeline with security scanning

---

## 🎯 OVERVIEW

V10 ULTIMATE includes **Complete CI/CD Pipeline** on VPS1 using Gitea Actions (self-hosted GitHub Actions alternative) + Trivy (security scanner).

**Benefits:**
- ✅ Auto-deploy on git push
- ✅ Security scan before deploy
- ✅ <5 min deployment time
- ✅ Self-hosted (no external CI/CD costs)
- ✅ Integrated with DevOps Agent

---

## 🏗️ ARCHITECTURE

```yaml
VPS1 (DevOps Stack):
  Gitea (1GB):
    - Port: 3001
    - Git repository hosting
    - Gitea Actions (CI/CD)
    - Webhook to Coolify
  
  Trivy (500MB):
    - Security scanner
    - Vulnerability detection
    - Container scanning
    - On-demand execution
  
  Coolify (2GB):
    - Receives deploy webhooks
    - Pulls from Gitea
    - Builds Docker images
    - Deploys to VPS2/VPS3
  
  DevOps Agent (190MB):
    - Monitors CI/CD pipeline
    - Auto-fix failed builds
    - Rollback on errors
    - Slack notifications
```

---

## 🚀 DEPLOYMENT

### **Step 1: Deploy Gitea**
```bash
cd /opt/trm/gitea
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  gitea:
    image: gitea/gitea:latest
    container_name: gitea
    restart: unless-stopped
    ports:
      - "3001:3000"
      - "2222:22"
    environment:
      - USER_UID=1000
      - USER_GID=1000
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=db:5432
      - GITEA__database__NAME=gitea
      - GITEA__database__USER=gitea
      - GITEA__database__PASSWD=gitea
      - GITEA__actions__ENABLED=true
    volumes:
      - gitea-data:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    depends_on:
      - db
    networks:
      - gitea

  db:
    image: postgres:15
    container_name: gitea-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=gitea
      - POSTGRES_PASSWORD=gitea
      - POSTGRES_DB=gitea
    volumes:
      - gitea-db:/var/lib/postgresql/data
    networks:
      - gitea

  runner:
    image: gitea/act_runner:latest
    container_name: gitea-runner
    restart: unless-stopped
    environment:
      - GITEA_INSTANCE_URL=http://gitea:3000
      - GITEA_RUNNER_REGISTRATION_TOKEN=YOUR_TOKEN_HERE
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/data
    depends_on:
      - gitea
    networks:
      - gitea

volumes:
  gitea-data:
  gitea-db:
  runner-data:

networks:
  gitea:
    driver: bridge
EOF

docker compose up -d
```

### **Step 2: Configure Gitea**
```bash
# Access Gitea
http://VPS1_IP:3001

# Initial setup:
1. Create admin account
2. Configure SSH (port 2222)
3. Enable Gitea Actions
4. Generate runner token
5. Update docker-compose.yml with token
6. Restart runner
```

### **Step 3: Deploy Trivy**
```bash
cd /opt/trm/trivy
cat > docker-compose.yml <<EOF
version: '3.8'
services:
  trivy:
    image: aquasec/trivy:latest
    container_name: trivy
    restart: unless-stopped
    volumes:
      - trivy-cache:/root/.cache/
    command: server --listen 0.0.0.0:8080
    ports:
      - "8081:8080"
    networks:
      - monitoring

volumes:
  trivy-cache:

networks:
  monitoring:
    driver: bridge
EOF

docker compose up -d
```

### **Step 4: Create CI/CD Workflow**
```yaml
# .gitea/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Run Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Check for HIGH/CRITICAL vulnerabilities
        run: |
          if grep -q "CRITICAL\|HIGH" trivy-results.sarif; then
            echo "Security vulnerabilities found!"
            exit 1
          fi
  
  build:
    needs: security-scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build -t app:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          docker tag app:${{ github.sha }} localhost:5000/app:latest
          docker push localhost:5000/app:latest
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify deployment
        run: |
          curl -X POST http://coolify:8000/api/deploy \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
            -d '{"project": "app", "tag": "latest"}'
      
      - name: Verify deployment
        run: |
          sleep 30
          curl -f http://app.trm.local/health || exit 1
      
      - name: Notify Slack
        if: always()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -d '{"text": "Deployment ${{ job.status }}"}'
```

---

## 🔒 SECURITY SCANNING

### **Trivy Scan Types**
```yaml
1. Filesystem Scan:
   - Scans code for vulnerabilities
   - Checks dependencies
   - Detects secrets
   
2. Container Image Scan:
   - Scans Docker images
   - Checks base images
   - Detects CVEs
   
3. Config Scan:
   - Scans IaC (Terraform, K8s)
   - Checks misconfigurations
   - Security best practices
```

### **Vulnerability Levels**
```yaml
CRITICAL: Block deployment
HIGH: Block deployment
MEDIUM: Warn but allow
LOW: Info only
```

### **Auto-fix with DevOps Agent**
```yaml
If vulnerability found:
  1. DevOps Agent notified
  2. Check if auto-fixable
  3. Create fix branch
  4. Submit PR
  5. Notify team
```

---

## 📊 MONITORING

### **CI/CD Metrics (Grafana)**
```yaml
Dashboards:
  - Build success rate
  - Build duration (p50, p95, p99)
  - Deploy frequency
  - Security scan results
  - Rollback rate

Alerts:
  - Build failed
  - Security vulnerability found
  - Deploy time > 10 min
  - Rollback triggered
```

### **Pipeline Logs (Loki)**
```bash
# View CI/CD logs
docker logs gitea-runner --tail 100

# Query in Grafana
{job="gitea-runner"} |= "error"
```

---

## 🔄 DEPLOYMENT WORKFLOW

### **Standard Deployment**
```yaml
1. Developer pushes to main branch
2. Gitea Actions triggered
3. Security scan (Trivy)
   - If CRITICAL/HIGH: Block
   - If MEDIUM/LOW: Continue
4. Build Docker image
5. Push to Zot Registry
6. Trigger Coolify deployment
7. Coolify pulls image
8. Deploy to VPS2/VPS3
9. Health check
10. Notify Slack
11. DevOps Agent monitors

Total time: <5 min
```

### **Rollback Workflow**
```yaml
If deployment fails:
  1. DevOps Agent detects failure
  2. Trigger rollback
  3. Coolify reverts to previous version
  4. Verify health
  5. Notify team
  6. Create incident in Neo4j Agent

Rollback time: <2 min
```

---

## 🛠️ ADVANCED FEATURES

### **Multi-Environment Deployment**
```yaml
Environments:
  - staging (auto-deploy from develop branch)
  - production (manual approval required)

Workflow:
  develop → staging (auto)
  staging → production (manual)
```

### **Blue-Green Deployment**
```yaml
Strategy:
  1. Deploy to green environment
  2. Run smoke tests
  3. Switch traffic to green
  4. Keep blue as backup
  5. After 1 hour, remove blue
```

### **Canary Deployment**
```yaml
Strategy:
  1. Deploy to 10% of instances
  2. Monitor metrics for 10 min
  3. If OK, deploy to 50%
  4. Monitor for 10 min
  5. If OK, deploy to 100%
```

---

## 🔧 TROUBLESHOOTING

### **Build Failed**
```bash
# Check runner logs
docker logs gitea-runner --tail 50

# Check Gitea Actions UI
http://VPS1_IP:3001/<repo>/actions

# Common fixes:
- Update dependencies
- Fix syntax errors
- Increase runner resources
```

### **Security Scan Failed**
```bash
# View Trivy results
cat trivy-results.sarif

# Fix vulnerabilities:
- Update dependencies
- Patch base images
- Remove unused packages

# Override if false positive:
# Add to .trivyignore
```

### **Deployment Failed**
```bash
# Check Coolify logs
docker logs coolify --tail 50

# Check application logs
docker logs <app-container> --tail 50

# Rollback manually:
curl -X POST http://coolify:8000/api/rollback \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📈 BEST PRACTICES

### **1. Security First**
```yaml
- Always run Trivy scan
- Block on CRITICAL/HIGH
- Update dependencies regularly
- Use minimal base images
- Scan on schedule (weekly)
```

### **2. Fast Feedback**
```yaml
- Keep builds < 5 min
- Parallel jobs when possible
- Cache dependencies
- Fail fast on errors
```

### **3. Reliable Deployments**
```yaml
- Always run health checks
- Keep rollback ready
- Monitor post-deploy
- Gradual rollout for critical changes
```

### **4. Observability**
```yaml
- Log all pipeline steps
- Track metrics in Grafana
- Alert on failures
- Post-mortem for incidents
```

---

## 📚 RESOURCES

- **Gitea Docs**: https://docs.gitea.io/
- **Gitea Actions**: https://docs.gitea.io/en-us/usage/actions/overview/
- **Trivy Docs**: https://aquasecurity.github.io/trivy/
- **Coolify Docs**: https://coolify.io/docs

---

**Status**: CI/CD pipeline deployed, <5 min deployments! 🚀
