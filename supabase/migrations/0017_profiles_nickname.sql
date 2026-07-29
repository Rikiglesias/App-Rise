-- Migration 0017 — nickname della persona, e il claim OIDC `preferred_username`
-- (goal partner-identita, F-NICKNAME — deciso da Riccardo il 2026-07-29)
--
-- PERCHÉ ESISTE. Il modulo di Let's Donation chiede un nickname. Finché da noi non
-- esiste, il brief deve dire al partner «questo campo non lo copriamo» — e una volta
-- letta, quella frase li porta a progettarsi un ripiego per un dato che invece gli
-- arriverà. Parole di Riccardo: «se diciamo che non lo facciamo, loro penseranno che
-- non potremo mai farlo».
--
-- COME VIAGGIA (verificato alla fonte sul codice di Supabase Auth, 2026-07-29, su
-- ENTRAMBE le facce del server OIDC):
--   - id_token  → `internal/tokens/service.go`, GenerateIDToken: legge
--                 user_metadata["preferred_username"], ripiego su ["username"];
--   - UserInfo  → `internal/api/oauthserver/handlers.go`, OAuthUserInfo: idem.
-- Le due letture e la dichiarazione del claim nel discovery sono nate nello STESSO
-- changeset (commit 162788f, PR #2250): non esiste una versione del server che
-- dichiari `preferred_username` senza leggerlo. Il nostro progetto lo dichiara dal
-- vivo (`claims_supported` del discovery, riletto il 29/07) ⇒ il binario ha quel codice.
-- ⚠️ Non osservato sul giro OIDC vero, perché il nostro provider è ancora SPENTO
-- (`oauth/authorize` → `feature_disabled`): stesso identico grado di prova su cui
-- poggia già il claim `name` in produzione. Quando il provider si accende, la prova
-- end-to-end va rifatta sul token reale.
--
-- DIFFERENZA IMPORTANTE RISPETTO A `name`: se `name` manca, il server ci mette
-- l'EMAIL dell'account come ripiego (ed è il motivo per cui `syncDisplayNameClaim`
-- esiste). Per `preferred_username` NON c'è ripiego: se manca, il claim è omesso e
-- basta. Un nickname assente non fa quindi trapelare nulla — verificato sulle stesse
-- due funzioni. È ciò che rende sicuro tenerlo FACOLTATIVO.
--
-- DECISIONE DI PRODOTTO — facoltativo, non obbligatorio: il nickname non serve a
-- NOI, nasce solo per il sito del partner. Obbligarlo aggiunge attrito certo su un
-- modulo che è già il più lungo del percorso (la preoccupazione esplicita di
-- Riccardo: «magari uno si stanca e non si registra proprio») in cambio di un
-- beneficio incerto. `profiles` resta la fonte di verità; `user_metadata` ne è la
-- proiezione, esattamente come per il nome.
--
-- IL NICKNAME NON DEVE MAI IMPEDIRE UNA REGISTRAZIONE. Il CHECK sulla colonna è una
-- difesa in profondità, ma il trigger NON gli lascia mai il compito di far fallire
-- l'insert: un valore fuori forma viene SCARTATO (null), non propagato. Senza questa
-- accortezza un campo facoltativo e decorativo potrebbe uccidere il signup — la
-- classe di guasto peggiore, perché si manifesta solo su input strani e in silenzio.
--
-- RIESEGUIBILE (come 0003/0005/0008/0009/0010/0011): `add column if not exists` +
-- `create or replace function`. Rollback:
--   alter table public.profiles drop column nickname;
--   -- e riapplicare il corpo di handle_new_user QUI SOTTO senza le due righe del nickname.
--   -- ⚠️ Il corpo di ripristino va preso dall'ULTIMA migration che tocca la funzione
--   --    (regola scritta dopo l'errore del 2026-07-29: un corpo copiato dalla migration
--   --    sbagliata regredisce in silenzio i fix intermedi). Alla data: questa, la 0017.

alter table public.profiles
  add column if not exists nickname text;

comment on column public.profiles.nickname is
  'Nome scelto dalla persona per i siti dei partner (claim OIDC preferred_username). '
  'Facoltativo: se assente il claim non viene emesso. Fonte di verità; la copia in '
  'auth.users.raw_user_meta_data.preferred_username è la sua proiezione.';

-- Forma: 2-30 caratteri, niente spazi ai bordi. Il valore finisce PUBBLICO sul sito
-- del partner, quindi la lunghezza è un vincolo di dominio, non un capriccio.
alter table public.profiles
  drop constraint if exists nickname_forma;

alter table public.profiles
  add constraint nickname_forma check (
    nickname is null
    or (char_length(nickname) between 2 and 30 and nickname = btrim(nickname))
  );

-- ---------------------------------------------------------------------------
-- handle_new_user — corpo preso dalla definizione VIVA del database (pg_get_functiondef,
-- letta il 2026-07-29 prima di scrivere questa migration), NON da un file di migration:
-- è il modo per non regredire i fix delle 0011/0013/0014 che l'hanno toccata.
-- Unica differenza rispetto al vivo: le due righe del nickname, marcate qui sotto.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := new.raw_user_meta_data;
  v_version text;
  v_marketing boolean := coalesce((v_meta->>'marketing_consent')::boolean, false);
  -- La mail dell'account vale come recapito solo se è un indirizzo vero: un alias
  -- Apple Private Relay non è la mail della persona e non deve finire in colonna.
  v_account_email text := case
    when new.email like '%@privaterelay.appleid.com' then null
    else new.email
  end;
  v_contact_email text := coalesce(
    nullif(v_meta->>'contact_email', ''),
    v_account_email
  );
  -- NUOVO (0017). La chiave si chiama `preferred_username` e non `nickname` perché è
  -- quella — e solo quella — che il server auth legge per costruire il claim OIDC.
  -- Il valore viene ripulito e VALIDATO qui: se non rispetta la forma della colonna
  -- diventa null, così un nickname storto non può mai far fallire la registrazione.
  v_nickname text := nullif(btrim(coalesce(v_meta->>'preferred_username', '')), '');
begin
  -- Stessa forma del CHECK `nickname_forma` qui sopra, ripetuta di proposito: là è la
  -- difesa, qui è la clemenza. Scritta con `<`/`>` e non con `not between` perché la
  -- precedenza di BETWEEN rispetto ad AND è stata storicamente incoerente in Postgres
  -- (sistemata in 9.5, ma la documentazione raccomanda comunque le parentesi): una
  -- condizione che si legge male è il posto sbagliato per essere spiritosi.
  -- Se le due regole divergeranno, a rompersi è la registrazione → cambiarle INSIEME.
  if v_nickname is not null
     and (char_length(v_nickname) < 2 or char_length(v_nickname) > 30) then
    v_nickname := null;
  end if;

  -- Marker del form email: birth_date è sempre presente nel signup email, mai nel social.
  if v_meta ? 'birth_date' then
    insert into public.profiles (
      id, first_name, last_name, phone, city, province, country,
      birth_date, privacy_consent_at, marketing_consent, contact_email,
      nickname                                            -- NUOVO (0017)
    )
    values (
      new.id,
      v_meta->>'first_name',
      v_meta->>'last_name',
      v_meta->>'phone',
      v_meta->>'city',
      nullif(v_meta->>'province', ''),
      coalesce(nullif(v_meta->>'country', ''), 'IT'),
      (v_meta->>'birth_date')::date,
      now(),
      v_marketing,
      v_contact_email,
      v_nickname                                          -- NUOVO (0017)
    );

    -- Versione informativa = ultima pubblicata (server-trusted, non client-supplied).
    select version into v_version
    from public.policy_versions
    order by published_at desc
    limit 1;

    insert into public.consent_events
      (user_id, purpose, action, policy_version, legal_basis, channel)
    values
      (new.id, 'privacy_notice', 'granted', v_version, 'consent', 'signup');

    if v_marketing then
      insert into public.consent_events
        (user_id, purpose, action, policy_version, legal_basis, channel)
      values
        (new.id, 'marketing', 'granted', v_version, 'consent', 'signup');
    end if;
  end if;

  return new;
end;
$$;
