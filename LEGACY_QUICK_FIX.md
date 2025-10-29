# 🚨 LEGACY CODE - QUICK FIX REQUIRED

## ⚠️ PROBLEMA CRITICO IDENTIFICATO

### 1. **HEADER_SUBTITLE_SIZE - CONFLITTO DI VALORI** 🔴

**Problema**: DUE definizioni diverse dello stesso valore!

```typescript
// File 1: typographySizes.ts (ATTIVO)
export const HEADER_SUBTITLE_SIZE = 26;

// File 2: headerSizes.ts (DEPRECATO)
export const HEADER_SUBTITLE_SIZE = 30; // Deprecated
```

**Impatto**: MEDIO-ALTO  
**Rischio**: Inconsistenza tipografica nel layout

### ✅ SOLUZIONE RACCOMANDATA

**Opzione A - Rimuovere Deprecato** (Raccomandato):
```bash
# 1. Verifica che nessuno usi la versione da headerSizes.ts
# 2. Rimuovi export deprecato
```

**Opzione B - Rinominare**:
```typescript
// In headerSizes.ts
export const LEGACY_HEADER_SUBTITLE_SIZE = 30; // Per migration tracking
```

---

## ✅ LEGACY ATTIVI E NECESSARI

### 2. **aboutMainStyles - IN USO ATTIVO** 🟢

**File utilizzatore**: `src/features/social/styles/mainStyles.ts:4,12`

```typescript
import { mainStyles as aboutMainStyles } from '../../about/styles/mainStyles';

export const mainStyles = StyleSheet.create({
  ...aboutMainStyles, // SPREAD ATTIVO
  // ...
});
```

**Stato**: ✅ NECESSARIO - non rimuovere  
**Azione**: Mantenere, è backward compatibility funzionante

---

### 3. **FoldableDevices Alias - IN USO INTERNO** 🟢

**Utilizzo**: Usato internamente in `devices/index.ts` per aggregazione

```typescript
export const AllFoldableDevices = [
  ...SamsungFoldables,
  ...FoldableDevices, // USATO QUI
];
```

**Stato**: ✅ NECESSARIO - alias funziona correttamente  
**Azione**: Mantenere, garantisce compatibilità

---

## 🎯 PIANO D'AZIONE IMMEDIATO

### STEP 1: Fix HEADER_SUBTITLE_SIZE Conflict

```bash
# Edita: src/features/shared/headerSizes.ts
# Rimuovi o commenta:
# export const HEADER_SUBTITLE_SIZE = 30;
```

**Codice da applicare**:
```typescript
// src/features/shared/headerSizes.ts
export const HOME_HEADER_TITLE_SIZE = 42;
export const HOME_SUBTITLE_SIZE = 18;
export const IMPACT_SUBTITLE_SIZE = 18;
export const CONTRIBUTE_SUBTITLE_SIZE = 18;

// ❌ RIMOSSO - Usa HEADER_SUBTITLE_SIZE da typographySizes.ts invece
// export const HEADER_SUBTITLE_SIZE = 30;
```

### STEP 2: Update LEGACY_CODE_AUDIT.md

Aggiorna stato:
- ✅ aboutMainStyles: Confermato NECESSARIO
- ✅ FoldableDevices: Confermato NECESSARIO  
- 🔴 HEADER_SUBTITLE_SIZE: CONFLITTO - richiede fix

---

## 📊 RIEPILOGO FINALE

| Item | Stato | Azione |
|------|-------|--------|
| **HEADER_SUBTITLE_SIZE conflict** | 🔴 Critico | FIX IMMEDIATO |
| **aboutMainStyles alias** | 🟢 Necessario | MANTENERE |
| **FoldableDevices alias** | 🟢 Necessario | MANTENERE |
| **Altri legacy** | 🟡 Documentati | NESSUNA AZIONE |

---

## ✅ CONCLUSIONE

**Azione Richiesta**: 1 fix immediato (HEADER_SUBTITLE_SIZE)  
**Tempo Stimato**: 2 minuti  
**Rischio**: Basso (se fatto ora)  

**Altri legacy sono TUTTI OK e gestiti correttamente!**
