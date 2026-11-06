#!/usr/bin/env node
/**
 * Client OIDC di prova: fa la parte del partner (Let's Donation) contro il NOSTRO server
 * di login, per provare il giro completo prima di darlo a loro (goal ld-ambiente-test, F3e).
 *
 *   authorization code + PKCE → pagina di consenso nostra → scambio del codice →
 *   firma dell'id_token verificata sulla JWKS → UserInfo.
 *
 * Uso (solo progetto di TEST; il secret si passa per variabile d'ambiente, mai come argomento;
 * senza OIDC_CLIENT_SECRET il client è PUBBLICO: solo PKCE, client_id nel corpo):
 *   SUPABASE_URL=https://<ref>.supabase.co OIDC_CLIENT_ID=… OIDC_CLIENT_SECRET=… \
 *     node scripts/prova-oidc-partner.mjs
 * Poi si apre nel browser l'indirizzo stampato. Il client va registrato con l'indirizzo di
 * ritorno ESATTO http://127.0.0.1:8787/callback (Supabase non accetta varianti).
 * Esce 0 solo se arrivano sub, email ed email_verified e la firma torna; 1 altrimenti.
 */
import { createServer } from 'node:http';
import { createHash, randomBytes, webcrypto } from 'node:crypto';

const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const clientId = process.env.OIDC_CLIENT_ID;
const clientSecret = process.env.OIDC_CLIENT_SECRET;
const porta = Number(process.env.PORTA || 8787);
const ritorno = `http://127.0.0.1:${porta}/callback`;

if (!base || !clientId) {
  console.error('Mancano SUPABASE_URL o OIDC_CLIENT_ID.');
  process.exit(1);
}

const b64url = buf => Buffer.from(buf).toString('base64url');
const verifier = b64url(randomBytes(32));
const challenge = b64url(createHash('sha256').update(verifier).digest());
const state = b64url(randomBytes(16));
const nonce = b64url(randomBytes(16));

const disco = await (
  await fetch(`${base}/auth/v1/.well-known/openid-configuration`)
).json();
for (const k of ['authorization_endpoint', 'token_endpoint', 'jwks_uri']) {
  if (!disco[k]) {
    console.error(`Discovery senza ${k}: il server OAuth è acceso?`, disco);
    process.exit(1);
  }
}

const url = new URL(disco.authorization_endpoint);
url.search = new URLSearchParams({
  response_type: 'code',
  client_id: clientId,
  redirect_uri: ritorno,
  scope: 'openid email profile',
  state,
  nonce,
  code_challenge: challenge,
  code_challenge_method: 'S256',
}).toString();

async function verificaIdToken(idToken) {
  const [h, p, s] = idToken.split('.');
  const header = JSON.parse(Buffer.from(h, 'base64url'));
  const claims = JSON.parse(Buffer.from(p, 'base64url'));
  const { keys } = await (await fetch(disco.jwks_uri)).json();
  const jwk = keys.find(k => k.kid === header.kid);
  if (!jwk) throw new Error(`kid ${header.kid} assente dalla JWKS`);
  if (header.alg !== 'ES256') throw new Error(`alg inatteso ${header.alg}`);
  const key = await webcrypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify']
  );
  const ok = await webcrypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    Buffer.from(s, 'base64url'),
    Buffer.from(`${h}.${p}`)
  );
  const errori = [];
  if (!ok) errori.push('firma non valida');
  if (claims.iss !== disco.issuer) errori.push(`iss ${claims.iss}`);
  const aud = [].concat(claims.aud);
  if (!aud.includes(clientId)) errori.push(`aud ${claims.aud}`);
  if (claims.nonce !== nonce) errori.push('nonce diverso');
  if (claims.exp * 1000 < Date.now()) errori.push('scaduto');
  return { claims, errori };
}

// Un partner deve ricevere UN solo ritorno: due ritorni con lo stesso codice vogliono dire che la
// pagina di consenso naviga due volte, e il secondo scambio fallisce (invalid_grant) davanti
// all'utente. Il server resta in ascolto ATTESA_MS dopo il primo per accorgersene.
const ATTESA_MS = 3000;
let ritorni = 0;
let esitoPrimo = null;

const server = createServer(async (req, res) => {
  const q = new URL(req.url, ritorno).searchParams;
  if (!req.url.startsWith('/callback')) return res.writeHead(404).end();
  ritorni += 1;
  if (ritorni > 1) {
    res
      .writeHead(409, { 'content-type': 'text/plain; charset=utf-8' })
      .end('ritorno doppio');
    console.log(
      `KO: ritorno ricevuto ${ritorni} volte (la pagina di consenso naviga più di una volta)`
    );
    return;
  }
  const chiudi = (codice, testo) => {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(testo);
    console.log(testo);
    esitoPrimo = codice;
    setTimeout(() => {
      server.close();
      process.exitCode = ritorni > 1 ? 1 : esitoPrimo;
      if (ritorni > 1) console.log('ESITO FINALE: KO per ritorno doppio');
    }, ATTESA_MS);
  };
  if (q.get('error')) return chiudi(1, `Rifiutato: ${q.get('error')}`);
  if (q.get('state') !== state)
    return chiudi(1, 'state diverso: risposta non nostra');
  try {
    const tok = await fetch(disco.token_endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        // Riservato: client_secret_basic (come farà LD). Pubblico: nessuna autenticazione.
        ...(clientSecret
          ? {
              authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            }
          : {}),
      },
      body: new URLSearchParams({
        ...(clientSecret ? {} : { client_id: clientId }),
        grant_type: 'authorization_code',
        code: q.get('code') || '',
        redirect_uri: ritorno,
        code_verifier: verifier,
      }),
    });
    const t = await tok.json();
    if (!tok.ok || !t.id_token)
      return chiudi(1, `Token: ${tok.status} ${JSON.stringify(t)}`);
    const { claims, errori } = await verificaIdToken(t.id_token);
    const ui = await fetch(disco.userinfo_endpoint, {
      headers: { authorization: `Bearer ${t.access_token}` },
    });
    const info = ui.ok ? await ui.json() : { errore: ui.status };
    const mancano = ['sub', 'email', 'email_verified'].filter(
      k => !(k in claims)
    );
    const esito = errori.length === 0 && mancano.length === 0;
    chiudi(
      esito ? 0 : 1,
      [
        esito
          ? 'ESITO: OK'
          : `ESITO: KO ${[...errori, ...mancano.map(m => `manca ${m}`)].join(', ')}`,
        `id_token: ${JSON.stringify(claims, null, 2)}`,
        `userinfo: ${JSON.stringify(info, null, 2)}`,
      ].join('\n')
    );
  } catch (e) {
    chiudi(1, `Errore: ${e.message}`);
  }
});

server.listen(porta, '127.0.0.1', () => {
  console.log(`Apri nel browser:\n${url.toString()}`);
});
