# 🔥 V10 AI TOOLS 2025 INTEGRATION PLAN

**Date:** Nov 7, 2025  
**Version:** V10.1 - AI Tools Enhancement  
**Status:** 🎯 Ready for Implementation  
**Owner:** TRM CEO

---

## 🎯 EXECUTIVE SUMMARY

Tích hợp 6 AI tools mới vào V10 infrastructure để:
- **Giảm 30-50% API costs** (TOON)
- **Production-grade document processing** (Markitdown, Docling)
- **GPU on-demand** với Modal (DeepSeek OCR)
- **Custom agent training** (Agent Lightning)
- **Next-gen reasoning** research (HRM)

**Expected ROI:** $500-800/month savings + enhanced capabilities

---

## 📊 TOOLS PRIORITIZATION

### **🏆 TIER 1: IMMEDIATE DEPLOYMENT (Week 1)**

#### **1. TOON - Token-Oriented Object Notation**

**Integration Point:** Tầng 3 (Agent Skills) + Tầng 4 (AI Core)

```yaml
Location: VPS3 Product AI + Agent AI
Purpose: Replace JSON in prompts → 30-50% token savings
Install: pip install toon

Integration:
  LangGraph Product:
    - System prompts: JSON → TOON
    - Agent communication: JSON → TOON
    - Log streaming: JSON → TOON
    - Tool responses: JSON → TOON
  
  LangGraph Agent:
    - Agent coordination: JSON → TOON
    - Monitoring data: JSON → TOON
    - Alerta payloads: JSON → TOON

Expected Savings:
  - Current token usage: ~10M tokens/month
  - TOON savings: 30% = 3M tokens saved
  - Cost reduction: $200-500/month
```

**Implementation Steps:**
1. Install toon library on VPS3
2. Create TOON encoder/decoder wrappers
3. Update LangGraph prompt templates
4. Test with sample workflows
5. Monitor token usage reduction
6. Roll out to all agents

---

#### **2. Markitdown - Document to Markdown Converter**

**Integration Point:** Tầng 2 (MCP Ecosystem)

```yaml
Location: VPS2 Ops AI (2GB) OR VPS3 (if compute allows)
Purpose: Convert docs → clean Markdown for RAG
Install: pip install 'markitdown[all]'

New MCP: markitdown-mcp
  Capabilities:
    - PDF → Markdown
    - Word/PowerPoint → Markdown
    - Excel → Markdown tables
    - Images → OCR text
    - Audio → Transcribed text
    - HTML → Clean markdown
    - ZIP → Process contents

Integration:
  Product AI Skills:
    - trm-research-report: Ingest source docs
    - trm-content-generation: Convert references
    - trm-data-analysis: Parse Excel/CSV
  
  Agent AI:
    - Documentation Agent: Auto-convert system docs
    - Compliance Agent: Parse legal documents

RAG Pipeline:
  1. User uploads document
  2. Markitdown converts → clean MD
  3. Chunk + embed → Qdrant
  4. Available for AI retrieval
```

**Implementation Steps:**
1. Install markitdown on VPS2/VPS3
2. Create MCP wrapper server
3. Add to LangGraph MCP config
4. Create skill: "trm-doc-processing"
5. Test with various doc formats
6. Integrate with Qdrant pipeline

---

#### **3. Docling - Advanced PDF Understanding**

**Integration Point:** Tầng 2 (MCP Ecosystem) + Skills

```yaml
Location: VPS2 Ops AI (has capacity for CPU tasks)
Purpose: Production-grade PDF parsing (0% hallucination)
Install: pip install docling

New MCP: docling-mcp
  Advantages over Markitdown:
    - Better layout understanding
    - Table structure preservation
    - Formula extraction
    - Image classification
    - Reading order detection
  
  Use Cases:
    - Technical documentation
    - Research papers
    - Contracts & legal docs
    - Financial reports

Integration Strategy:
  Two-tier approach:
    1. Markitdown: Quick, general docs
    2. Docling: Complex PDFs requiring accuracy
  
  Decision logic:
    if (pdf_has_tables OR pdf_has_formulas):
      use docling-mcp
    else:
      use markitdown-mcp

Skills Integration:
  - trm-technical-analysis: Use docling for papers
  - trm-compliance-check: Use docling for contracts
  - trm-financial-report: Use docling for statements
```

