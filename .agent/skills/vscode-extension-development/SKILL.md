---
name: vscode-extension-development
description: Expert guidance for developing Visual Studio Code extensions. Use when creating language support extensions, custom editors, debuggers, themes, or any VSCode functionality. Covers extension API, Language Server Protocol (LSP), activation events, commands, WebView panels, tree views, diagnostics, IntelliSense, syntax highlighting, debugging adapters, and publishing to the marketplace. Ideal for IDE tooling, language integration, and developer productivity tools.
---

# VSCode Extension Development

A comprehensive skill for building professional Visual Studio Code extensions, with special focus on language support and custom tooling.

## When to Use This Skill

Use this skill when the user wants to:

- Create a new VSCode extension from scratch
- Add language support (syntax highlighting, IntelliSense, validation)
- Implement Language Server Protocol (LSP)
- Build custom editors or WebView-based UIs
- Create debugging adapters
- Add custom commands, tree views, or side panels
- Integrate external tools or parsers
- Publish extensions to the marketplace
- Optimize extension performance and activation
- Troubleshoot extension issues

## Extension Architecture Overview

```
VSCode Extension Architecture
┌─────────────────────────────────────────────────────────┐
│                    VSCode Editor                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Extension Host Process                      │ │
│  │  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │  Extension   │  │  Extension   │               │ │
│  │  │  Main Code   │  │  Activation  │               │ │
│  │  └──────────────┘  └──────────────┘               │ │
│  │         ↓                  ↓                        │ │
│  │  ┌──────────────────────────────────┐             │ │
│  │  │     VSCode Extension API          │             │ │
│  │  └──────────────────────────────────┘             │ │
│  └────────────────────────────────────────────────────┘ │
│                         ↕                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │      Language Server (Optional, Separate Process)  │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Parser → AST → Validation → Completions    │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Getting Started: Project Setup

### Step 1: Prerequisites

```bash
# Install Node.js (v18 or later recommended)
node --version

# Install Yeoman and VSCode Extension Generator
npm install -g yo generator-code

# Install VSCode Extension Manager CLI (for testing)
npm install -g @vscode/vsce
```

### Step 2: Generate Extension Scaffold

```bash
# Generate new extension
yo code

