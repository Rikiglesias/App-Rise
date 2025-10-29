# 🛡️ Branch Protection Rules - Configurazione Raccomandazioni

## 📋 Configurazione Attuale

### Branch Protetti
- ✅ `master` - Protected
- ✅ `develop` - Protected  
- ✅ `release/1.0` - Protected

## 🎯 Regole Raccomandate per GitHub Settings

### **`master` (Production)**

#### Required Status Checks
```
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging

Status checks richiesti:
- Deadcode Scan
- 🔍 Quality Checks (typescript, eslint, prettier, tests)
- test (unit tests)
- 🎯 Visual Diff - Layout Regression Detection
- build (iOS + Android summary)
```

#### Pull Request Rules
```
✅ Require a pull request before merging
✅ Require approvals: 1
✅ Dismiss stale pull request approvals when new commits are pushed
✅ Require review from Code Owners (se configurato CODEOWNERS)
```

#### Additional Restrictions
```
✅ Require conversation resolution before merging
✅ Require signed commits (opzionale - aumenta sicurezza)
✅ Require linear history (opzionale - mantiene storia pulita)
✅ Do not allow bypassing the above settings
```

#### Force Push & Deletions
```
❌ Allow force pushes: Nobody
❌ Allow deletions: Disabled
```

---

### **`develop` (Integration)**

#### Required Status Checks
```
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging

Status checks richiesti:
- Deadcode Scan
- 🔍 Quality Checks
- test
- 🎯 Visual Diff (opzionale - solo per UI changes)
```

#### Pull Request Rules
```
✅ Require a pull request before merging
✅ Require approvals: 1 (può essere più permissivo di master)
✅ Dismiss stale approvals: Yes
```

#### Additional Restrictions
```
✅ Require conversation resolution
⚠️ Allow force push: Admins only (per rebase quando necessario)
❌ Allow deletions: Disabled
```

---

### **`release/*` (Release Candidates)**

#### Required Status Checks
```
✅ Require status checks to pass before merging
✅ Require branches to be up to date before merging

Status checks richiesti (TUTTI):
- Deadcode Scan
- 🔍 Quality Checks
- test
- 🎯 Visual Diff
- build
- 📊 Bundle Analysis
```

#### Pull Request Rules
```
✅ Require a pull request before merging
✅ Require approvals: 2 (più strict per release)
✅ Require review from Code Owners
✅ Dismiss stale approvals
```

#### Additional Restrictions
```
✅ Require conversation resolution
✅ Require signed commits (raccomandato per release)
✅ Require linear history
❌ Allow force pushes: Disabled
❌ Allow deletions: Disabled
```

---

## 📝 CODEOWNERS Configuration

Crea file `.github/CODEOWNERS`:

```
# Global owners
* @Rikiglesias

# CI/CD workflows
/.github/workflows/ @Rikiglesias

# Core app logic
/src/features/ @Rikiglesias

# Configuration files
*.config.* @Rikiglesias
package.json @Rikiglesias
tsconfig.json @Rikiglesias

# Security & sensitive files
/android/app/src/main/res/xml/network_security_config.xml @Rikiglesias
```

---

## 🚀 Implementazione su GitHub

### Passo 1: Configura master
1. Vai su: https://github.com/Rikiglesias/App-Rise/settings/branches
2. Clicca su `master` → Edit
3. Applica tutte le regole sopra indicate

### Passo 2: Configura develop
1. Stessa procedura per `develop`
2. Usa le regole specificate per develop

### Passo 3: Configura pattern release/*
1. Add rule → Branch name pattern: `release/*`
2. Applica regole release

### Passo 4: Crea CODEOWNERS
1. Crea file `.github/CODEOWNERS`
2. Aggiungi owners come sopra
3. Commit e push

---

## ⚙️ Automazioni Aggiuntive

### Auto-delete head branches
```
✅ Automatically delete head branches (dopo merge)
```

### Ruleset (GitHub Enterprise feature)
Se disponibile, considera di usare Rulesets invece di Branch Protection:
- Più flessibili
- Supportano pattern multipli
- Più granulari

---

## 🔒 Sicurezza Aggiuntiva

### Required Signatures
Per abilitare commit signing obbligatorio:

```bash
# Locale - configura GPG
git config --global user.signingkey YOUR_GPG_KEY_ID
git config --global commit.gpgsign true

# Su GitHub
Settings → SSH and GPG keys → New GPG key
```

### Deploy Keys
Per deployment automatizzato sicuro:

```
Settings → Deploy keys
✅ Add deploy key (read-only per CI)
✅ Separate deploy key per environment
```

---

## 📊 Monitoring & Alerts

### GitHub Actions Notifications
Configura notifications per workflow failures:

```yaml
# In workflow yml
- name: Notify on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        body: '❌ CI failed - immediate attention required'
      })
```

### Branch Protection Alerts
GitHub notificherà automaticamente:
- ✅ Quando qualcuno bypassa le regole (admin override)
- ✅ Quando status checks falliscono
- ✅ Quando force push viene bloccato

---

## 🎯 Checklist Implementazione

- [ ] Configura branch protection per `master`
- [ ] Configura branch protection per `develop`
- [ ] Configura pattern protection per `release/*`
- [ ] Crea file `.github/CODEOWNERS`
- [ ] Abilita auto-delete head branches
- [ ] Configura GPG signing (opzionale)
- [ ] Test le regole con una PR dummy
- [ ] Documenta override procedure per emergenze

---

**Nota**: Queste configurazioni richiedono permessi Admin sul repository.
Accedi a: https://github.com/Rikiglesias/App-Rise/settings/branches
