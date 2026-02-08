# Quick Start - UML Diagram Generation

Guía práctica para implementar generación de diagramas UML en tu proyecto.

## 🎯 Objetivo

Convertir tu AST de Tree-sitter en hermosos diagramas UML visuales.

## 📋 Decisiones Clave

### 1. ¿Qué tecnología de rendering usar?

```
¿Necesitas interactividad (drag, zoom, etc.)?
  ├─ SÍ → D3.js
  └─ NO
      ├─ ¿Necesitas control total del layout?
      │   ├─ SÍ → SVG Personalizado
      │   └─ NO → Mermaid
      └─ ¿Diagramas simples?
          └─ SÍ → Mermaid
```

**Recomendación para tu DSL UML:**
- **Fase 1**: Empieza con **Mermaid** (rápido, simple)
- **Fase 2**: Agrega **SVG custom** (control total)
- **Fase 3** (opcional): **D3.js** (si necesitas interactividad)

### 2. ¿Qué algoritmo de layout usar?

- **Grid Layout**: Diagramas sin jerarquía clara
- **Hierarchical Layout**: Cuando hay herencia/implementación
- **Force-Directed**: Cuando quieres layout automático óptimo

## 🚀 Implementación Paso a Paso

### Paso 1: Setup (5 minutos)

```bash
# En tu proyecto de extensión VSCode
cd vscode-extension

# Instalar dependencias
npm install mermaid
npm install --save-dev @types/mermaid

# Para export (opcional, instalar después)
# npm install jspdf svg2pdf.js
```

### Paso 2: Crear Generador Mermaid (30 minutos)

Crea `src/generators/mermaid-generator.ts`:

