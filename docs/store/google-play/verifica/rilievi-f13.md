# Rilievi di F13: dove va ogni riga

Criterio C83 del contratto `android-play` (U4: «controlla più volte»). Ogni riga delle tabelle dei revisori ha una
destinazione: un criterio Cn, con il titolo del test o l'azione che lo farebbe fallire; un residuo dichiarato; oppure
una voce del Fuori contratto. Le righe sono numerate come le conta il verificatore (`righeTabella`: righe di dati,
intestazioni escluse). Nella cartella `f13/` ci sono le stesse righe senza il testo dei revisori: gravità, `file:riga`
del repo e destinazione.

Revisione del delta su `b807ddd` (da `f1fefda`): è lo sha che il verificatore confronta con l'ultimo commit del codice.

## Come sono stati fatti i giri

- **Giro 1** (23-24/10): Codex `gpt-6-astra` con effort xhigh, in sola lettura, su `63352bc`, a sette perimetri
  (A-B-C, D, E, F1, F2, G, architettura). In più i difetti D1-D7, trovati da Claude sull'emulatore.
- **Giro 2** (25/10): stessi prompt, su `f1fefda`. **Non era cieco sulle note private**: il log del perimetro G mostra
  letture delle memorie di Codex e delle note di Claude (`giro2-g.log:137,1210,1218-1219`). Per questo ogni suo
  rilievo è stato riverificato alla fonte: quattro verificatori Codex in sola lettura (`verifica2-*-esito.md`) e poi
  il giudizio di Claude, riga per riga.
- **Delta** (emendamento R28): Codex in una copia del repo con `CODEX_HOME` pulito (dentro solo `auth.json`: niente
  memorie, niente AGENTS globali, niente MCP), modello ed effort passati con `-c`. Ogni prompt contiene il diff
  `f1fefda..<sha del giro>` del perimetro e i file che importano quelli cambiati. Le fonti di Let's Donation sono
  copiate nella copia: trascrizione e riassunto della call, preventivo, brief inviato e tre note nostre. In testa a
  ogni log ci sono la `CODEX_HOME` usata e il suo elenco di file. La copia viene cancellata a fine giro.
  Due giri validi: il primo il 30/10 su `9ec314f`, il secondo il 4/11 su `9b84388`. Un primo tentativo del 29/10 è
  nullo: i revisori non hanno letto nessun file, e i suoi esiti sono fuori da questa mappa.
