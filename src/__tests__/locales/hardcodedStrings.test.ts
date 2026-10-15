import fs from 'fs';
import path from 'path';
import ts from 'typescript';

// Eccezioni esatte (file + attributo + espressione), mai parole o file interi.
const properNames = [
  {
    file: 'features/auth/components/AuthScreen.tsx',
    attribute: 'accessibilityLabel',
    expression: '"Rise Against Hunger Italia"', // Nome legale dell'organizzazione.
  },
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
        properNames[0].file,
        '<Image accessibilityLabel="Rise Against Hunger Italia" />'
      )
    ).toEqual([]);
    expect(
      findHardcodedStrings(
        'fixture.tsx',
        '<Image accessibilityLabel="Rise Against Hunger Italia" />'
      )
    ).toHaveLength(1);
    expect(
      findHardcodedStrings(
        properNames[0].file,
        '<Image accessibilityHint="Rise Against Hunger Italia" />'
      )
    ).toHaveLength(1);
    expect(
      findHardcodedStrings(
        properNames[1].file,
        '<Button accessibilityLabel={`${c.nome} (${c.sigla})`} />'
      )
    ).toEqual([]);
  });
});
