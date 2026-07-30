-- TEST migration 0018 — la domanda «è libero?» e, soprattutto: risponde la VERITÀ
-- anche a chi non vede le righe.
--
-- Il cuore della suite sono T2 e T12.
--   · T2 è la ragione per cui la funzione esiste: senza `security definer` la risposta
--     sarebbe «libero» su un nickname occupato, perché le policy di `profiles` mostrano
--     solo la riga propria. Se qualcuno togliesse `security definer` credendo di
--     «stringere» la sicurezza, T2 diventa rosso.
--   · T12 presidia l'ALLINEAMENTO fra la funzione e l'indice `profiles_nickname_unico`:
--     sono due normalizzazioni scritte in due punti diversi, e il giorno in cui divergono
--     il modulo dice «libero» su un valore che il database respinge — cioè il silenzio
--     che la 0018 esiste per togliere, tornato da un'altra porta.
--
-- ⚠️ I profili di prova nascono dal trigger `handle_new_user` (insert in `auth.users` con
-- `birth_date` nei metadata, che è il marker del form email): è la stessa strada delle
-- suite 0011-0017, e fa sì che questi test esercitino anche la clemenza della 0017.
--
-- ⚠️ `auth.uid()` è pilotato con `set_config('request.jwt.claim.sub', …, true)`: `true`
-- lo rende LOCALE alla transazione del blocco `do`, quindi non sporca i test successivi.
-- È lo stesso GUC che PostgREST valorizza in produzione (vedi gli shim).
--
-- Prerequisiti: 0001→0017 applicate, poi 0018. Uno dei due shim.
-- Range di id dedicato (`…0500`+).

-- Popolamento: due persone con nickname, una senza.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000501', 'occupante@esempio.it',
   jsonb_build_object('first_name', 'Anna', 'last_name', 'Occupante',
                      'birth_date', '1990-01-01', 'country', 'IT',
                      'preferred_username', 'Mario')),
  ('00000000-0000-0000-0000-000000000502', 'altro@esempio.it',
   jsonb_build_object('first_name', 'Bruno', 'last_name', 'Altro',
                      'birth_date', '1990-01-01', 'country', 'IT',
                      'preferred_username', 'giulia')),
  ('00000000-0000-0000-0000-000000000503', 'senzanick@esempio.it',
   jsonb_build_object('first_name', 'Carla', 'last_name', 'Senza',
                      'birth_date', '1990-01-01', 'country', 'IT'));

do $$
begin
  if (select count(*) from public.profiles
       where id in ('00000000-0000-0000-0000-000000000501',
                    '00000000-0000-0000-0000-000000000502')
         and nickname is not null) <> 2 then
    raise exception 'SETUP FAIL: i profili di prova non hanno il nickname — il resto della suite sarebbe vacuo';
  end if;
  raise notice 'SETUP PASS: due profili con nickname, uno senza';
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- ⚠️ PERCHÉ OGNI TEST DI COMPORTAMENTO FA `set local role` — non è cerimonia.
-- La RLS su `public.profiles` è `enable`, non `force`: il PROPRIETARIO della tabella
-- la scavalca. I test girano come `postgres`, che è owner — quindi un test scritto
-- senza cambiare ruolo vedrebbe TUTTE le righe comunque, e resterebbe verde anche
-- contro una funzione a cui è stato tolto `security definer`. Sarebbe un test che
-- dice «presidiato» senza presidiare niente: la stessa classe di difetto trovata il
-- 2026-07-29 su T12 della 0016.
-- `set local role` vale fino a fine transazione, e ogni blocco `do` è la sua.
-- I ruoli sono quelli veri: `anon` in registrazione, `authenticated` in modifica.
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- T1 (LIBERO): un nickname che nessuno ha → disponibile. Come `anon`.
-- ---------------------------------------------------------------------------
do $$
begin
  execute 'set local role anon';
  if not public.nickname_disponibile('nessunolhamaiusato') then
    raise exception 'T1 FAIL: un nickname mai usato risulta occupato';
  end if;
  raise notice 'T1 PASS: un nickname libero risulta libero';
end $$;

-- ---------------------------------------------------------------------------
-- T2 (IL CUORE — OCCUPATO, E LO DICE ANCHE A CHI NON VEDE LA RIGA).
-- Gira come `anon` SENZA claim: è esattamente la REGISTRAZIONE. Con una `select` dal
-- client la risposta sarebbe «libero», perché `own_select` non mostra nulla ad anon.
-- Se qualcuno togliesse `security definer`, questo test diventa rosso — ed è l'unico
-- che se ne accorge, perché è l'unico che chiede senza i privilegi dell'owner.
-- ---------------------------------------------------------------------------
do $$
begin
  execute 'set local role anon';
  if public.nickname_disponibile('Mario') then
    raise exception 'T2 FAIL: un nickname GIA'' PRESO risulta libero — la funzione non sta leggendo oltre le policy';
  end if;
  raise notice 'T2 PASS: un nickname occupato risulta occupato anche a chi non vede la riga';
