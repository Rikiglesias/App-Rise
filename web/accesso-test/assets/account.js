/*
 * Pagina /account del login unico Rise — ambiente di TEST (goal ld-ambiente-test).
 * Serve al tecnico del partner per ripetere le prove:
 *   - «I miei dati», email, eliminazione: in miei-dati.js (le scritture dell'app);
 *   - «Esci»: cambiare utente di prova (se il consenso c'è già, /oauth/consent rimanda
 *     subito al partner con l'utente della sessione, senza mostrare nulla);
 *   - «Revoca»: ritirare il consenso dato a un partner, per rivedere la schermata di
 *     consenso al prossimo accesso (supabase-js auth.oauth.listGrants / revokeGrant).
 * Mai innerHTML con dati: tutto passa da textContent.
 */
(function () {
  'use strict';

  var cfg = window.RISE_ACCESSO_CONFIG || {};
  var client = null;
  var utente = null;

  function $(id) {
    return document.getElementById(id);
  }

  function mostra(id) {
    ['carica', 'errore', 'accedi', 'profilo'].forEach(function (v) {
      $(v).hidden = v !== id;
    });
  }

  function errore(testo) {
    $('errore-testo').textContent = testo;
    mostra('errore');
  }

  // Dopo «Esci» o l'eliminazione: la password dell'utente precedente non resta nel campo.
  function tornaAlLogin(nota) {
    utente = null;
    $('accedi-password').value = '';
    $('accedi-nota').textContent = nota;
    mostra('accedi');
  }

  function conErrori(fn) {
    return function (ev) {
      fn(ev).catch(function (e) {
        errore('Qualcosa non ha funzionato: ' + e.message);
      });
    };
  }

  async function avvia() {
    mostra('carica');
    var u = await client.auth.getUser();
    if (u.error || !u.data.user) return mostra('accedi');
    utente = u.data.user;
    $('chi').textContent = utente.email || '';
    await window.RiseMieiDati.carica();
    await caricaConsensi();
    mostra('profilo');
  }

  async function caricaConsensi() {
    var lista = $('consensi');
    lista.replaceChildren();
    var res = await client.auth.oauth.listGrants();
    if (res.error) {
      $('consensi-esito').textContent =
        'Elenco non disponibile: ' + res.error.message;
      return;
    }
    var voci = res.data || [];
    $('consensi-esito').textContent = voci.length
      ? ''
      : 'Nessun partner autorizzato.';
    voci.forEach(function (g) {
      var c = g.client || {};
      var li = document.createElement('li');
      var nome = document.createElement('span');
      nome.textContent = (c.name || c.client_name || 'Partner') + ' ';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'secondario';
      btn.textContent = 'Revoca';
      btn.addEventListener('click', function () {
        revoca(c.id || c.client_id);
      });
      li.appendChild(nome);
      li.appendChild(btn);
      lista.appendChild(li);
    });
  }

  async function revoca(clientId) {
    if (!clientId) return;
    var res = await client.auth.oauth.revokeGrant({ clientId: clientId });
    if (res.error) {
      $('consensi-esito').textContent =
        'Revoca non riuscita: ' + res.error.message;
      return;
    }
    await caricaConsensi();
    $('consensi-esito').textContent =
      'Consenso ritirato: al prossimo accesso dal partner la schermata ricompare.';
  }

  async function accedi(ev) {
    ev.preventDefault();
    $('accedi-errore').textContent = '';
    $('accedi-nota').textContent = '';
    var res = await client.auth.signInWithPassword({
      email: $('accedi-email').value.trim(),
      password: $('accedi-password').value,
    });
    if (res.error) {
      $('accedi-errore').textContent =
        res.error.message === 'Invalid login credentials'
          ? 'Email o password non corrette.'
          : res.error.message;
      return;
    }
    await avvia();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (
      !window.supabase ||
      !window.RiseMieiDati ||
      !cfg.url ||
      !cfg.publishableKey
    ) {
      return errore('Pagina non configurata (manca config.js).');
    }
    client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    window.RiseMieiDati.collega({
      client: client,
      url: cfg.url,
      $: $,
      conErrori: conErrori,
      utente: function () {
        return utente;
      },
      quandoCambiaUtente: function (u) {
        utente = u;
        $('chi').textContent = u.email || '';
      },
      quandoEliminato: function () {
        tornaAlLogin(
          'Account eliminato. Da qui non si entra più con quella email.'
        );
      },
    });
    $('form-accedi').addEventListener('submit', conErrori(accedi));
    $('esci').addEventListener('click', async function () {
      await client.auth.signOut();
      tornaAlLogin('');
    });
    avvia().catch(function (e) {
      errore('Qualcosa non ha funzionato: ' + e.message);
    });
  });
})();