# You'll be prompted for:
# - Extension type (New Extension TypeScript/JavaScript)
# - Extension name
# - Identifier (publisher.extension-name)
# - Description
# - Git initialization
# - Package manager (npm/yarn/pnpm)
```

### Step 3: Project Structure

```
my-extension/
├── .vscode/
│   ├── launch.json          # Debug configuration
│   └── tasks.json           # Build tasks
├── src/
│   ├── extension.ts         # Main extension entry point
│   └── test/                # Tests
├── syntaxes/                # TextMate grammars (optional)
│   └── language.tmLanguage.json
├── language-configuration.json  # Language config
├── package.json             # Extension manifest
├── tsconfig.json            # TypeScript config
└── README.md
```

## Extension Manifest (package.json)

The `package.json` is the heart of your extension. Here's a comprehensive example:

```json
{
  "name": "uml-language-support",
  "displayName": "UML Language Support",
  "description": "Language support for UML DSL",
  "version": "0.0.1",
  "publisher": "your-publisher-name",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Programming Languages",
    "Linters",
    "Formatters"
  ],
  "keywords": [
    "uml",
    "diagram",
    "modeling"
  ],
  "activationEvents": [
    "onLanguage:uml",
    "onCommand:uml.generateDiagram"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "languages": [
      {
        "id": "uml",
        "aliases": ["UML", "uml"],
        "extensions": [".uml"],
        "configuration": "./language-configuration.json",
        "icon": {
          "light": "./icons/uml-light.svg",
          "dark": "./icons/uml-dark.svg"
        }
      }
    ],
    "grammars": [
      {
        "language": "uml",
        "scopeName": "source.uml",
        "path": "./syntaxes/uml.tmLanguage.json"
      }
    ],
    "commands": [
      {
        "command": "uml.generateDiagram",
        "title": "UML: Generate Diagram",
        "icon": "$(graph)"
      },
      {
        "command": "uml.exportPNG",
        "title": "UML: Export as PNG"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "when": "resourceLangId == uml",
          "command": "uml.generateDiagram",
          "group": "navigation"
        }
      ],
      "editor/title": [
        {
          "when": "resourceLangId == uml",
          "command": "uml.generateDiagram",
          "group": "navigation"
        }
      ]
    },
    "keybindings": [
      {
        "command": "uml.generateDiagram",
        "key": "ctrl+shift+g",
        "mac": "cmd+shift+g",
        "when": "editorTextFocus && resourceLangId == uml"
      }
    ],
    "configuration": {
      "title": "UML",
      "properties": {
        "uml.diagramFormat": {
          "type": "string",
          "default": "svg",
          "enum": ["svg", "png", "pdf"],
          "description": "Default export format for diagrams"
        },
        "uml.autoGenerate": {
          "type": "boolean",
          "default": false,
          "description": "Automatically generate diagrams on save"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "test": "node ./out/test/runTest.js"
  },
  "devDependencies": {
    "@types/vscode": "^1.80.0",
    "@types/node": "^18.0.0",
    "@vscode/test-electron": "^2.3.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "vscode-languageclient": "^8.1.0"
  }
}
```

## Core Extension Patterns

### Pattern 1: Extension Activation

```typescript
// src/extension.ts
import * as vscode from 'vscode';

// Called when extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log('UML extension is now active!');

  // Register commands
  const generateDiagram = vscode.commands.registerCommand(
    'uml.generateDiagram',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'uml') {
        vscode.window.showErrorMessage('Not a UML file');
        return;
      }

      // Your diagram generation logic
      await generateDiagramFromDocument(document);
    }
  );

  // Add to subscriptions for proper cleanup
  context.subscriptions.push(generateDiagram);

  // Register other features
  registerDiagnostics(context);
  registerCompletion(context);
  registerHover(context);
}

// Called when extension is deactivated
export function deactivate() {
  // Cleanup if needed
}
```

### Pattern 2: Activation Events

Choose the right activation event to minimize startup impact:

```json
{
  "activationEvents": [
    // Activate when UML file is opened
    "onLanguage:uml",
    
    // Activate when command is invoked
    "onCommand:uml.generateDiagram",
    
    // Activate when UML file is in workspace
    "workspaceContains:**/*.uml",
    
    // Activate on VS Code startup (avoid if possible!)
    // "*"  // DON'T USE unless absolutely necessary
  ]
}
```

**Best Practice:** Use specific activation events, not `"*"`. Lazy loading keeps VSCode fast.

### Pattern 3: Diagnostics (Error/Warning Squiggles)

```typescript
import * as vscode from 'vscode';

// Create diagnostic collection
const diagnosticCollection = vscode.languages.createDiagnosticCollection('uml');

function registerDiagnostics(context: vscode.ExtensionContext) {
  context.subscriptions.push(diagnosticCollection);

  // Validate on open
  vscode.workspace.onDidOpenTextDocument(validateDocument);
  
  // Validate on save
  vscode.workspace.onDidSaveTextDocument(validateDocument);
  
  // Validate on change (with debouncing)
  let timeout: NodeJS.Timeout | undefined;
  vscode.workspace.onDidChangeTextDocument((event) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => validateDocument(event.document), 500);
  });
}

