# 🎯 SKILL DOCUMENTATION FRAMEWORK

**Purpose:** Standardize documentation for 100+ V10 skills  
**Last Updated:** Nov 7, 2025  
**Location:** /opt/trm/skills/

---

## 📋 OVERVIEW

V10 system will have 100+ documented skills across:
- **CODE capabilities:** Development, testing, deployment, data processing
- **MEDIA capabilities:** Content creation, video editing, social posting
- **Operations:** Monitoring, alerting, backups, compliance

Each skill needs consistent documentation for:
- AI agents to execute
- Founders to understand
- System to auto-generate

---

## 📝 SKILL.MD TEMPLATE

**Location:** `/opt/trm/skills/SKILL-TEMPLATE.md`

```markdown
# {SKILL_NAME}

**ID:** {skill_id}  
**Category:** {CODE|MEDIA|OPERATIONS}  
**Complexity:** {1-5}  
**Agent:** {agent_name}  
**MCP Tools:** {tool1, tool2, ...}  
**Dependencies:** {skill_ids or services}  
**Last Updated:** {date}

---

## 🎯 PURPOSE

{1-2 sentences: What does this skill do? Why is it needed?}

---

## 📋 INPUTS

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| {param1} | string | ✅ Yes | - | {description} |
| {param2} | integer | ❌ No | 10 | {description} |

---

## 📤 OUTPUTS

| Output | Type | Description |
|--------|------|-------------|
| {output1} | string | {description} |
| {output2} | object | {description} |

---

## 🔧 IMPLEMENTATION

### API Endpoint
```
POST /api/v1/skills/{skill_id}/execute
```

### Example Request
```bash
curl -X POST https://api.xknow.site/v1/skills/{skill_id}/execute \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "param1": "value1",
    "param2": 20
  }'
```

### Example Response
```json
{
  "skill_id": "{skill_id}",
  "status": "success",
  "execution_time": "2.3s",
  "output1": "result",
  "output2": { "key": "value" }
}
```

---

## 🔄 WORKFLOW

```yaml
1. Validate inputs
2. Check dependencies available
3. Execute main logic
4. Verify outputs
5. Log execution
6. Return results
```

---

## 🚨 ERROR HANDLING

| Error Code | Cause | Fix |
|------------|-------|-----|
| ERR_001 | Missing parameter | Provide required param |
| ERR_002 | Dependency unavailable | Check service status |
| ERR_003 | Execution timeout | Increase timeout or optimize |

---

## ✅ VERIFICATION

**Command:**
```bash
{verification_command}
```

**Expected Output:**
```
{expected_result}
```

---

## 📊 METRICS

- **Success Rate:** {target}%
- **Avg Execution Time:** {target}s
- **Error Rate:** < {threshold}%

---

## 🔗 RELATED SKILLS

- [{skill_name}](#) - {brief description}
- [{skill_name}](#) - {brief description}

---

## 📚 EXAMPLES

### Example 1: {scenario}
```bash
{command}
```

### Example 2: {scenario}
```bash
{command}
```

---

**Status:** {draft|reviewed|production}  
**Version:** {semver}  
**Last Tested:** {date}
```

---

## 🗂️ SKILL CATEGORIES

### CODE Skills (40+)

**Development (10):**
1. `code-generate-function` - Generate function from spec
2. `code-refactor` - Refactor existing code
3. `code-review` - Review PR for issues
4. `code-test-generate` - Generate unit tests
5. `code-optimize` - Optimize performance
6. `code-document` - Generate docstrings
7. `code-lint` - Run linters and fix
8. `code-format` - Format code style
9. `code-migrate` - Migrate API versions
10. `code-dependency-update` - Update dependencies

**Testing (8):**
11. `test-unit-run` - Run unit tests
12. `test-integration-run` - Run integration tests
13. `test-e2e-run` - Run E2E tests
14. `test-coverage-report` - Generate coverage
15. `test-performance` - Performance benchmarks
16. `test-security-scan` - Security vulnerability scan
17. `test-load` - Load testing
18. `test-regression` - Regression test suite

**Deployment (10):**
19. `deploy-staging` - Deploy to staging
20. `deploy-production` - Deploy to production
21. `deploy-rollback` - Rollback deployment
22. `deploy-canary` - Canary deployment
23. `deploy-blue-green` - Blue-green deployment
24. `deploy-verify` - Verify deployment health
25. `deploy-database-migrate` - Run DB migrations
26. `deploy-config-update` - Update configs
27. `deploy-scale` - Scale services
28. `deploy-restart` - Restart services

**Data Processing (12):**
29. `data-extract-api` - Extract from APIs
30. `data-extract-scrape` - Web scraping
31. `data-transform-clean` - Clean data
32. `data-transform-normalize` - Normalize data
33. `data-load-postgres` - Load to PostgreSQL
34. `data-load-neo4j` - Load to Neo4j
35. `data-load-lancedb` - Load to LanceDB
36. `data-query-sql` - Execute SQL queries
37. `data-query-graph` - Execute Cypher queries
38. `data-query-vector` - Vector similarity search
39. `data-backup` - Backup databases
40. `data-restore` - Restore databases

