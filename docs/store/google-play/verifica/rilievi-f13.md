# Rilievi di F13: dove va ogni riga

Criterio C83 del contratto `android-play` (U4: «controlla più volte»). Ogni riga delle tabelle dei revisori ha una
destinazione: un criterio Cn, con il titolo del test o l'azione che lo farebbe fallire; un residuo dichiarato; oppure
una voce del Fuori contratto. Le righe sono numerate come le conta il verificatore (`righeTabella`: righe di dati,
intestazioni escluse). Nella cartella `f13/` ci sono le stesse righe senza il testo dei revisori: gravità, `file:riga`
del repo e destinazione.

Revisione del delta su `a6b2394` (da `f1fefda`): è lo sha che il verificatore confronta con l'ultimo commit del codice.

## Come sono stati fatti i giri

- **Giro 1** (23-24/10): Codex `gpt-6-astra` con effort xhigh, in sola lettura, su `63352bc`, a sette perimetri
  (A-B-C, D, E, F1, F2, G, architettura). In più i difetti D1-D7, trovati da Claude sull'emulatore.
- **Giro 2** (25/10): stessi prompt, su `f1fefda`. **Non era cieco sulle note private**: il log del perimetro G mostra
  letture delle memorie di Codex e delle note di Claude (`giro2-g.log:137,1210,1218-1219`). Per questo ogni suo
  rilievo è stato riverificato alla fonte: quattro verificatori Codex in sola lettura (`verifica2-*-esito.md`) e poi
  il giudizio di Claude, riga per riga.
- **Delta** (emendamento R28): Codex in una copia del repo con `CODEX_HOME` pulito (dentro solo `auth.json`: niente
  memorie, niente AGENTS globali, niente MCP), modello ed effort passati con `-c`. Ogni prompt contiene il diff
  `f1fefda..a6b2394` del perimetro e i file che importano quelli cambiati. Le fonti di Let's Donation sono copiate
  nella copia: trascrizione e riassunto della call, preventivo, brief inviato e tre note nostre. In testa a ogni log
  ci sono la `CODEX_HOME` usata e il suo elenco di file. La copia viene cancellata a fine giro.
- **Chiusure**: un verificatore Codex in sola lettura per perimetro rilegge su `a6b2394` ogni rilievo del giro 2
  dichiarato corretto (`verifica-delta*-esito.md`, una riga per rilievo).

Per i criteri senza titoli Jest, la «prova» è l'azione che il controllo statico verifica. Sono le frasi di
`scripts/verifica-android-play/testi-criteri.mjs`, copiate dal testo del contratto; per C47 sono i file delle azioni
nominate.

## Mappa

