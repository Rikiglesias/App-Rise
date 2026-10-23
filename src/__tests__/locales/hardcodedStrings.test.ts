import fs from 'fs';
import path from 'path';
import ts from 'typescript';

import { iconeSenzaEtichetta } from '@/__tests__/helpers/iconeSenzaEtichetta';

// Eccezioni esatte (file + attributo + espressione), mai parole o file interi.
const properNames = [
  {
    file: 'features/auth/components/AuthCityField.tsx',
    attribute: 'accessibilityLabel',
    expression: '`${c.nome} (${c.sigla})`', // Toponimo e sigla ufficiale del comune.
  },
] as const;

const isAccessibility = (name: string): boolean =>
  name === 'accessibilityLabel' || name === 'accessibilityHint';

// Esamina anche fallback/ternari e concatenazioni; gli argomenti delle chiamate
// (t('chiave'), formatter, ecc.) non sono testo letterale mostrato all'utente.
const literalsIn = (node: ts.Node): ts.Node[] => {
  if (ts.isCallExpression(node)) return [];
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return /\p{L}/u.test(node.text) ? [node] : [];
  }
  if (ts.isTemplateExpression(node)) {
    return /\p{L}/u.test(
      node.head.text +
        node.templateSpans.map(span => span.literal.text).join('')
    )
      ? [node]
      : node.templateSpans.flatMap(span => literalsIn(span.expression));
  }
  const found: ts.Node[] = [];
  ts.forEachChild(node, child => {
    found.push(...literalsIn(child));
  });
  return found;
};

const findHardcodedStrings = (file: string, source: string): string[] => {
  const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const violations: string[] = [];
  const report = (node: ts.Node, label: string) => {
    const { line } = ast.getLineAndCharacterOfPosition(node.getStart(ast));
    violations.push(`${file}:${line + 1} ${label}: ${node.getText(ast)}`);
  };
  const checkAccessibility = (name: string, value: ts.Node) => {
    if (!isAccessibility(name)) return;
    const expression = ts.isJsxExpression(value) ? value.expression : value;
    if (!expression) return;
    if (
      properNames.some(
        entry =>
          entry.file === file &&
          entry.attribute === name &&
          entry.expression === expression.getText(ast)
      )
    )
      return;
    literalsIn(expression).forEach(literal => report(literal, name));
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && node.initializer) {
      checkAccessibility(node.name.getText(ast), node.initializer);
    }
    if (ts.isPropertyAssignment(node)) {
      const name =
        ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)
          ? node.name.text
          : node.name.getText(ast);
      checkAccessibility(name, node.initializer);
    }
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.expression.getText(ast) === 'Alert' &&
      node.expression.name.text === 'alert'
    ) {
      node.arguments.slice(0, 2).forEach(argument => {
        if (
          ts.isStringLiteral(argument) ||
          ts.isNoSubstitutionTemplateLiteral(argument) ||
          ts.isTemplateExpression(argument)
        ) {
          report(argument, 'Alert.alert');
        } else {
          literalsIn(argument).forEach(literal =>
            report(literal, 'Alert.alert')
          );
        }
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return violations;
};

const sourceFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (['__tests__', '__mocks__', 'locales', 'tests'].includes(entry.name))
      return [];
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(filename);
    return /\.tsx?$/.test(entry.name) &&
      !/\.(test|spec)\.tsx?$/.test(entry.name)
      ? [filename]
      : [];
  });

describe('i18n hardcoded strings guard', () => {
  it('non lascia testo letterale nelle etichette accessibili o negli Alert', () => {
    const root = path.resolve(__dirname, '../..');
    const files = sourceFiles(root);
    expect(files.length).toBeGreaterThan(0);
    const violations = files.flatMap(file =>
      findHardcodedStrings(
        path.relative(root, file).replace(/\\/g, '/'),
        fs.readFileSync(file, 'utf8')
      )
    );
    expect(violations).toEqual([]);
  });

  it.each([
    '<Button accessibilityLabel="Chiudi" />',
    '<Button accessibilityHint={"Apri dettagli"} />',
    '<Button accessibilityLabel={`Apri ${name}`} />',
    '<Button accessibilityLabel={label || "Categoria senza nome"} />',
    'const props = { accessibilityLabel: active ? "Attivo" : label };',
    'Alert.alert("Errore", message);',
    'Alert.alert(title, `Errore ${message}`);',
    'Alert.alert(title, "");',
  ])('rifiuta %s', source => {
    expect(findHardcodedStrings('fixture.tsx', source).length).toBeGreaterThan(
      0
    );
  });

  it('accetta traduzioni, valori dinamici e nomi propri solo nella sede esatta', () => {
    expect(
      findHardcodedStrings(
        'fixture.tsx',
        '<Button accessibilityLabel={t("common.close")} accessibilityHint={hint} />; Alert.alert(t("common.error"), message);'
      )
    ).toEqual([]);
    expect(
      findHardcodedStrings(
        'features/auth/components/AuthScreen.tsx',
        '<Image accessibilityLabel="Rise Against Hunger Italia" />'
      )
    ).toHaveLength(1);
    expect(
      findHardcodedStrings(
        'fixture.tsx',
        '<Image accessibilityLabel="Rise Against Hunger Italia" />'
      )
    ).toHaveLength(1);
    expect(
      findHardcodedStrings(
        'features/auth/components/AuthScreen.tsx',
        '<Image accessibilityHint="Rise Against Hunger Italia" />'
      )
    ).toHaveLength(1);
    expect(
      findHardcodedStrings(
        properNames[0].file,
        '<Button accessibilityLabel={`${c.nome} (${c.sigla})`} />'
      )
    ).toEqual([]);
  });
});

// C51: un controllo toccabile con la sola icona ha un'etichetta per il lettore di schermo.
describe('icone toccabili con etichetta', () => {
  const root = path.resolve(__dirname, '../..');
  const inTutta = (opzioni = {}) =>
    sourceFiles(root)
      .filter(file => file.endsWith('.tsx'))
      .flatMap(file =>
        iconeSenzaEtichetta(
          path.relative(root, file).replace(/\\/g, '/'),
          fs.readFileSync(file, 'utf8'),
          opzioni
        )
      );

  it('icone con etichetta: sentinella verde', () => {
    // Positivo: senza guardare l'etichetta vede le icone toccabili dell'app, altrimenti passerebbe a vuoto.
    expect(inTutta({ ancheConEtichetta: true }).length).toBeGreaterThan(0);
    expect(inTutta()).toEqual([]);
  });

  it('icone con etichetta: la fixture senza etichetta fa fallire', () => {
    const icona = '<PerfectIcon name="close" />';
    const conTocco = (attributi: string, figli: string) =>
      iconeSenzaEtichetta(
        'fixture.tsx',
        `<PlatformTouchable onPress={chiudi}${attributi}>${figli}</PlatformTouchable>`
      );
    expect(conTocco('', icona)).toHaveLength(1);
    expect(
      iconeSenzaEtichetta('fixture.tsx', '<PerfectIcon onPress={chiudi} />')
    ).toHaveLength(1);
    // Guardie: con l'etichetta, o con un testo visibile accanto all'icona, passa.
    expect(conTocco(" accessibilityLabel={t('common.close')}", icona)).toEqual(
      []
    );
    expect(
      conTocco('', `${icona}<PerfectText>{t('common.close')}</PerfectText>`)
    ).toEqual([]);
  });
});
