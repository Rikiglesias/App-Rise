# ⚡ QUICK REFERENCE - COMANDI ESSENZIALI

## 🚨 COMANDI CRITICI QUOTIDIANI

```bash
# 🔍 VERIFICA PROBLEMI
npm run conta-problemi

# 🔧 WORKFLOW SVILUPPO
npm run pre-modifiche    # Prima di iniziare
npm run post-modifiche   # Prima del commit

# 💾 COMMIT SICURO
git add .
git commit -m "feat: Descrizione"  # Solo se ZERO problemi
```

---

## 🚀 DEPLOY EAS - COMANDI RAPIDI

```bash
# 📱 BUILD TESTING
eas build --profile preview --platform all

# 🏪 BUILD PRODUCTION
eas build --profile production --platform all

# 📤 SUBMIT STORES
eas submit --platform all --profile production

# ⚡ HOTFIX OTA
eas update --branch production --message "Fix: Descrizione"
```

---

## 🔍 TROUBLESHOOTING VELOCE

```bash
# 📊 STATUS PROGETTO
eas whoami              # Account loggato
eas project:info        # Info progetto
git status             # Status git

# 🐛 DEBUG BUILD
eas build:list         # Lista build recenti
eas config            # Configurazione attuale

# 🔧 RESET CERTIFICATI
eas credentials --platform ios --clear
```

---

## 📊 SITUAZIONE ATTUALE

- **Problemi**: 172 totali (170 TS + 1 ESLint + 1 Jest)
- **Account EAS**: rikiglesias ✅
- **Commit**: ac7d1db (stato pulito)
- **Next**: Correggere errori TypeScript

---

## 🎯 PRIORITÀ IMMEDIATE

1. **Correggi errori TypeScript** in VS Code Problems tab
2. **Verifica**: `npm run conta-problemi` → ZERO
3. **Test build**: `eas build --profile preview --platform ios`
4. **Deploy**: Quando tutto funziona
