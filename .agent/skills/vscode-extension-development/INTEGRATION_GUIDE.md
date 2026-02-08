# Guía de Integración Rápida - VSCode Extension + Tree-sitter Parser

Esta guía muestra cómo integrar tu parser Tree-sitter de UML con tu extensión de VSCode.

## 📋 Prerequisites

Antes de empezar, necesitas tener:

- ✅ Parser Tree-sitter de UML compilado (.wasm file)
- ✅ Node.js v18+ instalado
- ✅ VSCode instalado
- ✅ Conocimientos básicos de TypeScript

## 🚀 Paso a Paso

### Paso 1: Crear Extensión Base

```bash
# Instalar generador
npm install -g yo generator-code

# Generar extensión
yo code

# Opciones:
# - Type: New Extension (TypeScript)
# - Name: uml-language-support
# - Identifier: uml-language-support
# - Description: Language support for UML DSL
# - Initialize git: Yes
# - Package manager: npm
```

### Paso 2: Instalar Dependencias

```bash
cd uml-language-support

# Instalar Tree-sitter
npm install web-tree-sitter

# Instalar tipos
npm install --save-dev @types/node
```

### Paso 3: Agregar Parser WASM

```bash
# Crear directorio para parsers
mkdir -p parsers

# Copiar tu parser compilado
cp /ruta/a/tree-sitter-uml.wasm parsers/

# Asegúrate de que esté en .vscodeignore (NO debe excluirse)
# Edita .vscodeignore y verifica que parsers/ NO esté listado
```

### Paso 4: Configurar package.json

Edita `package.json` y agrega:

```json
{
  "activationEvents": [
    "onLanguage:uml"
  ],
  "contributes": {
    "languages": [
      {
        "id": "uml",
        "aliases": ["UML", "uml"],
        "extensions": [".uml"],
        "configuration": "./language-configuration.json"
      }
    ],
    "grammars": [
      {
        "language": "uml",
        "scopeName": "source.uml",
        "path": "./syntaxes/uml.tmLanguage.json"
      }
    ]
  }
}
```

### Paso 5: Crear Archivos de Configuración

#### language-configuration.json

```json
{
  "comments": {
    "lineComment": "//",
    "blockComment": ["/*", "*/"]
  },
  "brackets": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"]
  ],
  "autoClosingPairs": [
    { "open": "{", "close": "}" },
    { "open": "[", "close": "]" },
    { "open": "(", "close": ")" },
    { "open": "\"", "close": "\"" }
  ]
}
```

#### syntaxes/uml.tmLanguage.json

Crear directorio y archivo:

```bash
mkdir syntaxes
```

Usa la gramática TextMate del skill o crea una básica:

```json
{
  "name": "UML",
  "scopeName": "source.uml",
  "patterns": [
    {
      "name": "keyword.control.uml",
      "match": "\\b(class|interface|extends|implements)\\b"
    },
    {
      "name": "string.quoted.double.uml",
      "begin": "\"",
      "end": "\""
    }
  ]
}
```

### Paso 6: Implementar Extension

Edita `src/extension.ts`:

```typescript
import * as vscode from 'vscode';
import Parser from 'web-tree-sitter';

let parser: Parser;
let umlLanguage: Parser.Language;

export async function activate(context: vscode.ExtensionContext) {
  console.log('UML extension activating...');

  try {
    // Inicializar Tree-sitter
    await Parser.init();
    parser = new Parser();

    // Cargar parser WASM
    const wasmPath = vscode.Uri.joinPath(
      context.extensionUri,
      'parsers',
      'tree-sitter-uml.wasm'
    );

    umlLanguage = await Parser.Language.load(wasmPath.fsPath);
    parser.setLanguage(umlLanguage);

    console.log('Parser initialized successfully');

    // Registrar validación
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('uml');
    context.subscriptions.push(diagnosticCollection);

    // Validar al cambiar documento
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document.languageId === 'uml') {
        validateDocument(event.document, diagnosticCollection);
      }
    });

    // Validar documentos abiertos
    vscode.workspace.textDocuments.forEach(doc => {
      if (doc.languageId === 'uml') {
        validateDocument(doc, diagnosticCollection);
      }
    });

    vscode.window.showInformationMessage('UML extension activated!');

  } catch (error) {
    vscode.window.showErrorMessage(`Failed to activate: ${error}`);
    console.error(error);
  }
}

function validateDocument(
  document: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection
) {
  const diagnostics: vscode.Diagnostic[] = [];

  try {
    const text = document.getText();
    const tree = parser.parse(text);

    // Buscar errores de sintaxis
    if (tree.rootNode.hasError()) {
      findErrors(tree.rootNode, document, diagnostics);
    }

    diagnosticCollection.set(document.uri, diagnostics);

  } catch (error) {
    console.error('Validation error:', error);
  }
}

function findErrors(
  node: Parser.SyntaxNode,
  document: vscode.TextDocument,
  diagnostics: vscode.Diagnostic[]
) {
  if (node.type === 'ERROR' || node.isMissing()) {
    const range = new vscode.Range(
      document.positionAt(node.startIndex),
      document.positionAt(node.endIndex)
    );

    const diagnostic = new vscode.Diagnostic(
      range,
      `Syntax error: ${node.type}`,
      vscode.DiagnosticSeverity.Error
    );

    diagnostics.push(diagnostic);
  }

  for (const child of node.children) {
    findErrors(child, document, diagnostics);
  }
}

export function deactivate() {
  if (parser) {
    parser.delete();
  }
}
```