**Implementation Steps:**
1. Install docling on VPS2
2. Create MCP server
3. Add routing logic in LangGraph
4. Create skill: "trm-pdf-analysis"
5. Test with complex PDFs
6. Benchmark vs Markitdown

---

### **⚡ TIER 2: MODAL INTEGRATION (Week 2-3)**

#### **4. DeepSeek OCR - Vision Token Compression**

**Integration Point:** Modal Functions + Tầng 2 (External MCP)

```yaml
Deployment: Modal serverless (GPU on-demand)
GPU: T4 ($0.50/hr) or A10G ($1.10/hr)
Purpose: 10x token savings for image-heavy tasks

Modal Function:
  @app.function(
    gpu="T4",
    image=modal.Image.debian_slim()
      .pip_install("deepseek-ocr", "vllm"),
    timeout=300
  )
  def ocr_compress(image_bytes):
    # DeepSeek OCR compression
    return compressed_tokens

Architecture:
  VPS3 Product AI → HTTP → Modal DeepSeek OCR
  ↓
  Compressed result (10x fewer tokens)
  ↓
  Feed to Claude/Grok for processing

Use Cases:
  - Screenshot analysis (10K tokens → 1K tokens)
  - Document scans (expensive OCR → compressed)
  - Image-heavy reports
  - UI/UX analysis from screenshots

Cost Analysis:
  Without DeepSeek OCR:
    100 images/day × 10K tokens = 1M tokens/day
    Cost: ~$30/day = $900/month
  
  With DeepSeek OCR:
    Modal GPU: 5 min/day = $0.04/day = $1.20/month
    Tokens: 100K/day = $3/day = $90/month
    Total: ~$91.20/month
    Savings: $808.80/month (90% reduction!)
```

**Implementation Steps:**
1. Setup Modal account & CLI
2. Deploy deepseek_ocr.py function
3. Get Modal endpoint URL
4. Create external MCP wrapper
5. Add to Product AI MCP config
6. Test with sample images
7. Monitor cost savings

---

#### **5. Agent Lightning - RL Training Pipeline**

**Integration Point:** Modal Functions + Skills Development

```yaml
Deployment: Modal A100 GPU (training only)
Purpose: Train & optimize custom agents
Frequency: Weekly or on-demand

Modal Function:
  @app.function(
    gpu="A100",
    cpu=8,
    memory=32768,
    timeout=3600
  )
  def train_agent(config, training_data):
    from agentlightning import optimize
    # Train LangGraph agents with RL
    return optimized_agent

Training Pipeline:
  1. Collect agent interaction logs (VPS3)
  2. Prepare training dataset
  3. Trigger Modal training job
  4. Get optimized agent config
  5. Deploy to VPS3
  6. A/B test performance

Use Cases:
  - Optimize Documentation Agent prompts
  - Train Cost-Optimizer Agent behaviors
  - Fine-tune Security Agent responses
  - Improve Research Agent workflows

Cost Model:
  A100: $4/hour
  Training session: 2 hours/week
  Monthly cost: ~$32/month
  
  Value:
    - Better agent performance
    - Reduced API calls (optimized prompts)
    - Higher success rates
    - ROI: 3-6 months
```

**Implementation Steps:**
1. Deploy Modal account
2. Create agent_training.py
3. Implement logging pipeline on VPS3
4. Create training data format
5. Run first training experiment
6. Evaluate improvements
7. Setup weekly training schedule

---

### **📚 TIER 3: RESEARCH & WATCH (Future)**

#### **6. HRM - Hierarchical Reasoning Model**

**Status:** Research project, not production-ready

```yaml
What it is:
  - 27M param model beats GPT-4 on reasoning
  - Novel hierarchical recurrent architecture
  - Trained without CoT data
  
Why interesting:
  - Future of efficient reasoning
  - Could replace expensive models for specific tasks
  - Research direction for local models

Action Items:
  - Monitor development
  - Follow paper updates
  - Test when production-ready
  - Consider for local inference (VPS7 GPU tier)

Timeline: 6-12 months
```

---

## 🏗️ V10.1 UPDATED ARCHITECTURE

### **Enhanced 4-Layer Stack:**

