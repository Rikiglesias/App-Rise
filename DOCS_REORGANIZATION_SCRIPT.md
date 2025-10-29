# 📁 DOCS REORGANIZATION - Manual Script

**Nota**: A causa del git lock file, esegui questi comandi manualmente dopo aver chiuso l'IDE.

## 🔧 Step 1: Creare Cartelle

```bash
mkdir docs\architecture
mkdir docs\guides
mkdir docs\ci-cd
mkdir docs\testing
mkdir docs\reports
mkdir docs\standards
mkdir docs\planning
```

## 📦 Step 2: Spostare File

### Architecture
```bash
git mv docs/ARCHITECTURE.md docs/architecture/overview.md
git mv docs/SRC_ARCHITECTURE_ANALYSIS.md docs/architecture/src-analysis.md
git mv docs/ARCHITECTURE_AUDIT.md docs/architecture/audit-report.md
git mv docs/ARCHITECTURE_CLEANUP_SUMMARY.md docs/architecture/cleanup-summary.md
```

### Guides
```bash
git mv docs/DEVELOPMENT_GUIDE.md docs/guides/development.md
git mv docs/DEPLOYMENT_GUIDE.md docs/guides/deployment.md
git mv docs/QUALITY_STANDARDS.md docs/guides/quality-standards.md
```

### CI/CD
```bash
git mv docs/GITHUB_ACTIONS_SETUP.md docs/ci-cd/github-actions.md
git mv docs/BRANCH_PROTECTION_RULES.md docs/ci-cd/branch-protection.md
git mv docs/GITHUB_RULESET_SETUP.md docs/ci-cd/ruleset-setup.md
```

### Testing
```bash
git mv docs/COVERAGE_TEST_PLAN.md docs/testing/coverage-plan.md
git mv docs/TEST_COVERAGE_FINAL_REPORT.md docs/testing/coverage-report.md
```

### Reports
```bash
git mv docs/LEGACY_CODE_AUDIT.md docs/reports/legacy-code-audit.md
git mv docs/LEGACY_QUICK_FIX.md docs/reports/legacy-quick-fix.md
git mv docs/IMPROVEMENTS_SUMMARY.md docs/reports/improvements-summary.md
git mv docs/PATH_ALIASES_MIGRATION.md docs/reports/path-aliases-migration.md
git mv docs/PERFECT_SYSTEM_FINAL_STATUS.md docs/reports/perfect-system-status.md
git mv docs/PERFECT_SYSTEM_MIGRATION.md docs/reports/perfect-system-migration.md
```

### Standards
```bash
git mv docs/FILE_SIZE_STANDARDS.md docs/standards/file-size.md
git mv docs/SICUREZZA_E_PERFORMANCE.md docs/standards/security-performance.md
git mv docs/LEGAL_COMPLIANCE_SIMPLIFIED.md docs/standards/legal-compliance.md
```

### Planning
```bash
git mv docs/ROADMAP_PROSSIMI_TASK.md docs/planning/roadmap.md
```

## ✅ Step 3: Verifica

```bash
git status
```

## 📝 Step 4: Commit

```bash
git add -A
git commit -m "docs: reorganize documentation into categories with clear structure"
git push
```

---

**Oppure procedo io con la creazione dei file direttamente?**
