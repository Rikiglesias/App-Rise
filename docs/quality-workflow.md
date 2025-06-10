# Workflow Controllo Qualità Automatico

## 🚀 Nuovi Script Disponibili

### Prima di Sviluppare

```bash
npm run dev:quick-check    # Solo controllo errori rapido
npm run dev:start         # Controllo errori + avvio app
```

### Dopo Implementazione Significativa

```bash
npm run dev:finish        # Controllo errori + warnings completo
```

### Prima del Commit

```bash
npm run dev:pre-commit    # Verifica COMMIT POLICY (strict)
```

## 🔄 Automazione Git (AGGIORNATA)

### Pre-Commit (Automatico)

- ✅ **COMMIT POLICY**: `check:strict` OBBLIGATORIO (zero errori + zero warnings)
- ✅ Lint-staged con fix automatico
- ⚠️ **BLOCCA commit se warnings**

### Post-Commit (Automatico)

- ✅ **CONTROLLO POST-FEATURE**: `quality-check:summary`
- ✅ Panoramica completa qualità

## 📋 Workflow Raccomandato (AGGIORNATO)

1. **PRE-MODIFICA**: `npm run dev:start` (check:errors-only)
2. **SVILUPPO**: Modifica codice
3. **CONTROLLO ERRORI + WARNINGS**: `npm run dev:finish` (dopo implementazione significativa)
4. **PRE-COMMIT**: `npm run dev:pre-commit` (check:strict)
5. **COMMIT**: Git commit (automazione completa)

## ⚠️ Note Importante

- **STOP se errori**: Mai procedere con errori TypeScript/ESLint
- **Warning gestiti**: Risolvi prima del commit finale
- **Controlli obbligatori**: Seguono le regole QA definite
