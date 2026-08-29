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
    ripetuta se spezzano pagina;
  - una tabella che ci starebbe in una pagina veniva comunque spezzata a cavallo di due, con
    l'intestazione ripetuta e una cella tagliata a meta' frase: bastava che il testo sopra si
    accorciasse (2026-07-29, brief in consegna, riga «sub»). Ora chi ci sta in una pagina resta
    unito -- deciso sull'ALTEZZA MISURATA, non sul numero di righe;
  - le sintassi che esistono solo in Obsidian (riquadri `> [!nota]`, evidenziato `==...==`,
    rimandi `[[...]]`, contenuti incorporati `![[...]]`) uscivano LETTERALI, e soprattutto un
    commento `%%...%%` -- che qui e' una nota INTERNA -- sarebbe stato STAMPATO nel documento
    letto da un terzo, perche' a differenza del commento HTML nessuno lo toglieva (2026-08-07)
    -> ora `_sentinella_sintassi_obsidian` le cerca nel testo consegnato e FERMA la generazione
    elencando riga per riga.
"""

import json
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BASE = getSampleStyleSheet()

# I margini del documento stanno QUI, non nella chiamata a SimpleDocTemplate in fondo: da loro
# si derivano lo spazio utile in larghezza e in altezza. Prima erano scritti due volte (170 mm
# «= A4 meno 20+20» da una parte, i 18 mm per lato dall'altra): cambiarne uno lasciava l'altro
# valore sbagliato in SILENZIO, e da quando la larghezza serve anche a decidere se una tabella
# sta in una pagina, un margine disallineato spezzerebbe tabelle che invece ci starebbero.
# Ridotti il 2026-07-30 (20/18 -> 18/15 mm) per il vincolo «il brief sta in 3 pagine»: il testo
# era gia' stato asciugato del 19% e tagliare oltre significava togliere domande al partner, non
# parole. Restano dentro i margini tipografici correnti per un A4 di testo; sotto questi il
# documento comincia a leggersi male, e la leggibilita' e' il motivo per cui esiste il PDF.
MARGINE_LATERALE = 18 * mm
MARGINE_VERTICALE = 15 * mm

CONTENT_WIDTH = A4[0] - 2 * MARGINE_LATERALE

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
        "body", parent=BASE["BodyText"], fontSize=9.8, leading=13.4,
        alignment=TA_JUSTIFY, spaceAfter=5,
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
        "ol", parent=BASE["BodyText"], fontSize=9.8, leading=13.4, alignment=TA_JUSTIFY,
        leftIndent=14, spaceAfter=5,
    ),
    # Capoverso che CONTINUA una voce di elenco numerato dopo una riga vuota. Serve perche' la
    # riga vuota chiude l'elenco (`flush_all`), quindi la riga rientrata che segue non trova piu'
    # un bullet aperto e cade nel ramo paragrafo: usciva a leftIndent 0, cioe' 14 punti PIU' A
    # SINISTRA della voce che continua, leggendosi come un blocco a se'. Trovato sul PDF in
    # consegna del 2026-07-30 (tre code della domanda 6: nickname, consensi, Paese) insieme al
    # danno vero: i rimandi interni tipo «i due campi elencati all'inizio» perdevano il bersaglio.
    "body_ol": ParagraphStyle(
        "body_ol", parent=BASE["BodyText"], fontSize=9.8, leading=13.4, alignment=TA_JUSTIFY,
        leftIndent=14, spaceAfter=5,
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

# Altezza utile: serve a sapere se una tabella ci sta in UNA pagina.
# I 6 pt per lato sono il padding che il Frame di reportlab aggiunge DA SOLO (default di
# `Frame.__init__`, non impostato da noi): senza toglierli la misura sovrastima lo spazio e
# promette «ci sta» a tabelle che poi vengono spezzate. Misurato: a 35 righe wrap() dava 734.0 pt
# contro 739.8 disponibili in teoria -> predizione «ci sta», realtà 2 pagine; con il padding
# tolto la soglia è 727.8 e la predizione torna a combaciare (34 righe stanno, 35 no).
# NB: quei numeri sono della misura del 2026-07-29, con MARGINE_VERTICALE a 18 mm. Col valore
# attuale (15 mm) la soglia vale ~744.9 pt: il MECCANISMO regge perche' l'altezza si deriva dalla
# costante, ma non citare quelle cifre come se fossero quelle di oggi.
FRAME_PADDING = 6
CONTENT_HEIGHT = A4[1] - 2 * MARGINE_VERTICALE - 2 * FRAME_PADDING

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
    "🟠": "[presto]",  # fra rosso e giallo: va fatto, ma non e' il primo della fila
    "🟡": "[medio]",
    "🔵": "[in coda]",
    "⚪": "[con calma]",
    "🧭": "[quadro]",
    "🧪": "[verifica]",  # marca i blocchi «critico avversariale» nelle note interne
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


def sta_in_una_pagina(table: Table) -> bool:
    """La tabella ci sta tutta in una pagina vuota?

    Si misura, non si indovina: `wrap()` restituisce l'altezza che il flowable occuperebbe
    nello spazio dato. reportlab lo richiama comunque durante il build, quindi chiamarlo qui
    non ha effetti collaterali.
    """
    return table.wrap(CONTENT_WIDTH, CONTENT_HEIGHT)[1] <= CONTENT_HEIGHT


def _righe_consegnate_numerate(sorgente: str) -> list[tuple[int, str]]:
    """Le righe che il destinatario leggera' davvero, col loro numero nel file sorgente.

    Usa la STESSA regola del renderer (`<!--` a inizio riga apre, `-->` chiude) e non una regex
    posizionale: due definizioni diverse di «commento» nello stesso file si separano al primo caso
    storto — un `<!--` a meta' riga verrebbe tolto qui e STAMPATO nel PDF, e la sentinella
    sarebbe cieca proprio dove serve. Il falso negativo e' la direzione peggiore: un blocco che
    non scatta non si nota, e cio' che non si nota arriva al partner.

    Il numero serve alle sentinelle che devono dire DOVE correggere: dopo il filtro le righe
    scalano, e un elenco che cita numeri sbagliati manda chi corregge sulla riga di un altro.
    """
    righe: list[tuple[int, str]] = []
    dentro_commento = False
    for numero, riga in enumerate(sorgente.splitlines(), start=1):
        if dentro_commento:
            if "-->" in riga:
                dentro_commento = False
            continue
        if riga.lstrip().startswith("<!--"):
            if "-->" not in riga:
                dentro_commento = True
            continue
        righe.append((numero, riga))
    return righe


def _righe_consegnate(sorgente: str) -> list[str]:
    """Le sole righe consegnate, senza numeri. Una riga sola sopra la funzione numerata:
    la regola di «cosa e' consegnato» resta scritta in UN posto solo."""
    return [riga for _, riga in _righe_consegnate_numerate(sorgente)]


