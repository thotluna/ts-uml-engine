# VSCode Extension Code Examples

Complete, ready-to-use code examples for building a UML language extension.

## Example 1: Complete package.json

```json
{
  "name": "uml-language-support",
  "displayName": "UML Language Support",
  "description": "Comprehensive language support for UML DSL files",
  "version": "0.1.0",
  "publisher": "your-name",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-name/uml-vscode-extension"
  },
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": [
    "Programming Languages",
    "Linters",
    "Formatters",
    "Visualization"
  ],
  "keywords": [
    "uml",
    "diagram",
    "modeling",
    "class diagram"
  ],
  "icon": "images/icon.png",
  "activationEvents": [
    "onLanguage:uml"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "languages": [
      {
        "id": "uml",
        "aliases": ["UML", "uml"],
        "extensions": [".uml", ".umldiagram"],
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
        "icon": "$(graph)",
        "category": "UML"
      },
      {
        "command": "uml.exportPNG",
        "title": "UML: Export as PNG",
        "category": "UML"
      },
      {
        "command": "uml.exportSVG",
        "title": "UML: Export as SVG",
        "category": "UML"
      },
      {
        "command": "uml.showPreview",
        "title": "UML: Show Live Preview",
        "icon": "$(open-preview)",
        "category": "UML"
      },
      {
        "command": "uml.validate",
        "title": "UML: Validate Document",
        "category": "UML"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "when": "resourceLangId == uml",
          "command": "uml.generateDiagram",
          "group": "uml@1"
        },
        {
          "when": "resourceLangId == uml",
          "command": "uml.showPreview",
          "group": "uml@2"
        }
      ],
      "editor/title": [
        {
          "when": "resourceLangId == uml",
          "command": "uml.showPreview",
          "group": "navigation"
        }
      ],
      "commandPalette": [
        {
          "command": "uml.generateDiagram",
          "when": "resourceLangId == uml"
        },
        {
          "command": "uml.exportPNG",
          "when": "resourceLangId == uml"
        },
        {
          "command": "uml.exportSVG",
          "when": "resourceLangId == uml"
        },
        {
          "command": "uml.showPreview",
          "when": "resourceLangId == uml"
        }
      ]
    },
    "keybindings": [
      {
        "command": "uml.generateDiagram",
        "key": "ctrl+shift+g",
        "mac": "cmd+shift+g",
        "when": "editorTextFocus && resourceLangId == uml"
      },
      {
        "command": "uml.showPreview",
        "key": "ctrl+shift+v",
        "mac": "cmd+shift+v",
        "when": "editorTextFocus && resourceLangId == uml"
      }
    ],
    "configuration": {
      "title": "UML Language Support",
      "properties": {
        "uml.diagramFormat": {
          "type": "string",
          "default": "svg",
          "enum": ["svg", "png", "pdf"],
          "enumDescriptions": [
            "Scalable Vector Graphics (recommended)",
            "Portable Network Graphics",
            "Portable Document Format"
          ],
          "description": "Default export format for diagrams"
        },
        "uml.autoGenerate": {
          "type": "boolean",
          "default": false,
          "description": "Automatically generate diagrams when saving"
        },
        "uml.validation.enable": {
          "type": "boolean",
          "default": true,
          "description": "Enable real-time validation"
        },
        "uml.validation.debounceMs": {
          "type": "number",
          "default": 500,
          "minimum": 100,
          "maximum": 5000,
          "description": "Debounce delay for validation (milliseconds)"
        },
        "uml.preview.autoRefresh": {
          "type": "boolean",
          "default": true,
          "description": "Automatically refresh preview on document change"
        },
        "uml.completion.enable": {
          "type": "boolean",
          "default": true,
          "description": "Enable IntelliSense / auto-completion"
        },
        "uml.trace.server": {
          "type": "string",
          "enum": ["off", "messages", "verbose"],
          "default": "off",
          "description": "Traces communication between VS Code and the language server"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile && npm run lint",
    "lint": "eslint src --ext ts",
    "test": "node ./out/test/runTest.js",
    "package": "vsce package",
    "publish": "vsce publish"
  },
  "devDependencies": {
    "@types/vscode": "^1.80.0",
    "@types/node": "^18.0.0",
    "@types/mocha": "^10.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vscode/test-electron": "^2.3.0",
    "@vscode/vsce": "^2.20.0",
    "eslint": "^8.47.0",
    "mocha": "^10.2.0",
    "typescript": "^5.1.0"
  },
  "dependencies": {
    "vscode-languageclient": "^8.1.0",
    "web-tree-sitter": "^0.20.8"
  }
}
```

