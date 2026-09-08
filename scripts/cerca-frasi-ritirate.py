#!/usr/bin/env python3
"""
Cerca in una trascrizione le frasi che erano state RITIRATE da un documento in uscita.

Perche' esiste: `frasi-ritirate.json` presidia il PDF — `md2pdf-brief.py` si rifiuta di
generarlo se una frase ritirata e' rientrata nel testo. Ma **nessuno presidia la voce**:
in una call quelle stesse frasi possono essere pronunciate, e una frase ritirata detta a
un terzo non e' una svista interna, e' un erratum verso il destinatario.

Perche' non un grep: nel parlato la frase non esce mai identica allo scritto — cambia
l'ordine, si perdono le preposizioni, il verbo si coniuga diverso. Un confronto letterale
troverebbe zero e consegnerebbe un «nessuna frase detta» falso, che e' il verdetto peggiore.
Qui si confrontano le parole PORTANTI dentro una finestra scorrevole, e si riporta ogni
sospetto col minuto, da verificare a orecchio.

Uso:
    python cerca-frasi-ritirate.py "C:/path/trascrizione.json"
    python cerca-frasi-ritirate.py "C:/path/trascrizione.txt" --soglia 0.5

La soglia e' la quota di parole portanti che devono comparire nella finestra (default 0.6).
Piu' bassa = piu' sospetti da controllare a mano, meno rischio di perderne uno.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

REGISTRO = Path(__file__).resolve().parent.parent / "docs" / "integrazioni" / "frasi-ritirate.json"

# Parole troppo comuni per distinguere una frase: se restassero, qualunque finestra
# di testo somiglierebbe a qualunque frase.
VUOTE = {
    "il", "lo", "la", "i", "gli", "le", "un", "uno", "una", "di", "a", "da", "in", "con",
    "su", "per", "tra", "fra", "del", "dello", "della", "dei", "degli", "delle", "al",
    "allo", "alla", "ai", "agli", "alle", "dal", "dalla", "nel", "nella", "nei", "negli",
    "nelle", "sul", "sulla", "e", "ed", "o", "ma", "se", "che", "chi", "cui", "non", "ne",
    "ci", "si", "mi", "ti", "vi", "li", "come", "anche", "solo", "piu", "molto", "essere",
    "sono", "sia", "stato", "stata", "ha", "ho", "hai", "abbiamo", "avere", "fa",
    "fare", "puo", "possa", "quello", "questo", "quella", "questa", "nostro", "nostra",
    "vostro", "vostra", "loro", "suo", "sua", "quel",
}


def normalizza(testo: str) -> list[str]:
    """Minuscole, via accenti e punteggiatura: il parlato non conserva la forma scritta."""
    piatto = unicodedata.normalize("NFD", testo.lower())
    piatto = "".join(c for c in piatto if unicodedata.category(c) != "Mn")
    return re.findall(r"[a-z0-9']+", piatto)


def portanti(parole: list[str]) -> set[str]:
    return {p for p in parole if p not in VUOTE and len(p) > 2}


# Quante lettere iniziali devono coincidere perche' due parole contino come la stessa.
# Serve per la flessione: «aprendo» contro «aprire», «titolari» contro «titolare»,
# «minorenni» contro «minorenne». Senza questo, una parola portante su tre si perde e
# una parafrasi appena piu' libera scivola sotto soglia — cioe' sparisce.
RADICE = 5


def combacia(chiave: str, parola: str) -> bool:
    if chiave == parola:
        return True
    minimo = min(len(chiave), len(parola))
    if minimo < RADICE:
        return False
    return chiave[:RADICE] == parola[:RADICE]


def quante_trovate(chiavi: set[str], finestra: list[str]) -> set[str]:
    """Le chiavi ritrovate nella finestra, ammettendo forme flesse."""
    return {c for c in chiavi if any(combacia(c, p) for p in finestra)}


def hms(secondi: float) -> str:
    ore, resto = divmod(int(secondi), 3600)
    minuti, sec = divmod(resto, 60)
    return f"{ore:02d}:{minuti:02d}:{sec:02d}"


def carica_trascrizione(percorso: Path) -> list[dict]:
    """Restituisce segmenti con inizio/testo. Dal .json arrivano i minuti; dal .txt no."""
    if percorso.suffix.lower() == ".json":
        dati = json.loads(percorso.read_text(encoding="utf-8"))
        return [
            {"inizio": s.get("inizio", 0.0), "testo": s.get("testo", "")}
            for s in dati.get("segmenti", [])
        ]
    return [{"inizio": None, "testo": percorso.read_text(encoding="utf-8")}]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Cerca frasi ritirate dentro una trascrizione."
    )
    parser.add_argument("trascrizione", help="File .json (preferito) o .txt della trascrizione")
    parser.add_argument(
        "--soglia",
        type=float,
        default=0.5,
        help="Quota di parole portanti da ritrovare (default 0.5, deliberatamente cauta: "
        "meglio qualche sospetto in piu' da riascoltare che una frase persa).",
    )
    parser.add_argument(
        "--registro", default=str(REGISTRO), help="Percorso di frasi-ritirate.json"
    )
    args = parser.parse_args()

    percorso = Path(args.trascrizione).expanduser()
    if not percorso.exists():
        raise SystemExit(f"Trascrizione non trovata: {percorso}")

    registro = Path(args.registro).expanduser()
    if not registro.exists():
        raise SystemExit(f"Registro non trovato: {registro}")

    dati = json.loads(registro.read_text(encoding="utf-8"))
    voci = [
        voce
        for chiave, blocco in dati.items()
        if not chiave.startswith("_")
        for voce in blocco
    ]
    if not voci:
        raise SystemExit("Il registro non contiene frasi: controllare il file.")

    segmenti = carica_trascrizione(percorso)
    if not segmenti:
        raise SystemExit("La trascrizione non contiene segmenti.")

    # Un indice unico di parole, con il minuto di ognuna: la frase parlata puo'
    # attraversare il confine fra due segmenti.
    parole: list[str] = []
    minuti: list[float | None] = []
    for segmento in segmenti:
        for parola in normalizza(segmento["testo"]):
            parole.append(parola)
            minuti.append(segmento["inizio"])

    print(f"Trascrizione : {percorso.name}  ({len(parole)} parole)")
    print(f"Registro     : {len(voci)} frasi ritirate")
    print(f"Soglia       : {args.soglia:.0%} delle parole portanti\n")

    sospetti = 0
    for indice, voce in enumerate(voci, start=1):
        frase = voce.get("frase", "")
        chiavi = portanti(normalizza(frase))
        if not chiavi:
            print(f"{indice:2}. NON CERCABILE (solo parole comuni): «{frase}»")
            continue

        # Finestra larga il triplo delle parole portanti: nel parlato ci si
        # infilano incisi, ripetizioni e correzioni a meta' frase.
        larghezza = max(len(chiavi) * 3, 12)
        quota_migliore = 0.0
        avvio_migliore = 0
        trovate_migliori: set[str] = set()
        for avvio in range(0, max(1, len(parole) - larghezza + 1)):
            finestra = parole[avvio : avvio + larghezza]
            trovate = quante_trovate(chiavi, finestra)
            quota = len(trovate) / len(chiavi)
            if quota > quota_migliore:
                quota_migliore = quota
                avvio_migliore = avvio
                trovate_migliori = trovate

        if quota_migliore >= args.soglia:
            sospetti += 1
            fine_finestra = min(avvio_migliore + larghezza, len(parole))
            # Il minuto da riportare e' quello della PRIMA parola-chiave dentro la
            # finestra, non quello in cui la finestra comincia: la finestra e' larga
            # il triplo della frase, e su una call lunga il divario manda a
            # riascoltare minuti prima del punto giusto.
            posizione = avvio_migliore
            for scorri in range(avvio_migliore, fine_finestra):
                if any(combacia(c, parole[scorri]) for c in trovate_migliori):
                    posizione = scorri
                    break
            momento = minuti[posizione] if posizione < len(minuti) else None
            dove = f" al minuto {hms(momento)}" if momento is not None else ""
            contesto = " ".join(parole[avvio_migliore:fine_finestra])
            print(f"{indice:2}. [!] SOSPETTA{dove} — corrispondenza {quota_migliore:.0%}")
            print(f"    ritirata il {voce.get('tolta_il', '?')}: {voce.get('perche', '')[:100]}")
            print(f"    frase   : «{frase}»")
            print(f"    sentito : ...{contesto}...\n")
        else:
            print(f"{indice:2}. ok ({quota_migliore:.0%}) — «{frase[:60]}»")

    print()
    if sospetti:
        print(f"{sospetti} frasi da VERIFICARE A ORECCHIO al minuto indicato.")
        print("Una frase ritirata detta davvero a voce e' un erratum verso il partner,")
        print("non una svista interna: va portata a Riccardo prima di scrivere il verbale.")
    else:
        print("Nessuna corrispondenza sopra soglia.")
        print("NON e' una prova che non siano state dette: la soglia puo' mancare una")
        print("parafrasi lontana. Per le frasi che pesano di piu', riascoltare comunque.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
