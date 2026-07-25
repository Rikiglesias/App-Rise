"""Converte un documento markdown di `docs/` in un PDF leggibile da un destinatario esterno.

Nato per il brief di integrazione verso Let's Donation (`docs/integrazioni/…`), che va
consegnato in PDF a un referente non tecnico.

PERCHE' STA NEL REPO: le due versioni precedenti vivevano in cartelle temporanee di sessione
e si sono perse entrambe, costringendo a riscriverlo da zero. Un artefatto che serve a ogni
consegna non puo' abitare in `%TEMP%`.

DIPENDENZA ESTERNA (non in package.json, e' uno strumento di consegna, non di build):
    pip install reportlab

USO:
    python scripts/md2pdf-brief.py docs/integrazioni/letsdonation-brief-integrazione.md out.pdf

DIFETTI GIA' CORRETTI, in ordine di scoperta:
  - i bullet con start="square" rendevano la lettera «n» (glifo ZapfDingbats) -> bulletText
    esplicito «•» con font Helvetica;
  - il corsivo *testo* lasciava gli asterischi a video -> conversione esplicita in <i>;
  - grassetto e corsivo aperti su una riga e chiusi sulla successiva -> il paragrafo si
    accumula e si converte UNA volta, sul testo intero;
  - **le tabelle markdown finivano nel PDF come testo con le barre verticali**, riga di
    separazione `| --- |` inclusa (39 barre nel brief del 2026-07-25, due tabelle rovinate,
    fra cui quella tecnica su quali dati passano) -> ora sono tabelle vere, con intestazione
    ripetuta se spezzano pagina.
"""

import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BASE = getSampleStyleSheet()

# Larghezza utile = A4 meno i margini laterali del documento (20 mm + 20 mm).
CONTENT_WIDTH = 170 * mm

STYLES = {
    "h1": ParagraphStyle(
        "h1", parent=BASE["Heading1"], fontSize=17, leading=21, spaceAfter=10,
        textColor="#1a1a1a",
    ),
    "h2": ParagraphStyle(
        "h2", parent=BASE["Heading2"], fontSize=13.5, leading=17, spaceBefore=14,
        spaceAfter=7, textColor="#8a2020",
    ),
    "h3": ParagraphStyle(
        "h3", parent=BASE["Heading3"], fontSize=11.5, leading=15, spaceBefore=10,
        spaceAfter=5, textColor="#333333",
    ),
    "body": ParagraphStyle(
        "body", parent=BASE["BodyText"], fontSize=9.8, leading=14.2,
        alignment=TA_JUSTIFY, spaceAfter=6,
    ),
    "quote": ParagraphStyle(
        "quote", parent=BASE["BodyText"], fontSize=9.2, leading=13.4, leftIndent=10,
        borderPadding=4, textColor="#444444", spaceAfter=7,
    ),
    "code": ParagraphStyle(
        "code", parent=BASE["BodyText"], fontName="Courier", fontSize=8.4, leading=11.5,
        leftIndent=10, textColor="#222222", spaceAfter=7,
    ),
    # Celle: corpo piu' piccolo e allineato a sinistra (il giustificato, in colonna
    # stretta, apre buchi fra le parole).
    "th": ParagraphStyle(
        "th", parent=BASE["BodyText"], fontName="Helvetica-Bold", fontSize=9, leading=12,
        spaceAfter=0, textColor="#1a1a1a",
    ),
    "td": ParagraphStyle(
        "td", parent=BASE["BodyText"], fontSize=9, leading=12.4, spaceAfter=0,
    ),
    # Voce di elenco NUMERATO: il numero sta nel testo, quindi serve solo il rientro.
    "ol": ParagraphStyle(
        "ol", parent=BASE["BodyText"], fontSize=9.8, leading=14.2, alignment=TA_JUSTIFY,
        leftIndent=14, spaceAfter=6,
    ),
}

# Proporzioni di colonna: la prima colonna delle tabelle di questo brief e' un'etichetta
# («chi arriva», «dato»), la seconda il discorso -> non vanno larghe uguali.
COL_RATIOS = {
    2: (0.34, 0.66),
    3: (0.26, 0.37, 0.37),
}


def col_ratios(ncols: int) -> tuple[float, ...]:
    """Proporzioni per un numero qualsiasi di colonne.

    Oltre le tre colonne non si prova a indovinare la semantica: la prima resta un po' piu'
    stretta (nelle matrici di `docs/` e' un identificativo tipo «A1», «G3») e il resto si
    divide in parti uguali. Serve perche' le matrici hanno tabelle da 5-7 colonne e senza
    fallback finivano tutte a larghezza uguale.
    """
    if ncols in COL_RATIOS:
        return COL_RATIOS[ncols]
    if ncols <= 1:
        return (1.0,)
    prima = 0.10
    resto = (1.0 - prima) / (ncols - 1)
    return (prima,) + tuple([resto] * (ncols - 1))

