#!/usr/bin/env python3
"""Prepara l'import delle anagrafiche storiche in `legacy_contacts`.

COSA FA E COSA NON FA
=====================
Legge il CSV esportato dal back office del partner e produce **un file .sql** con gli
INSERT pronti. Non tocca nessun database: l'applicazione resta una decisione umana,
separata e successiva. Stampa anche un rendiconto di ciò che ha normalizzato e di ciò
che ha rifiutato di normalizzare, perché su un import la cosa pericolosa non è il dato
che manca — è il dato inventato.

IL FILE PRODOTTO CONTIENE DATI PERSONALI DI PERSONE VERE.
Esce fuori dal repository apposta (default: C:/tmp), non va committato, non va mandato
via email, e va cancellato quando l'import è finito.

USO
---
    python scripts/prepara-import-legacy.py <file.csv> [file-uscita.sql]

    # esempio reale:
    python scripts/prepara-import-legacy.py "C:/Users/albie/Downloads/donatori_27-07-2026.csv"

PERCHÉ LE NORMALIZZAZIONI SONO QUESTE
-------------------------------------
Le regole sotto non sono state indovinate: vengono dalla forma REALE dell'export del
2026-07-27 (1352 persone), misurata prima di scrivere una riga di codice.

· **Email** — è la chiave di aggancio (`email_norm`) e il vincolo del database pretende
  `lower(btrim(...))` e non vuota. Nell'export sono 1352 distinte, zero duplicate, zero
  fuori formato: nessuna riga si perde per questo.

· **Telefono** — 896 presenti, e NESSUNO nella forma che l'app pretende (`+39…`). Si
  normalizza solo ciò che è certo: 10 cifre che iniziano per 3 (mobile italiano) e 12
  cifre che iniziano per 39 (prefisso internazionale senza il più). Tutto il resto —
  numeri di 7, 8, 9 o 11 cifre, o che iniziano in modo anomalo — **resta fuori dalla
  colonna** e sopravvive solo dentro `raw`. Un numero ricostruito a indovinare finirebbe
  precompilato nel profilo di una persona vera, che se lo ritroverebbe scritto da noi.

· **Provincia** — l'export scrive il nome esteso («Bologna»), l'app usa la sigla («BO»).
  Sono 9 valori distinti in tutto il file, mappati sotto uno per uno. Un nome non
  previsto NON viene tradotto a caso: viene lasciato fuori e segnalato nel rendiconto.

· **Data di nascita** — nell'export è `gg/mm/aaaa` mentre la data di iscrizione, nello
  STESSO file, è già ISO. Due formati diversi nello stesso export: la conversione è
  esplicita e le date non interpretabili vengono scartate, non tirate a indovinare.

· **Paese** — «ITALIA»/«GRECIA» diventano i codici a due lettere che usa il database.
  Le celle vuote diventano NULL, **non stringa vuota**: il trigger di aggancio confronta
  il paese con `'IT'`, e una stringa vuota lo farebbe fallire in silenzio (è il difetto
  chiuso dalla migration 0014, che ora regge entrambe le forme — ma non è una ragione
  per sporcare i dati alla sorgente).

· **Tutto il resto** — codice fiscale, indirizzo, CAP, regione, genere, livello, data di
  iscrizione e **i tre consensi** finiscono in `raw`, il campo che conserva il record
  originale intero. Nessuna informazione dell'export viene persa, anche quella che oggi
  non sappiamo dove mettere.

I CONSENSI NON DIVENTANO CONSENSI
---------------------------------
L'export porta «Consenso alla privacy», «Consenti ricezione mail» e «Consenso
comunicazioni promozionali Enti Terzo Settore». Vengono conservati in `raw` come PROVA
DOCUMENTALE di cosa risulta registrato dall'altra parte, e nient'altro: non scrivono
nessuna riga nel nostro registro dei consensi e non abilitano nessun invio. Il nostro
registro deve contenere solo consensi raccolti da noi — una riga scritta lì sulla base di
un file altrui sarebbe una prova falsa, e sarebbe peggio di non averla.
"""

from __future__ import annotations

import csv
import re
import sys
from datetime import datetime
from pathlib import Path

# --------------------------------------------------------------------------
# Mappe di conversione — chiuse per scelta: ciò che non è previsto viene
# segnalato, mai tradotto a intuito.
# --------------------------------------------------------------------------

# I 9 nomi di provincia presenti nell'export del 2026-07-27.
PROVINCE = {
    "ancona": "AN",
    "bologna": "BO",
    "cagliari": "CA",
    "forlì-cesena": "FC",
    "forli-cesena": "FC",
    "imperia": "IM",
    "milano": "MI",
    "perugia": "PG",
    "ravenna": "RA",
    "roma": "RM",
}

