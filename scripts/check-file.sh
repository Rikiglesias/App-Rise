#!/bin/bash

# Script per controllo singolo file
# Uso: ./scripts/check-file.sh src/components/MyComponent.tsx

if [ $# -eq 0 ]; then
    echo "❌ Errore: Specificare il file da controllare"
    echo "Uso: ./scripts/check-file.sh <percorso-file>"
    exit 1
fi

FILE=$1

echo "🔍 Controllo errori e warning per: $FILE"
echo "================================================"

# Controllo TypeScript
echo "📝 TypeScript Check..."
npx tsc --noEmit --skipLibCheck "$FILE"
TS_EXIT=$?

echo ""

# Controllo ESLint
echo "🔧 ESLint Check..."
npx eslint "$FILE" --format=stylish
ESLINT_EXIT=$?

echo ""
echo "================================================"

if [ $TS_EXIT -eq 0 ] && [ $ESLINT_EXIT -eq 0 ]; then
    echo "✅ Nessun errore trovato in $FILE"
else
    echo "❌ Errori trovati in $FILE"
    echo "   - TypeScript: $([ $TS_EXIT -eq 0 ] && echo "✅ OK" || echo "❌ ERRORI")"
    echo "   - ESLint: $([ $ESLINT_EXIT -eq 0 ] && echo "✅ OK" || echo "❌ ERRORI")"
fi

exit $((TS_EXIT + ESLINT_EXIT)) 