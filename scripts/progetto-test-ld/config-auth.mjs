// Legge o imposta la configurazione Auth del progetto di test (OAuth server, indirizzi, conferma email).
//
//   secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node scripts/progetto-test-ld/config-auth.mjs        # legge
//   secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node scripts/progetto-test-ld/config-auth.mjs --scrivi
//
// Stampa SOLO le chiavi elencate qui sotto: la risposta completa contiene segreti
// (SMTP, provider esterni) che non devono finire in un terminale né in un log.

import { api } from './api.mjs';

const PAGINA = 'https://rise-accesso-test.vercel.app';

// Valori voluti sul TEST. Conferma email spenta solo qui: gli account di prova si creano
// senza aspettare la posta (limite di 2 mail/ora dell'SMTP di base).
const VOLUTI = {
  site_url: PAGINA,
  uri_allow_list: `${PAGINA}/**`,
  mailer_autoconfirm: true,
  oauth_server_enabled: true,
  oauth_server_authorization_path: '/oauth/consent',
  oauth_server_allow_dynamic_registration: false,
  // Come in produzione (letto il 6/11): il test non deve accettare password che là verrebbero rifiutate.
  password_min_length: 8,
};

const CHIAVI_DA_MOSTRARE = [
  ...Object.keys(VOLUTI),
  'jwt_exp',
  'external_email_enabled',
  'disable_signup',
];

function mostra(titolo, config) {
  console.log(titolo);
  for (const chiave of CHIAVI_DA_MOSTRARE) {
    console.log(`  ${chiave} = ${JSON.stringify(config?.[chiave])}`);
  }
  const oauth = Object.keys(config ?? {}).filter(k =>
    k.startsWith('oauth_server')
  );
  console.log(
    `  (chiavi oauth_server* presenti: ${oauth.join(', ') || 'nessuna'})`
  );
}

const prima = await api('/config/auth');
if (!prima.ok) {
  console.error(`Config illeggibile: HTTP ${prima.status}`, prima.dati);
  process.exit(1);
}
mostra('Prima:', prima.dati);

if (!process.argv.includes('--scrivi')) process.exit(0);

const scrittura = await api('/config/auth', { method: 'PATCH', body: VOLUTI });
if (!scrittura.ok) {
  console.error(
    `Scrittura rifiutata: HTTP ${scrittura.status}`,
    scrittura.dati
  );
  process.exit(1);
}

// Il successo è la config RILETTA uguale ai valori voluti, non il 200 della PATCH.
const dopo = await api('/config/auth');
mostra('Dopo (riletta):', dopo.dati);
const diversi = Object.entries(VOLUTI).filter(([k, v]) => dopo.dati?.[k] !== v);
if (diversi.length) {
  console.error('NON applicati:', diversi.map(([k]) => k).join(', '));
  process.exit(1);
}
console.log('Tutti i valori voluti sono applicati.');