# Sintassi che esistono SOLO in Obsidian: il renderer di questo file non le conosce, quindi non
# le converte e non da' errore — finiscono LETTERALI nel PDF che legge un terzo. La piu' grave e'
# il commento fra doppi simboli di percentuale: e' una nota INTERNA, e a differenza del commento
# HTML (che `_righe_consegnate` toglie) verrebbe STAMPATA.
# Ogni voce: (nome leggibile, come si riconosce, cosa esce nel PDF se passa).
SINTASSI_OBSIDIAN = (
    ("commento  %%...%%", re.compile(r"%%"),
     "e' una NOTA INTERNA: viene stampata, segni di percentuale compresi"),
    ("evidenziato  ==...==", re.compile(r"==[^=\n]+=="),
     "escono i quattro segni di uguale, l'evidenziazione no"),
    ("contenuto incorporato  ![[...]]", re.compile(r"!\[\["),
     "il contenuto richiamato NON c'e': esce solo il nome del file fra parentesi"),
    ("rimando interno  [[...]]", re.compile(r"(?<!!)\[\["),
     "escono le parentesi doppie e un nome di file che il destinatario non ha"),
    ("riquadro  > [!tipo]", re.compile(r"^\s*>\s*\[!"),
     "esce una citazione che comincia con «[!nota]», senza riquadro"),
    ("casella da spuntare  - [ ]", re.compile(r"^\s*[-*]\s+\[[ xX]\]\s"),
     "escono le parentesi quadre al posto della casella"),
    ("etichetta  #parola", re.compile(r"(?<![\w#`(/])#[A-Za-z][\w/-]*"),
     "esce il cancelletto: per chi legge e' un refuso, non un'etichetta"),
    ("nota a pie' di pagina  [^1]", re.compile(r"\[\^"),
     "esce il richiamo fra parentesi e la nota resta orfana in fondo"),
    ("ancora di blocco  ^nome", re.compile(r"(?:^|\s)\^[A-Za-z0-9][\w-]*\s*$"),
     "esce un accento circonflesso e una parola senza senso a fine riga"),
    # Il dollaro seguito da una cifra e' un IMPORTO, non una formula: in un documento di
    # raccolta fondi due importi sulla stessa riga («da $50 a $500») facevano scattare il
    # blocco. Verificato il 2026-08-07: falso positivo reale, non teorico.
    ("formula  $...$", re.compile(r"\$\$|\$(?!\d)[^\s$][^$\n]*\$"),
     "escono i simboli di dollaro e la formula in codice sorgente"),
)