function validateDocument(document: vscode.TextDocument) {
  if (document.languageId !== 'uml') {
    return;
  }

  const diagnostics: vscode.Diagnostic[] = [];
  const text = document.getText();

  // Parse and find errors
  const errors = parseAndValidate(text);

  for (const error of errors) {
    const range = new vscode.Range(
      new vscode.Position(error.line, error.column),
      new vscode.Position(error.line, error.column + error.length)
    );

    const diagnostic = new vscode.Diagnostic(
      range,
      error.message,
      error.severity === 'error' 
        ? vscode.DiagnosticSeverity.Error 
        : vscode.DiagnosticSeverity.Warning
    );

    diagnostic.source = 'UML Validator';
    diagnostic.code = error.code;

    diagnostics.push(diagnostic);
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

function parseAndValidate(text: string) {
  // Your parser logic here
  // Return array of { line, column, length, message, severity, code }
  return [];
}
```

### Pattern 4: IntelliSense / Auto-completion

```typescript
function registerCompletion(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerCompletionItemProvider(
    'uml',
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
      ) {
        const completions: vscode.CompletionItem[] = [];

        // Keyword completions
        const classCompletion = new vscode.CompletionItem(
          'class',
          vscode.CompletionItemKind.Keyword
        );
        classCompletion.insertText = new vscode.SnippetString(
          'class ${1:ClassName} {\n\t$0\n}'
        );
        classCompletion.documentation = new vscode.MarkdownString(
          'Create a new class definition'
        );
        completions.push(classCompletion);

        // Type completions
        ['String', 'Number', 'Boolean', 'Date'].forEach(type => {
          const item = new vscode.CompletionItem(
            type,
            vscode.CompletionItemKind.TypeParameter
          );
          completions.push(item);
        });

        // Context-aware completions
        const linePrefix = document
          .lineAt(position)
          .text.substr(0, position.character);

        if (linePrefix.includes(':')) {
          // We're after a colon, suggest types
          return completions.filter(
            c => c.kind === vscode.CompletionItemKind.TypeParameter
          );
        }

        return completions;
      }
    },
    ' ', ':', '.'  // Trigger characters
  );

  context.subscriptions.push(provider);
}
```

### Pattern 5: Hover Information

```typescript
function registerHover(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerHoverProvider('uml', {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);

      // Look up symbol information
      const symbolInfo = lookupSymbol(word, document);

      if (symbolInfo) {
        const markdown = new vscode.MarkdownString();
        markdown.appendCodeblock(symbolInfo.signature, 'uml');
        markdown.appendMarkdown(`\n\n${symbolInfo.documentation}`);
        
        return new vscode.Hover(markdown, range);
      }

      return null;
    }
  });

  context.subscriptions.push(provider);
}

function lookupSymbol(word: string, document: vscode.TextDocument) {
  // Parse document and find symbol
  // Return { signature, documentation } or null
  return null;
}
```

## Language Server Protocol (LSP) Integration

For complex language features, use LSP to separate parsing logic:

### LSP Architecture

```
┌─────────────────┐         JSON-RPC over        ┌─────────────────┐
│  VSCode Client  │ ←──────────────────────────→ │ Language Server │
│   Extension     │        stdio/socket          │   (Node/other)  │
└─────────────────┘                               └─────────────────┘
```

### Client Setup (Extension Side)

```typescript
// src/extension.ts
import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // Server executable
  const serverModule = context.asAbsolutePath(
    path.join('out', 'server', 'server.js')
  );

  // Debug options
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // Server options
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  };

  // Client options
  const clientOptions: LanguageClientOptions = {
    // Register server for UML documents
    documentSelector: [{ scheme: 'file', language: 'uml' }],
    synchronize: {
      // Notify server about file changes to .uml files
      fileEvents: workspace.createFileSystemWatcher('**/*.uml')
    }
  };

  // Create and start client
  client = new LanguageClient(
    'umlLanguageServer',
    'UML Language Server',
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
```

### Server Implementation (Separate Process)

```typescript
// src/server/server.ts
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  CompletionItem,
  CompletionItemKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

// Create connection
const connection = createConnection(ProposedFeatures.all);

// Document manager
const documents = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: [' ', ':', '.']
      },
      hoverProvider: true,
      definitionProvider: true,
      referencesProvider: true,
      documentSymbolProvider: true
    }
  };
});

