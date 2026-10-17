import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const sourceRoot = path.resolve(__dirname, '../../..');
const helper = 'shared/auth/registraErroreAccount.ts';
const builder = 'shared/utils/buildProblemReport.ts';
const parse = (file: string, source: string) =>
  ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);

const mapperCalls = (file: string, source: string): number => {
  const ast = parse(file, source);
  const names = new Set(['mapAuthError']);
  const namespaces = new Set<string>();
  ast.statements.forEach(statement => {
    if (!ts.isImportDeclaration(statement)) return;
    const binding = statement.importClause?.namedBindings;
    if (binding && ts.isNamedImports(binding)) {
      binding.elements.forEach(element => {
        if (
          (element.propertyName?.text ?? element.name.text) === 'mapAuthError'
        )
          names.add(element.name.text);
      });
    }
    if (
      binding &&
      ts.isNamespaceImport(binding) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text.endsWith('authErrors')
    )
      namespaces.add(binding.name.text);
  });
  let count = 0;
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      if (
        (ts.isIdentifier(callee) && names.has(callee.text)) ||
        (ts.isPropertyAccessExpression(callee) &&
          callee.name.text === 'mapAuthError' &&
          ts.isIdentifier(callee.expression) &&
          namespaces.has(callee.expression.text))
      )
        count++;
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return count;
};

const sourceFiles = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory())
      return /^__tests__$|^__mocks__$/.test(entry.name)
        ? []
        : sourceFiles(full);
    return /\.tsx?$/.test(entry.name) &&
      !/\.(test|spec)\.tsx?$/.test(entry.name)
      ? [full]
      : [];
  });

it('B3a: solo l’helper account chiama mapAuthError, con sentinella positiva', () => {
  // La sonda vede chiamate normali, alias e namespace; ignora definizioni/commenti.
  expect(
    mapperCalls(
      'positive.ts',
      `
    import { mapAuthError as classify } from './authErrors';
    import * as errors from './authErrors';
    mapAuthError(error); classify(error); errors.mapAuthError(error);
  `
    )
  ).toBe(3);
  expect(
    mapperCalls(
      'negative.ts',
      `
    export const mapAuthError = (error: unknown) => 'generic';
    // mapAuthError(error)
  `
    )
  ).toBe(0);
  const calledBy = sourceFiles(sourceRoot).flatMap(file => {
    const calls = mapperCalls(file, fs.readFileSync(file, 'utf8'));
    return calls ? [path.relative(sourceRoot, file).replace(/\\/g, '/')] : [];
  });
  expect(calledBy).toEqual([helper]);
  expect(
    mapperCalls(helper, fs.readFileSync(path.join(sourceRoot, helper), 'utf8'))
  ).toBe(1);
});

it('B3a: il generatore puro esporta buildProblemReport e non importa il runtime', () => {
  const ast = parse(
    builder,
    fs.readFileSync(path.join(sourceRoot, builder), 'utf8')
  );
  const imports = ast.statements.flatMap(statement =>
    ts.isImportDeclaration(statement) &&
    ts.isStringLiteral(statement.moduleSpecifier)
      ? [statement.moduleSpecifier.text]
      : []
  );
  expect(
    imports.filter(module =>
      /^(expo-updates|expo-constants|react-native)$|(^|\/)logger$/.test(module)
    )
  ).toEqual([]);
  const exports = ast.statements.flatMap(statement => {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some(
        modifier => modifier.kind === ts.SyntaxKind.ExportKeyword
      )
    )
      return [];
    return statement.declarationList.declarations.map(declaration =>
      declaration.name.getText(ast)
    );
  });
  expect(exports).toContain('buildProblemReport');
});