TABLE_STYLE = TableStyle(
    [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f2ede9")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cfc6c0")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
)

SEPARATOR_ROW = re.compile(r"^\|[\s:|-]+\|$")

# I font base di reportlab (Helvetica & co.) usano WinAnsiEncoding: un carattere fuori da
# quella codifica NON da' errore, esce come un glifo sbagliato. Scoperto sul brief del
# 2026-07-25: la freccia «→» veniva resa «fi», e in tabella si leggeva «Tocca "Entra con
# RAH" fi la nostra pagina» - una frase senza senso, in un documento destinato a un partner.
# Si mappa invece di cambiare font: nel brief il carattere fuori codifica era UNO, e
# registrare un font Unicode per quattro frecce sarebbe sproporzionato (piu' peso, piu'
# dipendenza dal sistema, rischio di layout diverso).
# «->» e non «»» perche' il documento usa gia' le virgolette «...» e il segno si leggerebbe
# come una chiusura di citazione.
FUORI_WINANSI = {
    "→": "->",   # freccia destra
    "←": "<-",
    "⇒": "=>",
    "≤": "<=",
    "≥": ">=",
    "≠": "!=",
    "…": "...",  # puntini di sospensione tipografici
    "‑": "-",    # trattino unificatore
    # Marcatori usati nelle matrici di `docs/`: sono la colonna «provvedimento», cioe' il
    # significato della riga. Non mapparli voleva dire glifi sbagliati esattamente dove sta
    # l'informazione (62 righe in identita-matrice-scenari, 21 in app-gate-matrice).
    "🔧": "[noi]",
    "📨": "[a loro]",
    "⚠": "[!]",
    "🔑": "[leva]",
    "✅": "[fatto]",
    "❌": "[no]",
    "🔴": "[urgente]",
    "🟡": "[medio]",
    "🔵": "[in coda]",
    "⚪": "[con calma]",
    "🧭": "[quadro]",
    "➡": "->",
    "🎯": "[obiettivo]",
    "🔝": "[in testa]",
    "️": "",  # variation selector: accompagna gli emoji, non e' un carattere visibile
}


def avvisa_caratteri_non_mappati(text: str) -> None:
    """Sentinella: elenca i caratteri che il font non sa rendere e che non sono mappati.

    Serve a impedire il ritorno silenzioso della classe di bug: senza questo controllo un
    carattere nuovo nel markdown produce un glifo sbagliato che nessuno nota, perche' il
    generatore esce con successo.
    """
    ignoti = sorted(
        {
            ch
            for ch in text
            if ch not in FUORI_WINANSI and not ch.isspace() and not _in_winansi(ch)
        }
    )
    if ignoti:
        dettaglio = ", ".join(f"U+{ord(c):04X} ({c!r})" for c in ignoti)
        # FERMA la generazione, non avvisa soltanto: prima usciva «OK ->» con exit 0 e
        # l'avviso su stderr, quindi il PDF con i glifi sbagliati sembrava buono. Un
        # controllo che non blocca e' esattamente la classe di bug che doveva impedire.
        raise SystemExit(
            f"BLOCCATO: {len(ignoti)} carattere(i) non rappresentabile(i) dal font e non "
            f"mappato(i) -> uscirebbe un glifo SBAGLIATO: {dettaglio}. "
            f"Aggiungerlo(i) a FUORI_WINANSI e rigenerare."
        )


def _in_winansi(ch: str) -> bool:
    try:
        ch.encode("cp1252")
        return True
    except UnicodeEncodeError:
        return False