```typescript
import Parser from 'web-tree-sitter';

export class MermaidGenerator {
  private classes: Map<string, any> = new Map();
  private relationships: any[] = [];

  public generateFromAST(rootNode: Parser.SyntaxNode): string {
    this.classes.clear();
    this.relationships = [];

    // Extraer información
    this.extractClasses(rootNode);
    this.extractRelationships(rootNode);

    // Generar código Mermaid
    return this.generateMermaidCode();
  }

  private extractClasses(node: Parser.SyntaxNode) {
    // Buscar nodos de tipo 'class_declaration'
    if (node.type === 'class_declaration') {
      const name = node.childForFieldName('name')?.text || 'Unknown';
      const attributes: string[] = [];
      const methods: string[] = [];

      // Buscar miembros
      const body = node.children.find(n => n.type === 'class_body');
      if (body) {
        for (const member of body.children) {
          if (member.type === 'attribute') {
            const attr = this.parseAttribute(member);
            attributes.push(attr);
          } else if (member.type === 'method') {
            const method = this.parseMethod(member);
            methods.push(method);
          }
        }
      }

      this.classes.set(name, { name, attributes, methods });
    }

    // Recursión
    for (const child of node.children) {
      this.extractClasses(child);
    }
  }

  private parseAttribute(node: Parser.SyntaxNode): string {
    const name = node.childForFieldName('name')?.text || '';
    const type = node.childForFieldName('type')?.text || 'any';
    const visibility = this.getVisibility(node);
    
    return `${visibility}${type} ${name}`;
  }

  private parseMethod(node: Parser.SyntaxNode): string {
    const name = node.childForFieldName('name')?.text || '';
    const returnType = node.childForFieldName('return_type')?.text || 'void';
    const visibility = this.getVisibility(node);
    
    return `${visibility}${name}() ${returnType}`;
  }

  private getVisibility(node: Parser.SyntaxNode): string {
    // Buscar símbolo de visibilidad
    const vis = node.children.find(n => 
      ['+', '-', '#', '~'].includes(n.text)
    );
    return vis?.text || '+';
  }

  private extractRelationships(node: Parser.SyntaxNode) {
    if (node.type === 'relationship_declaration') {
      const from = node.childForFieldName('from')?.text || '';
      const to = node.childForFieldName('to')?.text || '';
      const arrow = node.childForFieldName('arrow')?.text || '->';
      
      this.relationships.push({ from, to, arrow });
    }

    for (const child of node.children) {
      this.extractRelationships(child);
    }
  }

  private generateMermaidCode(): string {
    const lines = ['classDiagram'];

    // Clases
    for (const [name, cls] of this.classes) {
      lines.push(`  class ${name} {`);
      cls.attributes.forEach((attr: string) => lines.push(`    ${attr}`));
      cls.methods.forEach((method: string) => lines.push(`    ${method}`));
      lines.push('  }');
    }

    // Relaciones
    for (const rel of this.relationships) {
      const arrow = this.convertArrow(rel.arrow);
      lines.push(`  ${rel.from} ${arrow} ${rel.to}`);
    }

    return lines.join('\n');
  }

  private convertArrow(arrow: string): string {
    const map: Record<string, string> = {
      '->': '-->',
      '<|--': '<|--',
      'o--': 'o--',
      '*--': '*--'
    };
    return map[arrow] || '-->';
  }
}
```

### Paso 3: Integrar en Extension (15 minutos)

Edita `src/extension.ts`:

```typescript
import { MermaidGenerator } from './generators/mermaid-generator';

// En tu función activate()
const generateDiagram = vscode.commands.registerCommand(
  'uml.generateDiagram',
  async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    const text = document.getText();

    // Parsear
    const tree = parser.parse(text);

    // Generar diagrama
    const generator = new MermaidGenerator();
    const mermaidCode = generator.generateFromAST(tree.rootNode);

    // Guardar
    const outputPath = document.uri.fsPath.replace('.uml', '.mermaid.md');
    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(outputPath),
      Buffer.from('```mermaid\n' + mermaidCode + '\n```', 'utf-8')
    );

    vscode.window.showInformationMessage('Diagram generated!');
  }
);
```

### Paso 4: Preview en WebView (30 minutos)

Crea `src/preview/diagram-preview.ts`:

```typescript
import * as vscode from 'vscode';
import Parser from 'web-tree-sitter';
import { MermaidGenerator } from '../generators/mermaid-generator';

export class DiagramPreviewPanel {
  private static currentPanel: DiagramPreviewPanel | undefined;
  private panel: vscode.WebviewPanel;
  private parser: Parser;
  private generator: MermaidGenerator;

  public static createOrShow(
    context: vscode.ExtensionContext,
    parser: Parser
  ) {
    const column = vscode.ViewColumn.Beside;

    if (DiagramPreviewPanel.currentPanel) {
      DiagramPreviewPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'umlPreview',
      'UML Diagram Preview',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    DiagramPreviewPanel.currentPanel = new DiagramPreviewPanel(
      panel,
      context,
      parser
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext,
    parser: Parser
  ) {
    this.panel = panel;
    this.parser = parser;
    this.generator = new MermaidGenerator();

    // Setup HTML
    this.panel.webview.html = this.getWebviewContent();

    // Update on document change
    vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.languageId === 'uml') {
        this.update(e.document);
      }
    });

    // Update now
    const editor = vscode.window.activeTextEditor;
    if (editor?.document.languageId === 'uml') {
      this.update(editor.document);
    }
  }

  private update(document: vscode.TextDocument) {
    const text = document.getText();
    const tree = this.parser.parse(text);
    const mermaidCode = this.generator.generateFromAST(tree.rootNode);

    this.panel.webview.postMessage({
      type: 'update',
      mermaidCode
    });
  }

  private getWebviewContent(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 20px;
            background: #fff;
          }
          #diagram {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .error {
            color: red;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div id="diagram"></div>
        
        <script>
          mermaid.initialize({ 
            startOnLoad: false,
            theme: 'default'
          });

          window.addEventListener('message', async event => {
            const message = event.data;
            
            if (message.type === 'update') {
              const container = document.getElementById('diagram');
              
              try {
                const { svg } = await mermaid.render(
                  'diagram-svg',
                  message.mermaidCode
                );
                container.innerHTML = svg;
              } catch (error) {
                container.innerHTML = 
                  '<div class="error">Error rendering diagram: ' + 
                  error.message + '</div>';
              }
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}
```

Registra el comando:

```typescript
// En extension.ts
import { DiagramPreviewPanel } from './preview/diagram-preview';

const showPreview = vscode.commands.registerCommand(
  'uml.showPreview',
  () => {
    DiagramPreviewPanel.createOrShow(context, parser);
  }
);

context.subscriptions.push(showPreview);
```

### Paso 5: Probar (5 minutos)

1. Presiona `F5` para abrir Extension Development Host
2. Crea `test.uml`:

```uml
class User {
  - id: Number
  - name: String
  + getName(): String
}

class Admin {
  - permissions: String[]
}

Admin -> User
```

3. Ejecuta comando: `UML: Show Preview`
4. ¡Deberías ver el diagrama!

## 🎨 Mejoras Opcionales

### Export a PNG

```typescript
async function exportPNG(svgString: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width * 2; // 2x scale
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Failed'));
      }, 'image/png');
    };

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    img.src = URL.createObjectURL(blob);
  });
}
```

### Themes (Light/Dark)

```typescript
// En el WebView
const theme = document.body.classList.contains('vscode-dark') 
  ? 'dark' 
  : 'default';

mermaid.initialize({ theme });
```

### Auto-update

```typescript
// Debouncing
let timeout: NodeJS.Timeout;

vscode.workspace.onDidChangeTextDocument(e => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (e.document.languageId === 'uml') {
      updatePreview(e.document);
    }
  }, 500);
});
```

## 📊 Próximos Pasos

### Fase 1: Básico ✅
- [x] Mermaid generator
- [x] Preview en WebView
- [x] Auto-update

### Fase 2: Mejorado
- [ ] SVG generator custom
- [ ] Algoritmo hierarchical layout
- [ ] Export PNG/PDF
- [ ] Themes personalizados

### Fase 3: Avanzado
- [ ] D3.js interactivo
- [ ] Drag-and-drop
- [ ] Zoom/pan
- [ ] Optimización para diagramas grandes

## 🐛 Debugging

### Mermaid no se muestra

**Problema**: Panel en blanco

**Solución**:
1. Abre DevTools del WebView: `Ctrl+Shift+P` → "Developer: Open Webview Developer Tools"
2. Verifica errores en console
3. Asegúrate que mermaid.min.js carga correctamente

### Diagrama incorrecto

**Problema**: Estructura no coincide con código

**Solución**:
```typescript
// Debug AST
console.log('AST:', tree.rootNode.toString());

// Debug Mermaid
console.log('Mermaid:', mermaidCode);
```

### Preview no actualiza

**Problema**: Cambios en código no se reflejan

**Solución**:
```typescript
// Verifica que el listener está registrado
vscode.workspace.onDidChangeTextDocument(e => {
  console.log('Document changed:', e.document.uri);
});
```

## ✅ Checklist Final

- [ ] MermaidGenerator implementado
- [ ] Preview WebView funcionando
- [ ] Auto-update activo
- [ ] Comando registrado en package.json
- [ ] Parser Tree-sitter integrado
- [ ] Error handling implementado
- [ ] Tests básicos escritos
- [ ] Documentación actualizada

## 🎓 Recursos

- **Skill completo**: `SKILL.md`
- **Ejemplos de código**: `implementation-examples.md`
- **Mermaid docs**: https://mermaid.js.org/
- **VSCode WebView API**: https://code.visualstudio.com/api/extension-guides/webview

---

¡En menos de 2 horas tienes generación de diagramas funcionando! 🚀

**Siguiente**: Implementa export PNG/PDF y themes personalizados.
