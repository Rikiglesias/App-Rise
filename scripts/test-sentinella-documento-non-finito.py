"""Sentinella della sentinella: `_sentinella_documento_non_finito` di md2pdf-brief.py.

Si lancia a mano, senza dipendenze:

    python scripts/test-sentinella-documento-non-finito.py

Perche' esiste, e perche' la parte che conta e' la seconda.
Questa guardia impedisce che un documento verso un terzo nasca con dentro un segnaposto mai
riempito o un residuo dello strumento con cui e' stato scritto. Una guardia del genere ha DUE modi
di fallire, e il secondo e' quello che fa danno davvero:

  1. lascia passare cio' che doveva fermare  -> il residuo arriva al destinatario;
  2. ferma cio' che doveva passare           -> la consegna si blocca su un falso allarme, e chi
     ha fretta spegne il controllo. Una guardia disattivata protegge zero.

La prima versione di questa regex e' caduta esattamente nel modo (2): segnalava 28 punti in
`app-gate-matrice.md`, che usa [V] e [A] come notazione DICHIARATA nel testo, e un segnaposto
`<data>` dentro un backtick in `identita-matrice-scenari.md`, dove descriveva la forma di un URL.
Nessuno dei due era un difetto. Per questo la parte piu' importante del file e' PARTE 2: i
documenti VERI, che devono passare tutti.

PARTE 3 e' il mutation test: rimuove la CHIAMATA dentro build() e pretende che il PDF nasca. Senza
questo, una guardia scollegata passerebbe le prime due parti restando inerte.
"""

from __future__ import annotations

import importlib.util
import sys
import tempfile
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
SORGENTE = RADICE / "scripts" / "md2pdf-brief.py"

# I documenti che vengono davvero consegnati o che hanno la stessa forma: nessuno deve bloccare.
DOCUMENTI_REALI = [
    "docs/integrazioni/letsdonation-brief-integrazione.md",
    "docs/informativa-punti-aperti.md",
    "docs/integrazioni/app-gate-matrice.md",
    "docs/integrazioni/identita-matrice-scenari.md",
]

DEVE_BLOCCARE = [
    ("marcatore di lavoro non finito", ["TODO: chiedere il numero a Marco."]),
    ("campo del modello mai sostituito", ["Gentile <nome>, in data <data> abbiamo concordato."]),
    ("quadra che chiede di essere riempita", ["Il totale e' [da inserire] euro."]),
    ("quadra vuota", ["Referente: []"]),
    ("quadra coi soli puntini", ["Firma: [...]"]),
    ("marcatore di citazione di un assistente", ["Come mostrato citeturn0search1 qui sopra."]),
    ("parametro di provenienza nell'URL", ["Vedi https://esempio.it/x?utm_source=chatgpt.com"]),
]

NON_DEVE_BLOCCARE = [
    # I due falsi positivi trovati sui documenti veri: sono la ragione di questo file.
    ("notazione [V]/[A] dichiarata nel testo",
     ["Ogni affermazione e' **[V]** se verificata alla fonte, **[A]** se assunta."]),
    ("segnaposto dentro codice inline (e' una specifica)",
     ["Metti `utm_campaign=newsletter-<data>` sui link della newsletter."]),
    # Markdown legittimo che una regex ingenua scambierebbe per segnaposto.
    ("nota numerata", ["Come detto sopra [1] e piu' avanti [12]."]),
    ("link markdown", ["Vedi la [documentazione](https://esempio.it/doc)."]),
    ("casella di spunta", ["- [ ] Attivita' da fare", "- [x] Attivita' fatta"]),
    ("rimando di Obsidian", ["Rimando a [[nota-interna]] del vault."]),
    ("esempio dentro un blocco di codice", ["```python", "# TODO: esempio didattico", "```"]),
    ("utm di campagna legittimo", ["Vedi https://esempio.it/x?utm_source=newsletter"]),
    ("testo pulito", ["Il progetto prevede tre fasi.", "La prima parte a settembre."]),
]