## Example 2: Complete extension.ts

```typescript
// src/extension.ts
import * as vscode from 'vscode';
import Parser from 'web-tree-sitter';
import { UMLDiagnostics } from './diagnostics';
import { UMLCompletionProvider } from './completion';
import { UMLHoverProvider } from './hover';
import { UMLPreviewPanel } from './preview';

let parser: Parser;
let umlLanguage: Parser.Language;
let diagnostics: UMLDiagnostics;

export async function activate(context: vscode.ExtensionContext) {
  console.log('UML Language Support extension is now active');

  // Initialize Tree-sitter parser
  await initializeParser(context);

  // Initialize diagnostics
  diagnostics = new UMLDiagnostics(parser);
  diagnostics.activate(context);

  // Register completion provider
  const completionProvider = new UMLCompletionProvider();
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      'uml',
      completionProvider,
      ' ', ':', '.'
    )
  );

  // Register hover provider
  const hoverProvider = new UMLHoverProvider(parser);
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('uml', hoverProvider)
  );

  // Register commands
  registerCommands(context);

  // Show welcome message
  const config = vscode.workspace.getConfiguration('uml');
  if (config.get('showWelcomeMessage', true)) {
    vscode.window.showInformationMessage(
      'UML Language Support is active! Create a .uml file to get started.',
      'Open Documentation',
      'Don\'t show again'
    ).then(selection => {
      if (selection === 'Open Documentation') {
        vscode.env.openExternal(
          vscode.Uri.parse('https://github.com/your-name/uml-docs')
        );
      } else if (selection === 'Don\'t show again') {
        config.update('showWelcomeMessage', false, true);
      }
    });
  }
}

async function initializeParser(context: vscode.ExtensionContext) {
  try {
    await Parser.init();
    parser = new Parser();

    const wasmPath = vscode.Uri.joinPath(
      context.extensionUri,
      'parsers',
      'tree-sitter-uml.wasm'
    );

    umlLanguage = await Parser.Language.load(wasmPath.fsPath);
    parser.setLanguage(umlLanguage);

    console.log('Tree-sitter parser initialized successfully');
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to initialize UML parser: ${error}`
    );
    throw error;
  }
}