| revisore | n | destinazione | prova che lo farebbe fallire | nota |
|---|---|---|---|---|
| A-B-C | 1 | residuo: link falso durante il recupero | — | il verificatore PKCE si perde, si rifà il recupero; nessuna presa dell'account (A2) |
| A-B-C | 2 | C79 | «revoca» | B6, consenso marketing in due scritture |
| A-B-C | 3 | C79 | «futuro» | B7, `created_at` deciso dal server |
| A-B-C | 4 | C79 | «legacy_contacts» | B8, storico cancellato con l'account |
| A-B-C | 5 | residuo: purge spento | — | si chiude prima di accendere il purge (`deletionPolicy.ts:42`) |
| A-B-C | 6 | residuo: purge spento | — | si chiude prima di accendere il purge (`deletionPolicy.ts:42`) |
| A-B-C | 7 | residuo: respinto, scelta voluta | — | il server verifica prima del redirect (`useAuthDeepLink.ts:98-99`) |
| A-B-C | 8 | C60 | «delete-account: errore senza dettagli interni» | C1 |
| D | 1 | C82 | «userInterfaceStyle = 'light'» | tema scuro irraggiungibile |
| D | 2 | C82 | «userInterfaceStyle = 'light'» | tema scuro irraggiungibile |
| D | 3 | C64 | «lettore di schermo: Paese con il valore» | D-a |
| D | 4 | C64 | «lettore di schermo: pulsante in caricamento con nome e busy» | D-b |
| D | 5 | C65 | «errore d'invio annunciato: Accesso» | D-c, classe |
| D | 6 | C56 | «mappa: intestazione in colonna» | D-d = D4 |
| D | 7 | C58 | «testo multiriga: mai più largo del contenitore» | D-e, classe D6 |
| D | 8 | C66 | «campo paese: nome lungo non spinge fuori il simbolo» | D-f |
| D | 9 | C64 | «link in caricamento: attesa visibile e tocco ignorato» | D-g |
| D | 10 | C75 | «profilo: attesa visibile finché il profilo non arriva» | D-h |
| E | 1 | C73 | «OTA all'avvio: oltre il tempo massimo l'app è usabile» | E-1 |
| E | 2 | C74 | «modale partner: scheda entro la finestra a 600×300» | E-2 |
| F1 | 1 | C67 | «doppio invio: Accesso chiama una volta sola e si libera dopo l'errore» | F1-a, classe |
| F1 | 2 | C68 | «reset concluso: indietro non torna al reset» | F1-b, classe |
| F1 | 3 | C69 | «link di recupero fallito: la riapertura avvisa» | F1-c |
| F1 | 4 | C70 | «salvataggio parziale: dice cosa è salvato» | F1-d |
| F1 | 5 | residuo: bozza del profilo persa se la sessione si invalida | — | conservarla = dati personali in chiaro sul telefono; evento raro |
| F2 | 1 | C71 | «donorbox: rinuncia non salvata, avviso di nuovo e niente dati» | F2-a, privacy |
| F2 | 2 | C72 | «elimina account: uscita che rigetta = sessione residua, non errore» | F2-b |
| F2 | 3 | C73 | «OTA all'avvio: oltre il tempo massimo l'app è usabile» | F2-c = E-1 |
| F2 | 4 | C67 | «riavvio: un tocco solo» | F2-d |
| G | 1 | C63 (parte nostra) + fuori contratto (G4, catena dell'avvocato) | «via dei Fornaciai 17, 40129 Bologna» | segnaposto della sede tolti; il resto all'avvocato |
| G | 2 | fuori contratto: G5, base giuridica del codice di provenienza (avvocato) | — | il codice parte solo col consenso verificato (C91) |
| G | 3 | C61 | «auth.delete.confirmNow» | G6 |
| G | 4 | fuori contratto: G8, revoca del codice di provenienza (avvocato + LD) | — |  |
| G | 5 | C99 + fuori contratto (G8, inoltro a LD) | «Richieste di cancellazione da inoltrare» | procedura scritta; l'inoltro lo fa l'associazione |
| G | 6 | C62 | «export: contiene i riferimenti partner» | G7 |
| G | 7 | fuori contratto: rettifica del brief LD del 31/07 | — | R25, due punti oggi falsi |
| G | 8 | fuori contratto: integrazione con LD della call e del preventivo, non decisa | — | decisione del team aperta |
| G | 9 | fuori contratto: collaudo dell'attribuzione del codice con LD | — | R25, Riccardo + LD |
| G | 10 | C52 (app e documenti nostri) + fuori contratto (G2, profilo LD «Onlus») | «Rise Against Hunger Italia ETS» | il profilo su LD si corregge nel loro pannello |
| G | 11 | C61 | «avviso di uscita verso Let's Donation» | G9 |
| G | 12 | C80 | «answer/10281818» | G10 |
| architettura | 1 | C79 | «revoca» | B6 |
| architettura | 2 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 3 | residuo: rotte `[key: string]`, app-rise-v2 F0-bis | — | R24 |
| architettura | 4 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 5 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 6 | C84 + C90 | «consensi: risposta del vecchio account scartata»; «profilo: una risposta vecchia arrivata dopo una nuova non sovrascrive» |  |
| architettura | 7 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 8 | C77 | «visual-diff.test.tsx» | AR-3 |
| architettura | 9 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 10 | residuo: purge spento | — | si chiude prima di accendere il purge (`deletionPolicy.ts:42`) |
| architettura | 11 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 12 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 13 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 14 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 15 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 16 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 17 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 18 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 19 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 20 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 21 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 22 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 23 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 24 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 25 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 26 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 27 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 28 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 29 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 30 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 31 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 32 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 33 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 34 | residuo: app-rise-v2 F0-bis | — | inventario e misure del Perfect System, non difetti |
| architettura | 35 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 36 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 37 | C58 | «testo multiriga: containerWidth 0 resta spento a scala 2» | AR-1 |
| architettura | 38 | C76 | «immunity={true}» | AR-2; il resto dei flag va in F0-bis |
| architettura | 39 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 40 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 41 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 42 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| architettura | 43 | residuo: app-rise-v2 F0-bis | — | opzioni di piano, non difetti |
| architettura | 44 | residuo: app-rise-v2 F0-bis | — | opzioni di piano, non difetti |
| architettura | 45 | residuo: app-rise-v2 F0-bis | — | opzioni di piano, non difetti |
| giro2-abc | 1 | C85, corretto in d239d10 | «il profilo di A sparisce al passaggio a B, anche se quello di B non arriva» |  |
| giro2-abc | 2 | C98, corretto | «cancellazione riuscita e uscita fallita: l'app torna ospite» | R28 punto 11 |
| giro2-abc | 3 | C89, corretto | «cancellazione: errore ma account già eliminato → riuscita e uscita» |  |
| giro2-abc | 4 | C86, corretto in f5f2256 | «T16» |  |
| giro2-abc | 5 | residuo R24: purge spento | — | si chiude prima di accendere il purge (`deletionPolicy.ts:42`) |
| giro2-abc | 6 | residuo R24: purge spento | — | si chiude prima di accendere il purge (`deletionPolicy.ts:42`) |
| giro2-d | 1 | C93, corretto | «errore di campo annunciato all'invio: AuthInput» |  |
| giro2-d | 2 | C47 | «azione1-chiudi-come-donare» | il ritaglio del tocco non c'è (`TouchTargetHelper.kt:202`) |
| giro2-d | 3 | C47 | «azione2-home-scala-2» | classe del testo multiriga |
| giro2-d | 4 | C95, corretto | «profilo: data di nascita col selettore» |  |
| giro2-d | 5 | residuo: smentito | — | `hitSlop` dentro i limiti (`YogaLayoutableShadowNode.cpp:776`) |
| giro2-d | 6 | residuo: icona bianca accanto all'etichetta visibile | — | WCAG 1.4.11 non scatta; colore in app-rise-v2 |
| giro2-d | 7 | C94, corretto | «sfondo non è un controllo senza nome: Come Donare» | classe: tutti gli sfondi |
| giro2-e | 1 | C47 | «azione5-finestra» | R28 punto 20 |
| giro2-e | 2 | residuo R24: spazi congelati e immagine hero | — | app-rise-v2 F0-bis |
| giro2-e | 3 | C47 | «azione3-registrazione-tastiera» |  |
| giro2-e | 4 | C47 | «azione4-scheda-mappa» |  |
| giro2-f1 | 1 | C87, corretto | «profilo: cambio email già in attesa non si rimanda salvando altro» |  |
| giro2-f1 | 2 | C87, corretto | «profilo: confermata la nuova email, il campo segue l'account e Salva non chiama updateEmail» |  |
| giro2-f1 | 3 | residuo R24: bozza del profilo persa | — | la permanenza nel modulo è smentita: la guardia torna ad Account |
| giro2-f1 | 4 | C88, corretto | «reset nel cancello: Annulla torna al passaggio obbligatorio» |  |
| giro2-f2 | 1 | C87, corretto | «profilo: email in attesa scritta con le maiuscole, salvare altro non la rimanda» |  |
| giro2-f2 | 2 | C27, scelta voluta | «aggiornamento OTA: dentro la finestra ricarica subito» | R28 punto 21 |
| giro2-g | 1 | C99, corretto per la parte nostra + fuori contratto (pubblicazione: sede USA) | «URL del gate § 8» | gate § 8 di `rilascio.md` |
| giro2-g | 2 | C92, corretto | «avviso partner: testo nuovo mostrato anche a chi aveva visto il vecchio» |  |
| giro2-g | 3 | C91, corretto | «Let's Donation: consenso non verificato → nessun codice» |  |
| giro2-g | 4 | fuori contratto: G3, qualificazione del rapporto con LD (avvocato) | — |  |
| giro2-g | 5 | C99, corretto | «Richieste di cancellazione da inoltrare» | R28 punto 20 |
| giro2-g | 6 | fuori contratto: collaudo dell'attribuzione del codice con LD | — |  |
| giro2-g | 7 | fuori contratto: integrazione con LD prima del login unico, non decisa | — |  |
| giro2-g | 8 | fuori contratto: impegni della call legati al login unico, non deciso | — |  |
| giro2-g | 9 | fuori contratto: G2, profilo LD «Onlus» | — | app e documenti nostri già «ETS» (C52) |
| giro2-g | 10 | C99, corretto (marcatore nel gate) + fuori contratto (leva «PEC») | «da-validare» |  |
| giro2-g | 11 | C96, corretto | «scambio-dati-quadro.md» |  |
| giro2-arch | 1 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 2 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 3 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 4 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 5 | residuo R24: rotte `[key: string]` | — | app-rise-v2 F0-bis |
| giro2-arch | 6 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 7 | C90, corretto | «profilo: una risposta vecchia arrivata dopo una nuova non sovrascrive» |  |
| giro2-arch | 8 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 9 | residuo: consenso marketing scritto due volte | — | innesco: 0022 applicata in produzione, poi togliere la seconda scrittura |
| giro2-arch | 10 | residuo: suite SQL fuori dalla CI | — | innesco: prima di applicare la 0022 |
| giro2-arch | 11 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 12 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 13 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 14 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 15 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 16 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 17 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 18 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 19 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 20 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 21 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 22 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 23 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 24 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 25 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 26 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 27 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 28 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 29 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 30 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 31 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 32 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 33 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 34 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 35 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 36 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 37 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 38 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 39 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 40 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 41 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 42 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 43 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 44 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 45 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 46 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 47 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 48 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 49 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 50 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 51 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 52 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 53 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| giro2-arch | 54 | residuo: app-rise-v2 F0-bis | — | architettura per la crescita, non difetto di rilascio |
| difetti | D1 | C81 | «contrasto: «Home» sull’ombra del pulsante centrale (attiva: true)» |  |
| difetti | D2 | C81 | «contrasto: segnaposto in light» |  |
| difetti | D3 | C81 | «contrasto: prefisso nella lista dei paesi» |  |
| difetti | D4 | C56 | «mappa: intestazione in colonna» |  |
| difetti | D5 | C57 | «contrasto: anno nella scheda del paese» |  |
| difetti | D6 | C58 | «testo multiriga: in una riga con un'icona accanto si restringe» |  |
| difetti | D7 | C58 + C47 | «testo multiriga: mai più largo del contenitore»; «azione2-home-scala-2» | da ricontrollare sulla build |
