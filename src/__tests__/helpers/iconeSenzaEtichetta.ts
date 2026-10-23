import ts from 'typescript';

// C51 (contratto android-play): un controllo toccabile (onPress) che mostra solo un'icona deve avere
// accessibilityLabel, altrimenti il lettore di schermo dice «pulsante» e basta. Un figlio di testo o
// un'espressione che non si sa leggere bastano a passare: si sbaglia per difetto, mai segnalando un pulsante
// che un'etichetta visibile ce l'ha.
type Elemento = ts.JsxElement | ts.JsxSelfClosingElement;

const elementoJsx = (node: ts.Node): node is Elemento =>
  ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node);
const apertura = (node: Elemento) =>
  ts.isJsxElement(node) ? node.openingElement : node;
const haAttributo = (node: Elemento, nome: string) =>
  apertura(node).attributes.properties.some(
    p => ts.isJsxAttribute(p) && p.name.getText() === nome
  );
const conSpread = (node: Elemento) =>
  apertura(node).attributes.properties.some(p => ts.isJsxSpreadAttribute(p));
const tag = (node: Elemento) => apertura(node).tagName.getText();

const soloIcona = (node: Elemento): boolean => {
  if (ts.isJsxSelfClosingElement(node)) return /Icon$/.test(tag(node));
  let testo = false;
  let icona = false;
  let ignoto = false;
  const visita = (figlio: ts.Node): void => {
    if (ts.isJsxText(figlio)) {
      if (/\p{L}/u.test(figlio.text)) testo = true;
    } else if (ts.isJsxExpression(figlio)) {
      const e = figlio.expression;
      if (!e) return;
      if (
        elementoJsx(e) ||
        ts.isConditionalExpression(e) ||
        ts.isBinaryExpression(e) ||
        ts.isParenthesizedExpression(e)
      )
        ts.forEachChild(e, visita);
      else ignoto = true;
    } else if (elementoJsx(figlio)) {
      if (/Text$/.test(tag(figlio))) testo = true;
      else if (/Icon$/.test(tag(figlio))) icona = true;
      if (ts.isJsxElement(figlio)) figlio.children.forEach(visita);
    } else ts.forEachChild(figlio, visita);
  };
  node.children.forEach(visita);
  return icona && !testo && !ignoto;
};

/** Controlli toccabili con sola icona e senza `accessibilityLabel`, come `file:riga <Tag>`. */
export const iconeSenzaEtichetta = (
  file: string,
  source: string,
  { ancheConEtichetta = false } = {}
): string[] => {
  const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const trovati: string[] = [];
  const visita = (node: ts.Node) => {
    if (
      elementoJsx(node) &&
      haAttributo(node, 'onPress') &&
      (ancheConEtichetta || !haAttributo(node, 'accessibilityLabel')) &&
      !conSpread(node) &&
      soloIcona(node)
    ) {
      const { line } = ast.getLineAndCharacterOfPosition(node.getStart(ast));
      trovati.push(`${file}:${line + 1} <${tag(node)}>`);
    }
    ts.forEachChild(node, visita);
  };
  visita(ast);
  return trovati;
};