def inline(text: str) -> str:
    """Markdown inline -> markup Platypus. L'ordine conta: prima il codice."""
    for src, dst in FUORI_WINANSI.items():
        text = text.replace(src, dst)
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    text = re.sub(r"`([^`]+)`", r'<font face="Courier" size="8.6">\1</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    # corsivo: singolo asterisco non adiacente ad altri asterischi
    text = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<i>\1</i>", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)  # link -> solo testo
    _sentinella_residui(text)
    return text


# Marcatori che, se sopravvivono alla conversione, il destinatario LEGGE nel PDF.
# Perche' esiste: le voci di elenco vengono convertite una RIGA per volta (a differenza
# dei paragrafi, che prima si uniscono), quindi un grassetto che attraversa l'a-capo
# non viene mai chiuso e i due asterischi finiscono stampati. E' arrivato fino al PDF
# del partner una volta; la verifica di allora guardava le tabelle e i glifi, non questo.
# Come la sentinella dei caratteri fuori codifica: SPARA, non avvisa — un avviso su
# stderr in mezzo all'output non ferma nessuno.
RESIDUI_MARKDOWN = ("**", "`")


def _sentinella_residui(text: str) -> None:
    trovati = [m for m in RESIDUI_MARKDOWN if m in text]
    if trovati:
        raise SystemExit(
            "SENTINELLA: marcatori markdown non convertiti, finirebbero VISIBILI nel PDF: "
            f"{trovati}\n  nel testo: {text[:180]}\n"
            "  Causa tipica: grassetto o codice che attraversa un a-capo dentro una voce "
            "di elenco. Rimetti l'apertura e la chiusura sulla stessa riga."
        )


def split_row(line: str) -> list[str]:
    """`| a | b |` -> ['a', 'b']. Le barre di bordo sono opzionali in markdown.

    La barra ESCAPATA (`\\|`) e' contenuto della cella, non un separatore: senza questa
    distinzione una sola cella con `Un Pasto in Sospeso \\| Bologna` aggiunge una colonna
    fantasma a TUTTA la tabella (le colonne si contano col massimo) e lascia il backslash
    a video nel PDF consegnato.
    """
    cells = re.split(r"(?<!\\)\|", line)
    if cells and not cells[0].strip():
        cells = cells[1:]
    if cells and not cells[-1].strip():
        cells = cells[:-1]
    return [c.strip().replace("\\|", "|") for c in cells]


def build_table(rows: list[str]):
    """Righe markdown grezze -> Table di reportlab, o None se non e' una tabella.

    La riga di separazione (`| --- | --- |`) NON e' contenuto: si scarta. Se manca del
    tutto, il blocco non e' una tabella markdown valida e il chiamante lo tratta come testo,
    invece di produrre una tabella a caso.
    """
    body = [r for r in rows if not SEPARATOR_ROW.match(r.strip())]
    if len(body) == len(rows):  # nessuna riga di separazione trovata
        return None
    if not body:
        return None

    parsed = [split_row(r) for r in body]
    ncols = max(len(r) for r in parsed)
    # Righe con meno celle del previsto vengono pareggiate: una tabella storta e' meglio
    # di un'eccezione durante una consegna.
    for row in parsed:
        row.extend([""] * (ncols - len(row)))

    data = [
        [
            Paragraph(inline(cell), STYLES["th"] if i == 0 else STYLES["td"])
            for cell in row
        ]
        for i, row in enumerate(parsed)
    ]

    widths = [CONTENT_WIDTH * r for r in col_ratios(ncols)]

    # splitByRow/splitInRow: nelle matrici una singola riga puo' contenere celle da 200+
    # caratteri e diventare piu' alta della pagina. Senza il permesso di spezzarla DENTRO,
    # reportlab non sa dove metterla e la tabella si perde.
    table = Table(data, colWidths=widths, repeatRows=1, splitByRow=1, splitInRow=1)
    table.setStyle(TABLE_STYLE)
    return table


def build(md_path: Path, pdf_path: Path) -> None:
    sorgente = md_path.read_text(encoding="utf-8")
    avvisa_caratteri_non_mappati(sorgente)
    lines = sorgente.splitlines()
    story: list = []
    bullets: list = []
    in_code = False
    code_buf: list = []
    # Un paragrafo markdown puo' occupare piu' righe: il grassetto e il corsivo possono
    # aprirsi su una riga e chiudersi sulla successiva. Vanno quindi accumulati e
    # convertiti UNA VOLTA sul paragrafo intero, altrimenti gli asterischi restano a video.
    para: list = []
    quote: list = []
    table_rows: list = []
    # Wrapper mutabile: le funzioni di flush sono chiusure, e serve poter cambiare il tipo
    # di elenco dall'esterno.
    numerato: list = [False]
    in_comment: list = [False]

    def flush_para() -> None:
        if para:
            story.append(Paragraph(inline(" ".join(para)), STYLES["body"]))
            para.clear()

    def flush_quote() -> None:
        if quote:
            story.append(Paragraph(inline(" ".join(quote)), STYLES["quote"]))
            quote.clear()

    def flush_bullets() -> None:
        """Chiude il punto elenco aperto.

        Numerato e puntato NON si mescolano: prima l'elenco numerato riceveva sia il pallino
        (bulletType="bullet") sia il «1.» iniettato nel testo, e nel PDF usciva «• 1. …».
        Visto dal vivo sul documento di consegna del 2026-07-25, dove i passi erano l'unica
        lista. Come si numera davvero: vedi il commento nel ramo `numerato` qui sotto.
        """
        if not bullets:
            return
        if numerato[0]:
            # Il numero e' quello SCRITTO NEL MARKDOWN, gia' dentro il testo della voce.
            # Due strade scartate, entrambe provate sul documento di consegna:
            #   - bulletType="1" (numerazione di reportlab) -> mostrava «1» su tutte le voci;
            #   - enumerate() qui -> riparte da 1 a ogni voce, perche' una riga vuota fra le
            #     voci chiude l'elenco e questa funzione viene richiamata per ognuna.
            # Il numero del documento non puo' sbagliare: e' quello che l'autore ha scritto.
            for b in bullets:
                story.append(Paragraph(b, STYLES["ol"]))
        else:
            story.append(
                ListFlowable(
                    [
                        ListItem(Paragraph(b, STYLES["body"]), leftIndent=14)
                        for b in bullets
                    ],
                    bulletType="bullet",
                    bulletFontName="Helvetica",
                    bulletFontSize=7,
                    start="•",
                    leftIndent=12,
                )
            )
        story.append(Spacer(1, 3))
        bullets.clear()
        numerato[0] = False

    def flush_table() -> None:
        if not table_rows:
            return
        table = build_table(table_rows)
        if table is None:
            # Non era una tabella: meglio il testo grezzo che perdere il contenuto.
            story.append(Paragraph(inline(" ".join(table_rows)), STYLES["body"]))
        else:
            story.append(table)
            story.append(Spacer(1, 7))
        table_rows.clear()

    def flush_all() -> None:
        flush_para()
        flush_quote()
        flush_bullets()
        flush_table()

    for raw in lines:
        line = raw.rstrip()

        # Commento HTML = nota INTERNA, non contenuto: non deve finire nel PDF consegnato.
        # Senza questo, l'intestazione «documento da mandare a…, non ancora inviato» aggiunta
        # a un documento in partenza veniva stampata in prima pagina e il destinatario
        # leggeva le nostre note di lavoro.
        if in_comment[0]:
            if "-->" in line:
                in_comment[0] = False
            continue
        if line.lstrip().startswith("<!--"):
            if "-->" not in line:
                in_comment[0] = True
            continue

        if line.startswith("```"):
            if in_code:
                story.append(Paragraph("<br/>".join(code_buf), STYLES["code"]))
                code_buf.clear()
            in_code = not in_code
            continue
        if in_code:
            code_buf.append(
                line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            )
            continue

        if not line.strip():
            flush_all()
            continue

        if line.lstrip().startswith("|"):
            # La tabella interrompe qualunque blocco aperto, ma NON se stessa.
            flush_para()
            flush_quote()
            flush_bullets()
            table_rows.append(line.strip())
        elif line.startswith("### "):
            flush_all()
            story.append(Paragraph(inline(line[4:]), STYLES["h3"]))
        elif line.startswith("## "):
            flush_all()
            story.append(Paragraph(inline(line[3:]), STYLES["h2"]))
        elif line.startswith("# "):
            flush_all()
            story.append(Paragraph(inline(line[2:]), STYLES["h1"]))
        elif line.startswith("---"):
            flush_all()
            story.append(Spacer(1, 5))
        elif line.startswith(">"):
            # Il blockquote e' multi-riga; la riga di solo «>» separa i capoversi.
            flush_para()
            flush_bullets()
            flush_table()
            content = line[1:].strip()
            if content:
                quote.append(content)
            else:
                flush_quote()
        elif re.match(r"^\s*[-*] ", line):
            flush_para()
            flush_quote()
            flush_table()
            if numerato[0]:  # si passa da numerato a puntato: sono due elenchi diversi
                flush_bullets()
            bullets.append(inline(re.sub(r"^\s*[-*] ", "", line)))
        elif re.match(r"^\s*\d+\. ", line):
            flush_para()
            flush_quote()
            flush_table()
            if bullets and not numerato[0]:  # da puntato a numerato
                flush_bullets()
            numerato[0] = True
            num = re.match(r"^\s*(\d+)\. ", line).group(1)
            bullets.append(
                f"<b>{num}.</b>&nbsp; " + inline(re.sub(r"^\s*\d+\. ", "", line))
            )
        elif bullets and line.startswith((" ", "\t")):
            # Continuazione indentata dell'ultimo punto elenco: QUALUNQUE rientro.
            # Prima si richiedevano 3 spazi, ma prettier indenta a 2 le continuazioni dei
            # bullet «- »: quelle cadevano nel ramo paragrafo e la voce usciva spezzata in
            # due, con la seconda metà a piena larghezza. Non si era visto perche' l'unico
            # PDF guardato dal vivo aveva voci NUMERATE (continuazione a 3 spazi).
            bullets[-1] += " " + inline(line.strip())
        else:
            flush_quote()
            flush_bullets()
            flush_table()
            para.append(line)

    flush_all()

    SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="Rise Against Hunger Italia - Brief di integrazione",
        author="Rise Against Hunger Italia",
    ).build(story)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("uso: python scripts/md2pdf-brief.py <input.md> <output.pdf>")
    build(Path(sys.argv[1]), Path(sys.argv[2]))
    print(f"OK -> {sys.argv[2]}")