def carica(sorgente_testo: str, etichetta: str):
    percorso = Path(tempfile.gettempdir()) / f"_md2pdf_{etichetta}.py"
    percorso.write_text(sorgente_testo, encoding="utf-8")
    spec = importlib.util.spec_from_file_location(f"_md2pdf_{etichetta}", percorso)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def blocca(modulo, righe: list[str]) -> bool:
    numerate = list(enumerate(righe, 1))
    try:
        modulo._sentinella_documento_non_finito(Path("prova.md"), numerate)
        return False
    except SystemExit:
        return True


def main() -> int:
    if not SORGENTE.exists():
        print(f"FAIL: non trovo {SORGENTE}")
        return 1
    testo = SORGENTE.read_text(encoding="utf-8")
    m = carica(testo, "vero")
    falliti: list[str] = []

    print("PARTE 1 - casi che DEVONO bloccare")
    for nome, righe in DEVE_BLOCCARE:
        if blocca(m, righe):
            print(f"  ok   {nome}")
        else:
            print(f"  FAIL {nome}: e' passato, doveva bloccare")
            falliti.append(nome)

    print("PARTE 1-bis - casi che NON devono bloccare")
    for nome, righe in NON_DEVE_BLOCCARE:
        if blocca(m, righe):
            print(f"  FAIL {nome}: ha bloccato, doveva passare")
            falliti.append(nome)
        else:
            print(f"  ok   {nome}")

    print("PARTE 2 - documenti REALI, nessuno deve bloccare")
    for doc in DOCUMENTI_REALI:
        percorso = RADICE / doc
        if not percorso.exists():
            print(f"  --   {doc} (assente, saltato)")
            continue
        numerate = m._righe_consegnate_numerate(percorso.read_text(encoding="utf-8"))
        try:
            m._sentinella_documento_non_finito(percorso, numerate)
            print(f"  ok   {doc}")
        except SystemExit as errore:
            righe_errore = str(errore).split("\n")
            prima_riga = righe_errore[1] if len(righe_errore) > 1 else str(errore)
            print(f"  FAIL {doc} ha bloccato: {prima_riga[:150]}")
            falliti.append(doc)

    print("PARTE 3 - mutation test: senza la CHIAMATA, il PDF deve nascere")
    riga_chiamata = "    _sentinella_documento_non_finito(md_path, numerate)\n"
    if riga_chiamata not in testo:
        print("  FAIL la riga di chiamata non esiste: la guardia e' scollegata da build()")
        falliti.append("mutation: chiamata assente")
    else:
        md = Path(tempfile.gettempdir()) / "_prova_sentinella.md"
        md.write_text("# Titolo\n\nTesto.\n\nTODO: chiedere il numero.\n", encoding="utf-8")
        pdf = Path(tempfile.gettempdir()) / "_prova_sentinella.pdf"

        def esito(sorgente_testo: str, etichetta: str) -> str:
            modulo = carica(sorgente_testo, etichetta)
            try:
                modulo.build(md, pdf)
                return "nasce"
            except SystemExit as errore:
                return "blocca" if "non era finito" in str(errore) else "blocca-per-altro"

        con = esito(testo, "collegata")
        senza = esito(testo.replace(riga_chiamata, "", 1), "scollegata")
        if con == "blocca" and senza == "nasce":
            print("  ok   con la guardia blocca, senza la chiamata nasce")
        else:
            print(f"  FAIL con={con} senza={senza} (atteso con=blocca senza=nasce)")
            falliti.append("mutation test")
        md.unlink(missing_ok=True)
        pdf.unlink(missing_ok=True)

    print()
    if falliti:
        print(f"FAIL: test-sentinella-documento-non-finito ({len(falliti)}): {', '.join(falliti[:5])}")
        return 1
    totale = len(DEVE_BLOCCARE) + len(NON_DEVE_BLOCCARE) + len(DOCUMENTI_REALI) + 1
    print(f"PASS: test-sentinella-documento-non-finito ({totale} controlli)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
