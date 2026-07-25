# Informativa privacy — triage dei punti aperti

> I punti evidenziati in giallo nella bozza (`privacy-policy.html` e `privacy-policy-en.html`,
> PR #57) sono **10**, non 12: due dei dodici marcatori sono lo stile CSS e l'avviso generale
> «bozza interna», non domande.
>
> Questo documento serve a **non mandare al legale ciò che non è materia legale**. Dei dieci,
> alla consulente arrivano **tre domande vere e una conferma**; gli altri sei li chiudiamo noi.
>
> Triage del 2026-07-25. Fonte: i file della PR #57, il codice su master `ccd6022`, la memoria
> di progetto. Ogni riga dice su cosa poggia.

## Come sono classificati

| Simbolo | Significato | Quanti |
| --- | --- | --- |
| 🟩 | **Chiuso da noi** — la risposta c'è già, va solo scritta nel testo | 2 |
| 🟦 | **Dato da recuperare** — serve un documento o un pannello di controllo, non un parere | 4 |
| 🟨 | **Conferma** — la posizione è già argomentata, serve un sì o un no | 1 |
| 🟥 | **Domanda legale vera** — serve la competenza della consulente | 3 |

---

## 🟥 Le tre domande per la consulente legale

Sono le uniche che richiedono davvero un parere. Per ognuna diamo il contesto di fatto, così
non deve ricostruirlo.

### L1 — Trasferimenti fuori dall'Unione Europea (riga 86)

**Il fatto**: i dati dell'account risiedono in UE — Supabase, region Francoforte (Germania),
verificata il 2026-07-07. Alcuni fornitori sono però società statunitensi: Sentry (diagnostica
errori), Donorbox (donazioni), Expo (distribuzione app), il fornitore email.

**La domanda**: come va formulata la sezione sul capo V del GDPR, e quali garanzie citiamo
per ciascun fornitore (clausole contrattuali standard, Data Privacy Framework, entrambe)?

### L2 — Per quanto conserviamo il registro dei consensi (riga 91)

**Il fatto**: conserviamo il registro anche dopo la cancellazione dell'account, come prova
dell'avvenuto consenso (art. 7.1). Oggi il testo dice «per il tempo necessario alla difesa in
caso di contestazioni», senza un numero.

**La domanda**: quale durata indichiamo? La bozza ipotizza dieci anni, ma è un'ipotesi nostra,
non una scelta motivata.

### L3 — Serve nominare un Responsabile della Protezione dei Dati? (riga 124)

**Il fatto**: siamo un'associazione non profit; trattiamo dati di donatori (anagrafica,
contatti, data di nascita per la maggiore età) e un registro dei consensi. Nessuna categoria
particolare di dati, nessun monitoraggio sistematico su larga scala allo stato attuale.

**La domanda**: la nomina è dovuta ai sensi dell'art. 37? Oggi il testo dichiara «non nominato».

---

## 🟨 La conferma

### C1 — Come qualifichiamo il rapporto con Let's Donation (riga 107)

**Non è una domanda aperta: è una posizione già presa e argomentata**, serve solo un sì.

La posizione: **due titolari autonomi**. Non contitolarità (art. 26) e non responsabile del
trattamento (art. 28). Le ragioni: Let's Donation decide autonomamente finalità e mezzi dei
propri trattamenti, la loro piattaforma è multi-tenant e serve oltre mille enti, e la
contitolarità esporrebbe l'associazione a responsabilità solidale su trattamenti che riguardano
i donatori di altre organizzazioni. La liceità della trasmissione poggia sul click della
persona, che avvia lei il flusso.

Riferimenti su cui si basa: EDPB 07/2020 e 02/2025. Serve inoltre un accordo di condivisione
dati fra le due società.

---

## 🟦 I quattro dati da recuperare (non servono al legale)

| # | Cosa serve | Dove si trova | Riga |
| --- | --- | --- | --- |
| **R1** | Copia firmata del **DPA di Supabase** con clausole contrattuali standard | Pannello Supabase, sezione legale/compliance: si accetta e si archivia la copia | 77 |
| **R2** | **Region di ingestione di Sentry** (UE o USA) + il loro DPA | Pannello Sentry, impostazioni del progetto. NB: già tracciata come azione aperta nel binding del goal | 78 |
| **R3** | **Retention configurata su Sentry** (il testo dice 90 giorni «per impostazione predefinita») | Pannello Sentry: va confermato il valore reale, non quello di default | 92 |
| **R4** | **PEC e indirizzo della sede legale** dell'associazione | Dato dell'associazione | 121 |

---

## 🟩 I due che chiudiamo scrivendo, senza chiedere niente a nessuno

### S1 — Il fornitore delle email di servizio (riga 80)

**Non è una domanda: è già deciso.** Oggi le email tecniche (conferma registrazione, recupero
password) partono dal servizio integrato di Supabase. È già stabilito che prima del lancio si
passa a un fornitore dedicato — **Resend** — perché il servizio integrato è pensato per lo
sviluppo (due email l'ora, reputazione condivisa). Fonte: memoria di progetto
`supabase-email-smtp`.

**Cosa fare**: il testo attuale è già corretto per oggi. Va aggiornato **nel momento dello
switch**, insieme al DPA del nuovo fornitore. Da mettere nella lista delle cose da fare al
lancio, non nella lista del legale.

### S2 — Il pre-riempimento dei moduli e il codice di provenienza (riga 109) ⚠️

**Questo è l'unico punto che segnala un disallineamento reale, e va corretto prima di
pubblicare.**

Il testo dice: «Se verrà attivato il pre-riempimento dei moduli (nome/email nell'indirizzo web)
o un codice di riconoscimento della provenienza della donazione, questa sezione va aggiornata
**prima dell'attivazione**».

**Quella condizione si è già avverata.** Sono entrambi attivi su master:

- il pre-riempimento verso Donorbox passa **nome, cognome ed email** nell'indirizzo web
  (`usePartnerExit.ts`, funzione `openDonation`);
- il codice di provenienza `rise_ref` è **vivo sul database** (migration 0008 e 0009 applicate
  il 2026-07-24) e viaggia su ogni uscita verso i partner.

**Cosa fare**: riscrivere quella sezione al presente — descrivendo quali dati viaggiano, verso
chi, e che finiscono nella cronologia del browser esterno perché l'app apre il link fuori
dall'app. Non è materia legale: è allineare il testo a ciò che il software fa già.

---

## Riepilogo operativo

1. **Alla consulente** vanno L1, L2, L3 e la conferma C1. Nient'altro.
2. **A chi gestisce gli account** (R1-R4): due copie di DPA, due valori dai pannelli di
   controllo, PEC e sede.
3. **A noi** (S1, S2): S2 **prima** della pubblicazione, perché oggi il testo descrive come
   futuro qualcosa che è già attivo; S1 al momento del passaggio a Resend.

Finché il punto S2 non è sistemato, la bozza non è pronta per andare online — e la pubblicazione
sul sito è il gate che blocca ogni trasmissione di dati ai partner.