# Blocchi di codice che Obsidian disegna e questo generatore no: restano righe di codice inerte.
FENCE_SOLO_OBSIDIAN = re.compile(r"^\s*```\s*(mermaid|dataview|dataviewjs|query)\b", re.IGNORECASE)

# Un documento verso un terzo non deve nascere se dentro c'e' la prova che non era finito (un
# segnaposto mai riempito) o con che cosa e' stato scritto (un residuo di assistente).
# E' la CLASSE, non l'istanza: il commit 803decd ha curato le note interne, cioe' UN modo in cui
# il contesto di scrittura arriva al destinatario. Questi sono gli altri due.
# NB: i commenti HTML NON stanno qui - `_righe_consegnate` li toglie gia', e ridefinire in questo
# punto che cos'e' un «commento» creerebbe due verita' sullo stesso concetto.
SEGNAPOSTO_NON_RIEMPITO = (
    ("marcatore di lavoro non finito",
     re.compile(r"\b(TODO|FIXME|DA COMPLETARE|DA DECIDERE|XXX)\b", re.IGNORECASE),
     "dice al destinatario che il documento e' stato mandato prima di essere finito"),
    ("campo modello mai sostituito",
     re.compile(r"<(?:data|nome|azienda|cifra|importo|referente|da definire)>", re.IGNORECASE),
     "un campo del modello e' rimasto al posto del valore vero"),
    # NON «una quadra qualsiasi»: quella regola l'ho provata sui documenti veri e dava 28 falsi
    # positivi su `app-gate-matrice.md`, che usa [V] e [A] come notazione DICHIARATA nel testo
    # («ogni affermazione e' [V] se verificata, [A] se assunta»). Il segnale non e' la parentesi:
    # e' la parentesi che CHIEDE di essere riempita. Vuota, con soli puntini, o con una parola
    # d'attesa dentro.
    ("parentesi quadra da riempire",
     re.compile(r"\[\s*(?:|\.{2,}|_{2,}|"
                r"(?:da\s+(?:inserire|definire|completare|decidere|confermare)|"
                r"inserire|tbd|placeholder|segnaposto|nome|data|cifra|importo)"
                r"[^\]\[]{0,30})\](?!\()", re.IGNORECASE),
     "una quadra che chiede ancora di essere riempita"),
)

RESIDUI_DELLO_STRUMENTO = (
    ("marcatore di citazione di un assistente",
     re.compile(r"(citeturn|oaicite|contentReference)", re.IGNORECASE),
     "e' la prova di un copia-incolla da un assistente, e resta visibile"),
    ("parametro di provenienza nell'URL",
     re.compile(r"[?&](?:utm_source=(?:chatgpt|openai|copilot|claude)|referrer=grok)", re.IGNORECASE),
     "il link porta scritto da dove e' stato preso"),
)