PAESI = {
    "italia": "IT",
    "italy": "IT",
    "grecia": "GR",
    "greece": "GR",
}

RE_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def pulisci(valore: str | None) -> str | None:
    """Stringa vuota e soli spazi valgono «assente», cioè NULL — non `''`."""
    if valore is None:
        return None
    v = valore.strip()
    return v or None


def normalizza_telefono(grezzo: str | None) -> tuple[str | None, str | None]:
    """Ritorna (numero normalizzato, motivo del rifiuto).

    Solo le due forme certe vengono convertite. Per tutto il resto si preferisce
    il vuoto: questo numero finirebbe precompilato nel profilo di una persona vera.
    """
    v = pulisci(grezzo)
    if v is None:
        return None, None

    cifre = re.sub(r"[\s\-\.\(\)/]", "", v)

    if cifre.startswith("+"):
        return (cifre, None) if re.fullmatch(r"\+\d{8,15}", cifre) else (None, f"già internazionale ma fuori formato: {len(cifre)} caratteri")

    if re.fullmatch(r"3\d{9}", cifre):          # 3XXXXXXXXX → mobile italiano
        return "+39" + cifre, None
    if re.fullmatch(r"39\d{10}", cifre):        # 39XXXXXXXXXX → manca solo il +
        return "+" + cifre, None

    return None, f"forma non riconosciuta ({len(cifre)} cifre, inizia per {cifre[:2]})"


def normalizza_data(grezzo: str | None) -> tuple[str | None, str | None]:
    """`gg/mm/aaaa` → ISO. Le altre forme si scartano, non si indovinano."""
    v = pulisci(grezzo)
    if v is None:
        return None, None
    for formato in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(v[:10], formato).date().isoformat(), None
        except ValueError:
            continue
    return None, f"data non interpretabile: {v!r}"