---

### MEDIA Skills (35+)

**Content Writing (10):**
41. `media-blog-post` - Write blog post
42. `media-social-caption` - Generate social caption
43. `media-video-script` - Write video script
44. `media-email` - Write email copy
45. `media-ad-copy` - Generate ad copy
46. `media-seo-optimize` - SEO optimization
47. `media-translate` - Translate content
48. `media-summarize` - Summarize long content
49. `media-proofread` - Proofread and edit
50. `media-headline` - Generate headlines

**Visual Creation (12):**
51. `media-image-generate` - Generate image (SD)
52. `media-image-edit` - Edit image
53. `media-image-upscale` - Upscale image
54. `media-image-remove-bg` - Remove background
55. `media-thumbnail-create` - Create thumbnail
56. `media-logo-design` - Design logo
57. `media-banner-create` - Create banner
58. `media-infographic` - Create infographic
59. `media-meme-create` - Create meme
60. `media-diagram` - Generate diagram
61. `media-chart` - Create chart
62. `media-mockup` - Design mockup

**Video Production (13):**
63. `media-video-edit` - Edit video (FFmpeg)
64. `media-video-trim` - Trim video
65. `media-video-merge` - Merge videos
66. `media-video-subtitle` - Generate subtitles
67. `media-video-transcribe` - Transcribe audio
68. `media-video-translate-sub` - Translate subtitles
69. `media-video-compress` - Compress video
70. `media-video-thumbnail` - Extract thumbnail
71. `media-audio-extract` - Extract audio
72. `media-audio-enhance` - Enhance audio quality
73. `media-shorts-generate` - Generate shorts
74. `media-b-roll-find` - Find B-roll footage
75. `media-music-add` - Add background music

---

### OPERATIONS Skills (30+)

**Monitoring (8):**
76. `ops-health-check` - System health check
77. `ops-metrics-collect` - Collect metrics
78. `ops-logs-query` - Query logs
79. `ops-alert-check` - Check alerts
80. `ops-dashboard-update` - Update dashboards
81. `ops-performance-analyze` - Analyze performance
82. `ops-anomaly-detect` - Detect anomalies
83. `ops-capacity-plan` - Capacity planning

**Alerting (6):**
84. `ops-alert-send` - Send alert
85. `ops-alert-escalate` - Escalate alert
86. `ops-alert-acknowledge` - Acknowledge alert
87. `ops-alert-resolve` - Resolve alert
88. `ops-incident-create` - Create incident
89. `ops-incident-postmortem` - Write postmortem

**Backup & Recovery (6):**
90. `ops-backup-create` - Create backup
91. `ops-backup-verify` - Verify backup
92. `ops-backup-restore` - Restore from backup
93. `ops-backup-cleanup` - Clean old backups
94. `ops-disaster-recovery` - DR procedure
95. `ops-config-backup` - Backup configs

**Compliance (10):**
96. `ops-audit-log` - Audit logging
97. `ops-security-scan` - Security scan
98. `ops-vulnerability-check` - Check vulnerabilities
99. `ops-permission-audit` - Audit permissions
100. `ops-compliance-report` - Generate compliance report
101. `ops-gdpr-export` - Export user data (GDPR)
102. `ops-gdpr-delete` - Delete user data (GDPR)
103. `ops-access-review` - Review access logs
104. `ops-cert-renew` - Renew SSL certificates
105. `ops-policy-check` - Check policy compliance

---

## 📁 FOLDER STRUCTURE

```
/opt/trm/skills/
├── SKILL-TEMPLATE.md              # Template for new skills
├── README.md                       # Overview of all skills
├── code/
│   ├── development/
│   │   ├── code-generate-function.md
│   │   ├── code-refactor.md
│   │   └── ...
│   ├── testing/
│   │   ├── test-unit-run.md
│   │   └── ...
│   ├── deployment/
│   │   ├── deploy-staging.md
│   │   └── ...
│   └── data/
│       ├── data-extract-api.md
│       └── ...
├── media/
│   ├── content/
│   │   ├── media-blog-post.md
│   │   └── ...
│   ├── visual/
│   │   ├── media-image-generate.md
│   │   └── ...
│   └── video/
│       ├── media-video-edit.md
│       └── ...
└── operations/
    ├── monitoring/
    │   ├── ops-health-check.md
    │   └── ...
    ├── alerting/
    │   ├── ops-alert-send.md
    │   └── ...
    ├── backup/
    │   ├── ops-backup-create.md
    │   └── ...
    └── compliance/
        ├── ops-audit-log.md
        └── ...
```

