/*
 * «Riporta ai valori di partenza» della pagina /account — ambiente di TEST (goal
 * ld-ambiente-test). Il partner rifà le prove da capo senza chiederci niente.
 *
 * Nessun potere nuovo: la persona riscrive SOLO i suoi dati, con le stesse strade di
 * «I miei dati» (RLS di `profiles`, funzione `cambio-email-test` per il solo utente del
 * token). Cosa rimette a posto:
 *   - nome, cognome, nickname, paese dalla matrice `account-di-prova.json` (la stessa da cui
 *     `crea-account.mjs` ha creato gli account). I claim li riallinea il trigger della 0020;
 *   - l'email: quella della registrazione, che resta in `user_metadata.email` anche dopo un
 *     cambio (né la conferma né l'admin la toccano, visto il 6/11). Da lì si ricava anche
 *     quale account della matrice è (`+ldNN@`);
 *   - i consensi ai partner (tutti ritirati: la schermata di consenso ricompare);
 *   - le sessioni: uscita da tutti i dispositivi, comprese quelle aperte dal partner.
 * Un account cancellato (ld09) non si ripristina da qui: si registra di nuovo dalla pagina
 * di accesso con la stessa email, e riceve un `sub` nuovo.
 * Collegato da account.js con `RiseRipristino.collega(...)`. Mai innerHTML con dati.
 */
(function () {
  'use strict';

  var ctx = null; // { client, $, conErrori, utente(), quandoRipristinato() }
  var voce = null; // riga della matrice dell'utente, o null

  function emailOriginale(u) {
    var m = u && u.user_metadata && u.user_metadata.email;
    return typeof m === 'string' ? m.toLowerCase() : '';
  }

  // La matrice si legge a ogni caricamento: è piccola, ed è la fonte unica.
  async function trovaVoce(u) {
    var tag = /\+ld(\d{2})@/.exec(emailOriginale(u));
    if (!tag) return null;
    var r = await fetch('/assets/account-di-prova.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('matrice non leggibile (HTTP ' + r.status + ')');
    var matrice = await r.json();
    var n = Number(tag[1]);
    return (
      matrice.find(function (p) {
        return p.n === n;
      }) || null
    );
  }

  // Non è un account della matrice (es. +riccardo) → la sezione non compare. Se la matrice
  // non si legge, la sezione compare spenta col motivo: un guasto non deve sembrare «non serve».
  async function carica() {
    var esito = ctx.$('ripristino-esito');
    esito.textContent = '';
    ctx.$('ripristina').disabled = false;
    try {
      voce = await trovaVoce(ctx.utente());
      ctx.$('ripristino').hidden = !voce;
    } catch (e) {
      voce = null;
      ctx.$('ripristino').hidden = false;
      ctx.$('ripristina').disabled = true;
      esito.textContent = 'Ripristino non disponibile: ' + e.message;
    }
  }

  function passo(testo) {
    ctx.$('ripristino-esito').textContent = testo;
  }

  // L'utente si legge dal SERVER: quello dentro la sessione salvata resta all'email del
  // login anche dopo un cambio (visto 7/11: il ripristino saltava l'email credendola giusta).
  async function utenteFresco() {
    var u = await ctx.client.auth.getUser();
    return (u.data && u.data.user) || null;
  }

  async function riportaEmail(token, utente) {
    var originale = emailOriginale(utente);
    if ((utente.email || '').toLowerCase() === originale) return null;
    var r = await window.RiseMieiDati.chiamaFunzione(
      'cambio-email-test',
      token,
      {
        email: originale,
      }
    );
    if (!r.ok)
      return r.codice === 'email_exists'
        ? "L'email di partenza ora è di un altro account di prova: riporta prima quello."
        : 'Email non riportata: ' + r.codice;
    // Si controlla l'effetto, non la risposta.
    var dopo = await utenteFresco();
    return dopo && (dopo.email || '').toLowerCase() === originale
      ? null
      : 'Email non riportata: il server ha ancora ' +
          ((dopo && dopo.email) || '?');
  }

  async function riportaProfilo(id) {
    var voluto = {
      first_name: voce.first_name,
      last_name: voce.last_name,
      nickname: voce.nickname || null,
      country: voce.country || 'IT',
    };
    var attuale = await ctx.client
      .from('profiles')
      .select('first_name, last_name, nickname, country')
      .eq('id', id)
      .maybeSingle();
    if (attuale.error || !attuale.data)
      return 'Profilo non leggibile: ' + (attuale.error || {}).message;
    var patch = {};
    Object.keys(voluto).forEach(function (k) {
      if ((attuale.data[k] || null) !== voluto[k]) patch[k] = voluto[k];
    });
    if (Object.keys(patch).length === 0) return null;
    // `.select()` perché una UPDATE bloccata da RLS non dà errore: torna 0 righe.
    var res = await ctx.client
      .from('profiles')
      .update(patch)
      .eq('id', id)
      .select('id');
    if (res.error)
      return (res.error.message || '').indexOf('profiles_nickname_unico') !== -1
        ? 'Il nickname di partenza ora è di un altro account di prova: riporta prima quello.'
        : 'Profilo non riportato: ' + res.error.message;
    if (!res.data || res.data.length !== 1)
      return 'Profilo non riportato: nessuna riga aggiornata.';
    return null;
  }

  async function ritiraConsensi() {
    var elenco = await ctx.client.auth.oauth.listGrants();
    if (elenco.error) return 'Consensi non leggibili: ' + elenco.error.message;
    var voci = elenco.data || [];
    for (var i = 0; i < voci.length; i++) {
      var c = voci[i].client || {};
      var r = await ctx.client.auth.oauth.revokeGrant({
        clientId: c.id || c.client_id,
      });
      if (r.error) return 'Consenso non ritirato: ' + r.error.message;
    }
    return null;
  }

  async function ripristina() {
    var bottone = ctx.$('ripristina');
    bottone.disabled = true;
    try {
      var s = await ctx.client.auth.getSession();
      var sessione = s.data && s.data.session;
      var utente = sessione && (await utenteFresco());
      if (!utente || !voce || utente.id !== ctx.utente().id) {
        passo('Sessione cambiata: ricarica la pagina e riprova.');
        return;
      }
      // In quest'ordine: le scritture vogliono la sessione, che l'ultimo passo chiude.
      // Un passo che non riesce ferma tutto; rilanciare è sicuro (fa solo ciò che manca).
      passo('Riporto l’email…');
      var errore = await riportaEmail(sessione.access_token, utente);
      if (!errore) {
        passo('Riporto nome, cognome, nickname e paese…');
        errore = await riportaProfilo(utente.id);
      }
      if (!errore) {
        passo('Ritiro i consensi ai partner…');
        errore = await ritiraConsensi();
      }
      if (errore) {
        passo(errore);
        return;
      }
      passo('Chiudo tutte le sessioni…');
      var esci = await ctx.client.auth.signOut({ scope: 'global' });
      if (esci.error) {
        passo('Dati riportati, ma sessioni non chiuse: ' + esci.error.message);
        return;
      }
      ctx.quandoRipristinato();
    } finally {
      bottone.disabled = false;
    }
  }

  function collega(contesto) {
    ctx = contesto;
    ctx.$('ripristina').addEventListener('click', ctx.conErrori(ripristina));
  }

  window.RiseRipristino = { collega: collega, carica: carica };
})();
