# 🎯 AGENT SKILLS GUIDE - Domain Expertise + 8 Autonomous AI Agents

**Version:** 10.0 ULTIMATE (Autonomous Operations Era)  
**Last Updated:** 04/11/2025  
**Features:** Agent Skills Library + 8 Autonomous AI Agents  
**Official Announcement:** [Anthropic Blog (Oct 16, 2025)](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

> **V10 Addition**: This guide now covers both Agent Skills (procedural knowledge) AND 8 Autonomous AI Agents (autonomous operations)

---

## 🚨 **BREAKING: AGENT SKILLS JUST LAUNCHED!**

Anthropic vừa release **Agent Skills** (Oct 16, 2025) - framework mới để package domain expertise cho Claude. Đây là missing piece giữa MCPs (tools) và prompts (instructions).

**Official Resources:**
- 📚 [Agent Skills Documentation](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- 🔧 [GitHub Skills Repository](https://github.com/anthropics/skills)
- 📖 [Engineering Blog Post](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- 🎓 [Cookbook Examples](https://github.com/anthropics/claude-cookbooks/tree/main/skills)
- 💼 [Notion Skills Example](https://www.notion.com/help/notion-mcp) (real-world implementation)

---

## 🎯 **WHAT ARE AGENT SKILLS?**

### **Definition (from Anthropic)**

> "Skills are organized folders of instructions, scripts, and resources that agents can discover and load dynamically to perform better at specific tasks."

**Think of it as:** Onboarding guide for a new hire, but for AI.

### **Skills vs MCPs vs Prompts**

```yaml
Prompts:
  Format: Text instructions in chat
  Scope: One-off tasks, conversation-level
  Lifespan: Single session
  Example: "Write a report about market trends"
  
Agent Skills: ⭐ NEW
  Format: Folder (SKILL.md + resources + scripts)
  Scope: Procedural knowledge, workflows, context
  Lifespan: Persistent, reusable, shareable
  Example: "HOW to write TRM-style research reports"
  
MCPs:
  Format: Running server (API protocol)
  Scope: Tools, data sources, external APIs
  Lifespan: Runtime services
  Example: "WHAT tools are available (Neo4j, Apify)"

Relationship:
  Skills tell Claude HOW to use MCPs
  MCPs provide WHAT tools are available
  Together: Powerful, specialized agent
```

---

## 🏗️ **SKILLS ARCHITECTURE**

### **Progressive Disclosure (3 Levels)**

```yaml
Level 1 - Metadata (Always Loaded):
  File: SKILL.md frontmatter
  Content: name, description, tags
  Size: ~50-200 characters
  Purpose: Help Claude decide when to trigger skill
  
Level 2 - Instructions (Loaded When Triggered):
  File: SKILL.md body
  Content: Workflows, guidelines, examples
  Size: ~1-5 KB
  Purpose: Core procedural knowledge
  
Level 3 - Resources (Loaded As Needed):
  Files: Additional .md, scripts, templates
  Content: Detailed reference, code, data
  Size: Unlimited (loaded on-demand)
  Purpose: Deep context only when required
```

**Example Structure:**

```
trm-research-report/
├── SKILL.md           # Level 1 + 2
├── sources.md         # Level 3: How to gather data
├── analysis.md        # Level 3: Analysis frameworks
├── structure.md       # Level 3: Report template
└── scripts/           # Level 3: Executable code
    ├── scrape.py
    └── analyze.py
```

---

## 📋 **SKILL ANATOMY**

### **SKILL.md Template**

```markdown
---
name: skill-name-kebab-case
description: Brief description of what this skill does (Claude uses this to decide when to trigger)
tags: [category, domain, feature]
version: 1.0.0
author: TRM AI Team
created: 2025-10-17
---

# Skill Name

## When to Use This Skill

Use this skill when:
- Condition 1 (specific trigger)
- Condition 2 (user request pattern)
- Condition 3 (task type)

## Process

### Step 1: [Action]
- Sub-step 1
- Sub-step 2
- See [reference.md] for details

### Step 2: [Action]
- Sub-step 1
- Use [mcp-name] for [purpose]
- See [guide.md] for examples

### Step 3: [Action]
- Final steps
- Quality checks

## MCPs Used

This skill uses:
- `neo4j-mcp`: Query knowledge graph
- `apify-mcp`: Web scraping
- `perplexity-mcp`: Latest news

## Output Format

[Template or guidelines]

## Examples

### Example 1: [Scenario]
Input: [User request]
Output: [Expected result]

### Example 2: [Scenario]
Input: [User request]
Output: [Expected result]

## Quality Checklist

Before completing:
- [ ] All data sources cited
- [ ] Format follows TRM guidelines
- [ ] Output verified with [tool/method]
```

---

## 🎨 **TRM CORE SKILLS (Priority)**

### **Week 1: Essential Skills**

#### **1. trm-research-report**

```yaml
Purpose: Generate comprehensive market research reports
MCPs Used: neo4j-mcp, perplexity-mcp, apify-mcp
Output: 5-10 page PDF report with exec summary
Priority: P0 (most important)

Workflow:
  1. Query Neo4j for existing knowledge
  2. Search latest news (Perplexity)
  3. Scrape competitor sites (Apify)
  4. Analyze data (scripts/analyze.py)
  5. Generate report (structure.md template)
  6. Quality check (citations, format)
```

#### **2. trm-content-generation**

```yaml
Purpose: Create marketing content (blogs, social, emails)
MCPs Used: neo4j-mcp (brand guidelines), notion-mcp
Output: Ready-to-publish content
Priority: P0

Content Types:
  - Blog posts (1000-2000 words)
  - Social media (Twitter, LinkedIn)
  - Email newsletters
  - Landing pages
```

#### **3. trm-data-analysis**

```yaml
Purpose: Analyze datasets and generate insights
MCPs Used: neo4j-mcp, postgres-mcp
Output: Charts + insights report
Priority: P1

Capabilities:
  - Statistical analysis (scripts/stats.py)
  - Data visualization (matplotlib)
  - Trend detection
  - Anomaly detection
```

#### **4. trm-superapp-development**

```yaml
Purpose: Guide SuperApp MVP development
MCPs Used: neo4j-mcp (data model), github-mcp
Output: Implementation plans, code structure
Priority: P1

Focus Areas:
  - Architecture decisions
  - Data model design
  - API specifications
  - Testing strategies
```

#### **5. trm-brand-guidelines**

```yaml
Purpose: Ensure consistent brand identity
MCPs Used: notion-mcp (brand assets)
Output: Brand-compliant deliverables
Priority: P1

Elements:
  - Visual identity (colors, fonts, logos)
  - Tone of voice
  - Messaging framework
  - Templates
```

---

## 🔧 **IMPLEMENTATION**

### **Phase 1: Infrastructure Setup (Day 1)**

**Create Skills Directory:**

```bash
# On VPS2
ssh trm@<VPS2_IP>

# Create skills structure
mkdir -p /opt/trm/skills
cd /opt/trm/skills

# Create first skill
mkdir -p trm-research-report
cd trm-research-report
nano SKILL.md
```

**Integrate with LangGraph:**

```python
# File: /opt/trm/langgraph/skills_loader.py

from pathlib import Path
import yaml
from typing import List, Dict

SKILLS_DIR = Path("/opt/trm/skills")

class SkillsManager:
    """Manage Agent Skills loading and discovery"""
    
    def __init__(self):
        self.skills_metadata = self._load_all_metadata()
    
    def _load_all_metadata(self) -> List[Dict]:
        """Load Level 1 metadata from all skills"""
        skills = []
        
        for skill_dir in SKILLS_DIR.iterdir():
            if not skill_dir.is_dir():
                continue
            
            skill_file = skill_dir / "SKILL.md"
            if not skill_file.exists():
                continue
            
            try:
                content = skill_file.read_text()
                
                # Parse YAML frontmatter
                if content.startswith("---"):
                    parts = content.split("---", 2)
                    if len(parts) >= 3:
                        frontmatter = yaml.safe_load(parts[1])
                        skills.append({
                            "name": frontmatter.get("name"),
                            "description": frontmatter.get("description"),
                            "tags": frontmatter.get("tags", []),
                            "path": str(skill_dir),
                            "skill_file": str(skill_file)
                        })
            except Exception as e:
                print(f"Error loading skill {skill_dir}: {e}")
        
        return skills
    
    def get_metadata_for_prompt(self) -> str:
        """Format metadata for system prompt (Level 1)"""
        if not self.skills_metadata:
            return "No skills installed."
        
        prompt = "## Available Skills\n\n"
        for skill in self.skills_metadata:
            prompt += f"### {skill['name']}\n"
            prompt += f"Description: {skill['description']}\n"
            if skill.get('tags'):
                prompt += f"Tags: {', '.join(skill['tags'])}\n"
            prompt += f"Load via: Read file at `{skill['skill_file']}`\n\n"
        
        return prompt
    
    def load_skill_full(self, skill_name: str) -> str:
        """Load Level 2 (full SKILL.md content)"""
        for skill in self.skills_metadata:
            if skill['name'] == skill_name:
                return Path(skill['skill_file']).read_text()
        
        return f"Skill '{skill_name}' not found."
```

**Update LangGraph Agent:**

```python
# File: /opt/trm/langgraph/agent.py

from skills_loader import SkillsManager

# Initialize Skills Manager
skills_mgr = SkillsManager()

# Add to system prompt
SYSTEM_PROMPT = f"""You are an AI cognitive orchestrator with access to:

{skills_mgr.get_metadata_for_prompt()}

## How to Use Skills

When a task matches a skill's description:
1. Load the skill by reading its SKILL.md file
2. Follow the workflow defined in the skill
3. Use the MCPs mentioned in the skill
4. If skill references other files, read them as needed

## Tools Available

- Neo4j databases (neo4j-mcp)
- PostgreSQL (postgres-mcp)
- Web scraping (apify-mcp)
- Web search (perplexity-mcp)
- Notion workspace (notion-mcp)
- Filesystem (filesystem-mcp)

Always check if a skill exists before starting a task.
Skills contain tested workflows and best practices.
"""

# Rest of agent code...
```

---

## 📝 **CREATING YOUR FIRST SKILL**

### **Example: TRM Research Report Skill**

**Step 1: Create Directory**

```bash
mkdir -p /opt/trm/skills/trm-research-report/{scripts,templates}
cd /opt/trm/skills/trm-research-report
```

**Step 2: Create SKILL.md**

```markdown
---
name: trm-research-report
description: Generate comprehensive market research reports following TRM's quality standards and format guidelines
tags: [research, analysis, reporting]
version: 1.0.0
author: TRM AI Team
created: 2025-10-17
---

# TRM Research Report Skill

## When to Use This Skill

Use this skill when user requests:
- Market research reports
- Industry analysis
- Competitive landscape studies
- Investment thesis documents
- Trend analysis reports

## Process

### 1. Define Scope
- Identify research question
- Define target market/industry
- Set timeline (historical data needed)
- Determine depth level (quick scan vs deep dive)

### 2. Data Gathering

**Sources (in order):**

1. **Internal Knowledge (Neo4j)**
   ```
   Use neo4j-mcp to query:
   - Existing research
   - Related companies
   - Market trends in database
   ```

2. **Latest News (Perplexity)**
   ```
   Use perplexity-mcp to search:
   - Recent news (last 30 days)
   - Expert opinions
   - Industry reports
   ```

3. **Competitor Analysis (Apify)**
   ```
   Use apify-mcp to scrape:
   - Competitor websites
   - Product pages
   - Pricing information
   ```

See [sources.md](sources.md) for detailed sourcing guidelines.

### 3. Data Analysis

Run analysis script:
```bash
python scripts/analyze.py --data gathered_data.json --output analysis.json
```

Framework:
- SWOT analysis
- Porter's Five Forces
- Trend identification
- Statistical significance testing

See [analysis.md](analysis.md) for frameworks.

### 4. Report Generation

Use template from [structure.md](structure.md):

**Required Sections:**
1. Executive Summary (1 page)
2. Market Overview (2-3 pages)
3. Competitive Landscape (2-3 pages)
4. Key Insights & Trends (1-2 pages)
5. Recommendations (1 page)
6. Appendix (data tables, charts)

### 5. Quality Check

Before delivering:
- [ ] All claims have citations
- [ ] Data sources documented with URLs
- [ ] Charts properly labeled with source
- [ ] TRM brand guidelines followed
- [ ] Confidence levels stated for predictions
- [ ] Executive summary standalone readable

## MCPs Used

- `neo4j-mcp`: Query internal knowledge graph
- `perplexity-mcp`: Latest news and trends
- `apify-mcp`: Competitor data scraping
- `filesystem-mcp`: Read/write report files

## Output Format

- Format: Markdown → PDF conversion
- Length: 5-10 pages (excluding appendix)
- Style: Professional, data-driven
- Citations: Footnotes or inline links
- Date: Include research completion date

## Examples

### Example 1: AI Market Research

**Input:**
> "Research the AI agent market: size, key players, trends"

**Process:**
1. Query Neo4j for existing AI companies
2. Perplexity search: "AI agent market size 2025"
3. Scrape top 10 AI agent companies
4. Analyze with scripts/analyze.py
5. Generate report using structure.md

**Output:**
- 8-page report
- Executive summary highlighting $50B market
- Top 5 players analyzed
- 3 key trends identified
- Investment recommendations

### Example 2: Competitor Analysis

**Input:**
> "Analyze top 5 competitors in our space"

**Process:**
1. Identify competitors from Neo4j
2. Scrape their websites (Apify)
3. Compare features, pricing, positioning
4. SWOT analysis for each
5. Generate comparison matrix

**Output:**
- 6-page competitive analysis
- Feature comparison table
- Pricing matrix
- Strategic recommendations

## Common Pitfalls

❌ **Don't:**
- Start writing without data gathering
- Cite sources without verification
- Make predictions without confidence levels
- Skip executive summary
- Use outdated data (>90 days old without note)

✅ **Do:**
- Cross-reference multiple sources
- State data collection date
- Provide evidence for all claims
- Use visualizations for complex data
- Include actionable recommendations

## Maintenance

Update this skill when:
- New data sources become available
- Report template changes
- Quality standards evolve
- New analysis frameworks adopted

Last updated: 2025-10-17
```

**Step 3: Create Supporting Files**

```bash
# sources.md - Data gathering guidelines
# analysis.md - Analysis frameworks
# structure.md - Report template
# scripts/analyze.py - Data analysis script
```

**Step 4: Test the Skill**

```python
# Test script
from skills_loader import SkillsManager

skills_mgr = SkillsManager()
print(skills_mgr.get_metadata_for_prompt())

# Should show trm-research-report in list
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

```yaml
Infrastructure:
  ☐ Create /opt/trm/skills directory
  ☐ Copy skills_loader.py to /opt/trm/langgraph/
  ☐ Update agent.py with Skills integration
  ☐ Restart LangGraph service
  ☐ Test skill loading

Week 1 Skills (Priority):
  ☐ trm-research-report (MUST HAVE)
  ☐ trm-content-generation (MUST HAVE)
  ☐ trm-data-analysis
  ☐ trm-superapp-development
  ☐ trm-brand-guidelines

Testing:
  ☐ Each skill triggers correctly
  ☐ MCPs are called as documented
  ☐ Output follows templates
  ☐ Quality checks pass
  ☐ Progressive disclosure works

Documentation:
  ☐ Update CLAUDE.md with Skills patterns
  ☐ Update README with Skills section
  ☐ Update 01-ARCHITECTURE with 4-tier model
  ☐ Add Skills to 02-IMPLEMENTATION-GUIDE
```

---

## 📚 **BEST PRACTICES**

### **From Anthropic**

1. **Start with evaluation**: Identify gaps in agent performance first
2. **Structure for scale**: Split large skills into multiple files
3. **Think from Claude's perspective**: Monitor how skills are actually used
4. **Iterate with Claude**: Ask Claude to capture successful approaches

### **TRM-Specific**

1. **Document assumptions**: State what Claude should/shouldn't assume
2. **Include examples**: Real scenarios with inputs/outputs
3. **Version skills**: Track changes, test before deploying
4. **Security first**: Audit skills before using in production

---

## 🔐 **SECURITY CONSIDERATIONS**

**From Anthropic Guidelines:**

> "Skills provide Claude with new capabilities through instructions and code. While this makes them powerful, it also means that malicious skills may introduce vulnerabilities."

### **Security Checklist**

```yaml
Before Installing a Skill:
  ☐ Review all SKILL.md content
  ☐ Check bundled scripts for malicious code
  ☐ Verify external dependencies
  ☐ Audit network requests
  ☐ Test in isolated environment first

TRM Skills (Trusted):
  ✅ Created in-house
  ✅ Version controlled (git)
  ✅ Code reviewed
  ✅ No external network calls without approval
  ✅ Sensitive data handled properly

Community Skills (Untrusted):
  ⚠️ Audit before use
  ⚠️ Run in sandbox first
  ⚠️ Check GitHub stars/forks
  ⚠️ Read all bundled code
```

---

## 🎓 **LEARNING RESOURCES**

### **Official Anthropic**

- [Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)
- [Creating Custom Skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
- [Skills Best Practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/authoring-best-practices)
- [Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills)

### **Community Examples**

- [Anthropic Skills Repo](https://github.com/anthropics/skills) - 15+ example skills
- [Notion Skills](https://www.notion.com/help/notion-mcp) - Real-world implementation
- [Claude Code Skills](https://docs.claude.com/en/docs/claude-code/skills) - Production skills

### **TRM Internal**

- Skills Library: `/opt/trm/skills/`
- Skills Documentation: This file
- Testing Guide: `05-TROUBLESHOOTING.md#skills`

---

## 💡 **FUTURE ROADMAP**

### **Month 1: Foundation**
```yaml
✅ Core 5 skills deployed
✅ LangGraph integration
✅ Testing framework
☐ Team training on skill creation
```

### **Month 2: Expansion**
```yaml
☐ 20+ skills library
☐ Skills marketplace (internal)
☐ AI-assisted skill creation
☐ Multi-tenant skill packages
```

### **Month 3: Advanced**
```yaml
☐ Claude self-creates skills
☐ Skills analytics dashboard
☐ A/B testing framework
☐ Skills as revenue stream ($50-500 each)
```

---

## ❓ **FAQ**

### **Q: Skills vs MCPs - Which should I build?**

A: Build both!
- MCP if you're adding a NEW TOOL or data source
- Skill if you're documenting HOW to use existing tools

### **Q: Can Claude create skills automatically?**

A: Yes! Ask Claude: "Create a skill for [task] and save to /opt/trm/skills/"

### **Q: How many skills can Claude handle?**

A: Unlimited! Only metadata loads initially (tiny), full skills load on-demand.

### **Q: Do skills work with other AI models?**

A: Format is model-agnostic, but optimized for Claude's context window handling.

### **Q: Can I sell TRM skills?**

A: Yes! Skills are portable, can be packaged and sold to other companies.

---

**Document Version:** 7.0 (Agent Skills Era)  
**Last Updated:** 17/10/2025  
**Status:** 🔥 ACTIVE - Start building skills today!

🚀 **Ready to create your first skill? See examples in `/opt/trm/skills/`**