function registerCommands(context: vscode.ExtensionContext) {
  // Command: Generate Diagram
  const generateDiagram = vscode.commands.registerCommand(
    'uml.generateDiagram',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'uml') {
        vscode.window.showWarningMessage('Not a UML file');
        return;
      }

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: 'Generating UML diagram...',
            cancellable: false
          },
          async () => {
            const document = editor.document;
            const tree = parser.parse(document.getText());
            
            // Generate diagram (implement your logic)
            const diagram = await generateDiagramFromAST(tree.rootNode);
            
            // Save or display diagram
            await saveDiagram(diagram, document.uri);
            
            vscode.window.showInformationMessage('Diagram generated successfully!');
          }
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to generate diagram: ${error}`);
      }
    }
  );

  // Command: Show Preview
  const showPreview = vscode.commands.registerCommand(
    'uml.showPreview',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'uml') {
        vscode.window.showWarningMessage('Not a UML file');
        return;
      }

      UMLPreviewPanel.createOrShow(context, parser);
    }
  );

  // Command: Export PNG
  const exportPNG = vscode.commands.registerCommand(
    'uml.exportPNG',
    async () => {
      await exportDiagram('png');
    }
  );

  // Command: Export SVG
  const exportSVG = vscode.commands.registerCommand(
    'uml.exportSVG',
    async () => {
      await exportDiagram('svg');
    }
  );

  // Command: Validate
  const validate = vscode.commands.registerCommand(
    'uml.validate',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== 'uml') {
        return;
      }

      diagnostics.validateDocument(editor.document);
      vscode.window.showInformationMessage('Validation complete');
    }
  );

  context.subscriptions.push(
    generateDiagram,
    showPreview,
    exportPNG,
    exportSVG,
    validate
  );
}

async function generateDiagramFromAST(rootNode: Parser.SyntaxNode): Promise<string> {
  // TODO: Implement AST to diagram conversion
  // This would use your diagram generation library (PlantUML, Mermaid, etc.)
  return '<svg>...</svg>';
}

async function saveDiagram(diagram: string, sourceUri: vscode.Uri) {
  const config = vscode.workspace.getConfiguration('uml');
  const format = config.get('diagramFormat', 'svg');
  
  const outputUri = sourceUri.with({
    path: sourceUri.path.replace(/\.uml$/, `.${format}`)
  });

  await vscode.workspace.fs.writeFile(
    outputUri,
    Buffer.from(diagram, 'utf-8')
  );

  // Ask to open the file
  const open = await vscode.window.showInformationMessage(
    `Diagram saved to ${outputUri.fsPath}`,
    'Open'
  );

  if (open === 'Open') {
    await vscode.commands.executeCommand('vscode.open', outputUri);
  }
}

async function exportDiagram(format: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'uml') {
    vscode.window.showWarningMessage('Not a UML file');
    return;
  }

  const saveUri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(`diagram.${format}`),
    filters: {
      'Images': [format]
    }
  });

  if (!saveUri) {
    return;
  }

  // Generate and save
  const tree = parser.parse(editor.document.getText());
  const diagram = await generateDiagramFromAST(tree.rootNode);
  
  await vscode.workspace.fs.writeFile(saveUri, Buffer.from(diagram, 'utf-8'));
  vscode.window.showInformationMessage(`Exported to ${saveUri.fsPath}`);
}

export function deactivate() {
  if (parser) {
    parser.delete();
  }
}
```

## Example 3: Diagnostics Provider

