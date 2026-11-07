/*
 * «Modifica i miei dati» della pagina /account — ambiente di TEST (goal ld-ambiente-test).
 * Serve al partner per simulare i cambi che una persona fa nell'app e vedere cosa gli
 * arriva al login successivo. Le scritture sono le stesse dell'app:
 *   - nome, cognome, nickname: `profiles` è la fonte (come `AuthContext.updateProfile`),
 *     poi la proiezione su `user_metadata` (name, preferred_username) da cui il server auth
 *     costruisce i claim. Dalla 0020 i claim li riallinea comunque un trigger;
 *   - email: nell'app `auth.updateUser({ email })` manda un link e il cambio vale dopo il
 *     clic. Sul test il link non arriverebbe (SMTP di base: solo indirizzi del team), quindi
 *     la funzione solo-test `cambio-email-test` fa la parte del clic, per il solo utente del
 *     token. `contact_email` la riallinea il trigger della 0013;
 *   - eliminazione: la Edge Function `delete-account`, col token di chi la chiede.
 * Collegato da account.js con `RiseMieiDati.collega(...)`. Mai innerHTML con dati.
 */
(function () {
  'use strict';

  // Allineati al CHECK `nickname_forma` (0017) e al nome dell'indice unico.
  var NICK_MIN = 2;
  var NICK_MAX = 30;
  var INDICE_NICKNAME = 'profiles_nickname_unico';

  var ctx = null; // { client, url, $, conErrori, utente(), quandoCambiaUtente(u), quandoEliminato() }
  var datiCorrenti = null;

  function occupato(form, si) {
    Array.prototype.forEach.call(
      form.querySelectorAll('button, input'),
      function (el) {
        el.disabled = si;
      }
    );
  }

  // ---- Nome, cognome, nickname --------------------------------------------

  async function carica() {
    var $ = ctx.$;
    $('email-nuova').value = '';
    $('dati-esito').textContent = '';
    $('email-esito').textContent = '';
    $('elimina-esito').textContent = '';
    $('elimina-conferma').hidden = true;
    var res = await ctx.client
      .from('profiles')
      .select('first_name, last_name, nickname')
      .eq('id', ctx.utente().id)
      .maybeSingle();
    if (res.error || !res.data) {
      datiCorrenti = null;
      occupato($('form-dati'), true);
      $('dati-esito').textContent = res.error
        ? 'Dati non disponibili: ' + res.error.message
        : 'Profilo non trovato.';
      return;
    }
    datiCorrenti = res.data;
    occupato($('form-dati'), false);
    $('dati-nome').value = res.data.first_name || '';
    $('dati-cognome').value = res.data.last_name || '';
    $('dati-nickname').value = res.data.nickname || '';
  }

  function modifiche() {
    var $ = ctx.$;
    var nome = $('dati-nome').value.trim();
    var cognome = $('dati-cognome').value.trim();
    var nick = $('dati-nickname').value.trim() || null;
    if (!nome || !cognome)
      return { errore: 'Nome e cognome sono obbligatori.' };
    if (nick !== null && (nick.length < NICK_MIN || nick.length > NICK_MAX)) {
      return {
        errore:
          'Il nickname va da ' + NICK_MIN + ' a ' + NICK_MAX + ' caratteri.',
      };
    }
    var patch = {};
    if (nome !== (datiCorrenti.first_name || '')) patch.first_name = nome;
    if (cognome !== (datiCorrenti.last_name || '')) patch.last_name = cognome;
    if (nick !== (datiCorrenti.nickname || null)) patch.nickname = nick;
    return { patch: patch };
  }

  async function salvaDati(ev) {
    ev.preventDefault();
    var $ = ctx.$;
    var esito = $('dati-esito');
    if (!datiCorrenti) return;
    var m = modifiche();
    if (m.errore) {
      esito.textContent = m.errore;
      return;
    }
    if (Object.keys(m.patch).length === 0) {
      esito.textContent = 'Nessuna modifica da salvare.';
      return;
    }
    occupato($('form-dati'), true);
    esito.textContent = 'Salvo…';
    try {
      // Controllo di cortesia, come nell'app: l'indice unico resta la difesa vera.
      if (m.patch.nickname) {
        var libero = await ctx.client.rpc('nickname_disponibile', {
          p_nickname: m.patch.nickname,
        });
        if (!libero.error && libero.data === false) {
          esito.textContent = 'Questo nickname è già di un altro account.';
          return;
        }
      }
      // `.select()` perché una UPDATE bloccata da RLS non dà errore: torna 0 righe.
      var res = await ctx.client
        .from('profiles')
        .update(m.patch)
        .eq('id', ctx.utente().id)
        .select('first_name, last_name, nickname');
      if (res.error) {
        esito.textContent =
          (res.error.message || '').indexOf(INDICE_NICKNAME) !== -1
            ? 'Questo nickname è già di un altro account. Non è stato salvato niente.'
            : 'Non salvato: ' + res.error.message;
        return;
      }
      if (!res.data || res.data.length !== 1) {
        esito.textContent = 'Non salvato: nessuna riga aggiornata.';
        return;
      }
      datiCorrenti = res.data[0];
      // Proiezione su user_metadata, come `syncDisplayNameClaim` / `syncNicknameClaim`.
      var meta = {};
      if ('first_name' in m.patch || 'last_name' in m.patch) {
        meta.name = (
          datiCorrenti.first_name +
          ' ' +
          datiCorrenti.last_name
        ).trim();
      }
      if ('nickname' in m.patch)
        meta.preferred_username = datiCorrenti.nickname;
      var proiezione = await ctx.client.auth.updateUser({ data: meta });
      esito.textContent = proiezione.error
        ? 'Salvato. (Allineamento dei metadati non riuscito: ci pensa il database.)'
        : 'Salvato. Il partner vede i dati nuovi al prossimo accesso.';
    } finally {
      occupato($('form-dati'), false);
    }
  }

  // ---- Email dell'account --------------------------------------------------

  // Chiamata diretta a una funzione del progetto, col token di chi agisce. Non passa da
  // `functions.invoke` perché la libreria aggiunge le intestazioni `apikey` e `x-client-info`,
  // che il CORS di delete-account (pensata per l'app, dove il CORS non esiste) non dichiara:
  // il browser bloccherebbe la richiesta prima di partire (visto in console il 6/11).
  // Una rete che cade non solleva: torna come esito non riuscito, da riconciliare.
  async function chiamaFunzione(nome, token, corpo) {
    try {
      var r = await fetch(ctx.url + '/functions/v1/' + nome, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(corpo),
      });
      var dati = await r.json().catch(function () {
        return null;
      });
      return { ok: r.ok, codice: (dati && dati.error) || 'HTTP ' + r.status };
    } catch (e) {
      return { ok: false, codice: e.message };
    }
  }

  function messaggioEmail(codice) {
    if (codice === 'email_exists')
      return 'Questa email è già usata da un altro account.';
    if (codice === 'email_non_valida') return 'Email non valida.';
    return 'Non cambiata: ' + codice;
  }

  async function cambiaEmail(ev) {
    ev.preventDefault();
    var $ = ctx.$;
    var esito = $('email-esito');
    var nuova = $('email-nuova').value.trim().toLowerCase();
    if (nuova === (ctx.utente().email || '').toLowerCase()) {
      esito.textContent = 'È già la tua email.';
      return;
    }
    occupato($('form-email'), true);
    esito.textContent = 'Cambio…';
    try {
      var s = await ctx.client.auth.getSession();
      var sessione = s.data && s.data.session;
      if (!sessione) {
        esito.textContent = 'Sessione scaduta: accedi di nuovo.';
        return;
      }
      // Nell'app qui parte il link di conferma (`updateUser({ email })`); sul test la
      // funzione cambio-email-test fa la parte del clic, solo per l'utente del token.
      var r = await chiamaFunzione('cambio-email-test', sessione.access_token, {
        email: nuova,
      });
      if (!r.ok) {
        esito.textContent = messaggioEmail(r.codice);
        return;
      }
      var u = await ctx.client.auth.getUser();
      if (u.data && u.data.user) ctx.quandoCambiaUtente(u.data.user);
      $('email-nuova').value = '';
      esito.textContent =
        'Email cambiata. Il partner la vede al prossimo accesso, con lo stesso identificativo (sub).';
    } finally {
      occupato($('form-email'), false);
    }
  }

  // ---- Elimina l'account ---------------------------------------------------

  // Se la libreria non riesce a chiudere la sessione di un utente che non esiste più,
  // la si toglie dallo storage con la chiave predefinita di supabase-js.
  async function chiudiSessioneLocale() {
    var client = ctx.client;
    await client.auth.signOut({ scope: 'local' }).catch(function () {});
    var s = await client.auth.getSession();
    if (s.data && s.data.session) {
      try {
        window.localStorage.removeItem(client.auth.storageKey);
      } catch (e) {
        /* storage non disponibile: la sessione scade da sola */
      }
    }
  }

  function bottoniElimina(spenti) {
    ['elimina-si', 'elimina-no'].forEach(function (id) {
      ctx.$(id).disabled = spenti;
    });
  }

  async function elimina() {
    var esito = ctx.$('elimina-esito');
    esito.textContent = '';
    bottoniElimina(true);
    try {
      var s = await ctx.client.auth.getSession();
      var sessione = s.data && s.data.session;
      if (!sessione || sessione.user.id !== ctx.utente().id) {
        esito.textContent = 'Sessione cambiata: ricarica la pagina e riprova.';
        return;
      }
      var token = sessione.access_token;
      var r = await chiamaFunzione('delete-account', token, {});
      if (!r.ok) {
        // La risposta può perdersi DOPO la cancellazione: lo si chiede al server.
        var verifica = await ctx.client.auth.getUser(token);
        var eliminato =
          verifica.error && verifica.error.code === 'user_not_found';
        if (!eliminato) {
          esito.textContent = 'Eliminazione non riuscita: ' + r.codice;
          return;
        }
      }
      await chiudiSessioneLocale();
      ctx.quandoEliminato();
    } finally {
      bottoniElimina(false);
    }
  }

  // ---- Collegamento --------------------------------------------------------

  function collega(contesto) {
    ctx = contesto;
    var $ = ctx.$;
    $('form-dati').addEventListener('submit', ctx.conErrori(salvaDati));
    $('form-email').addEventListener('submit', ctx.conErrori(cambiaEmail));
    $('elimina').addEventListener('click', function () {
      $('elimina-conferma').hidden = false;
    });
    $('elimina-no').addEventListener('click', function () {
      $('elimina-conferma').hidden = true;
    });
    $('elimina-si').addEventListener('click', ctx.conErrori(elimina));
  }

  window.RiseMieiDati = {
    collega: collega,
    carica: carica,
    chiamaFunzione: chiamaFunzione, // usata anche da ripristino.js
  };
})();
