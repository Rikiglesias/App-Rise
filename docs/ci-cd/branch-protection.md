# 🛡️ Branch Protection Rules - Configurazione

## 📋 Configurazione Attuale

### Branch Protetti

L'unico branch del repository è `master`, protetto dal ruleset
`.github/ruleset.yml` (enforcement `active`). I branch `develop` e
`release/*` **non esistono** e non sono gestiti.

- ✅ `master` - Protected (ruleset attivo)

> Il ruleset include anche il pattern `main` come difesa preventiva, ma quel
> branch non esiste: il flusso reale usa solo `master`.

## 🎯 Regole Attive su `master`

Allineate a `.github/ruleset.yml`:

### **`master` (Production)**

#### Required Status Checks
```
✅ Require status checks to pass before merging
✅ Strict: branch must be up to date before merging

Status checks richiesti (da ruleset.yml):
- 🎯 Visual Diff - Layout Regression Detection
- 🔍 Quality Checks (typescript)
- 🔍 Quality Checks (eslint)
- 🔍 Quality Checks (prettier)
- 🔍 Quality Checks (tests)
- build
- test
```

#### Pull Request Rules
```
✅ Require a pull request before merging
✅ Require approvals: 1 (required_approving_review_count)
✅ Dismiss stale pull request approvals when new commits are pushed
✅ Require review from Code Owners (se configurato CODEOWNERS)
✅ Require last push approval
```

#### Additional Restrictions
```
✅ Require linear history (non_fast_forward → blocca rewrite history)
✅ Conventional commits enforced (commit_message_pattern)
⚠️ Require signed commits: disattivato (required_signatures.required: false)
```

#### Force Push & Deletions
```
❌ Allow force pushes: bloccato (non_fast_forward)
❌ Allow deletions: bloccato (deletion rule)
```

> **Bypass**: solo il repository owner (OrganizationAdmin, `bypass_mode: always`).

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

La protezione è gestita via ruleset versionato (`.github/ruleset.yml`),
non via Branch Protection classico. Per applicarlo/aggiornarlo:

### Passo 1: Importa/aggiorna il ruleset
1. Vai su: https://github.com/Rikiglesias/App-Rise/settings/rules
2. New ruleset → Import a ruleset → carica `.github/ruleset.yml`
3. Verifica enforcement `Active` e target `master`

### Passo 2: Crea CODEOWNERS (opzionale)
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

- [ ] Importa/aggiorna il ruleset per `master` (`.github/ruleset.yml`)
- [ ] Crea file `.github/CODEOWNERS`
- [ ] Abilita auto-delete head branches
- [ ] Configura GPG signing (opzionale)
- [ ] Test le regole con una PR dummy
- [ ] Documenta override procedure per emergenze

---

**Nota**: Queste configurazioni richiedono permessi Admin sul repository.
Accedi a: https://github.com/Rikiglesias/App-Rise/settings/branches
