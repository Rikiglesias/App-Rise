"""Conta i <PerfectText lines={N>1}> senza containerWidth in src/ (test esclusi). Uso: python conta-multiriga.py <repo>
Sono i punti dove PerfectText si da' da solo una larghezza fissa (70% di 393 dp) centrata, ignorando il contenitore."""
import pathlib
import re
import subprocess
import sys
from collections import Counter

repo = sys.argv[1]
files = subprocess.run(["git", "-C", repo, "ls-files", "src"], capture_output=True, text=True).stdout.split()
siti = []
for f in files:
    if not f.endswith(".tsx") or "__tests__" in f:
        continue
    s = (pathlib.Path(repo) / f).read_text(encoding="utf-8")
    for m in re.finditer(r"<PerfectText\b([^>]*?)>", s, re.S):
        a = m.group(1)
        lm = re.search(r"lines=\{(\d+)\}", a)
        if lm and int(lm.group(1)) > 1 and "containerWidth" not in a:
            siti.append((f, s[: m.start()].count("\n") + 1, lm.group(1)))
# Positivo noto: il valore del programma nella scheda paese (D6) deve comparire.
noto = any(f.endswith("MapLocationModal.tsx") for f, _, _ in siti)
print(f"totale {len(siti)} in {len(set(f for f, _, _ in siti))} file; positivo noto D6 visto: {noto}")
for f, n in Counter(f for f, _, _ in siti).most_common():
    print(n, f)
