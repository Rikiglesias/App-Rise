-- Migration 0018 — «questo nickname è libero?», la domanda che il modulo deve poter fare
-- (goal partner-identita, F-NICKNAME-UX)
--
-- PERCHÉ ESISTE. La 0017 ha reso il nickname UNICO e ha messo due clemenze perché una
-- collisione non uccida la registrazione: il valore viene SCARTATO in silenzio. Il
-- database è protetto, la persona no — oggi scrive un nickname, si registra, e lo trova
-- vuoto senza che nessuno glielo abbia detto. Questa migration dà al modulo il modo di
-- dirglielo PRIMA, mentre scrive.
--
-- ⚠️ PERCHÉ NON BASTA UNA `select` DAL CLIENT — è il punto che decide tutto il disegno.
-- Le policy di `public.profiles` (verificate sul database vivo il 2026-07-30) sono tutte
-- della forma `auth.uid() = id`:
--     own_select r  ((SELECT auth.uid()) = id)
-- Quindi una `select … where lower(nickname) = …` fatta dal client risponde
-- «nessuna riga» — cioè «libero» — in ENTRAMBI i punti in cui serve:
--   · in REGISTRAZIONE chi scrive è `anon` e non vede NESSUNA riga;
--   · in MODIFICA PROFILO chi scrive è `authenticated` e vede SOLO LA PROPRIA.
-- Un controllo così direbbe sempre «libero», soprattutto quando è occupato: sarebbe un
-- presidio che mente, cioè peggio di nessun presidio. Serve per forza una funzione
-- `security definer`, che legge oltre le policy e restituisce SOLO un booleano.
--
-- SUPERFICIE ESPOSTA, dichiarata. La funzione è chiamabile da `anon`: deve esserlo, il
-- caso principale è la registrazione. Questo rende i nickname ENUMERABILI (si può
-- chiedere «esiste tizio?» e avere sì/no). È il costo intrinseco di un namespace unico
-- e pubblico — lo stesso che pagano tutti i siti con gli username — ed è accettabile
-- QUI per una ragione precisa: il nickname nasce per essere mostrato in pubblico sul
-- sito del partner, non è un dato che teniamo riservato. Ciò che la funzione NON fa,
-- e non deve mai fare: restituire righe, id, o qualunque altro campo di `profiles`.
-- Se un giorno servisse la stessa domanda su un dato riservato (una email), NON si
-- estende questa funzione: se ne scrive un'altra, autenticata.
--
-- RIESEGUIBILE: `create or replace` + revoke/grant idempotenti. Rollback:
--   drop function if exists public.nickname_disponibile(text);
-- Non tocca dati, non tocca `handle_new_user`, non ha bisogno di backfill.

-- ---------------------------------------------------------------------------
-- La normalizzazione è la STESSA dell'indice `profiles_nickname_unico` (0017):
-- `lower(...)` sul valore già ripulito ai bordi. Se le due divergessero, il modulo
-- direbbe «libero» su un nickname che poi l'indice respinge — cioè esattamente il
-- silenzio che questa migration esiste per togliere. Cambiarle INSIEME.
--
-- `id is distinct from auth.uid()` esclude CHI STA CHIEDENDO, e serve nel secondo punto
-- d'uso: in «modifica profilo» chi riapre il modulo col proprio nickname già dentro
-- deve leggere «libero», non «occupato da te stesso». Per `anon` (registrazione)
-- `auth.uid()` è null e `is distinct from` è vero per ogni riga, quindi non esclude
-- niente: lo stesso codice serve i due casi senza un ramo in più.
--
-- Un nickname assente (null o stringa vuota) è sempre «disponibile»: è la risposta
-- normale di chi non ne vuole uno, non un errore. `lower(btrim(null))` è null e il
-- confronto non è mai vero, quindi il caso si risolve da sé senza un `if`.
-- ---------------------------------------------------------------------------
create or replace function public.nickname_disponibile(p_nickname text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1
    from public.profiles
    where lower(nickname) = lower(btrim(p_nickname))
      and id is distinct from (select auth.uid())
  );
$$;

comment on function public.nickname_disponibile(text) is
  'Dice se un nickname è libero, escludendo chi chiede (per la modifica del proprio '
  'profilo). SECURITY DEFINER perché le policy di profiles mostrano solo la riga '
  'propria: senza, in registrazione (anon) e in modifica risponderebbe sempre «libero». '
  'Restituisce SOLO un booleano, mai righe. Normalizzazione allineata all''indice '
  'profiles_nickname_unico della 0017.';

-- Le funzioni nascono con EXECUTE concesso a PUBLIC. Su una `security definer` quel
-- default è troppo largo per lasciarlo implicito: si revoca e si concede a mano, così
-- l'elenco di chi può chiamarla è scritto qui e non ereditato.
-- I grant sono ESPLICITI e non si appoggiano ai `default privileges`, che nell'ambiente
-- restrittivo non ci sono (ed è la ragione per cui la suite gira contro due shim).
revoke all on function public.nickname_disponibile(text) from public;
grant execute on function public.nickname_disponibile(text) to anon, authenticated;