### Paso 7: Compilar y Probar

```bash
# Compilar TypeScript
npm run compile

# O watch mode
npm run watch
```

En VSCode:
1. Presiona `F5` para abrir Extension Development Host
2. Crea un archivo `test.uml`
3. Escribe código UML
4. Verifica syntax highlighting y validación

### Paso 8: Agregar Features Avanzadas

#### Auto-completion

Crea `src/completion.ts`:

```typescript
import * as vscode from 'vscode';

export class UMLCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] {
    const items: vscode.CompletionItem[] = [];

    // Keyword: class
    const classItem = new vscode.CompletionItem(
      'class',
      vscode.CompletionItemKind.Keyword
    );
    classItem.insertText = new vscode.SnippetString(
      'class ${1:Name} {\n\t$0\n}'
    );
    items.push(classItem);

    // Types
    ['String', 'Number', 'Boolean'].forEach(type => {
      items.push(new vscode.CompletionItem(
        type,
        vscode.CompletionItemKind.TypeParameter
      ));
    });

    return items;
  }
}
```

Registra en `extension.ts`:

```typescript
import { UMLCompletionProvider } from './completion';

// En activate():
const completionProvider = new UMLCompletionProvider();
context.subscriptions.push(
  vscode.languages.registerCompletionItemProvider(
    'uml',
    completionProvider,
    ' ', ':', '.'
  )
);
```

## 🧪 Testing

### Test Manual

1. `F5` para abrir Development Host
2. Crear `test.uml`
3. Probar features:
   - Syntax highlighting
   - Error squiggles
   - Auto-completion
   - Hover info

### Test Automatizado

Crea `src/test/suite/extension.test.ts`:

```typescript
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('Should activate on UML file', async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: 'uml',
      content: 'class User {}'
    });

    await vscode.window.showTextDocument(doc);

    const ext = vscode.extensions.getExtension('your-publisher.uml-language-support');
    assert.ok(ext?.isActive);
  });
});
```

Ejecutar tests:

```bash
npm test
```

## 📦 Packaging

```bash
# Instalar vsce
npm install -g @vscode/vsce

# Empaquetar
vsce package

# Genera: uml-language-support-0.0.1.vsix
```

Instalar localmente:
```bash
code --install-extension uml-language-support-0.0.1.vsix
```

## 🔍 Debugging

### Console Output

```typescript
// En extension.ts
const outputChannel = vscode.window.createOutputChannel('UML');
outputChannel.appendLine('Debug message');
outputChannel.show();
```

### Breakpoints

1. Pon breakpoints en `src/extension.ts`
2. Presiona `F5`
3. Los breakpoints se activarán en Development Host

### Parser Debug

```typescript
function debugTree(node: Parser.SyntaxNode, indent = '') {
  console.log(indent + node.type + ': ' + node.text.substring(0, 20));
  node.children.forEach(child => debugTree(child, indent + '  '));
}

// Usar:
const tree = parser.parse(text);
debugTree(tree.rootNode);
```

## ⚠️ Troubleshooting

### Parser no carga

**Problema:** `Cannot find module tree-sitter-uml.wasm`

**Solución:**
1. Verifica que `parsers/` esté en el proyecto
2. Revisa `.vscodeignore` - NO debe excluir `parsers/`
3. Verifica path en código: `vscode.Uri.joinPath(...)`

### Syntax highlighting no funciona

**Problema:** Sin colores en código UML

**Solución:**
1. Verifica `syntaxes/uml.tmLanguage.json` existe
2. Revisa `package.json` → `contributes.grammars`
3. Recarga window: `Ctrl+Shift+P` → "Reload Window"

### Extension no activa

**Problema:** Extension no se activa con archivos .uml

**Solución:**
1. Verifica `activationEvents` en `package.json`
2. Debe incluir `"onLanguage:uml"`
3. Verifica que el `id` del lenguaje coincida

### Errores de TypeScript

**Problema:** Errores de compilación

**Solución:**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Recompilar
npm run compile
```

## 📚 Próximos Pasos

1. ✅ **Agregar más features**
   - Hover information
   - Go to definition
   - Find references
   - Code actions

2. ✅ **Implementar preview**
   - WebView panel
   - Diagram rendering
   - Export functionality

3. ✅ **Optimizar performance**
   - Debouncing
   - Incremental parsing
   - LSP si es necesario

4. ✅ **Publicar**
   - Crear README atractivo
   - Screenshots y GIFs
   - Publish to marketplace

## 🎯 Checklist de Integración

- [ ] Parser WASM en `parsers/`
- [ ] `web-tree-sitter` instalado
- [ ] Language registrado en `package.json`
- [ ] TextMate grammar creada
- [ ] Parser inicializado en `activate()`
- [ ] Diagnostics implementados
- [ ] Completion provider registrado
- [ ] Tests escritos
- [ ] Extension empaquetada
- [ ] Documentación creada

¡Éxito en tu integración! 🚀
