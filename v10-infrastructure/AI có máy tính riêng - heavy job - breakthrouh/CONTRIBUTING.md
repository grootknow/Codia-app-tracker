# 🤝 CONTRIBUTING TO TRM AI PRODUCTION SYSTEM

**Thank you for your interest in contributing!**

This is a **private production system** documentation, but we welcome improvements and suggestions.

---

## 📋 **HOW TO CONTRIBUTE**

### **1. Documentation Improvements**

If you find:
- Typos or grammatical errors
- Unclear explanations
- Missing information
- Outdated references

**Please:**
1. Fork the repository
2. Create a branch: `git checkout -b fix/documentation-improvement`
3. Make your changes
4. Submit a Pull Request with clear description

### **2. Code Examples**

We welcome:
- Better code examples
- Alternative implementations
- Bug fixes in example code
- Performance improvements

**Guidelines:**
- Follow existing code style
- Include comments
- Test before submitting
- Explain your changes

### **3. Agent Skills**

We're building a TRM Skills Library! You can contribute:
- New skill templates
- Improved workflows
- Better examples
- Bug fixes in skills

**Skill Contribution Guidelines:**
- Follow SKILL.md format (see 06-AGENT-SKILLS-GUIDE.md)
- Include clear examples
- Test with real tasks
- Document MCPs used

### **4. Architecture Suggestions**

For architectural changes:
1. Open an Issue first
2. Explain the problem
3. Propose solution with rationale
4. Wait for discussion before implementing

---

## ✅ **CONTRIBUTION CHECKLIST**

Before submitting:

```yaml
☐ Code follows project style
☐ Documentation is clear
☐ Examples are tested
☐ No sensitive data (API keys, passwords)
☐ Commit messages are descriptive
☐ PR description explains changes
☐ Related issues are referenced
```

---

## 🚫 **WHAT NOT TO CONTRIBUTE**

Please **DO NOT** submit:
- ❌ API keys or credentials
- ❌ Production data or backups
- ❌ Personal information
- ❌ Proprietary code from other projects
- ❌ Large binary files
- ❌ Unrelated features

---

## 📝 **COMMIT MESSAGE FORMAT**

Use clear, descriptive commit messages:

```
Good:
✅ "Add Redis caching example to CLAUDE.md"
✅ "Fix typo in 02-IMPLEMENTATION-GUIDE.md Day 5"
✅ "Update Agent Skills integration code"

Bad:
❌ "fix stuff"
❌ "update"
❌ "changes"
```

---

## 🔍 **CODE REVIEW PROCESS**

1. **Submit PR** with clear description
2. **Automated checks** run (if configured)
3. **Manual review** by maintainers
4. **Feedback** provided (if needed)
5. **Merge** when approved

Expected review time: 2-7 days

---

## 🎨 **STYLE GUIDE**

### **Documentation (Markdown)**
- Use clear headings (H2, H3)
- Include code examples in triple backticks
- Use bullet points for lists
- Keep paragraphs short
- Include emojis sparingly (only for section headers)

### **Code Examples**
```python
# Python: Follow PEP 8
def function_name(param: str) -> dict:
    """Clear docstring."""
    return {"result": "value"}
```

```yaml
# YAML: 2 spaces indentation
key:
  nested_key: value
  list:
    - item1
    - item2
```

---

## 💬 **QUESTIONS?**

- **Documentation questions**: Open an Issue
- **Implementation help**: Check 05-TROUBLESHOOTING.md first
- **Feature requests**: Open an Issue with detailed description
- **Bug reports**: Include steps to reproduce

---

## 📜 **LICENSE**

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 **ACKNOWLEDGMENTS**

We appreciate all contributors who help improve this documentation!

**Special Thanks:**
- Anthropic for Agent Skills framework
- LangGraph team for orchestration tools
- Neo4j community for graph database excellence
- All open-source projects we build upon

---

**Happy Contributing! 🚀**

_Last Updated: 17/10/2025_