```
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 4: AI CORE (Enhanced with TOON)                      │
│  ─────────────────────────────────────────────────────────  │
│  • Claude Sonnet 4 (primary) - TOON prompts ⭐             │
│  • Grok 3 (Agent AI) - TOON coordination ⭐                │
│  • DeepSeek OCR (Modal) - Vision compression ⭐            │
│  • Agent Lightning (Modal) - Training pipeline ⭐          │
│                                                              │
│  Cost Optimization:                                          │
│    - TOON: -30% tokens across all models                   │
│    - DeepSeek: -90% on vision tasks                        │
│    - Modal: Pay per second (vs 24/7 GPU)                   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 3: AGENT SKILLS (New Skills Added) ⭐                │
│  ─────────────────────────────────────────────────────────  │
│  Existing 100+ skills PLUS:                                 │
│    • trm-doc-processing (Markitdown + Docling) ⭐          │
│    • trm-pdf-analysis (Docling specialized) ⭐             │
│    • trm-vision-analysis (DeepSeek OCR) ⭐                 │
│    • trm-agent-optimization (Agent Lightning) ⭐           │
│                                                              │
│  Integration:                                                │
│    - Skills now use TOON for prompts                        │
│    - Reference new MCPs (markitdown, docling)              │
│    - Modal functions as external capabilities              │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 2: MCP ECOSYSTEM (Expanded) ⭐                       │
│  ─────────────────────────────────────────────────────────  │
│  Internal MCPs (VPS-hosted):                               │
│    • markitdown-mcp (VPS2/VPS3) ⭐ NEW                     │
│    • docling-mcp (VPS2) ⭐ NEW                             │
│    • [existing 50+ MCPs]                                   │
│                                                              │
│  External MCPs (API/Cloud):                                │
│    • modal-deepseek-ocr ⭐ NEW                             │
│    • modal-agent-training ⭐ NEW                           │
│    • [existing external MCPs]                              │
│                                                              │
│  Total: 50+ → 54+ MCPs                                     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│  TẦNG 1: VPS + MODAL HYBRID ⭐                             │
│  ─────────────────────────────────────────────────────────  │
│  VPS Tier (Always-On):                                      │
│    VPS1 (24GB): Control + Observability                    │
│    VPS2 (24GB): Databases + Docling + Markitdown ⭐        │
│    VPS3 (12GB): Product AI + Agent AI (TOON optimized) ⭐  │
│                                                              │
│  Modal Tier (On-Demand): ⭐ NEW                            │
│    - DeepSeek OCR (T4/A10G)                                │
│    - Agent Training (A100)                                 │
│    - Future: Heavy inference, video processing             │
│                                                              │
│  Cost Structure:                                            │
│    VPS: $38/month base (predictable)                       │
│    AI APIs: $100-150/month → $50-75/month (TOON) ⭐        │
│    Modal: $5-50/month (usage-based) ⭐                     │
│    Total: ~$100-165/month (vs $250+ before)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 IMPLEMENTATION TIMELINE

### **Week 1: Core Token Optimization**

**Day 1-2: TOON Integration**
- [ ] Install toon on VPS3
- [ ] Create encoding/decoding utilities
- [ ] Update LangGraph prompt templates
- [ ] Test with 10 sample tasks
- [ ] Monitor token reduction

**Day 3-4: Markitdown MCP**
- [ ] Install markitdown on VPS2
- [ ] Create MCP server wrapper
- [ ] Add to MCP config
- [ ] Test with doc samples
- [ ] Create doc-processing skill

**Day 5-7: Docling MCP**
- [ ] Install docling on VPS2
- [ ] Create MCP server
- [ ] Implement routing logic
- [ ] Test with complex PDFs
- [ ] Benchmark accuracy

**Milestone:** 30% token savings, doc processing operational

---

### **Week 2-3: Modal Integration**

**Day 8-10: Modal Setup + DeepSeek OCR**
- [ ] Setup Modal account
- [ ] Deploy deepseek_ocr function
- [ ] Create MCP wrapper
- [ ] Test with images
- [ ] Monitor GPU costs

**Day 11-14: Agent Lightning Pipeline**
- [ ] Deploy agent_training function
- [ ] Setup logging pipeline
- [ ] Collect training data
- [ ] Run first training job
- [ ] Evaluate improvements

**Milestone:** GPU on-demand working, agent training pipeline active

---

### **Week 4: Testing & Optimization**

- [ ] A/B test TOON vs JSON (measure savings)
- [ ] Benchmark Markitdown vs Docling
- [ ] Monitor Modal costs
- [ ] Optimize agent performance
- [ ] Document learnings

**Milestone:** V10.1 fully operational with cost metrics

---

## 💰 COST-BENEFIT ANALYSIS

### **Monthly Cost Changes:**

| Category | Before V10.1 | After V10.1 | Savings |
|----------|--------------|-------------|---------|
| **VPS Infrastructure** | $38 | $38 | $0 |
| **AI API Calls** | $150 | $75 | **-$75** |
| **GPU (if VPS-hosted)** | $0 (N/A) | $0 | $0 |
| **Modal (on-demand)** | $0 | $30 | +$30 |
| **Total** | **$188** | **$143** | **-$45/mo** |

### **Annual Savings:** $540/year

### **Additional Value (Unquantified):**
- Better document processing quality
- Vision task capabilities
- Agent training & optimization
- Scalability for future growth

---

## 🎯 SUCCESS METRICS

### **Week 1 Targets:**
- ✅ TOON deployed, 25-35% token reduction measured
- ✅ Markitdown processing 50+ docs/day
- ✅ Docling handling complex PDFs with >95% accuracy

### **Week 2-3 Targets:**
- ✅ DeepSeek OCR processing 20+ images/day
- ✅ First agent training completed
- ✅ Modal costs <$40/month

### **Month 1 Targets:**
- ✅ $50+ monthly savings from TOON
- ✅ 100% doc processing automation
- ✅ 1-2 agents optimized via RL
- ✅ Zero downtime during integration

---

## 🔗 INTEGRATION WITH EXISTING SYSTEMS

### **Updated Agent Responsibilities:**

```yaml
Documentation Agent:
  New capabilities:
    - Use markitdown-mcp for auto-doc conversion
    - Use docling-mcp for technical docs
    - TOON format for generated docs (smaller)

