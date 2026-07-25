# Identità utente fra RAH e Let's Donation — matrice scenari × esiti × provvedimenti

> **Cos'è.** La mappa completa di cosa può succedere a una persona che passa fra l'app Rise
> Against Hunger Italia (RAH) e la piattaforma Let's Donation (LD), e del provvedimento
> previsto per ogni caso. È il documento da cui si derivano — in un colpo solo — le richieste
> definitive a LD, il piano di costruzione lato nostro e i residui accettati.
>
> **Perché esiste.** Il brief a LD è stato riscritto sei volte in una notte (PR #71→#76), ogni
> volta per tappare un buco trovato a valle. Ogni correzione era giusta, ma il perimetro non
> era mai stato mappato prima. Questo documento viene **prima** del brief: il brief si riscrive
> una volta sola, a valle di qui.
> Ledger: `~/memory/errors/2026-07-25-brief-a-correzioni-reattive-senza-matrice-scenari.md`.
>
> **Come si legge.** Ogni riga della matrice ha quattro colonne: *cosa accade oggi* · *cosa
> vogliamo* · *provvedimento* (🔧 nostro codice · 📨 richiesta a LD · ⚠️ residuo accettato ·
> 🔑 leva umana) · *come si verifica*. Ogni affermazione è marcata **[V]** se verificata alla
> fonte in questa analisi, **[A]** se assunta e ancora da confermare.
>
> Stato: prima stesura 2026-07-25. Binding: `~/todos/partner-identita.md` (criterio F3.0).

---

## Parte 0 — Il quadro esterno

Prima degli scenari serve sapere di cosa stiamo parlando davvero. Quattro premesse che il
lavoro precedente dava per buone si sono rivelate false alla verifica diretta delle pagine
pubbliche del nostro tenant (`riseagainsthunger.org.letsdonation.com`, 2026-07-25).

### 0.1 Le quattro premesse corrette

| Come era scritto finora | Cosa è davvero |
| --- | --- |
| «Donorbox = i soldi, LD = shop/eventi» (memoria `integrazione-identita-partner`) | **Su LD si dona in denaro**, ai progetti di crowdfunding. Il progetto «Un Pasto in Sospeso \| Bologna» ha **47 donazioni per €259,10** [V]. LD è già oggi un canale di raccolta attivo, con donatori reali e account reali. |
| «shop = un ordine su cui salvare l'UTM» | `/charity/ecommerce` è una **vetrina cashback affiliate**: l'utente attiva il cashback e poi **compra su un merchant terzo** (>1.000 e-commerce partner). Su LD non nasce nessun ordine con righe-prodotto [V]. |
| «eventi = il flusso dove servono i dati completi» | Sul nostro tenant **non c'è nessun evento attivo** («Non ci sono eventi attivi») [V]. Il requisito esiste, il flusso oggi è vuoto. |
| claim `name` verso LD «quando disponibile» | Per gli utenti email/password il claim sarà **sempre vuoto**: `signUp` scrive `first_name`/`last_name` in `raw_user_meta_data`, **mai** `name` (`useSignUpForm.ts:154-159`) [V]. Non è un caso limite: è la maggioranza. |

### 0.2 Le quattro cose che LD è, con quattro modelli di transazione diversi

Trattarle come un blocco unico è la radice degli errori di perimetro. Ognuna ha un'attribuzione
diversa, un requisito di account diverso e un valore diverso per noi.

| Destinazione | Cosa succede davvero | Dove nasce il dato | Account necessario |
| --- | --- | --- | --- |
| **Progetti** (`/org/projects`) | Donazione in denaro a una campagna | Ordine/donazione **su LD** | Sì [V] |
| **Gift card** (`/charity/giftcards`) | Acquisto di gift card di brand terzi (>150); il brand dona una % | Ordine **su LD** [A: il pagamento sembra su LD] | Sì [V] |
| **Charity shop** (`/charity/ecommerce`) | Attivazione cashback → acquisto **sul sito del merchant** | Report differito dalla rete affiliate (tipicamente 30-90 gg) [A] | Sì [V] |
| **Eventi** (`/organization/events`) | Iscrizione a evento | Iscrizione su LD | Sì [V] — oggi zero eventi |

### 0.3 Gli attori e le superfici dove nasce un'identità

Tre superfici possono creare un account, e sono la vera posta in gioco:

1. **App RAH** (iOS/Android) — oggi l'unica nostra. Crea `auth.users` + `profiles` + `consent_events`.
2. **Pagina web RAH** (`/register`, `/consent`) — **non esiste ancora**. È il pezzo da costruire.
3. **Form nativo LD** — esiste, funziona, ha già utenti. Non è togliibile (risposta di Michele Placucci, 2026-07-24).

Più due terzi che ricevono dati ma non creano identità nostre: **Donorbox** (donazioni da ospite)
e i **merchant affiliate** (fuori dal nostro perimetro).

### 0.4 Gli invarianti — cosa non è negoziabile

Filtrano ogni provvedimento della matrice. Fonte: decisioni vincolanti del binding e della memoria.

- **I1** Nessun accesso reciproco ai database, in nessuna direzione.
- **I2** L'identità si aggancia sul **`sub`**, mai sull'email (alias Apple).
- **I3** Il nuovo utente che passa dal nostro pulsante **nasce nella nostra anagrafica**, mai nel form nativo di LD.
- **I4** Login **web-first**: mai obbligare a scaricare l'app.
- **I5** Nessun host su `riseagainsthunger.org` (dominio di Rise Against Hunger USA).
- **I6** Prima di trasmettere qualunque dato: informativa vera pubblicata (criterio 1 del goal).
- **I7** Non chiediamo a LD di togliere il form nativo — chiediamo prominenza e collegamento account.

### 0.5 La domanda-radice

> Se ogni pezzo funzionasse alla perfezione, **una persona qualsiasi che vuole dare una mano
> finisce con uno o con due account?** E quando ne ha due, chi se ne accorge e cosa succede?

Tutto il resto del documento è la risposta, caso per caso.

---

## Parte 1 — Gli assi

I primi dieci sono gli assi dettati nel brief di metodo; i quattro finali sono emersi da questa
analisi e non erano nella lista (gli esempi erano un seme, non il perimetro).

| # | Asse | Perché cambia il provvedimento |
| --- | --- | --- |
| 1 | **Punto di ingresso** | Da dove arriva decide se il `rise_ref` esiste e se il nostro pulsante è visibile |
| 2 | **Stato dell'utente** | Le quattro combinazioni account RAH × account LD hanno esiti opposti |
| 3 | **Tipo di email** | L'alias Apple rompe ogni logica basata sull'email |
| 4 | **Dove nasce l'account e chi raccoglie i consensi** | Determina chi è titolare di cosa e quale informativa vale |
| 5 | **Intenzione** | I quattro modelli di transazione di §0.2 hanno attribuzioni diverse |
| 6 | **Device e contesto** | La sessione dell'app non è la sessione del browser; gli in-app browser rompono OAuth |
| 7 | **Attribuzione** | Il `rise_ref` deve sopravvivere al giro di login, o non serve a niente |
| 8 | **Failure modes** | Un login di produzione su una feature beta ha bisogno di una via di fuga sempre aperta |
| 9 | **Vincoli fissi** | Filtrano ciò che è proponibile |
| 10 | **Chi fa cosa** | Ogni provvedimento è nostro, loro, o dichiarato scoperto |
| **11** | **Peso dell'onboarding** | *(nuovo)* Il nostro form chiede 7 campi, il loro 4: l'attrito è il costo nascosto dell'inversione |
| **12** | **Tempo e versione** | *(nuovo)* Informativa che cambia, email che cambia, token che scade, dominio che migra |
| **13** | **Uscita e reversibilità** | *(nuovo)* Cancellazione, revoca, disaccoppiamento: cosa resta dall'altra parte |
| **14** | **Chi paga il fallimento** | *(nuovo)* Se il flusso si rompe a metà, l'utente perde il carrello o l'iscrizione |

---

## Parte 2 — La matrice

### Famiglia A — Punto di ingresso

| # | Scenario | Oggi | Vogliamo | Provvedimento | Verifica |
| --- | --- | --- | --- | --- | --- |
| A1 | Dall'app, utente **loggato**, tocca Gift card / Progetti / Shop | Schermata onesta (una volta) → browser esterno con `?rise_ref=…` → atterra su pagina categoria LD **da sloggato** [V, `usePartnerExit.ts:78-84`] | Atterra e trova «Entra con RAH» come pulsante principale | 📨 prominenza sul nostro tenant · 🔧 pagina `/consent` | Click reale dall'app → il pulsante è il primo elemento del box di accesso |
| A2 | Dall'app, utente **ospite** (non loggato) | `getOrCreatePartnerRef` ritorna `null` → esce senza correlazione, nessuna schermata [V] | Che l'uscita non si blocchi mai, ma che l'utente sappia che accedendo il suo contributo viene riconosciuto | 🔧 invito soft al login **non bloccante** prima dell'uscita (decisione di design, non ancora presa) | L'uscita da ospite continua a funzionare con ref assente |
| A3 | **Diretto su LD** (SEO, loro canali, passaparola) — non passa da noi | Si registra col form nativo → nasce nel loro DB, noi non lo sapremo mai [V] | Che veda «Entra con RAH» primario e scelga di nascere da noi | 📨 prominenza · ⚠️ **residuo strutturale**: chi ignora il pulsante nasce da loro, e va bene così | Nessuna: è il caso che accettiamo |
| A4 | **Link condiviso** a un progetto specifico (`/project/…`) da un altro utente | Il visitatore è un terzo: nessun `rise_ref`, nessuna relazione con noi | Attribuzione al progetto, non all'utente | ⚠️ residuo: l'attribuzione per-utente non si applica ai link condivisi | — |
| A5 | **Email / newsletter** nostra | Nessun `rise_ref`: il ref è per-utente, un invio di massa avrebbe un solo URL | Attribuzione almeno per-campagna | 🔧 `utm_campaign=newsletter-<data>` sui link (non per-utente) · ⚠️ per-utente richiede merge-tag del provider email | Link della newsletter contiene l'UTM di campagna |
| A6 | **QR a evento fisico** | Stampa statica: un URL uguale per tutti | Attribuzione per-evento | 🔧 `utm_campaign=evento-<slug>` · ⚠️ per-utente impossibile su stampa | — |
| A7 | **Dal sito WordPress** RAH | Link diretti a LD senza ref, visitatore anonimo | Attribuzione di canale | 🔧 UTM di canale sui link del sito (fuori dal repo dell'app) | — |
| A8 | **Da un in-app browser** (Instagram/Facebook) | L'utente atterra su LD dentro il webview del social | Che «Entra con RAH» funzioni comunque | 🔧 sulla nostra pagina: rilevare lo user-agent embedded e proporre «apri nel browser» + email/password — **Google blocca OAuth da webview embedded** (`disallowed_useragent`) [A, policy nota Google] | Aprire il link da Instagram e tentare il login Google |

### Famiglia B — Stato dell'utente

| # | Scenario | Oggi | Vogliamo | Provvedimento | Verifica |
| --- | --- | --- | --- | --- | --- |
| B1 | Ha **RAH**, non ha LD | Si registra da loro: secondo account | Login one-tap, account LD creato via JIT agganciato al `sub` | 📨 client OIDC con matching su `sub` · 🔧 server OIDC + consent | Test end-to-end: due login consecutivi → un solo utente lato LD |
| B2 | **Non ha nessuno dei due** | Nasce da loro, form 4 campi | Nasce da noi (invariante I3) | 🔧 pagina `/register` — **ma vedi B2-bis, è il nodo critico** | Registrazione dal web → riga in `profiles` + `consent_events` |
| **B2-bis** | *(il nodo)* Peso dell'onboarding | Il nostro `profiles` ha **NOT NULL** su `first_name`, `last_name`, `phone`, `city`, `birth_date`, `privacy_consent_at` + constraint 18+ [V, `0001_profiles.sql:4-17`]; LD ne chiede 4 (paese, password, privacy + anagrafica base) [V] | Che chi vuole comprare una gift card non incontri un modulo da 7 campi | 🔧 **migration 0010**: `phone` e `city` nullable → profilo web minimo (nome, email, nascita/18+, consenso) e il resto chiesto dopo, alla prima azione che lo richiede · 🔑 decisione di Riccardo: quali campi sono davvero indispensabili subito | Registrazione web completabile in ≤4 campi; l'app continua a chiederli tutti |
| B3 | Ha **entrambi**, stessa email | Due account scollegati per sempre | Che LD colleghi i due sull'email | 📨 account linking (già nel brief §5-bis) | Utente di test con account nativo → login RAH → un solo account |
| B4 | Ha **entrambi**, email diverse (alias Apple) | Due account, non collegabili né sull'email né sul `sub` | Almeno una via manuale | 📨 chiedere a LD se esiste un «collega il mio account» nel profilo utente · ⚠️ altrimenti residuo dichiarato | — |
| B5 | Ha RAH ma **profilo incompleto** (`auth.users` senza `profiles`) | Gestito lato ref: errore 23503 → no-op silenzioso [V, PR #67/#68] | Che il caso non nasca proprio dal web | 🔧 `/register` crea utente **e** profilo nello stesso atto; se il profilo fallisce, l'account non resta orfano | Test: fallimento simulato del profilo → nessun `auth.users` orfano |
| B6 | Ha LD nativo e **non vuole** collegare | — | Che resti com'è | ⚠️ nessun provvedimento: non si forza nessuno | — |
| B7 | È anche donatore **Donorbox** | Terza identità scollegata | Correlazione a posteriori | ⚠️ rinviato alla Fase 2 (gate volumi) | — |

### Famiglia C — Identità ed email

| # | Scenario | Oggi | Vogliamo | Provvedimento | Verifica |
| --- | --- | --- | --- | --- | --- |
| C1 | Email reale (password o Google) | — | Claim `email` reale a LD | Nessuno | — |
| C2 | **Apple Private Relay** | `contact_email` raccolta in app (F1.10) ma **non trasmissibile** come claim OIDC [V] | Che la posta arrivi comunque | ⚠️ residuo dichiarato: LD vede l'alias, che inoltra alla casella reale · 📨 confermare che il loro JIT accetti un alias `@privaterelay.appleid.com` | Registrazione di test con account Apple-hide |
| C3 | **Email cambiata** dopo il primo login | LD resterebbe con la vecchia | Anagrafica LD aggiornata | 📨 chiedere se aggiornano l'anagrafica dai claim a **ogni** login o solo al JIT | — |
| C4 | LD pretende `email_verified` | Un utente email non confermato ha `email_verified:false` | JIT non deve rifiutarlo | 📨 domanda esplicita al loro tecnico | — |
| C5 | **Claim `name` vuoto** | Per ogni utente email/password il claim `name` **non esiste** [V] | Nome presente per tutti | 🔧 popolare `user_metadata.name` — backfill degli esistenti + scrittura al signup e a ogni aggiornamento profilo | Query: `auth.users` con `raw_user_meta_data->>'name'` non nullo = 100% |

### Famiglia D — Dove nasce l'account e chi raccoglie i consensi

| # | Scenario | Oggi | Vogliamo | Provvedimento | Verifica |
| --- | --- | --- | --- | --- | --- |
| D1 | Nasce **da noi via app**, email/password | Trigger `handle_new_user` crea profilo + `consent_events` (privacy + marketing) [V, `0004`/`0007`] | — | Nessuno | — |
| D2 | Nasce **da noi via web**, social (Apple/Google) | **Buco**: il trigger crea il profilo solo se `birth_date` è nei metadata — marker del form email; per il social il profilo lo crea `CompleteProfileScreen`, **che sul web non esiste** [V] → utente senza profilo, senza `privacy_consent_at`, senza `consent_events` = buco Art. 7 | Che ogni nascita, ovunque, lasci la stessa prova di consenso | 🔧 la pagina `/register` deve raccogliere 18+ e consenso **prima** di creare l'utente e scrivere profilo + `consent_events` con la stessa semantica del trigger | Registrazione web via Apple → riga `consent_events` con `purpose='privacy_notice'` |
| D3 | Nasce **da loro** (form nativo) | Tre consensi loro: informativa, marketing titolare, marketing enti beneficiari [V] | — | ⚠️ residuo accettato: sono titolari autonomi, non sappiamo nulla di quell'utente | — |
| D4 | Nasce da noi, **poi entra su LD** (JIT) | Al JIT non c'è nessuna casella da spuntare | Che l'utente veda **anche la loro** informativa | 📨 come presentano l'informativa LD agli account creati via JIT (è un loro obbligo, non nostro, ma ci riguarda perché nasce dal nostro pulsante) | — |
| D5 | Consensi marketing sull'account JIT | — | Che non siano presunti a `true` | 📨 conferma esplicita: JIT crea con marketing a **false** | — |
| D6 | **18+** | Constraint DB lato nostro [V] | Stesso presidio sul web | 🔧 `/register` verifica l'età prima dell'insert (riusa `validation.ts`) | Data di nascita minorenne → registrazione rifiutata |
| D7 | Utente **cancella l'account RAH** | Tombstone lato nostro [V, PR #59/#61/#62]; l'account LD creato via JIT **resta loro** | Che la cancellazione non lasci un fantasma inspiegabile | 📨 chiedere se esiste propagazione/notifica di cancellazione · ⚠️ altrimenti residuo, da dichiarare nell'informativa | — |
| D8 | **Data Sharing Agreement** | Non esiste | Accordo firmato prima del primo dato reale | 🔑 leva: legale + firma (gate all'attivazione) | — |

### Famiglia E — Intenzione (i quattro modelli di transazione)

| # | Scenario | Oggi | Vogliamo | Provvedimento | Verifica |
| --- | --- | --- | --- | --- | --- |
| E1 | **Donare** a un progetto su LD | L'app manda «Dona» a Donorbox **e** «Progetti» a LD, dove si dona lo stesso — due canali di denaro non dichiarati [V] | Coerenza: sapere quale canale vogliamo per le donazioni in denaro | 🔑 **decisione di Riccardo**: Donorbox resta il canale unico (e i progetti LD sono solo vetrina) oppure convivono e le donazioni LD vanno riconciliate | — |
| E2 | **Gift card** | Ordine reale su LD | UTM sull'ordine + export | 📨 Richiesta A, così com'è | Ordine di test con `utm_campaign` → compare nell'export |
| E3 | **Charity shop** (cashback) | **Non nasce un ordine su LD**: c'è un'attivazione cashback, l'acquisto è sul merchant, il valore torna dalla rete affiliate con settimane di ritardo [V/A] | Attribuzione dell'**attivazione**, non dell'ordine | 📨 **riformulare la Richiesta A**: l'UTM va agganciato all'evento di attivazione cashback e deve sopravvivere fino alla conferma differita | — |
| E4 | **Eventi** | Zero eventi attivi [V] | Sapere cosa chiederà l'iscrizione quando ci sarà | 📨 quali dati raccoglie l'iscrizione a un evento e se sono esportabili | — |
| E5 | **Sfide / community / bacheca** | Funzioni loro, mai mappate [V, home del tenant] | Sapere se generano dati riconducibili a noi | 📨 domanda di perimetro | — |

### Famiglia F — Device e contesto

| # | Scenario | Oggi | Vogliamo | Provvedimento | Verifica |
| --- | --- | --- | --- | --- | --- |
| F1 | **Dall'app iOS/Android** | L'uscita apre il **browser esterno**: la sessione dell'app **non è** quella del browser → sulla nostra pagina web l'utente **deve rifare il login** [V] | Che «one-tap» sia davvero one-tap per chi viene dall'app | 🔧 valutare `expo-web-browser` con sessione autenticata condivisa (ASWebAuthenticationSession / Custom Tabs) · ⚠️ altrimenti **dichiarare** che dall'app il primo passaggio richiede un login | Uscita dall'app → la pagina RAH riconosce già l'utente? |
| F2 | Browser mobile / desktop | — | — | Nessuno | — |
| F3 | **In-app browser** social | Vedi A8 | — | 🔧 rilevamento UA + fallback | — |
| F4 | Apple guideline 4.8 | Riguarda l'app, non il web [V, decisione binding] | — | Nessuno | — |

### Famiglia G — Attribuzione

| # | Scenario | Oggi | Vogliamo | Provvedimento | Verifica |
| --- | --- | --- | --- | --- | --- |
| G1 | `rise_ref` presente e catturato all'atterraggio | Lo mandiamo [V], **nessuno lo cattura** | Cattura in sessione al landing → stampa sull'ordine | 📨 Richiesta A | — |
| G2 | **`rise_ref` perso attraversando il login** | Il giro OIDC esce dal sito e rientra su una redirect URI: **il parametro della pagina di partenza si perde** se non è già in sessione | Che sopravviva al giro di login | 📨 dirlo **esplicitamente**: la cattura deve avvenire all'atterraggio, prima e indipendentemente dal login | Landing con UTM → login → ordine: l'UTM è ancora sull'ordine |
| G3 | Ordine senza ref (ingresso diretto) | Nessuna attribuzione | — | ⚠️ accettato | — |
| G4 | **Utente federato** | — | — | 🔧/📨 **osservazione che semplifica**: se LD crea l'account via JIT sul nostro `sub`, ogni suo ordine è nostro **per costruzione**, senza bisogno di UTM. La Richiesta A resta necessaria per i **non federati** e per le campagne → chiedere in aggiunta un **flag «utente proveniente da RAH»** nell'export | — |
| G5 | Doppio conteggio Donorbox + LD | — | — | ⚠️ Fase 2 | — |

### Famiglia H — Failure modes

| # | Scenario | Provvedimento | Verifica |
| --- | --- | --- | --- |
| H1 | **OAuth server beta giù** o breaking change | ⚠️/📨 il form nativo **resta** ed è la via di fuga — è la ragione tecnica per cui non chiediamo SSO-only (coerente con I7) | Disabilitare il server in staging → il form nativo funziona ancora |
| H2 | Utente **nega** il consenso sulla consent screen | 🔧 `denyAuthorization()` + rientro su LD con errore leggibile · 📨 come lo gestisce il loro plugin | Test del percorso «Nega» |
| H3 | **Chiavi di firma non asimmetriche** | 🔑 leva bloccante: l'`id_token` con HS256 fallisce; verificare l'algoritmo **prima** di ogni altra cosa | Discovery + decodifica di un id_token di test |
| H4 | **Conferma email obbligatoria** — con «Confirm email» ON il signup **non restituisce sessione** [V, `0004` riga 2-3], quindi chi si registra dal web per rientrare su LD resta appeso alla mail | 🔧 sul web privilegiare Apple/Google (sessione immediata); per l'email, schermata esplicita «controlla la posta» e ripresa del rientro dopo la conferma | Registrazione email dal web → il rientro su LD non si perde |
| H5 | **Nostro host giù** (Vercel) | ⚠️ nessun accesso via RAH; il form nativo salva la giornata | — |
| H6 | LD cambia template e **il pulsante sparisce** | ⚠️ residuo · 🔧 eventuale controllo sintetico periodico sulla pagina di login | — |
| H7 | **Token scaduto** a metà checkout | Nessun impatto: LD ha la sua sessione dopo il login [A] | — |
| H8 | **Revoca/rotazione del client secret** | 🔧 procedura scritta: la rotazione disconnette tutti gli utenti federati → concordare la finestra con LD | — |
| H9 | Due schede, due login concorrenti | 🔧 idempotenza sul `sub` lato JIT (è loro) · 📨 | — |
| H10 | **LD non implementa niente** | 🔑 scenario da mettere in conto: cosa facciamo intanto? Oggi la risposta onesta è «tutto resta com'è, con la doppia registrazione» — va detto a Riccardo, non scoperto fra sei mesi | — |

### Famiglia I — Tempo, versione, uscita

| # | Scenario | Provvedimento |
| --- | --- | --- |
| I1 | **Nuova informativa** (re-consent) | 🔧 sul web serve l'equivalente di `ReConsentScreen`, oggi solo in app |
| I2 | Migrazione di dominio LD (già successa una volta) | ⚠️ coperto dai 301 + dominio vecchio in allowlist [V] |
| I3 | **Supabase OAuth esce da beta** con breaking change | ⚠️ rischio dichiarato; mitigazione = form nativo sempre attivo |
| I4 | `rise_ref` revocato | 🔧 già previsto (revoca amministrativa, `partner_refs.active`) |
| I5 | Prezzo post-GA di Supabase OAuth ignoto | 🔑 rischio economico da accettare esplicitamente |

### Famiglia J — Vincoli fissi (filtro, non scenari)

LD è multi-tenant con oltre 1.000 enti (nessuna personalizzazione per noi che non valga per
tutti) · Supabase OAuth Server è in **beta** · RAH-Italia **non ha un dominio proprio** [A, in
attesa di conferma] · `riseagainsthunger.org` è di Rise USA · l'**informativa in produzione è
falsa** finché non si pubblica la nuova (gate a monte di tutto) · i claim OIDC sono solo quelli
standard (`sub`, `name`, `email`) · nessuna pre-creazione massiva di account.

---

## Parte 3 — Cosa se ne deriva

### 3.1 Richieste definitive a Let's Donation

Sostituiscono e riorganizzano quelle sparse nel brief attuale. In ordine di valore su sforzo.

| # | Richiesta | Da quale riga nasce |
| --- | --- | --- |
| **R1** | **Cattura UTM all'atterraggio, in sessione**, indipendente dal login, stampata sull'ordine e presente nell'export — *e che sopravviva al giro di login* | G1, G2 |
| **R2** | Per il **charity shop**: l'aggancio dev'essere sull'**attivazione cashback**, non su un ordine che non esiste, e reggere fino alla conferma differita | E3 |
| **R3** | **Client OIDC su Joomla** con matching sul **`sub`** (JIT al primo accesso) | B1 |
| **R4** | **Account linking sull'email** per chi ha già un account nativo | B3 |
| **R5** | **Inversione di prominenza** sul nostro tenant: «Entra con RAH» primario, form nativo secondario — *senza toglierlo* (è anche la nostra via di fuga se il nostro provider è giù) | A1, A3, H1 |
| **R6** | **Flag «utente proveniente da RAH»** nell'export: per gli utenti federati vale più dell'UTM | G4 |
| **R7** | Domande di chiarimento: alias Apple accettato dal JIT? `email_verified` richiesto? Anagrafica aggiornata a ogni login o solo al JIT? Marketing a false sul JIT? Informativa LD mostrata all'account JIT? Cancellazione propagabile? Che dati chiede l'iscrizione a un evento? | C2, C3, C4, D4, D5, D7, E4 |
| **R8** | **Il precedente Zucchetti**: che meccanismo è davvero (già nel brief, resta) | — |

### 3.2 Piano di costruzione lato nostro

In ordine di dipendenza. Le prime due non dipendono da nessuna risposta di LD.

| # | Pezzo | Dipende da |
| --- | --- | --- |
| **P1** | **`user_metadata.name`**: backfill + scrittura al signup e all'aggiornamento profilo — senza questo il claim `name` è vuoto per la maggioranza | Niente. Si può fare subito |
| **P2** | **Migration 0010**: `phone` e `city` nullable, per rendere possibile un profilo web minimo | Decisione di Riccardo su quali campi sono indispensabili subito (B2-bis) |
| **P3** | **Pagina web** (Next.js): `/consent`, `/register` (con 18+ e consenso **prima** dell'insert, profilo e `consent_events` nello stesso atto), `/auth/callback`, rilevamento in-app browser | Hosting (leva) |
| **P4** | **Chiavi di firma asimmetriche** + abilitazione OAuth server | Leve di Riccardo |
| **P5** | Registrazione del client LD, discovery, test end-to-end | Risposta LD |
| **P6** | Re-consent sul web | Dopo P3 |

### 3.3 Residui dichiarati — li accettiamo, non li scopriremo dopo

1. Chi arriva su LD **senza passare da noi** e usa il form nativo nasce da loro: non lo sapremo mai (A3).
2. Utenti **Apple-hide** con un account nativo preesistente restano **due account** (B4).
3. LD vede l'**alias** di posta, non l'indirizzo reale (C2).
4. Gli account LD creati via JIT **restano loro** anche dopo la cancellazione da noi (D7).
5. L'attribuzione **per-utente** è impossibile su QR e newsletter di massa (A5, A6).
6. Se LD non implementa nulla, **tutto resta com'è** (H10).
7. Se veniamo dall'app, il primo passaggio sul web **richiede un login**, salvo P3 avanzato (F1).

### 3.4 Le decisioni che servono a Riccardo

| # | Decisione | Perché blocca |
| --- | --- | --- |
| **D-a** | **Quali campi** chiediamo davvero nella registrazione web (proposta: nome, email, data di nascita per il 18+, consenso — telefono e città dopo, alla prima azione che li richiede) | Da qui esce la migration 0010 e il peso dell'intero flusso (B2-bis) |
| **D-b** | **Donazioni in denaro**: Donorbox resta il canale unico o convivono con i progetti LD? | Oggi l'app manda a entrambi senza che sia una scelta (E1) |
| **D-c** | **Hosting** della pagina: Vercel gratuito o dominio proprio RAH-Italia (esiste?) | Blocca P3 e P5 |
| **D-d** | Accettare l'auth di produzione su una **feature beta** | Blocca P4 |

---

## Appendice — Metodo e limiti di questa analisi

**Cosa è verificato alla fonte** in questa passata (2026-07-25): le quattro pagine pubbliche del
nostro tenant LD e il suo form di registrazione; lo schema `profiles` e i trigger di signup;
`useSignUpForm`, `usePartnerExit`, `partnerUrls`, `useActionButtonsData`, `urls.ts`, `socialAuth`.

**Cosa resta assunto** ed è marcato [A] nel testo: dove avviene esattamente il pagamento delle
gift card; i tempi di conferma della rete affiliate; il blocco Google sui webview embedded
(policy nota, non riprovata qui); il comportamento del plugin OIDC di LD, che non conosciamo.

**Cosa questo documento non copre**: la Fase 2 (pull dei dati donazione da Donorbox) e la
riconciliazione fra le tre identità (RAH, LD, Donorbox), rinviate al gate volumi.