- **Revisione delle correzioni** (`delta3-fix`, `delta4-fix`, `delta5-fix`): le correzioni del secondo giro toccano
  la cancellazione dell'account e i dati che partono verso i partner, quindi chi le ha scritte non le certifica. Un
  solo revisore Codex per giro, con le stesse regole del delta; ogni giro rilegge le correzioni del precedente:
  `delta3-fix` su `9b84388..e00f18c` (5/11), `delta4-fix` su `e00f18c..10a0d2e` e `delta5-fix` su
  `10a0d2e..b807ddd` (6/11). L'ultimo non ha trovato nulla di bloccante: i suoi tre rilievi minori restano residui
  dichiarati (un'altra correzione avrebbe chiesto un altro giro). Le righe hanno una destinazione come le altre.
- **Chiusure**: un verificatore Codex in sola lettura per perimetro rilegge ogni rilievo del giro 2 dichiarato
  corretto (`verifica-delta*-esito.md`, una riga per rilievo).

## Decisioni di Riccardo

Il contratto ammette al massimo due giri del delta: ciò che resta aperto dopo il secondo è una decisione di Riccardo.
Nella mappa queste righe sono «fuori contratto: decisione di Riccardo», col motivo nella nota. Le chiusure trovate
corrette solo in parte sono queste tre:

- **Cancellazione che il server completa dopo la verifica** (chiusura A-B-C 3, C89): se alla verifica l'account
  esiste ancora e sparisce subito dopo, l'app non esce da sola (`accountActions.ts`, secondo il verificatore). Da
  decidere: tenere così, perché serve che il server finisca nei pochi secondi fra la verifica e la risposta, oppure
  aggiungere un secondo controllo.
- **Salvataggio del profilo e lettura partita prima** (chiusura architettura 7, C90): fra due letture vince la più
  recente; una lettura partita prima di un salvataggio può ancora arrivare fra il salvataggio e la rilettura che lo
  segue (`AuthContext.tsx`, secondo il verificatore). Da decidere: tenere così, perché la rilettura rimette il dato
  giusto, oppure invalidare le letture all'inizio del salvataggio.
- **Revoca del codice e inoltro ai partner** (chiusura G 5, C99, insieme alla riga G 2 del secondo giro): l'inoltro
  manuale entro un mese è scritto (`rilascio.md`, § «Chi fa cosa»); mancano la procedura di revoca del solo codice
  con l'account attivo, chi assegna i riscontri dei partner e cosa vuol dire l'anonimizzazione di Let's Donation. Il
  testo per la consulente lo dice già (§ «Consulente», punto 1).

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
| delta1-abc | 1 | C97, corretto | «elimina account nel cancello: al cambio di account si torna al passaggio obbligatorio e non si cancella» | guardia valida dopo lo smontaggio, 515d57a: `legataDopoLoSmontaggio.test.tsx`, `azioniDopoLoSmontaggio.test.tsx` |
| delta1-abc | 2 | C90, corretto | «consensi: una lettura partita prima dell'accettazione non riapre il cancello» | accettazione legata a chi l'ha data, 515d57a: `consensoDiAltroAccount.test.tsx` |
| delta1-abc | 3 | C85, corretto | «sessione già di B mentre il render è ancora di A: nessun link si apre» | controllo della sessione dopo l'ultima attesa, 515d57a: `partnerSessioneCambiataDopoLoStorage.test.tsx` |
| delta1-abc | 4 | C79, corretto | «nessun evento `marketing` → `false`» | T4 riparte da un dato davvero discordante, ef52875: fixture a trigger spenti, poi riallineamento |
| delta1-arch | 1 | C90, corretto | «consensi: una lettura partita prima dell'accettazione non riapre il cancello» | accettazione legata a chi l'ha data, 515d57a: `consensoDiAltroAccount.test.tsx` |
| delta1-arch | 2 | C97, corretto | «elimina account nel cancello: al cambio di account si torna al passaggio obbligatorio e non si cancella» | guardia valida dopo lo smontaggio, 515d57a: `legataDopoLoSmontaggio.test.tsx`, `azioniDopoLoSmontaggio.test.tsx` |
| delta1-arch | 3 | C85, corretto | «sessione già di B mentre il render è ancora di A: nessun link si apre» | controllo della sessione dopo l'ultima attesa, 515d57a: `partnerSessioneCambiataDopoLoStorage.test.tsx` |
| delta1-arch | 4 | residuo: cancellazione di A riuscita mentre entra B, poi corretto in 6fc41d4 (U5 del delta 2) | — | solo l'account eliminato esce: `eliminazioneDuranteCambioAccount.test.ts` |
| delta1-arch | 5 | C79, corretto | «nessun evento `marketing` → `false`» | T4 riparte da un dato davvero discordante, ef52875: fixture a trigger spenti, poi riallineamento |
| delta1-d | 1 | C87, corretto | «profilo: Rimanda il link chiama resend email_change con l'email dell'account» | messaggio senza limite di righe, 515d57a: `rinvioEmailTestoIntero.test.tsx` |
| delta1-d | 2 | C87, corretto | «profilo: Rimanda il link chiama resend email_change con l'email dell'account» | annuncio su iOS, 515d57a: `rinvioEmailAnnunciato.test.tsx` |
| delta1-f1 | 1 | C97, corretto | «elimina account nel cancello: al cambio di account si torna al passaggio obbligatorio e non si cancella» | guardia valida dopo lo smontaggio, 515d57a: `legataDopoLoSmontaggio.test.tsx`, `azioniDopoLoSmontaggio.test.tsx` |
| delta1-f1 | 2 | C90, corretto | «profilo: una risposta vecchia arrivata dopo una nuova non sovrascrive» | lettura di chi è uscito fuori dal contatore, 515d57a: `profiloDiAltroUtente.test.tsx` |
| delta1-f2 | 1 | C97, corretto | «elimina account nel cancello: al cambio di account si torna al passaggio obbligatorio e non si cancella» | guardia valida dopo lo smontaggio, 515d57a: `legataDopoLoSmontaggio.test.tsx`, `azioniDopoLoSmontaggio.test.tsx` |
| delta1-f2 | 2 | C90, corretto | «consensi: una lettura partita prima dell'accettazione non riapre il cancello» | accettazione legata a chi l'ha data, 515d57a: `consensoDiAltroAccount.test.tsx` |
| delta1-f2 | 3 | C92, corretto | «avviso partner: testo nuovo mostrato anche a chi aveva visto il vecchio» | avviso anche per chi ha rinunciato ai dati, se il codice parte, 515d57a: `avvisoSoloCodice.test.tsx` |
| delta1-g | 1 | C90, corretto | «consensi: una lettura partita prima dell'accettazione non riapre il cancello» | accettazione legata a chi l'ha data, 515d57a: `consensoDiAltroAccount.test.tsx` |
| delta1-g | 2 | C85, corretto | «sessione già di B mentre il render è ancora di A: nessun link si apre» | controllo della sessione dopo l'ultima attesa, 515d57a: `partnerSessioneCambiataDopoLoStorage.test.tsx` |
| delta1-g | 3 | C92, corretto | «avviso partner: testo nuovo mostrato anche a chi aveva visto il vecchio» | frase condizionale it/en, 515d57a: restringe ciò che si dichiara, stessa chiave `_v2` |
| delta2-abc | 1 | C97, corretto in 74b7c42 | «elimina account nel cancello: al cambio di account si torna al passaggio obbligatorio e non si cancella» | guardia che legge sempre chi è collegato adesso, 74b7c42: `schermateLegateAllUtente.test.tsx`, `profiloSalvataggioLegato.test.tsx` |
| delta2-abc | 2 | C85, corretto in ef8d27f | «sessione già di B mentre il render è ancora di A: nessun link si apre» | lettura del codice filtrata su `user_id`, ef8d27f + a63d43b: `partnerRefService.test.ts` (sessione che passa a B dopo il controllo) |
| delta2-abc | 3 | C92, corretto in ef8d27f + e7a0248 | «avviso partner: testo nuovo mostrato anche a chi aveva visto il vecchio» | avviso anche col solo codice, che non segna visto né cancella la rinuncia, ef8d27f + e7a0248: `avvisoSoloCodice.test.tsx`, `avvisoSoloCodiceNonConsuma.test.tsx` |
| delta2-arch | 1 | C97, corretto in 74b7c42 | «elimina account nel cancello: al cambio di account si torna al passaggio obbligatorio e non si cancella» | guardia che legge sempre chi è collegato adesso, 74b7c42: `schermateLegateAllUtente.test.tsx`, `profiloSalvataggioLegato.test.tsx` |
| delta2-arch | 2 | C98, corretto in 6fc41d4 | «cancellazione riuscita e uscita fallita: l'app torna ospite» | solo l'account eliminato esce e si pulisce, 6fc41d4: `eliminazioneDuranteCambioAccount.test.ts`, `eliminazioneStatoDiB.test.tsx` |
| delta2-arch | 3 | fuori contratto: decisione di Riccardo: account eliminato che rientra da `getSession` al cambio lingua | — | solo dopo un doppio guasto (uscita fallita e pulizia fallita) |
| delta2-arch | 4 | C92, corretto in ef8d27f + e7a0248 | «avviso partner: testo nuovo mostrato anche a chi aveva visto il vecchio» | avviso anche col solo codice, che non segna visto né cancella la rinuncia, ef8d27f + e7a0248: `avvisoSoloCodice.test.tsx`, `avvisoSoloCodiceNonConsuma.test.tsx` |
| delta2-arch | 5 | C47 + fuori contratto: decisione di Riccardo: `fit` dei numeri riduce il testo ingrandito | «azione2-home-scala-2» | prova sul nativo in F12 con scala 2,0, poi decisione |
| delta2-f1 | 1 | C97, corretto in 74b7c42 | «elimina account nel cancello: al cambio di account si torna al passaggio obbligatorio e non si cancella» | guardia che legge sempre chi è collegato adesso, 74b7c42: `schermateLegateAllUtente.test.tsx`, `profiloSalvataggioLegato.test.tsx` |
| delta2-f1 | 2 | fuori contratto: decisione di Riccardo: `popTo('Account')` chiude anche il recupero aperto dal link di B | — | raro: serve il link di recupero di B aperto mentre A modifica il profilo; B riapre il link |
| delta2-f2 | 1 | C98, corretto in 6fc41d4 | «cancellazione riuscita e uscita fallita: l'app torna ospite» | solo l'account eliminato esce e si pulisce, 6fc41d4: `eliminazioneDuranteCambioAccount.test.ts`, `eliminazioneStatoDiB.test.tsx` |
| delta2-f2 | 2 | C85, corretto in 25b1aca | «sessione già di B mentre il render è ancora di A: nessun link si apre» | errore di `getSession` ≠ cambio account, messaggio it/en: `uscitaPartnerAccountNonVerificato.test.tsx` |
| delta2-f2 | 3 | C92, corretto in ef8d27f + e7a0248 | «avviso partner: testo nuovo mostrato anche a chi aveva visto il vecchio» | avviso anche col solo codice, che non segna visto né cancella la rinuncia, ef8d27f + e7a0248: `avvisoSoloCodice.test.tsx`, `avvisoSoloCodiceNonConsuma.test.tsx` |
| delta2-f2 | 4 | fuori contratto: decisione di Riccardo: rinvio email con 429, la libreria butta il verificatore PKCE | — | dentro supabase-js: il rinvio si rifà dopo l'attesa |
| delta2-g | 1 | C92, corretto in ef8d27f + e7a0248 | «avviso partner: testo nuovo mostrato anche a chi aveva visto il vecchio» | avviso anche col solo codice, che non segna visto né cancella la rinuncia, ef8d27f + e7a0248: `avvisoSoloCodice.test.tsx`, `avvisoSoloCodiceNonConsuma.test.tsx` |
| delta2-g | 2 | C99, testo per la consulente corretto in e00f18c + fuori contratto: decisione di Riccardo (procedura di revoca con account attivo, G8) | «Richieste di cancellazione da inoltrare» | revoca del solo codice «ancora da attivare»: oggi nessuno la riceve, le uscite portano lo stesso codice |
| delta2-g | 3 | C92, corretto in 9a448e1 | «avviso partner: testo nuovo mostrato anche a chi aveva visto il vecchio» | motivazione di `play-console-risposte.md` riscritta: il codice di Donorbox parte anche senza nome ed email, dopo l'avviso |
| delta2-g | 4 | C99, corretto in 9a448e1 | «da-validare» | il gate cerca la classe `da-validare`, non il selettore CSS |
| delta3-fix | 1 | fuori contratto: decisione di Riccardo: B entra fra la lettura della sessione e l'uscita dopo la cancellazione di A | — | finestra di pochi passaggi: la coda interna di auth-js serializza le operazioni; renderle indivisibili chiede il lock privato della libreria; effetto peggiore: B esce e rientra, nessun dato esposto. ACCETTATO da Riccardo il 6/11 (in chat, sul consiglio di tenerlo così) |
| delta3-fix | 2 | residuo dichiarato (correzione con test nuovo, fuori dai titoli del contratto congelato): corretto in 3d3a9c1 | «cancellazione di A fallita mentre entra B già eliminato altrove: A NON risulta eliminato» | classe di C89 e C98; verifica con `getUser(token di A)`: `eliminazioneDuranteCambioAccount.test.ts`, `eliminazioneRiconciliata.test.tsx` |
| delta3-fix | 3 | residuo dichiarato (testo di un documento, nessun titolo del contratto lo prova): corretto in 10a0d2e | testo riletto dopo la correzione | classe di C92; `play-console-risposte.md`: l'avviso del solo codice ricompare finché manca il profilo |
| delta3-fix | 4 | residuo dichiarato (correzione con test nuovo, fuori dai titoli del contratto congelato): corretto in 10a0d2e | «il tocco dopo, col rinnovo riuscito, esce davvero col codice di A» | classe di C85; primo tocco controllato; il caso senza cambio account marcato come controllo positivo |
| delta3-fix | 5 | residuo dichiarato (correzione con test nuovo, fuori dai titoli del contratto congelato): corretto in 10a0d2e | «parte il solo codice: nell’avviso Donorbox non c’è «Continua senza i miei dati»» | classe di C92; `ActionButtonsAvvisoSoloCodice.test.tsx`, modale vera + controllo positivo |
| delta3-fix | 6 | residuo dichiarato (correzione con test nuovo, fuori dai titoli del contratto congelato): corretto in 10a0d2e | «il messaggio c’è in italiano e in inglese, ed è diverso nelle due lingue» | classe di C85; dizionari letti senza fallback |
| delta4-fix | 1 | residuo dichiarato (correzione con test nuovo, fuori dai titoli del contratto congelato): corretto in 0960a38 | «B entra fra la lettura del token di A e la chiamata: il server cancella A, non B» | classe di C89; `invoke` col token di A esplicito, senza token non parte (functions-js 2.108.2: header della chiamata in testa) |
| delta4-fix | 2 | residuo dichiarato (testo di un documento, nessun titolo del contratto lo prova): corretto in b807ddd | testo riletto dopo la correzione | classe di C92; `play-console-risposte.md`: l'avviso del solo codice compare finché quello completo non è stato visto |
| delta4-fix | 3 | residuo dichiarato (correzione con test nuovo, fuori dai titoli del contratto congelato): corretto in 0960a38 | «chiamata fallita senza cancellare A mentre entra B: A è ancora presente, si dice «non riuscito»» | classe di C89; errore non di rete + `getUser('token-A')`; spie azzerate |
| delta4-fix | 4 | residuo dichiarato, nessuna correzione: commit di soli test, il codice provato è lo stesso in e00f18c e 10a0d2e | — | la prova che distinguono è il mutante sul codice che proteggono (giro 3, uno per test) |
| delta5-fix | 1 | residuo: diagnostica persa quando il token di A non si legge (SecureStore rigetta o sessione già di B) | — | la cancellazione non parte e la persona riprova: nessun danno; manca solo la causa nel rapporto (`accountActions.ts:178` esce prima di `registraEsitoAccount`); innesco: primo aggiornamento dopo l'invio |
| delta5-fix | 2 | residuo: testo di `play-console-risposte.md:174` dice «visto», il codice vuole «confermato e salvato» | — | il comportamento vero è più prudente del testo (l'avviso compare più spesso, non meno: `usePartnerExit.ts:293-301`); innesco: primo aggiornamento dopo l'invio, insieme al rilievo 1 |
| delta5-fix | 3 | residuo dichiarato, nessuna correzione: i 3 test aggiornati in 0960a38 coprono comportamenti di prima | — | il vincolo nuovo lo provano `eliminazioneDuranteCambioAccount.test.ts:123,185` e `deleteAccount.test.tsx:164`, riconosciuti dal revisore stesso; mutanti 3/3 nel giro 4 |
| difetti | D1 | C81 | «contrasto: «Home» sull’ombra del pulsante centrale (attiva: true)» |  |
| difetti | D2 | C81 | «contrasto: segnaposto in light» |  |
| difetti | D3 | C81 | «contrasto: prefisso nella lista dei paesi» |  |
| difetti | D4 | C56 | «mappa: intestazione in colonna» |  |
| difetti | D5 | C57 | «contrasto: anno nella scheda del paese» |  |
| difetti | D6 | C58 | «testo multiriga: in una riga con un'icona accanto si restringe» |  |
| difetti | D7 | C58 + C47 | «testo multiriga: mai più largo del contenitore»; «azione2-home-scala-2» | da ricontrollare sulla build |