// Document change → validation
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const diagnostics = [];

  // Your parsing and validation logic
  const errors = parseAndValidate(text);

  for (const error of errors) {
    diagnostics.push({
      severity: error.severity,
      range: {
        start: textDocument.positionAt(error.offset),
        end: textDocument.positionAt(error.offset + error.length)
      },
      message: error.message,
      source: 'UML'
    });
  }

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Completions
connection.onCompletion((_textDocumentPosition) => {
  return [
    {
      label: 'class',
      kind: CompletionItemKind.Keyword,
      data: 1
    },
    {
      label: 'interface',
      kind: CompletionItemKind.Keyword,
      data: 2
    }
  ];
});

documents.listen(connection);
connection.listen();
```

## Syntax Highlighting (TextMate Grammar)

Create `syntaxes/uml.tmLanguage.json`:

```json
{
  "name": "UML",
  "scopeName": "source.uml",
  "patterns": [
    { "include": "#keywords" },
    { "include": "#strings" },
    { "include": "#comments" },
    { "include": "#types" },
    { "include": "#operators" }
  ],
  "repository": {
    "keywords": {
      "patterns": [
        {
          "name": "keyword.control.uml",
          "match": "\\b(class|interface|extends|implements)\\b"
        },
        {
          "name": "keyword.other.uml",
          "match": "\\b(public|private|protected|static)\\b"
        }
      ]
    },
    "strings": {
      "name": "string.quoted.double.uml",
      "begin": "\"",
      "end": "\"",
      "patterns": [
        {
          "name": "constant.character.escape.uml",
          "match": "\\\\."
        }
      ]
    },
    "comments": {
      "patterns": [
        {
          "name": "comment.line.double-slash.uml",
          "match": "//.*$"
        },
        {
          "name": "comment.block.uml",
          "begin": "/\\*",
          "end": "\\*/"
        }
      ]
    },
    "types": {
      "name": "support.type.uml",
      "match": "\\b(String|Number|Boolean|Date)\\b"
    },
    "operators": {
      "name": "keyword.operator.uml",
      "match": "(->|<\\|--|o--|\\*--|-->)"
    }
  }
}
```

## Language Configuration

Create `language-configuration.json`:

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
    { "open": "\"", "close": "\"", "notIn": ["string"] }
  ],
  "surroundingPairs": [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
    ["\"", "\""]
  ],
  "folding": {
    "markers": {
      "start": "^\\s*//\\s*#region",
      "end": "^\\s*//\\s*#endregion"
    }
  },
  "wordPattern": "(-?\\d*\\.\\d\\w*)|([^\\`\\~\\!\\@\\#\\%\\^\\&\\*\\(\\)\\-\\=\\+\\[\\{\\]\\}\\\\\\|\\;\\:\\'\\\"\\,\\.\\<\\>\\/\\?\\s]+)"
}
```

## WebView Panels (Custom UI)

For diagram preview or custom editors:

```typescript
function showDiagramPreview(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'umlPreview',
    'UML Diagram Preview',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, 'media')
      ]
    }
  );

  // Set HTML content
  panel.webview.html = getWebviewContent(panel.webview, context);

  // Handle messages from webview
  panel.webview.onDidReceiveMessage(
    message => {
      switch (message.command) {
        case 'export':
          exportDiagram(message.format);
          break;
      }
    },
    undefined,
    context.subscriptions
  );

  // Update content when document changes
  const changeSubscription = vscode.workspace.onDidChangeTextDocument(e => {
    if (e.document.languageId === 'uml') {
      updateDiagramPreview(panel, e.document);
    }
  });

  panel.onDidDispose(() => changeSubscription.dispose());
}

function getWebviewContent(
  webview: vscode.Webview,
  context: vscode.ExtensionContext
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'media', 'preview.js')
  );
  
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'media', 'preview.css')
  );

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>UML Diagram Preview</title>
  </head>
  <body>
    <div id="diagram-container"></div>
    <script src="${scriptUri}"></script>
  </body>
  </html>`;
}
```