```typescript
// src/diagnostics.ts
import * as vscode from 'vscode';
import Parser from 'web-tree-sitter';

export class UMLDiagnostics {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private parser: Parser;
  private debounceTimeout: NodeJS.Timeout | undefined;

  constructor(parser: Parser) {
    this.parser = parser;
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('uml');
  }

  public activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(this.diagnosticCollection);

    // Validate on open
    vscode.workspace.textDocuments.forEach(doc => {
      if (doc.languageId === 'uml') {
        this.validateDocument(doc);
      }
    });

    // Validate on change (with debouncing)
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.languageId === 'uml') {
          this.debouncedValidate(event.document);
        }
      })
    );

    // Validate on save
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(doc => {
        if (doc.languageId === 'uml') {
          this.validateDocument(doc);
        }
      })
    );

    // Clear diagnostics on close
    context.subscriptions.push(
      vscode.workspace.onDidCloseTextDocument(doc => {
        this.diagnosticCollection.delete(doc.uri);
      })
    );
  }

  private debouncedValidate(document: vscode.TextDocument) {
    clearTimeout(this.debounceTimeout);
    
    const config = vscode.workspace.getConfiguration('uml');
    const debounceMs = config.get('validation.debounceMs', 500);

    this.debounceTimeout = setTimeout(() => {
      this.validateDocument(document);
    }, debounceMs);
  }

  public validateDocument(document: vscode.TextDocument) {
    const config = vscode.workspace.getConfiguration('uml');
    if (!config.get('validation.enable', true)) {
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    try {
      const tree = this.parser.parse(text);
      
      // Check for syntax errors
      if (tree.rootNode.hasError()) {
        this.findSyntaxErrors(tree.rootNode, document, diagnostics);
      }

      // Semantic validation
      this.performSemanticValidation(tree.rootNode, document, diagnostics);

    } catch (error) {
      console.error('Validation error:', error);
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  private findSyntaxErrors(
    node: Parser.SyntaxNode,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
  ) {
    if (node.type === 'ERROR') {
      const range = new vscode.Range(
        document.positionAt(node.startIndex),
        document.positionAt(node.endIndex)
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        'Syntax error: unexpected token',
        vscode.DiagnosticSeverity.Error
      );
      diagnostic.source = 'UML Parser';
      diagnostic.code = 'syntax-error';

      diagnostics.push(diagnostic);
    }

    // Recursively check children
    for (const child of node.children) {
      this.findSyntaxErrors(child, document, diagnostics);
    }
  }

  private performSemanticValidation(
    rootNode: Parser.SyntaxNode,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
  ) {
    // Example: Check for duplicate class names
    const classNames = new Map<string, Parser.SyntaxNode>();

    const checkNode = (node: Parser.SyntaxNode) => {
      if (node.type === 'class_declaration') {
        const nameNode = node.childForFieldName('name');
        if (nameNode) {
          const className = nameNode.text;
          
          if (classNames.has(className)) {
            const range = new vscode.Range(
              document.positionAt(nameNode.startIndex),
              document.positionAt(nameNode.endIndex)
            );

            const diagnostic = new vscode.Diagnostic(
              range,
              `Duplicate class name: ${className}`,
              vscode.DiagnosticSeverity.Error
            );
            diagnostic.source = 'UML Validator';
            diagnostic.code = 'duplicate-class';

            // Add related information pointing to first declaration
            const firstDecl = classNames.get(className)!;
            diagnostic.relatedInformation = [
              new vscode.DiagnosticRelatedInformation(
                new vscode.Location(
                  document.uri,
                  new vscode.Range(
                    document.positionAt(firstDecl.startIndex),
                    document.positionAt(firstDecl.endIndex)
                  )
                ),
                'First declaration here'
              )
            ];

            diagnostics.push(diagnostic);
          } else {
            classNames.set(className, nameNode);
          }
        }
      }

      // Recursively check children
      for (const child of node.children) {
        checkNode(child);
      }
    };

    checkNode(rootNode);
  }
}
```

## Example 4: Completion Provider

```typescript
// src/completion.ts
import * as vscode from 'vscode';

export class UMLCompletionProvider implements vscode.CompletionItemProvider {
  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const completions: vscode.CompletionItem[] = [];

    const linePrefix = document.lineAt(position).text.substr(0, position.character);

    // Keyword completions
    if (!linePrefix.includes(':') && !linePrefix.includes('(')) {
      completions.push(...this.getKeywordCompletions());
    }

    // Type completions (after ':')
    if (linePrefix.includes(':')) {
      completions.push(...this.getTypeCompletions());
    }

    // Visibility modifiers
    if (linePrefix.trim().length === 0 || linePrefix.endsWith(' ')) {
      completions.push(...this.getVisibilityCompletions());
    }

    return completions;
  }

  private getKeywordCompletions(): vscode.CompletionItem[] {
    const keywords = [
      {
        label: 'class',
        kind: vscode.CompletionItemKind.Keyword,
        insertText: new vscode.SnippetString('class ${1:ClassName} {\n\t$0\n}'),
        documentation: 'Define a new class'
      },
      {
        label: 'interface',
        kind: vscode.CompletionItemKind.Keyword,
        insertText: new vscode.SnippetString('interface ${1:InterfaceName} {\n\t$0\n}'),
        documentation: 'Define a new interface'
      },
      {
        label: 'extends',
        kind: vscode.CompletionItemKind.Keyword,
        insertText: 'extends ',
        documentation: 'Extend a class'
      },
      {
        label: 'implements',
        kind: vscode.CompletionItemKind.Keyword,
        insertText: 'implements ',
        documentation: 'Implement an interface'
      }
    ];

    return keywords.map(kw => {
      const item = new vscode.CompletionItem(kw.label, kw.kind);
      item.insertText = kw.insertText;
      item.documentation = new vscode.MarkdownString(kw.documentation);
      return item;
    });
  }

  private getTypeCompletions(): vscode.CompletionItem[] {
    const types = ['String', 'Number', 'Boolean', 'Date', 'void'];

    return types.map(type => {
      const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.TypeParameter);
      item.detail = `Built-in type: ${type}`;
      return item;
    });
  }

  private getVisibilityCompletions(): vscode.CompletionItem[] {
    const visibilities = [
      { symbol: '+', name: 'public', description: 'Public visibility' },
      { symbol: '-', name: 'private', description: 'Private visibility' },
      { symbol: '#', name: 'protected', description: 'Protected visibility' },
      { symbol: '~', name: 'package', description: 'Package visibility' }
    ];

    return visibilities.map(vis => {
      const item = new vscode.CompletionItem(
        vis.symbol,
        vscode.CompletionItemKind.Keyword
      );
      item.detail = vis.name;
      item.documentation = new vscode.MarkdownString(vis.description);
      return item;
    });
  }
}
```