def sql_literal(valore) -> str:
    if valore is None:
        return "null"
    return "'" + str(valore).replace("'", "''") + "'"


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2

    sorgente = Path(sys.argv[1])
    if not sorgente.is_file():
        print(f"ERRORE: non trovo il file {sorgente}")
        return 1

    destinazione = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("C:/tmp") / f"import-legacy-{sorgente.stem}.sql"

    with sorgente.open(encoding="utf-8-sig", newline="") as fh:
        righe = list(csv.DictReader(fh))

    if not righe:
        print("ERRORE: il file non contiene righe")
        return 1

    valori: list[str] = []
    viste: set[str] = set()
    scartate: list[str] = []
    tel_rifiutati: list[str] = []
    date_rifiutate: list[str] = []
    prov_ignote: set[str] = set()
    conteggi = {"telefono": 0, "citta": 0, "provincia": 0, "nascita": 0, "paese": 0}

    for i, r in enumerate(righe, start=2):  # riga 1 = intestazione
        email = pulisci(r.get("Email"))
        if not email or not RE_EMAIL.match(email):
            scartate.append(f"riga {i}: email assente o fuori formato")
            continue

        chiave = email.lower()
        if chiave in viste:
            scartate.append(f"riga {i}: indirizzo ripetuto nel file")
            continue
        viste.add(chiave)

        telefono, motivo_tel = normalizza_telefono(r.get("Telefono"))
        if motivo_tel:
            tel_rifiutati.append(f"riga {i}: {motivo_tel}")
        if telefono:
            conteggi["telefono"] += 1

        nascita, motivo_data = normalizza_data(r.get("Data di nascita"))
        if motivo_data:
            date_rifiutate.append(f"riga {i}: {motivo_data}")
        if nascita:
            conteggi["nascita"] += 1

        prov_grezza = pulisci(r.get("Provincia"))
        provincia = None
        if prov_grezza:
            provincia = PROVINCE.get(prov_grezza.lower())
            if provincia:
                conteggi["provincia"] += 1
            else:
                prov_ignote.add(prov_grezza)

        paese_grezzo = pulisci(r.get("Paese"))
        paese = PAESI.get(paese_grezzo.lower()) if paese_grezzo else None
        if paese:
            conteggi["paese"] += 1

        citta = pulisci(r.get("Città"))
        if citta:
            conteggi["citta"] += 1

        # `raw` conserva il record ORIGINALE intero, celle vuote comprese: è la sola
        # copia di ciò che l'export diceva davvero, e i tre consensi vivono qui.
        import json

        raw = json.dumps({k: v for k, v in r.items()}, ensure_ascii=False)

        valori.append(
            "  ({}, {}, {}, {}, {}, {}, {}, {}, 'letsdonation-export-2026-07-27', {}::jsonb)".format(
                sql_literal(chiave),
                sql_literal(pulisci(r.get("Nome"))),
                sql_literal(pulisci(r.get("Cognome"))),
                sql_literal(telefono),
                sql_literal(citta),
                sql_literal(provincia),
                sql_literal(paese),
                sql_literal(nascita),
                sql_literal(raw),
            )
        )

    # A BLOCCHI, non in un unico INSERT da 1352 tuple. Con un solo comando basta una
    # riga storta — un vincolo che non avevamo previsto, un carattere che il database
    # rifiuta — per far fallire l'intero import: si perderebbero 1351 righe buone a
    # causa di una, e senza sapere quale. A blocchi di 100 l'errore resta confinato,
    # il messaggio di PostgreSQL dice quale blocco, e le altre righe entrano.
    # La transazione resta UNICA (begin/commit attorno a tutto): o l'import è completo
    # o si annulla per intero, che è ciò che serve a un'operazione one-shot su dati
    # personali. I blocchi servono a localizzare il guasto, non a spezzare l'atomicità.
    DIM_BLOCCO = 100
    blocchi = [valori[i : i + DIM_BLOCCO] for i in range(0, len(valori), DIM_BLOCCO)]

    intestazione = f"""-- Import anagrafiche storiche in `public.legacy_contacts`
-- Generato da scripts/prepara-import-legacy.py
-- Sorgente: {sorgente.name}
--
-- ⚠️ CONTIENE DATI PERSONALI DI {len(valori)} PERSONE REALI. Non committare, non
-- inoltrare, cancellare dopo l'uso.
--
-- ⚠️ PRIMA DI ESEGUIRE, due condizioni che non sono tecniche:
--   ① l'informativa privacy dev'essere pubblicata (l'import è un trattamento);
--   ② la base giuridica dev'essere chiusa con la consulente — questi dati sono stati
--      raccolti altrove, e i consensi che l'export riporta NON diventano nostri.
-- E una che è tecnica ma pesa uguale: l'import va fatto PRIMA che comincino le
-- registrazioni vere. Chi si registra prima del caricamento e completa il profilo non
-- si ricollegherà mai da solo al proprio storico (vedi l'avvertenza nella 0012).
--
-- È RIESEGUIBILE: `on conflict (email_norm) do nothing`. Una seconda esecuzione non
-- duplica nulla e non sovrascrive le righe già rivendicate da qualcuno.

begin;

insert into public.legacy_contacts
  (email_norm, first_name, last_name, phone, city, province, country, birth_date, source, raw)
values
"""

    pezzi = []
    for n_blocco, blocco in enumerate(blocchi, start=1):
        primo = (n_blocco - 1) * DIM_BLOCCO + 1
        ultimo = primo + len(blocco) - 1
        pezzi.append(
            f"-- blocco {n_blocco} di {len(blocchi)} (righe {primo}-{ultimo})\n"
            "insert into public.legacy_contacts\n"
            "  (email_norm, first_name, last_name, phone, city, province, country, birth_date, source, raw)\n"
            "values\n"
            + ",\n".join(blocco)
            + "\non conflict (email_norm) do nothing;\n"
        )
    corpo = "\n".join(pezzi)
    coda = """

-- Controllo: quante righe ci sono ora, e quante risultano già collegate a un account.
select count(*) as righe_totali,
       count(claimed_by) as gia_collegate
  from public.legacy_contacts;

commit;
"""

    destinazione.parent.mkdir(parents=True, exist_ok=True)
    destinazione.write_text(intestazione + corpo + coda, encoding="utf-8")

    n = len(valori)
    print(f"Righe lette dal file ......... {len(righe)}")
    print(f"Righe pronte per l'import .... {n}")
    print(f"Righe scartate ............... {len(scartate)}")
    print()
    print("Campi valorizzati (sul totale importabile):")
    for campo, quanti in conteggi.items():
        print(f"  {campo:<12} {quanti:>5} / {n}")
    print()
    print(f"Telefoni NON normalizzati (restano solo in `raw`): {len(tel_rifiutati)}")
    print(f"Date di nascita non interpretabili ..............: {len(date_rifiutate)}")
    if prov_ignote:
        print(f"⚠️  Province senza sigla nota (non tradotte): {sorted(prov_ignote)}")
        print("    → aggiungerle alla mappa PROVINCE in questo script e rigenerare.")
    if scartate:
        print()
        print("Motivi degli scarti (primi 10):")
        for s in scartate[:10]:
            print(f"  {s}")
    print()
    print(f"SQL scritto in: {destinazione}")
    print("NON è stato applicato niente: l'esecuzione è una decisione separata.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