## Testing Your Extension

### Unit Tests

```typescript
// src/test/suite/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('publisher.extension-name'));
  });

  test('Should register commands', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('uml.generateDiagram'));
  });

  test('Should activate on UML file', async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: 'uml',
      content: 'class User {}'
    });

    await vscode.window.showTextDocument(doc);
    
    const ext = vscode.extensions.getExtension('publisher.extension-name');
    assert.ok(ext?.isActive);
  });
});
```

### Integration Tests

```bash
# Run tests
npm test

# Test in VSCode development host
F5 (or Run > Start Debugging)
```

## Performance Best Practices

### 1. Lazy Activation

```json
{
  "activationEvents": [
    "onLanguage:uml"  // ✓ Good
    // "*"            // ✗ Bad - activates on startup
  ]
}
```

### 2. Debounce Expensive Operations

```typescript
let timeout: NodeJS.Timeout | undefined;

vscode.workspace.onDidChangeTextDocument(event => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    // Expensive operation (parsing, validation)
    validateDocument(event.document);
  }, 500);  // Wait 500ms after last change
});
```

### 3. Use Output Channel for Logging (Not console.log)

```typescript
const outputChannel = vscode.window.createOutputChannel('UML');

outputChannel.appendLine('Extension activated');
outputChannel.show();  // Show in Output panel
```

### 4. Dispose Resources Properly

```typescript
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(...);
  
  // Add to subscriptions for automatic disposal
  context.subscriptions.push(disposable);
}
```

## Publishing Your Extension

### Step 1: Prepare for Publishing

```bash
# Install vsce
npm install -g @vscode/vsce

# Package extension
vsce package

# This creates extension-name-0.0.1.vsix
```

### Step 2: Create Publisher Account

1. Go to https://marketplace.visualstudio.com/manage
2. Create a publisher (choose a unique ID)
3. Generate a Personal Access Token (PAT) from Azure DevOps

### Step 3: Publish

```bash
# Login with PAT
vsce login your-publisher-name

# Publish to marketplace
vsce publish

# Or publish specific version
vsce publish minor  # 0.0.1 → 0.1.0
vsce publish patch  # 0.0.1 → 0.0.2
vsce publish major  # 0.0.1 → 1.0.0
```

### Step 4: Update README and Metadata

Create compelling `README.md`:

```markdown
# UML Language Support

Provides comprehensive language support for UML DSL files.

## Features

- ✅ Syntax highlighting
- ✅ IntelliSense / Auto-completion
- ✅ Real-time validation
- ✅ Diagram preview
- ✅ Export to PNG/SVG/PDF

## Usage

1. Create a `.uml` file
2. Start writing UML code
3. Press `Ctrl+Shift+G` to generate diagram

![Demo](images/demo.gif)

## Requirements

- VS Code 1.80.0 or higher

## Extension Settings

- `uml.diagramFormat`: Default export format (svg/png/pdf)
- `uml.autoGenerate`: Auto-generate on save

## Release Notes

### 0.0.1
Initial release with basic language support
```

Add images to `images/` folder:
- Icon (128x128 PNG)
- Screenshots
- Demo GIFs

## Common Patterns for Your UML Extension

### Pattern: Integrate Tree-sitter Parser

```typescript
import Parser from 'web-tree-sitter';

let parser: Parser;
let umlLanguage: Parser.Language;

async function initializeParser() {
  await Parser.init();
  parser = new Parser();
  
  const wasmPath = vscode.Uri.joinPath(
    context.extensionUri,
    'parsers',
    'tree-sitter-uml.wasm'
  );
  
  umlLanguage = await Parser.Language.load(wasmPath.fsPath);
  parser.setLanguage(umlLanguage);
}

function parseDocument(document: vscode.TextDocument) {
  const tree = parser.parse(document.getText());
  return tree.rootNode;
}
```

### Pattern: Real-time Diagram Preview