end $$;

-- ---------------------------------------------------------------------------
-- T3 (MAIUSCOLE): «MARIO» e «mario» sono lo stesso nickname, come nell'indice.
-- Senza questo, due nomi che si distinguono per una maiuscola passerebbero il modulo
-- e poi si scontrerebbero sull'indice.
-- ---------------------------------------------------------------------------
do $$
begin
  execute 'set local role anon';
  if public.nickname_disponibile('MARIO') then
    raise exception 'T3 FAIL: «MARIO» risulta libero mentre «Mario» esiste — la funzione non normalizza le maiuscole';
  end if;
  if public.nickname_disponibile('mArIo') then
    raise exception 'T3 FAIL: «mArIo» risulta libero mentre «Mario» esiste';
  end if;
  raise notice 'T3 PASS: il confronto ignora le maiuscole, come l''indice';
end $$;

-- ---------------------------------------------------------------------------
-- T4 (SPAZI AI BORDI): «  Mario  » è «Mario». Il CHECK `nickname_forma` rifiuta i
-- valori non ripuliti, quindi ciò che arriva in colonna è già senza bordi: se la
-- funzione non ripulisse l'input, direbbe «libero» a chi ha solo aggiunto uno spazio.
-- ---------------------------------------------------------------------------
do $$
begin
  execute 'set local role anon';
  if public.nickname_disponibile('  Mario  ') then
    raise exception 'T4 FAIL: «  Mario  » risulta libero — l''input non viene ripulito ai bordi';
  end if;
  raise notice 'T4 PASS: gli spazi ai bordi non fanno sembrare libero un nickname preso';
end $$;

-- ---------------------------------------------------------------------------
-- T5/T6 (ASSENTE): null e stringa vuota sono la risposta normale di chi non vuole un
-- nickname, non un errore. Devono risultare «disponibili» e NON sollevare.
-- ---------------------------------------------------------------------------
do $$
begin
  execute 'set local role anon';
  if not public.nickname_disponibile(null) then
    raise exception 'T5 FAIL: null risulta occupato';
  end if;
  raise notice 'T5 PASS: nessun nickname (null) è sempre ammesso';
end $$;

do $$
begin
  execute 'set local role anon';
  if not public.nickname_disponibile('') then
    raise exception 'T6 FAIL: la stringa vuota risulta occupata';
  end if;
  if not public.nickname_disponibile('   ') then
    raise exception 'T6 FAIL: una stringa di soli spazi risulta occupata';
  end if;
  raise notice 'T6 PASS: stringa vuota e soli spazi sono ammessi';
end $$;

-- ---------------------------------------------------------------------------
-- T7 (IL PROPRIO NICKNAME È LIBERO PER SÉ) — il caso «modifica profilo».
-- Chi riapre il modulo col proprio nickname già dentro non deve leggere «occupato da
-- te stesso»: senza l'esclusione di `auth.uid()`, salvare il profilo senza toccare il
-- nickname mostrerebbe un errore su un campo che la persona non ha nemmeno sfiorato.
-- Il claim si imposta PRIMA del cambio ruolo: `anon`/`authenticated` non hanno il
-- diritto di scrivere GUC arbitrari, e `set_config` fallirebbe.
-- ---------------------------------------------------------------------------
do $$
begin
  perform set_config('request.jwt.claim.sub',
                     '00000000-0000-0000-0000-000000000501', true);
  execute 'set local role authenticated';
  if not public.nickname_disponibile('Mario') then
    raise exception 'T7 FAIL: il PROPRIO nickname risulta occupato a chi già lo possiede';
  end if;
  raise notice 'T7 PASS: il proprio nickname risulta libero per sé';
end $$;

-- ---------------------------------------------------------------------------
-- T8 (MA SOLO PER SÉ): lo stesso nickname, chiesto da un ALTRO autenticato, resta
-- occupato. Senza questo test l'esclusione di T7 potrebbe essere scritta come «escludi
-- sempre», che renderebbe la funzione inutile.
-- ---------------------------------------------------------------------------
do $$
begin
  perform set_config('request.jwt.claim.sub',
                     '00000000-0000-0000-0000-000000000502', true);
  execute 'set local role authenticated';
  if public.nickname_disponibile('Mario') then
    raise exception 'T8 FAIL: il nickname di un ALTRO risulta libero a chi è autenticato — l''esclusione non guarda l''identità';
  end if;
  raise notice 'T8 PASS: il nickname altrui resta occupato per chi è autenticato';
end $$;

