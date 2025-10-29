# ⚙️ CI/CD & GitHub Setup

Configurazione CI/CD e GitHub per il progetto App-Rise.

## 📄 Documenti

### [github-actions.md](./github-actions.md)
**GitHub Actions Setup**
- Workflow configurati
- Jobs e steps
- Secrets e variabili
- Trigger conditions
- Matrix testing

### [branch-protection.md](./branch-protection.md)
**Branch Protection Rules**
- Regole per main e feature branches
- Required reviews
- Status checks
- Merge strategies
- Force push policies

### [ruleset-setup.md](./ruleset-setup.md)
**GitHub Ruleset Configuration**
- Rulesets configurati
- Bypass permissions
- Branch naming conventions
- Tag protection
- Workflow permissions

---

## 🔄 CI/CD Pipeline

```
Push → Lint → Test → Build → Deploy
  ↓      ↓      ↓      ↓       ↓
 ✅    ✅    ✅    ✅     ✅
```

**Automated Checks**:
- ✅ ESLint
- ✅ TypeScript
- ✅ Tests (661 passing)
- ✅ Bundle size
- ✅ Visual regression

---

[← Torna alla Documentazione](../README.md)