Research Agent:
  New capabilities:
    - Process PDFs with docling
    - Handle images with deepseek-ocr
    - Generate reports in TOON format

Cost-Optimizer Agent:
  New responsibilities:
    - Monitor Modal GPU usage
    - Recommend TOON vs JSON per task
    - Track token savings metrics
    - Alert on cost anomalies

Developer Agent:
  New capabilities:
    - Deploy Modal functions
    - Update MCP configurations
    - Test new tool integrations
```

---

## 🚧 RISKS & MITIGATION

### **Risk 1: TOON Adoption Learning Curve**
- **Impact:** Medium
- **Mitigation:** 
  - Keep JSON fallback for 2 weeks
  - Gradual rollout (10% → 50% → 100%)
  - Document TOON patterns in skills

### **Risk 2: Modal Cost Overruns**
- **Impact:** High
- **Mitigation:**
  - Set budget alerts ($50/month)
  - Monitor usage daily (first month)
  - Cache results aggressively
  - Rate limit GPU calls

### **Risk 3: New MCPs Reliability**
- **Impact:** Medium
- **Mitigation:**
  - Health checks every 5 minutes
  - Fallback to alternative tools
  - Alerta alerts on failures
  - Manual override available

---

## 📚 DOCUMENTATION UPDATES NEEDED

1. **Skills Library:**
   - Add 4 new skills (doc-processing, pdf-analysis, vision-analysis, agent-optimization)
   - Update existing skills to use TOON
   - Document Modal integration patterns

2. **MCP Registry:**
   - Add markitdown-mcp, docling-mcp docs
   - Document external Modal MCPs
   - Update routing logic guide

3. **Runbooks:**
   - TOON troubleshooting
   - Modal deployment procedure
   - Cost monitoring dashboard

4. **Architecture Diagrams:**
   - Update 4-layer stack
   - Add Modal tier
   - Show new data flows

---

## 🎊 CONCLUSION

V10.1 AI Tools Integration brings:

✅ **Cost Efficiency:** $540/year direct savings, more with scale  
✅ **Enhanced Capabilities:** Production doc processing, vision, training  
✅ **Future-Proof:** Modal enables GPU scaling without VPS commits  
✅ **Low Risk:** Gradual rollout, fallbacks, monitoring  

**Status:** Ready for Week 1 kickoff  
**Owner:** TRM CEO  
**Timeline:** 4 weeks to full deployment  
**Expected ROI:** 3-6 months

---

**Next Steps:**
1. Review & approve this plan
2. Kickoff Week 1 (TOON + Markitdown + Docling)
3. Update codia-tracker with tasks
4. Begin implementation

**Date:** Nov 7, 2025  
**Sign-off:** _________________
