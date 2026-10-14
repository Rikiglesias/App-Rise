# 🌍 Guida Localizzazione Store - Italiano + Inglese

## ✅ Configurazione App (GIÀ COMPLETATA)

La configurazione nel codice è già corretta:

**iOS (`app.config.js`):**
```javascript
CFBundleLocalizations: ['it', 'en']
```

**Entrambe le piattaforme:**
```javascript
locales: {
  it: './locales/it.json',
  en: './locales/en.json',
}
```

---

## 📱 App Store Connect (iOS) - SETUP MANUALE NECESSARIO

### Passo 1: Accedi ad App Store Connect
1. Vai su: https://appstoreconnect.apple.com
2. Accedi con il tuo Apple ID developer
3. Clicca su **"Le mie app"**
4. Seleziona **"RAH Italia"**

### Passo 2: Aggiungi Localizzazione Italiana
1. Vai sulla tab **"App Store"**
2. Sotto **"Informazioni sull'app"**, clicca sul **"+"** accanto a "Lingue"
3. Seleziona **"Italiano"**
4. Clicca **"Crea"**

### Passo 3: Compila i Campi in Italiano

**Nome app (massimo 30 caratteri):**
```
RAH Italia
```

**Sottotitolo (massimo 30 caratteri):**
```
Lotta contro la fame
```

**Descrizione breve (massimo 170 caratteri):**
```
Unisciti alla missione contro la fame nel mondo. Scopri il nostro impatto, dona e fai la differenza con Rise Against Hunger Italia.
```

**Descrizione completa (massimo 4000 caratteri):**
```
🌍 UNISCITI ALLA MISSIONE #FAMEZERO

Rise Against Hunger Italia è un'organizzazione non profit impegnata nella lotta contro la fame nel mondo. La nostra app ti permette di:

✅ SCOPRI IL NOSTRO IMPATTO
• Visualizza in tempo reale i pasti distribuiti
• Esplora i progetti attivi in Italia, Ucraina e Mozambico
• Segui le storie delle persone che aiutiamo

❤️ DONA ORA
• Donazioni sicure e immediate
• Supporta progetti specifici
• Traccia l'impatto delle tue donazioni

📊 NUMERI CHE CONTANO
• Oltre 3 milioni di pasti distribuiti
• 100+ kit igienici forniti
• 500+ volontari attivi
• Progetti in 3 paesi

🤝 DIVENTA VOLONTARIO
• Trova eventi di confezionamento pasti
• Unisciti alla community
• Fai la differenza concretamente

📱 FUNZIONALITÀ
• Interfaccia moderna e intuitiva
• Aggiornamenti in tempo reale
• Supporto multilingua (Italiano/Inglese)

🌟 LA NOSTRA MISSIONE
Crediamo che la fame sia un problema risolvibile. Ogni pasto conta, ogni donazione fa la differenza. Unisciti a noi nella missione #famezero.

📞 CONTATTI
• Web: italy.riseagainsthunger.org
• Email: info@riseagainsthunger.it
• Social: @RAHItalia

Scarica l'app e inizia a fare la differenza oggi stesso!
```

**Parole chiave (massimo 100 caratteri, separate da virgola):**
```
fame,donazioni,volontariato,non profit,umanitario,beneficenza,pasti,aiuti
```

**Note sulla versione (per v1.2.9):**
```
🌍 Supporto multilingua italiano/inglese
❤️ Nuova interfaccia con design migliorato
📊 Sistema aggiornamenti OTA ottimizzato
🔧 Correzioni bug e miglioramenti performance
```

### Passo 4: Screenshot (OPZIONALE ma CONSIGLIATO)
Carica screenshot in italiano per:
- iPhone 6.7" (Pro Max)
- iPhone 6.5" 
- iPad Pro 12.9"

---

## 🤖 Google Play (Android)

Le istruzioni Android stanno in [google-play/rilascio.md](./store/google-play/rilascio.md)
(runbook della scheda nuova `org.riseagainsthunger.italia`); i testi della scheda IT/EN in
[google-play/scheda.md](./store/google-play/scheda.md). I testi Android che stavano qui erano
della vecchia app e non valgono più.

---

## ✅ Verifica che Funzioni

### iOS (App Store)
Dopo aver pubblicato la localizzazione:
1. Vai sulla pagina dell'app nello store
2. In alto vedrai **"Lingua: Italiano, Inglese"**
3. Gli utenti con iPhone in italiano vedranno la descrizione in italiano

### Android (Google Play)
Vedi [google-play/rilascio.md](./store/google-play/rilascio.md).

---

## 📝 Note Importanti

1. **Le modifiche agli store richiedono approvazione:**
   - iOS: 24-48 ore di review Apple
   - Android: 1-7 giorni di review Google

2. **La localizzazione del codice è GIÀ ATTIVA:**
   - L'app cambierà lingua automaticamente in base al dispositivo
   - Non serve fare nulla lato codice

3. **Aggiornamenti futuri:**
   - Ricordati di aggiornare ENTRAMBE le lingue (IT + EN) ad ogni nuova versione
   - Le note sulla versione devono essere tradotte

---

## 🎯 Checklist Finale

- [ ] App Store Connect: Aggiunta localizzazione italiana
- [ ] App Store Connect: Compilati tutti i campi in italiano
- [ ] App Store Connect: Caricate screenshot in italiano (opzionale)
- [ ] Google Play: passi di [google-play/rilascio.md](./store/google-play/rilascio.md)
- [ ] Verificato che "Lingue: Italiano, Inglese" appaia negli store

---

**Una volta completato, gli utenti vedranno l'app disponibile sia in Italiano che in Inglese!** 🎉