---

## 🤖 AUTO-GENERATION

### Generate Skill List
```bash
#!/bin/bash
# /opt/trm/scripts/generate-skill-list.sh

echo "# V10 Skills Catalog" > /opt/trm/skills/README.md
echo "" >> /opt/trm/skills/README.md
echo "**Total Skills:** $(find /opt/trm/skills -name '*.md' ! -name 'README.md' ! -name 'SKILL-TEMPLATE.md' | wc -l)" >> /opt/trm/skills/README.md
echo "" >> /opt/trm/skills/README.md

for category in code media operations; do
  echo "## ${category^^}" >> /opt/trm/skills/README.md
  find /opt/trm/skills/$category -name '*.md' | while read skill; do
    name=$(basename "$skill" .md)
    purpose=$(grep "^## 🎯 PURPOSE" -A 1 "$skill" | tail -1)
    echo "- [$name]($skill) - $purpose" >> /opt/trm/skills/README.md
  done
  echo "" >> /opt/trm/skills/README.md
done

echo "✅ Skill catalog generated"
```

### Generate API Routes
```bash
#!/bin/bash
# /opt/trm/scripts/generate-skill-routes.sh

# Auto-generate Express routes from skill docs
find /opt/trm/skills -name '*.md' ! -name 'README.md' ! -name 'SKILL-TEMPLATE.md' | while read skill; do
  skill_id=$(basename "$skill" .md)
  
  cat >> /opt/trm/api/routes/skills.js << EOF
router.post('/skills/${skill_id}/execute', async (req, res) => {
  try {
    const result = await executeSkill('${skill_id}', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

EOF
done

echo "✅ API routes generated"
```

---

## 📊 SKILL DATABASE SCHEMA

```sql
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  skill_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  complexity INTEGER CHECK (complexity BETWEEN 1 AND 5),
  agent_name VARCHAR(100),
  mcp_tools TEXT[],
  dependencies TEXT[],
  status VARCHAR(20) DEFAULT 'draft',
  version VARCHAR(20) DEFAULT '1.0.0',
  last_tested TIMESTAMP,
  success_rate DECIMAL(5,2),
  avg_execution_time DECIMAL(10,3),
  total_executions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_executions (
  id SERIAL PRIMARY KEY,
  skill_id VARCHAR(100) NOT NULL,
  agent_name VARCHAR(100),
  inputs JSONB,
  outputs JSONB,
  status VARCHAR(20) NOT NULL,
  execution_time DECIMAL(10,3),
  error_message TEXT,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_skill_executions_skill_id ON skill_executions(skill_id);
CREATE INDEX idx_skill_executions_executed_at ON skill_executions(executed_at);
```

---

## 🎯 SKILL DEVELOPMENT WORKFLOW

```yaml
1. Identify Need:
   - Agent needs capability
   - Founder requests feature
   - System gap identified

2. Create Skill Doc:
   - Copy SKILL-TEMPLATE.md
   - Fill in all sections
   - Define inputs/outputs
   - Add examples

3. Implement:
   - Write code
   - Add MCP tool integration
   - Implement error handling
   - Add logging

4. Test:
   - Unit tests
   - Integration tests
   - Real-world scenarios
   - Performance benchmarks

5. Document:
   - Update skill doc
   - Add troubleshooting
   - Record metrics
   - Update catalog

6. Deploy:
   - Merge to main
   - Update API routes
   - Notify agents
   - Monitor usage

7. Maintain:
   - Track success rate
   - Fix issues
   - Optimize performance
   - Version updates
```

---

## ✅ SKILL QUALITY CHECKLIST

**Documentation:**
- [ ] Purpose clearly stated
- [ ] All inputs documented
- [ ] All outputs documented
- [ ] Examples provided
- [ ] Error handling documented
- [ ] Verification command included

**Implementation:**
- [ ] Code follows standards
- [ ] Error handling implemented
- [ ] Logging added
- [ ] Metrics tracked
- [ ] Tests written
- [ ] MCP tools integrated

**Testing:**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing done
- [ ] Edge cases covered
- [ ] Performance acceptable
- [ ] Security reviewed

**Production:**
- [ ] Deployed successfully
- [ ] Monitored in dashboards
- [ ] Success rate > 95%
- [ ] Avg execution time acceptable
- [ ] No critical errors
- [ ] Documentation updated

---

## 🎯 SUCCESS METRICS

**Per Skill:**
- Success Rate: > 95%
- Avg Execution Time: < 10s (varies by skill)
- Error Rate: < 5%
- Usage: Tracked daily

**Overall:**
- Total Skills: 100+ documented
- Production Ready: 50+ active
- Agent Usage: 80%+ skills used monthly
- Documentation Coverage: 100%

---

**Status:** ✅ Framework defined, template created  
**Next:** Document first 10 skills  
**Cron:** Auto-generate catalog daily