def _sentinella_sintassi_obsidian(md_path: Path, righe: list[tuple[int, str]]) -> None:
    """Ferma la generazione se nel testo CONSEGNATO c'e' sintassi che solo Obsidian capisce.

    Perche' blocca invece di avvisare: la lezione di questo file, arrivata alla terza occorrenza,
    e' che un presidio scritto in prosa non ferma nessuno e un avviso su stderr passa inosservato
    in mezzo all'output. Le due sentinelle sopra sparano per lo stesso motivo.

    Gira sulle sole righe consegnate, come le altre: bloccare per una sintassi che sta in una nota
    interna insegnerebbe ad aggirare il controllo.

    Dentro i blocchi di codice non guarda: li' il testo e' mostrato APPOSTA cosi' com'e'. Il
    blocco stesso invece si controlla, perche' un diagramma che Obsidian disegna qui esce come
    codice sorgente.
    """
    trovati: list[tuple[int, str, str, str]] = []

    if righe and righe[0][1].strip() == "---":
        trovati.append((
            righe[0][0], "intestazione di proprieta' (--- in testa al file)",
            "le proprieta' (titolo, etichette, stato) vengono stampate come testo del documento",
            righe[0][1].strip(),
        ))

    in_code = False
    for numero, riga in righe:
        apre_o_chiude = riga.lstrip().startswith("```")
        if apre_o_chiude and not in_code and FENCE_SOLO_OBSIDIAN.search(riga):
            trovati.append((
                numero, "blocco che solo Obsidian disegna",
                "esce il codice sorgente del diagramma, non il disegno", riga.strip(),
            ))
        if apre_o_chiude:
            in_code = not in_code
            continue
        if in_code:
            continue
        for nome, rx, danno in SINTASSI_OBSIDIAN:
            if rx.search(riga):
                trovati.append((numero, nome, danno, riga.strip()))

    if not trovati:
        return
    dettaglio = "\n".join(
        f"  riga {n}: {nome} -> {danno}\n    {testo[:150]}"
        for n, nome, danno, testo in trovati
    )
    raise SystemExit(
        f"SENTINELLA: in {md_path.name} ci sono {len(trovati)} punti con sintassi di Obsidian "
        f"nel testo CONSEGNATO. Uscirebbero letterali nel PDF che legge il destinatario:\n"
        f"{dettaglio}\n"
        "  Riscrivili in markdown normale. Se erano note interne, spostale in un commento "
        "HTML (<!-- ... -->): quello non viene consegnato."
    )