## Example 5: Preview Panel with WebView

```typescript
// src/preview.ts
import * as vscode from 'vscode';
import Parser from 'web-tree-sitter';

export class UMLPreviewPanel {
  private static currentPanel: UMLPreviewPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly context: vscode.ExtensionContext;
  private readonly parser: Parser;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext, parser: Parser) {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;

    if (UMLPreviewPanel.currentPanel) {
      UMLPreviewPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'umlPreview',
      'UML Preview',
      column,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'media')
        ],
        retainContextWhenHidden: true
      }
    );

    UMLPreviewPanel.currentPanel = new UMLPreviewPanel(panel, context, parser);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    parser: Parser
  ) {
    this.panel = panel;
    this.context = context;
    this.parser = parser;

    // Set initial content
    this.update();

    // Listen for document changes
    vscode.workspace.onDidChangeTextDocument(
      e => {
        if (e.document.languageId === 'uml') {
          this.update();
        }
      },
      null,
      this.disposables
    );

    // Handle panel disposal
    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Handle messages from webview
    this.panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'export':
            this.exportDiagram(message.format);
            break;
          case 'zoomIn':
            this.panel.webview.postMessage({ command: 'zoom', factor: 1.2 });
            break;
          case 'zoomOut':
            this.panel.webview.postMessage({ command: 'zoom', factor: 0.8 });
            break;
        }
      },
      null,
      this.disposables
    );
  }

  private update() {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'uml') {
      return;
    }

    const text = editor.document.getText();
    const tree = this.parser.parse(text);

    // Generate SVG diagram
    const diagramSVG = this.generateDiagram(tree.rootNode);

    // Update webview
    this.panel.webview.postMessage({
      command: 'update',
      diagram: diagramSVG
    });
  }

  private generateDiagram(rootNode: Parser.SyntaxNode): string {
    // TODO: Implement actual diagram generation
    // This is where you'd use your diagram library
    return `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="200" height="100" fill="lightblue" stroke="black"/>
        <text x="110" y="60" text-anchor="middle">Sample Diagram</text>
      </svg>
    `;
  }

  private exportDiagram(format: string) {
    vscode.window.showInformationMessage(`Exporting as ${format}...`);
    // Implement export logic
  }

  public dispose() {
    UMLPreviewPanel.currentPanel = undefined;

    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'preview.js')
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'media', 'preview.css')
    );

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>UML Preview</title>
      </head>
      <body>
        <div class="toolbar">
          <button onclick="zoomIn()">Zoom In</button>
          <button onclick="zoomOut()">Zoom Out</button>
          <button onclick="exportSVG()">Export SVG</button>
          <button onclick="exportPNG()">Export PNG</button>
        </div>
        <div id="diagram-container"></div>
        <script src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}
```

These examples provide a solid foundation for building your UML VSCode extension!
