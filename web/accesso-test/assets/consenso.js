/*
 * Pagina di accesso e consenso del login unico Rise (OAuth 2.1 / OIDC su Supabase).
 * Ambiente di TEST per Let's Donation (goal ld-ambiente-test, F3c).
 *
 * Il server di autorizzazione è Supabase Auth: qui si fa solo ciò che Supabase NON
 * ospita — riconoscere la persona e chiederle se vuole passare i suoi dati al partner.
 * Flusso (docs supabase.com/docs/guides/auth/oauth-server/getting-started, «React (SPA)»):
 *   1. arriva `?authorization_id=…` da /auth/v1/oauth/authorize;
 *   2. senza sessione → accesso o registrazione (stesse chiavi dell'app:
 *      src/shared/auth/useEmailConfirmation.ts, signUp);
 *   3. getAuthorizationDetails → se il consenso c'è già, Supabase dà subito redirect_url;
 *   4. altrimenti si mostra chi chiede cosa, e approve/deny.
 * Mai innerHTML con dati: tutto passa da textContent.
 */
(function () {
  'use strict';

  var cfg = window.RISE_ACCESSO_CONFIG || {};
  var ETA_MINIMA = 14; // vincolo anche nel database: migration 0019, check su birth_date
  var SCOPE = {
    openid: 'chi sei su Rise (un codice che non cambia)',
    email: 'il tuo indirizzo email e se è stato verificato',
    profile: 'nome, cognome e nickname',
    phone: 'il tuo numero di telefono',
  };
  var ERRORI = {
    'Invalid login credentials': 'Email o password non corrette.',
    'Email not confirmed':
      'Prima conferma l’indirizzo con il link che ti abbiamo mandato.',
    'User already registered':
      'Esiste già un account con questa email: accedi.',
  };

  var params = new URLSearchParams(window.location.search);
  var authorizationId = params.get('authorization_id');
  var client = null;

  function $(id) {
    return document.getElementById(id);
  }

  function mostra(id) {
    ['carica', 'errore', 'accedi', 'registrati', 'consenso', 'attendi'].forEach(
      function (v) {
        $(v).hidden = v !== id;
      }
    );
  }

  function errore(testo) {
    $('errore-testo').textContent = testo;
    mostra('errore');
  }

  function messaggio(err) {
    if (!err) return 'Errore sconosciuto.';
    return ERRORI[err.message] || 'Qualcosa non ha funzionato: ' + err.message;
  }

  // Solo indirizzi web: un redirect_url con un altro schema (javascript:, data:) non si segue.
  function vaiA(url) {
    var u;
    try {
      u = new URL(url);
    } catch (e) {
      return errore('Indirizzo di ritorno non valido.');
    }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') {
      return errore('Indirizzo di ritorno non valido.');
    }
    window.location.assign(u.toString());
  }

  function etaInAnni(data) {
    var nascita = new Date(data + 'T00:00:00');
    var oggi = new Date();
    var anni = oggi.getFullYear() - nascita.getFullYear();
    var m = oggi.getMonth() - nascita.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) anni -= 1;
    return anni;
  }

  async function avvia() {
    mostra('carica');
    if (!authorizationId) {
      return errore(
        'Questa pagina si apre dal sito del partner, con il pulsante «Accedi con Rise».'
      );
    }
    var utente = await client.auth.getUser();
    if (utente.error || !utente.data.user) return mostra('accedi');
    $('chi').textContent = utente.data.user.email || '';
    return caricaRichiesta();
  }

  async function caricaRichiesta() {
    var res = await client.auth.oauth.getAuthorizationDetails(authorizationId);
    if (res.error || !res.data) return errore(messaggio(res.error));
    var d = res.data;
    // Consenso già dato a questo partner: Supabase rimanda subito indietro.
    if (!('authorization_id' in d) && d.redirect_url)
      return vaiA(d.redirect_url);
    $('partner').textContent = (d.client && d.client.name) || 'Il partner';
    var lista = $('dati');
    lista.replaceChildren();
    String(d.scope || '')
      .split(' ')
      .filter(Boolean)
      .forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = SCOPE[s] || s;
        lista.appendChild(li);
      });
    mostra('consenso');
  }

  async function decidi(approva) {
    mostra('attendi');
    // Senza skipBrowserRedirect supabase-js naviga DA SOLO al redirect_url (auth-js 2.108.2,
    // GoTrueClient _approveAuthorization/_denyAuthorization) e poi navigheremmo anche noi: il
    // partner riceverebbe due ritorni con lo stesso codice, e il secondo scambio fallisce con
    // invalid_grant (visto nel giro del 6/11). Una sola navigazione: la nostra, che controlla lo schema.
    var opzioni = { skipBrowserRedirect: true };
    var res = approva
      ? await client.auth.oauth.approveAuthorization(authorizationId, opzioni)
      : await client.auth.oauth.denyAuthorization(authorizationId, opzioni);
    if (res.error || !res.data) return errore(messaggio(res.error));
    vaiA(res.data.redirect_url);
  }

  async function accedi(ev) {
    ev.preventDefault();
    $('accedi-errore').textContent = '';
    var res = await client.auth.signInWithPassword({
      email: $('accedi-email').value.trim(),
      password: $('accedi-password').value,
    });
    if (res.error) {
      $('accedi-errore').textContent = messaggio(res.error);
      return;
    }
    avvia();
  }

  async function registrati(ev) {
    ev.preventDefault();
    var out = $('reg-errore');
    out.textContent = '';
    var nome = $('reg-nome').value.trim();
    var cognome = $('reg-cognome').value.trim();
    var nickname = $('reg-nickname').value.trim();
    var nascita = $('reg-nascita').value;
    if (!$('reg-privacy').checked) {
      out.textContent =
        'Per creare l’account serve presa visione dell’informativa.';
      return;
    }
    if (!nascita || etaInAnni(nascita) < ETA_MINIMA) {
      out.textContent =
        'Per registrarti devi avere almeno ' + ETA_MINIMA + ' anni.';
      return;
    }
    // Stesse chiavi del signUp dell'app (useEmailConfirmation.ts): il trigger
    // handle_new_user crea profilo e consensi lato server leggendo questi campi.
    var data = {
      name: (nome + ' ' + cognome).trim(),
      first_name: nome,
      last_name: cognome,
      birth_date: nascita,
      country: 'IT',
      marketing_consent: $('reg-marketing').checked,
    };
    if (nickname) data.preferred_username = nickname;
    var res = await client.auth.signUp({
      email: $('reg-email').value.trim(),
      password: $('reg-password').value,
      options: { emailRedirectTo: window.location.href, data: data },
    });
    if (res.error) {
      out.textContent = messaggio(res.error);
      return;
    }
    if (!res.data.session) {
      $('errore-testo').textContent =
        'Ti abbiamo mandato una mail: apri il link per confermare, poi torni qui.';
      return mostra('errore');
    }
    avvia();
  }

  async function esci() {
    await client.auth.signOut();
    mostra('accedi');
  }

  function collega() {
    $('form-accedi').addEventListener('submit', accedi);
    $('form-registrati').addEventListener('submit', registrati);
    $('vai-registrati').addEventListener('click', function () {
      mostra('registrati');
    });
    $('vai-accedi').addEventListener('click', function () {
      mostra('accedi');
    });
    $('approva').addEventListener('click', function () {
      decidi(true);
    });
    $('rifiuta').addEventListener('click', function () {
      decidi(false);
    });
    $('esci').addEventListener('click', esci);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.supabase || !cfg.url || !cfg.publishableKey) {
      return errore('Pagina non configurata (manca config.js).');
    }
    client = window.supabase.createClient(cfg.url, cfg.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    collega();
    avvia().catch(function (e) {
      errore(messaggio(e));
    });
  });
})();
