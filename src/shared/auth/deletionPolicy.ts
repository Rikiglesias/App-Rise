/**
 * Regole della cancellazione account, in un posto solo.
 *
 * Stanno qui e non dentro una schermata perché le legge sia chi OFFRE la
 * cancellazione (`DeleteAccountScreen`) sia chi ne MOSTRA lo stato
 * (`ProfileScreen`): due copie della stessa regola divergono al primo cambio.
 */

/** Giorni di ripensamento fra la richiesta di cancellazione e l'eliminazione. */
export const GRACE_DAYS = 30;

/**
 * Se offrire o no la cancellazione differita («Elimina tra 30 giorni»).
 *
 * ⛔ Oggi è SPENTA, e non per scelta di prodotto: **nessuno esegue davvero
 * quell'eliminazione**. Il pulsante scriveva solo un timestamp
 * (`profiles.deletion_requested_at`), e l'unico codice che lo trasforma in una
 * cancellazione vera è l'Edge Function `purge-deletions` — che è pubblicata e
 * funzionante, ma che nessuno chiama mai.
 *
 * Verificato sul database di produzione il 2026-08-15, non dedotto dai file:
 * l'estensione `pg_cron` risulta `installed_version: null` e lo schema `cron`
 * non esiste. La leva era già prevista e non è mai stata tirata — piano M3,
 * `docs/superpowers/plans/2026-06-15-donor-auth-gdpr-M3.md:19` (P4).
 *
 * Lasciarla accesa significava dire a una persona «il tuo account sarà
 * eliminato fra 30 giorni» e non eliminarlo mai: un'affermazione falsa, e per
 * di più sull'unica richiesta che il GDPR (Art.17) vuole onorata. Il diritto
 * resta comunque pienamente servito da «Elimina subito», che passa da
 * `delete-account` e cancella davvero.
 *
 * ✅ PER RIACCENDERLA servono due cose, entrambe dal pannello Supabase:
 *   1. il segreto `CRON_SECRET` fra i secrets delle Edge Functions;
 *   2. un job giornaliero (Integrations → Cron) che chiami `purge-deletions`
 *      passando quel valore nell'header `x-cron-secret`.
 * Fatte quelle, questa costante torna `true` e la promessa ridiventa vera.
 *
 * Il tipo è annotato `boolean` di proposito: senza annotazione TypeScript
 * dedurrebbe il tipo letterale `false`, e da lì marcherebbe come irraggiungibile
 * il ramo che dovrà tornare vivo appena la leva sarà tirata.
 */
export const CANCELLAZIONE_PROGRAMMATA_ATTIVA: boolean = false;