-- ---------------------------------------------------------------------------
-- T9 (CONFIGURAZIONE DELLA FUNZIONE): `security definer` + `search_path` impostato a
-- vuoto. Non è pignoleria da introspezione: sono le due proprietà su cui poggia tutto
-- il resto, e sono invisibili al comportamento finché qualcuno non le toglie.
-- ---------------------------------------------------------------------------
do $$
declare r record;
begin
  select p.prosecdef, p.proconfig into r
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'nickname_disponibile';

  if r is null then
    raise exception 'T9 FAIL: la funzione non esiste';
  end if;
  if not r.prosecdef then
    raise exception 'T9 FAIL: la funzione NON è security definer — risponderebbe «libero» a chi non vede le righe';
  end if;
  -- `set search_path = ''` viene memorizzato da Postgres come `search_path=""` — con le
  -- virgolette DENTRO il valore, non come `search_path=`. Verificato eseguendo: la prima
  -- stesura di questo test cercava la forma senza virgolette e falliva su una funzione
  -- configurata correttamente. Si accettano entrambe le scritture del «vuoto», e NIENTE
  -- altro: un `search_path=public` deve restare rosso.
  if r.proconfig is null
     or not (r.proconfig && array['search_path=""', 'search_path=']) then
    raise exception 'T9 FAIL: search_path non è fissato a vuoto (proconfig = %)', coalesce(r.proconfig::text, '<null>');
  end if;
  raise notice 'T9 PASS: security definer con search_path vuoto';
end $$;

-- ---------------------------------------------------------------------------
-- T10/T11 (CHI PUÒ CHIAMARLA): `anon` e `authenticated` sì — il caso principale è la
-- registrazione, dove chi scrive è `anon`. `public` no: le funzioni nascono con EXECUTE
-- concesso a PUBLIC e su una `security definer` quel default va revocato.
-- Girano su ENTRAMBI gli shim, e il restrittivo (senza default privileges) è quello che
-- dimostra che i grant sono espliciti e non ereditati dall'ambiente.
-- ---------------------------------------------------------------------------
do $$
begin
  if not has_function_privilege('anon', 'public.nickname_disponibile(text)', 'execute') then
    raise exception 'T10 FAIL: anon non può chiamare la funzione — in registrazione il controllo non funzionerebbe';
  end if;
  if not has_function_privilege('authenticated', 'public.nickname_disponibile(text)', 'execute') then
    raise exception 'T10 FAIL: authenticated non può chiamare la funzione — in modifica profilo il controllo non funzionerebbe';
  end if;
  raise notice 'T10 PASS: anon e authenticated possono chiamarla';
end $$;

do $$
begin
  if has_function_privilege('public', 'public.nickname_disponibile(text)', 'execute') then
    raise exception 'T11 FAIL: EXECUTE è ancora concesso a PUBLIC — il revoke non c''è o non ha avuto effetto';
  end if;
  raise notice 'T11 PASS: PUBLIC non ha EXECUTE, i permessi sono espliciti';
end $$;

-- ---------------------------------------------------------------------------
-- T12 (L'ALLINEAMENTO CON L'INDICE — l'altro cuore della suite).
-- Le due normalizzazioni vivono in file diversi: `lower(nickname)` nell'indice della
-- 0017, `lower(btrim(...))` nella funzione della 0018. Questo test le mette una contro
-- l'altra sui dati veri: ciò che la funzione dichiara OCCUPATO deve essere davvero
-- respinto dall'indice, e ciò che dichiara LIBERO deve entrare.
-- Se un domani qualcuno cambia una delle due (per esempio togliendo `lower` per
-- «rispettare le maiuscole scelte dalla persona»), questo test lo intercetta qui,
-- invece di lasciarlo scoprire a chi si registra.
-- ---------------------------------------------------------------------------
do $$
declare
  v_respinto boolean := false;
begin
  -- ① ciò che la funzione dice OCCUPATO, l'indice lo respinge davvero.
  if public.nickname_disponibile('mario') then
    raise exception 'T12 FAIL (premessa): «mario» dovrebbe risultare occupato';
  end if;
  begin
    update public.profiles set nickname = 'mario'
     where id = '00000000-0000-0000-0000-000000000503';
  exception when unique_violation then
    v_respinto := true;
  end;
  if not v_respinto then
    raise exception 'T12 FAIL: la funzione dice «occupato» ma l''indice ha ACCETTATO il valore — le due normalizzazioni divergono';
  end if;

  -- ② ciò che la funzione dice LIBERO, l'indice lo accetta davvero.
  if not public.nickname_disponibile('MarioSecondo') then
    raise exception 'T12 FAIL (premessa): «MarioSecondo» dovrebbe risultare libero';
  end if;
  update public.profiles set nickname = 'MarioSecondo'
   where id = '00000000-0000-0000-0000-000000000503';
  if (select nickname from public.profiles
       where id = '00000000-0000-0000-0000-000000000503') is distinct from 'MarioSecondo' then
    raise exception 'T12 FAIL: la funzione dice «libero» ma il valore non è entrato';
  end if;

  raise notice 'T12 PASS: funzione e indice normalizzano allo stesso modo, sui dati veri';
end $$;