```typescript
let currentPanel: vscode.WebviewPanel | undefined;

function showLiveDiagramPreview(context: vscode.ExtensionContext) {
  if (currentPanel) {
    currentPanel.reveal(vscode.ViewColumn.Beside);
    return;
  }

  currentPanel = vscode.window.createWebviewPanel(
    'umlLivePreview',
    'UML Live Preview',
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  // Update on every document change
  const updateListener = vscode.workspace.onDidChangeTextDocument(e => {
    if (e.document.languageId === 'uml' && currentPanel) {
      const diagram = generateDiagramSVG(e.document.getText());
      currentPanel.webview.postMessage({ type: 'update', diagram });
    }
  });

  currentPanel.onDidDispose(() => {
    currentPanel = undefined;
    updateListener.dispose();
  });
}
```

## Troubleshooting Common Issues

### Issue: Extension not activating

**Check:**
- Activation events in `package.json`
- Language ID matches in `contributes.languages`
- File extension registered correctly

### Issue: Commands not appearing

**Check:**
- Commands registered in both code AND `package.json`
- Command IDs match exactly
- Extension activated before command invoked

### Issue: Syntax highlighting not working

**Check:**
- Grammar scope name matches in both files
- TextMate grammar JSON is valid
- File extension associated with language

### Issue: Performance problems

**Solutions:**
- Use debouncing for validation
- Implement incremental parsing
- Use Language Server for heavy processing
- Profile with VSCode Performance tools

## Advanced Topics

### Custom Tree Views

```typescript
class UMLOutlineProvider implements vscode.TreeDataProvider<UMLNode> {
  getTreeItem(element: UMLNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: UMLNode): UMLNode[] {
    // Return root nodes or children
  }
}

// Register in activate()
vscode.window.registerTreeDataProvider(
  'umlOutline',
  new UMLOutlineProvider()
);
```

### Code Actions (Quick Fixes)

```typescript
vscode.languages.registerCodeActionsProvider('uml', {
  provideCodeActions(document, range, context) {
    const actions = [];
    
    for (const diagnostic of context.diagnostics) {
      if (diagnostic.code === 'missing-type') {
        const action = new vscode.CodeAction(
          'Add type annotation',
          vscode.CodeActionKind.QuickFix
        );
        action.edit = new vscode.WorkspaceEdit();
        action.edit.insert(document.uri, range.end, ': String');
        actions.push(action);
      }
    }
    
    return actions;
  }
});
```

## Resources

### Official Documentation
- VSCode API: https://code.visualstudio.com/api
- Extension Samples: https://github.com/microsoft/vscode-extension-samples
- LSP Specification: https://microsoft.github.io/language-server-protocol/

### Tools
- Yo Code Generator: https://www.npmjs.com/package/generator-code
- VSCE: https://github.com/microsoft/vscode-vsce
- Extension Test Runner: https://github.com/microsoft/vscode-test

### Community
- VSCode Extension Development Discord
- Stack Overflow [vscode-extensions] tag
- GitHub Discussions on vscode repository

## Workflow Summary

For your UML DSL extension:

1. ✅ **Setup** → Generate extension with `yo code`
2. ✅ **Language Definition** → Add UML to `package.json`
3. ✅ **Syntax Highlighting** → Create TextMate grammar
4. ✅ **Parser Integration** → Add Tree-sitter parser
5. ✅ **Diagnostics** → Implement validation
6. ✅ **IntelliSense** → Add completions and hover
7. ✅ **Commands** → Register diagram generation
8. ✅ **Preview** → Create WebView panel
9. ✅ **Testing** → Write unit and integration tests
10. ✅ **Publishing** → Package and publish to marketplace

## Conclusion

Building a VSCode extension requires understanding the extension API, choosing the right architecture (client-only vs LSP), and following performance best practices. For language support, LSP with Tree-sitter provides the best developer experience and maintainability.

Remember: Start simple, test frequently, and iterate based on user feedback!
