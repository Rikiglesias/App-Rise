/*
 * Pagina /account del login unico Rise — ambiente di TEST (goal ld-ambiente-test).
 * Serve al tecnico del partner per ripetere le prove:
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

  async function avvia() {
    mostra('carica');
    var u = await client.auth.getUser();
    if (u.error || !u.data.user) return mostra('accedi');
    $('chi').textContent = u.data.user.email || '';
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
    avvia();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.supabase || !cfg.url || !cfg.publishableKey) {
      return errore('Pagina non configurata (manca config.js).');
    }
    client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    $('form-accedi').addEventListener('submit', accedi);
    $('esci').addEventListener('click', async function () {
      await client.auth.signOut();
      mostra('accedi');
    });
    avvia().catch(function (e) {
      errore('Qualcosa non ha funzionato: ' + e.message);
    });
  });
})();
