# 🌍 Sistema Internazionalizzazione (i18n)

Sistema multi-lingua per Rise Against Hunger Italia.

## 📱 Funzionamento

### iOS

1. Utente cambia lingua: `Settings → General → Language & Region → iPhone Language`
2. App rileva automaticamente lingua di sistema
3. Traduzioni aggiornate al prossimo avvio

### Android

1. Utente cambia lingua: `Impostazioni → Sistema → Lingua e input → Lingua`
2. App rileva automaticamente lingua di sistema
3. Traduzioni aggiornate al prossimo avvio

## 🎯 Lingue Supportate

- 🇮🇹 **Italiano** (lingua predefinita/fallback)
- 🇬🇧 **Inglese**

## 📝 Uso nei Componenti

### Esempio Base

```tsx
import { useTranslation } from '@/shared/hooks/useTranslation';

const MyComponent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('common.loading')}</Text>
      <Text>{t('home.welcome')}</Text>
    </View>
  );
};
```

### Con Parametri Dinamici

```tsx
const { t } = useTranslation();

// File traduzione:
// welcome: 'Benvenuto, {{name}}!'

<Text>{t('home.welcome', { name: 'Mario' })}</Text>
// Output: "Benvenuto, Mario!"
```

### Check Lingua Corrente

```tsx
const { locale, isItalian, isEnglish } = useTranslation();

if (isItalian) {
  // Logica specifica per italiano
}

console.log(locale); // 'it' o 'en'
```

### Cambiare Lingua Manualmente (Opzionale)

```tsx
const { setLocale } = useTranslation();

// Forza cambio a inglese
setLocale('en');
```

## 📂 Struttura File

```text
src/locales/
├── index.ts          # Configurazione i18n principale
├── types.ts          # TypeScript types
├── it.ts             # Traduzioni italiane
├── en.ts             # Traduzioni inglesi
└── README.md         # Questa documentazione
```

## ➕ Aggiungere Nuove Traduzioni

### 1. Aggiungi chiave in `it.ts`

```typescript
export default {
  // ... altre traduzioni
  myFeature: {
    title: 'Titolo Feature',
    description: 'Descrizione feature',
  },
};
```

### 2. Aggiungi stessa chiave in `en.ts`

```typescript
export default {
  // ... altre traduzioni
  myFeature: {
    title: 'Feature Title',
    description: 'Feature description',
  },
};
```

### 3. Usa nel componente

```tsx
const { t } = useTranslation();
<Text>{t('myFeature.title')}</Text>
```

## 🚀 Aggiornare Traduzioni via OTA

✅ **Le traduzioni sono aggiornabili via OTA!**

```bash
# 1. Modifica file it.ts o en.ts
# 2. Pubblica OTA update
npm run update:production "Aggiornamento traduzioni"

# Utenti vedranno nuove traduzioni senza reinstallare app
```

## 🌐 Aggiungere Nuova Lingua

### Esempio: Aggiungere Spagnolo

**1. Crea file `es.ts`:**

```typescript
export default {
  common: {
    appName: 'Rise Against Hunger Italia',
    loading: 'Cargando...',
    // ...
  },
  // ... tutte le chiavi tradotte
};
```

**2. Aggiorna `types.ts`:**

```typescript
export type SupportedLocale = 'it' | 'en' | 'es';
```

**3. Aggiorna `index.ts`:**

```typescript
import es from './es';

const i18n = new I18n({
  it,
  en,
  es, // ← Aggiungi qui
});

const supportedLocales: SupportedLocale[] = ['it', 'en', 'es'];
```

**4. Pubblica OTA update:**

```bash
npm run update:production "Aggiunto supporto lingua spagnola"
```

## 🎯 Best Practices

### ✅ DO

- Usa chiavi descrittive: `home.heroTitle` invece di `text1`
- Raggruppa traduzioni per feature: `home.*`, `impact.*`
- Testa sempre entrambe le lingue
- Mantieni lunghezza testi simile tra lingue
- Usa parametri per valori dinamici

### ❌ DON'T

- Non hardcodare testi nei componenti
- Non usare chiavi generiche (`title1`, `text2`)
- Non dimenticare di tradurre in tutte le lingue
- Non usare traduzioni per logica business

## 🔍 Debugging

### Vedere lingua rilevata

```tsx
import * as Localization from 'expo-localization';

const locales = Localization.getLocales();
console.log('Lingua sistema:', locales[0].languageCode);
console.log('Tutte lingue:', locales);
```

### Forzare lingua in dev

```tsx
// In App.tsx (solo per testing)
import { changeLanguage } from '@/locales';

useEffect(() => {
  changeLanguage('en'); // Force inglese
}, []);
```

## 📊 Traduzioni Esistenti

### Sezioni Complete

- ✅ `common` - Testi comuni
- ✅ `navigation` - Tab navigation
- ✅ `home` - Home screen
- ✅ `impact` - Impact screen
- ✅ `actions` - Actions screen
- ✅ `about` - About screen
- ✅ `errors` - Messaggi errore
- ✅ `updates` - Sistema OTA

### Da Tradurre

Se trovi testi hardcoded:

1. Aggiungi chiave in `it.ts` e `en.ts`
2. Sostituisci con `t('chiave')`
3. Commit e push

## 🤝 Contribuire

Per aggiungere/modificare traduzioni:

1. Modifica `it.ts` e `en.ts`
2. Testa entrambe le lingue
3. Commit con messaggio: `i18n: descrizione modifica`
4. Push e OTA update

---

**Domande?** Contatta il team di sviluppo.