class CanvasNumerato(canvas.Canvas):
    """Scrive «2 di 3» in fondo a ogni pagina.

    Un documento che va a un'altra societa' viene stampato, inoltrato e discusso da piu' persone:
    senza numeri non si puo' dire «guarda in fondo alla due», e un foglio staccato non si sa piu'
    dove torna. Il TOTALE e' la parte che dice se ne manca uno, ed e' anche il motivo per cui non
    basta un `onPage`: quante pagine saranno si sa solo alla fine. Quindi le pagine si mettono da
    parte man mano e si scrivono tutte all'ultimo, quando il totale e' noto — e' il modo con cui
    reportlab stesso risolve il problema.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._pagine: list[dict] = []

    def showPage(self) -> None:
        self._pagine.append(dict(self.__dict__))
        self._startPage()

    def save(self) -> None:
        totale = len(self._pagine)
        for stato in self._pagine:
            self.__dict__.update(stato)
            self._scrivi_numero(totale)
            super().showPage()
        super().save()

    def _scrivi_numero(self, totale: int) -> None:
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#777777"))
        self.drawCentredString(
            A4[0] / 2, MARGINE_VERTICALE / 2, f"{self.getPageNumber()} di {totale}"
        )
        self.restoreState()


def _altezza(flowable) -> float:
    """Altezza occupata, spazi verticali dello stile inclusi.

    `wrap()` da solo restituisce il solo blocco di testo: sommare quelli e basta sottostima il
    gruppo e fa promettere «ci sta» a un insieme che poi non ci sta. Gli spazi contano perche'
    fra un titolo e il suo cappello ce ne sono una decina di punti.
    """
    alto = flowable.wrap(CONTENT_WIDTH, CONTENT_HEIGHT)[1]
    stile = getattr(flowable, "style", None)
    return alto + getattr(stile, "spaceBefore", 0) + getattr(stile, "spaceAfter", 0)


def _gruppo_col_titolo(table: Table, story: list) -> list:
    """La tabella piu' il titolo e il cappello che la annunciano, se ci stanno insieme.

    Risale la storia finche' trova testo (al massimo due blocchi: un titolo e una riga di
    presentazione) e li SPOSTA dentro il gruppo da tenere unito. Se il gruppo non ci sta in una
    pagina rinuncia al blocco piu' lontano, e alla peggio torna alla sola tabella: meglio un
    titolo staccato che una tabella spezzata a meta' frase.
    """
    coda: list = []
    i = len(story)
    while i > 0 and len(coda) < 2 and isinstance(story[i - 1], Paragraph):
        coda.insert(0, story[i - 1])
        i -= 1

    altezza_tabella = table.wrap(CONTENT_WIDTH, CONTENT_HEIGHT)[1]
    while coda:
        if sum(_altezza(f) for f in coda) + altezza_tabella <= CONTENT_HEIGHT:
            del story[len(story) - len(coda):]
            return coda + [table]
        coda.pop(0)
    return [table]


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


# Quanto rientra ogni livello di annidamento di un elenco, in punti. I punti elenco annidati
# (i tre sotto la domanda 6 del brief, rientrati di 3 spazi nel markdown) uscivano alla STESSA
# x di quelli di primo livello: il rientro veniva buttato via dalla re.sub che toglie il «- ».
# Trovato da un critico indipendente il 2026-07-30, e non visto prima perche' il PDF non era
# stato ispezionato a occhio (pdftoppm assente sulla macchina).
PASSO_ANNIDAMENTO = 12


def _livello_bullet(line: str) -> int:
    """Livello di annidamento di un punto elenco, dedotto dal rientro nel markdown.

    Due spazi = un livello (prettier indenta a 2, l'autore a 3: entrambi valgono 1). Il tetto a
    3 evita che un rientro anomalo spinga la voce fuori dalla colonna di testo.
    """
    spazi = len(re.match(r"^([ \t]*)", line).group(1).expandtabs(4))
    return min(spazi // 2, 3)


def _solo_parole(testo: str) -> str:
    """Il testo ridotto alle sue PAROLE: senza marcatori markdown, spazi normalizzati, minuscolo.

    Serve al confronto della sentinella, e chiude un falso negativo trovato da un critico
    indipendente il 2026-07-30: il confronto girava sul markdown GREZZO, quindi una frase ritirata
    che rientrasse con un grassetto in mezzo — «per iscritto **nell'accordo**», e in questo
    documento il grassetto è ovunque — non faceva match e passava in silenzio. Un presidio con un
    falso negativo è peggio di nessun presidio: dice «pulito» e nessuno guarda più.
    """
    t = testo
    t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", t)   # link: resta il testo
    t = re.sub(r"[*`_|#>]+", "", t)                   # enfasi, codice, tabelle, titoli, citazioni
    return " ".join(t.split()).lower()


def _sentinella_documento_non_finito(md_path: Path, righe: list[tuple[int, str]]) -> None:
    """Ferma la generazione se nel testo CONSEGNATO c'e' un segnaposto mai riempito o un
    residuo dello strumento con cui il documento e' stato scritto.

    Perche' BLOCCA invece di avvisare: e' la lezione di questo file, arrivata alla terza
    occorrenza - un presidio in prosa non ferma nessuno e un avviso su stderr passa inosservato.
    E qui pesa piu' che altrove: il brief e' gia' partito verso il partner il 2026-07-31, quindi
    da allora ogni correzione non e' un commit da rifare ma un erratum verso un terzo.

    Gira sulle sole righe CONSEGNATE e salta i blocchi di codice, come le altre: dentro un blocco
    un `TODO` o una quadra vuota sono l'esempio che si vuole mostrare, e bloccare li' insegnerebbe
    ad aggirare il controllo.

    Assorbita il 2026-08-21 dalla skill `humanizer` (P33 segnaposto, P34 marcatori di citazione,
    P35 parametri di provenienza), voce 9/12 del goal catalogo-skill.
    """
    trovati: list[tuple[int, str, str, str]] = []
    in_code = False
    for numero, riga in righe:
        if riga.lstrip().startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        # La casella di spunta e' markdown legittimo; i rimandi [[...]] li segnala gia' la
        # sentinella di Obsidian. Tolti prima del controllo per non dare due errori sulla
        # stessa riga, che manderebbe a caccia del sintomo sbagliato.
        ripulita = re.sub(r"^\s*[-*]\s*\[[ xX]\]", "", riga)
        ripulita = re.sub(r"\[\[[^\]]*\]\]", "", ripulita)
        # Il codice INLINE si salta come i blocchi, e per lo stesso motivo: li' dentro il testo
        # e' mostrato apposta com'e'. Trovato provando sui documenti veri - in
        # `identita-matrice-scenari.md` la specifica dice `utm_campaign=newsletter-<data>`, dove
        # <data> e' un segnaposto VOLUTO che descrive la forma del link, non un campo dimenticato.
        ripulita = re.sub(r"`[^`]*`", "", ripulita)
        for nome, rx, danno in SEGNAPOSTO_NON_RIEMPITO:
            if rx.search(ripulita):
                trovati.append((numero, nome, danno, riga.strip()))
        for nome, rx, danno in RESIDUI_DELLO_STRUMENTO:
            if rx.search(riga):
                trovati.append((numero, nome, danno, riga.strip()))

    if not trovati:
        return
    dettaglio = "\n".join(
        f"  riga {n}: {nome} -> {danno}\n    {testo[:150]}"
        for n, nome, danno, testo in trovati
    )
    raise SystemExit(
        f"SENTINELLA: in {md_path.name} ci sono {len(trovati)} punti che dicono al destinatario "
        f"che il documento non era finito, o con che cosa e' stato scritto:\n{dettaglio}\n"
        "  Riempi il segnaposto o togli il residuo. Se e' un esempio da mostrare mettilo in un "
        "blocco di codice; se e' una nota interna mettila in un commento HTML (<!-- ... -->), "
        "che non viene consegnato. La deroga si scrive nel registro col motivo, mai spegnendo "
        "il controllo."
    )


def _sentinella_frasi_ritirate(md_path: Path, consegnato: str) -> None:
    """Ferma la consegna se e' rientrata una frase tolta DI PROPOSITO.

    Presidia una classe di errore con tre occorrenze sul brief verso Let's Donation, tutte
    scoperte a valle da una review e mai dall'autore: riscrivere un paragrafo resuscita cio' che
    una passata precedente aveva deciso di togliere. Il presidio umano («prima di riscrivere una
    riga, `git log -S` sulla frase») non ha fermato la terza, arrivata fino al PDF in consegna.

    Gira sul solo testo CONSEGNATO, per la ragione gia' imparata in questo file: una sentinella
    che scatta su testo che il destinatario non vedra' mai insegna ad aggirarla. Le decisioni
    stanno in `frasi-ritirate.json` accanto al documento, non qui: cambiare idea si fa aggiungendo
    `revocata_il` alla voce, non spegnendo il controllo.
    """
    registro = md_path.parent / "frasi-ritirate.json"
    if not registro.exists():
        return
    voci = json.loads(registro.read_text(encoding="utf-8")).get(md_path.name, [])
    piatto = _solo_parole(consegnato)
    trovate = [
        v for v in voci
        if not v.get("revocata_il") and _solo_parole(v["frase"]) in piatto
    ]
    if trovate:
        dettaglio = "\n".join(
            f"  - «{v['frase']}» — tolta il {v['tolta_il']}: {v['perche']}"
            + (f"\n    (gia' rientrata: {', '.join(v['rientrata_il'])})" if v.get("rientrata_il") else "")
            + f"\n    dove vive ora: {v['dove_vive_ora']}"
            for v in trovate
        )
        raise SystemExit(
            f"SENTINELLA: nel testo consegnato di {md_path.name} sono rientrate "
            f"{len(trovate)} frasi ritirate di proposito:\n{dettaglio}\n"
            "  Togliile, oppure — se la decisione e' cambiata — aggiungi \"revocata_il\" alla "
            f"voce in {registro.name}, col motivo e chi l'ha deciso."
        )


def build(md_path: Path, pdf_path: Path) -> None:
    sorgente = md_path.read_text(encoding="utf-8")
    numerate = _righe_consegnate_numerate(sorgente)
    consegnato = "\n".join(riga for _, riga in numerate)
    # Per PRIMA la sintassi di Obsidian: una nota interna fra doppi percentuali resta nel testo
    # consegnato, quindi le sue emoji farebbero sparare la sentinella dei caratteri e chi legge
    # l'errore andrebbe a cercare un glifo invece della nota interna, che e' il guaio grosso.
    _sentinella_sintassi_obsidian(md_path, numerate)
    # Dopo la sintassi di Obsidian e prima delle frasi ritirate: un rimando [[...]] e' gia' stato
    # segnalato sopra, e questa lo ignora apposta per non dare due errori sulla stessa riga.
    _sentinella_documento_non_finito(md_path, numerate)
    _sentinella_frasi_ritirate(md_path, consegnato)
    # La sentinella guarda SOLO cio' che finira' nel PDF. Girava sul markdown grezzo, commenti
    # inclusi, e fermava la consegna per un'emoji che sta in una nota interna e che il
    # destinatario non vedra' mai: e' gia' successo (🧪 🔑 🔴 sono in FUORI_WINANSI non perche' il
    # PDF li renda, ma per far ripartire la build). Un blocco che scatta su testo non consegnato
    # insegna ad aggirarlo, ed e' il modo in cui una sentinella smette di essere creduta.
    avvisa_caratteri_non_mappati(consegnato)
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
    # Il capoverso corrente continua una voce di elenco numerato chiusa da una riga vuota?
    # Lo decide la PRIMA riga del blocco (vedi il ramo paragrafo in fondo): da sola sa di essere
    # rientrata, mentre `flush_para` vede solo il testo unito e non piu' l'indentazione.
    para_rientrato: list = [False]

    def flush_para() -> None:
        if para:
            stile = STYLES["body_ol"] if para_rientrato[0] else STYLES["body"]
            story.append(Paragraph(inline(" ".join(para)), stile))
            para.clear()
        # Il reset sta FUORI dall'`if`: dentro, dipendeva dall'invariante non scritta «flag
        # acceso ⟹ para non vuoto». Oggi vale (il flag si accende solo insieme al primo append),
        # ma un domani chi svuotasse `para` per un'altra via si ritroverebbe il rientro applicato
        # al paragrafo SUCCESSIVO — un difetto invisibile in un documento che va a un partner.
        # Segnalato come fragilità da un critico indipendente, non come bug vivo.
        para_rientrato[0] = False

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
            for _, b in bullets:
                story.append(Paragraph(b, STYLES["ol"]))
        else:
            story.append(
                ListFlowable(
                    [
                        ListItem(
                            Paragraph(b, STYLES["body"]),
                            leftIndent=14 + liv * PASSO_ANNIDAMENTO,
                        )
                        for liv, b in bullets
                    ],
                    bulletType="bullet",
                    bulletFontName="Helvetica",
                    # 7 pt su un corpo di 9.8 rendeva un puntino minuscolo appeso in ALTO alla
                    # prima riga, che a stampa si legge come un apice o uno sporco di
                    # conversione, non come un pallino di elenco (visto ingrandendo il PDF in
                    # consegna del 2026-07-29). Il glifo si allinea al testo quando i due corpi
                    # sono vicini.
                    bulletFontSize=9,
                    # Il glifo resta comunque ancorato in cima alla voce, non alla riga: senza
                    # questo scarto siede all'altezza delle maiuscole invece che a meta' parola.
                    bulletOffsetY=-2,
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
        elif sta_in_una_pagina(table):
            # Una tabella che ci sta in una pagina non deve spezzarsi: altrimenti basta che il
            # testo sopra si accorci perche' scivoli a cavallo di due, ripetendo l'intestazione e
            # tagliando una cella a meta' frase (visto sul brief in consegna, riga «sub»).
            # Lo Spacer resta FUORI dal gruppo: dentro, i suoi 7 pt entrerebbero nell'altezza da
            # tenere unita, che la misura non conta - e lo spazio dopo una tabella non ha bisogno
            # di stare nella sua stessa pagina.
            # IL TITOLO VIENE CON LEI. Tenere unita la sola tabella non bastava: sul brief del
            # 2026-07-29 il titolo «Scheda dei dati» e la riga «Cosa emettiamo a ogni accesso»
            # restavano in fondo a pagina 2 e la tabella saltava a pagina 3, lasciando due terzi
            # di pagina bianca fra la promessa e la cosa promessa. Chi legge gira pagina e trova
            # quattro sigle tecniche senza la frase che dice cosa sono.
            # Si risale finche' i flowable precedenti sono testo (il titolo e il suo cappello,
            # non piu' di due) e si misura il gruppo INTERO: se non ci sta, si lascia com'era —
            # meglio un titolo staccato che una tabella spezzata.
            story.append(KeepTogether(_gruppo_col_titolo(table, story)))
            story.append(Spacer(1, 7))
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
            # Le stesse sostituzioni che fa `inline()`: senza, una freccia dentro un blocco di
            # codice usciva come glifo sbagliato E la sentinella taceva, perche' esclude per
            # costruzione tutto cio' che sta in FUORI_WINANSI. Il falso negativo che il resto del
            # file e' stato sistemato per evitare, lasciato aperto proprio dove nessuno guarda.
            for src, dst in FUORI_WINANSI.items():
                line = line.replace(src, dst)
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
            bullets.append((_livello_bullet(line), inline(re.sub(r"^\s*[-*] ", "", line))))
        elif re.match(r"^\s*\d+\. ", line):
            flush_para()
            flush_quote()
            flush_table()
            if bullets and not numerato[0]:  # da puntato a numerato
                flush_bullets()
            numerato[0] = True
            num = re.match(r"^\s*(\d+)\. ", line).group(1)
            # Livello 0 FISSO: l'annidamento e' implementato solo per i punti puntati (nel brief
            # sono gli unici annidati, sotto la domanda 6). Un elenco NUMERATO annidato uscirebbe
            # quindi allineato a quelli di primo livello, senza errore e senza avviso: se un
            # domani serve, il rientro si prende con _livello_bullet(line) come nel ramo sopra.
            bullets.append(
                (0, f"<b>{num}.</b>&nbsp; " + inline(re.sub(r"^\s*\d+\. ", "", line)))
            )
        elif bullets and line.startswith((" ", "\t")):
            # Continuazione indentata dell'ultimo punto elenco: QUALUNQUE rientro.
            # Prima si richiedevano 3 spazi, ma prettier indenta a 2 le continuazioni dei
            # bullet «- »: quelle cadevano nel ramo paragrafo e la voce usciva spezzata in
            # due, con la seconda metà a piena larghezza. Non si era visto perche' l'unico
            # PDF guardato dal vivo aveva voci NUMERATE (continuazione a 3 spazi).
            bullets[-1] = (bullets[-1][0], bullets[-1][1] + " " + inline(line.strip()))
        else:
            flush_quote()
            flush_bullets()
            flush_table()
            # Se il blocco COMINCIA con una riga rientrata di almeno tre spazi, non e' un
            # capoverso di sezione: e' la continuazione della voce numerata che la riga vuota
            # precedente ha chiuso. Va allo stesso rientro dell'elenco, non a filo del corpo.
            # Tre spazi, non due: le continuazioni dei bullet «- » che prettier indenta a due
            # sono gia' intercettate dal ramo sopra quando l'elenco e' ancora aperto, e per
            # quelle a elenco chiuso il comportamento resta invariato (nessun caso osservato).
            if not para and re.match(r"^ {3,}\S", line):
                para_rientrato[0] = True
            para.append(line)

    flush_all()

    SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=MARGINE_LATERALE,
        rightMargin=MARGINE_LATERALE,
        topMargin=MARGINE_VERTICALE,
        bottomMargin=MARGINE_VERTICALE,
        title="Rise Against Hunger Italia - Brief di integrazione",
        author="Rise Against Hunger Italia",
    ).build(story, canvasmaker=CanvasNumerato)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("uso: python scripts/md2pdf-brief.py <input.md> <output.pdf>")
    build(Path(sys.argv[1]), Path(sys.argv[2]))
    print(f"OK -> {sys.argv[2]}")
