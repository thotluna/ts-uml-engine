# VSCode Extension Development Skill

Un skill completo para Claude que proporciona experiencia experta en desarrollo de extensiones para Visual Studio Code, con énfasis especial en soporte de lenguajes personalizados.

## 🎯 Propósito

Este skill ayuda a desarrolladores a:
- Crear extensiones de VSCode desde cero
- Implementar soporte completo de lenguajes (syntax highlighting, validation, IntelliSense)
- Integrar parsers personalizados (Tree-sitter, ANTLR, etc.)
- Implementar Language Server Protocol (LSP)
- Crear interfaces personalizadas con WebView
- Optimizar performance y activación
- Publicar extensiones al marketplace
- Debuggear y testear extensiones

## 🚀 Casos de Uso

### Extensión de Lenguaje DSL
```
Usuario: "Quiero crear extensión VSCode para mi DSL de UML"
Claude: [Guía completa con scaffold, package.json, providers, etc.]
```

### Integración de Parser
```
Usuario: "¿Cómo integro mi parser Tree-sitter en la extensión?"
Claude: [Código completo de inicialización, validación, diagnostics]
```

### Syntax Highlighting
```
Usuario: "Necesito syntax highlighting para mi lenguaje"
Claude: [Gramática TextMate completa con ejemplos]
```

### WebView Preview
```
Usuario: "Quiero preview en vivo del diagrama"
Claude: [Implementación completa de WebView con actualización automática]
```

## 📋 Contenido del Skill

### Arquitectura de Extensiones
- Extension Host Process
- Extension API
- Language Server Protocol (opcional)
- Comunicación con VSCode

### Setup de Proyecto
- Generación con Yeoman (`yo code`)
- Estructura de archivos
- Configuration (package.json)
- TypeScript setup

### Contribuciones Core
- **Languages**: Registro de nuevos lenguajes
- **Grammars**: Syntax highlighting con TextMate
- **Commands**: Comandos personalizados
- **Menus**: Context menus, editor toolbar
- **Keybindings**: Atajos de teclado
- **Configuration**: Settings de usuario

### Providers y Features
- **Diagnostics**: Errores y warnings (squiggles)
- **Completion**: IntelliSense / autocompletado
- **Hover**: Información al pasar el mouse
- **Definition**: Go to definition
- **References**: Find references
- **Formatting**: Code formatting
- **Code Actions**: Quick fixes

### Language Server Protocol
- Arquitectura client-server
- Comunicación JSON-RPC
- Setup del cliente (extensión)
- Implementación del servidor
- Capabilities y features

### WebView Panels
- Creación de panels
- HTML/CSS/JS personalizado
- Comunicación bidireccional
- Resource URIs y security
- Actualización en tiempo real

### Testing y Debugging
- Unit tests
- Integration tests
- Debug configuration
- Extension Development Host

### Performance
- Lazy activation
- Debouncing
- Code splitting
- Output channels vs console.log

### Publishing
- Packaging con vsce
- Publisher account
- Marketplace listing
- Versionado semántico

## 🧪 Evaluaciones (Evals)

El skill incluye 8 evaluaciones que cubren:

1. **eval-0**: Setup inicial y estructura de proyecto
2. **eval-1**: Integración de parser Tree-sitter para validación
3. **eval-2**: Gramática TextMate para syntax highlighting
4. **eval-3**: Implementación de CompletionProvider inteligente
5. **eval-4**: Arquitectura LSP client-server completa
6. **eval-5**: WebView panel con preview en vivo
7. **eval-6**: Optimización de performance y activación
8. **eval-7**: Publishing al marketplace

## 📦 Estructura del Skill

```
vscode-extension-skill/
├── SKILL.md              # Skill principal (guía completa)
├── README.md             # Este archivo
└── evals/
    ├── evals.json        # Casos de prueba
    └── files/
        └── code-examples.md  # Ejemplos de código completos
```

## 🎓 Para Qué Proyectos es Útil

- ✅ Extensiones de soporte de lenguajes personalizados (DSLs)
- ✅ Integraciones con herramientas externas
- ✅ Editores personalizados
- ✅ Debuggers
- ✅ Linters y formatters
- ✅ Snippets y templates
- ✅ Productivity tools
- ✅ Themes y customización de UI

## 🔧 Cómo Usar Este Skill

### Opción 1: Usar con Claude

1. Sube el archivo `SKILL.md`
2. Pide a Claude: "Lee este skill sobre VSCode extensions"
3. Haz preguntas específicas sobre tu extensión

### Opción 2: Como Referencia

Usa el skill como documentación de referencia mientras desarrollas tu extensión. Las secciones están organizadas por tarea.

### Opción 3: Ejemplos de Código

El archivo `code-examples.md` contiene implementaciones completas listas para usar:
- package.json configurado
- extension.ts completo
- Diagnostics provider
- Completion provider
- Preview panel con WebView

## 💡 Preguntas que el Skill Maneja Bien

- "¿Cómo empiezo una extensión de VSCode?"
- "¿Cómo integro mi parser en la extensión?"
- "¿Cómo implemento syntax highlighting?"
- "¿Cómo muestro errores con squiggles?"
- "¿Cómo hago autocompletado inteligente?"
- "¿LSP o providers directos?"
- "¿Cómo creo un preview panel?"
- "¿Por qué mi extensión es lenta?"
- "¿Cómo publico al marketplace?"

## 🎯 Tu Proyecto: Extensión UML

Este skill fue diseñado específicamente para tu proyecto de DSL UML. Cubre todo lo necesario:

### Fase 1: Setup ✅
- Scaffold con `yo code`
- Configuración de package.json
- Registro del lenguaje UML

### Fase 2: Parser Integration ✅
- Integración de Tree-sitter
- Inicialización del parser
- Parsing de documentos

### Fase 3: Language Features ✅
- Syntax highlighting (TextMate)
- Diagnostics (validación)
- IntelliSense (completion)
- Hover information

### Fase 4: Diagram Preview ✅
- WebView panel
- SVG rendering
- Actualización automática
- Export functionality

### Fase 5: Publishing ✅
- Packaging
- Testing
- Marketplace submission

## 📚 Complementa con Otros Skills

Este skill se integra perfectamente con:

1. **DSL Parser Development** - Para diseñar e implementar tu parser
2. **UML Diagram Generation** - Para generar los diagramas visuales
3. **Testing & QA** - Para probar tu extensión

## 🔗 Workflow Integrado

```
1. DSL Parser Skill
   ↓ (diseña gramática + implementa parser)
   
2. VSCode Extension Skill  ← ESTE SKILL
   ↓ (crea extensión + integra parser)
   
3. UML Diagram Generation Skill
   ↓ (genera diagramas desde AST)
   
4. Testing & QA Skill
   ↓ (prueba todo el flujo)
   
5. ¡Extensión publicada! 🎉
```

## 📖 Recursos Incluidos

### Ejemplos de Código Completos
El archivo `code-examples.md` incluye:
- ✅ package.json completo y documentado
- ✅ extension.ts con todos los comandos
- ✅ UMLDiagnostics class completa
- ✅ UMLCompletionProvider con snippets
- ✅ UMLPreviewPanel con WebView

### Patterns de Arquitectura
- Extension activation
- Diagnostics con debouncing
- Completion context-aware
- LSP client-server
- WebView communication

### Best Practices
- Performance optimization
- Proper resource disposal
- Error handling
- User experience

## 🚀 Quick Start para Tu Proyecto

```bash
# 1. Instalar herramientas
npm install -g yo generator-code @vscode/vsce

# 2. Generar extensión
yo code
# Selecciona: TypeScript Extension
# Nombre: uml-language-support

# 3. Agregar dependencias
cd uml-language-support
npm install vscode-languageclient web-tree-sitter

# 4. Copiar ejemplos del skill
# - package.json contributions
# - extension.ts
# - diagnostics.ts
# - completion.ts
# - preview.ts

# 5. Testear
npm run compile
F5  # Abre Extension Development Host

# 6. Publicar
vsce package
vsce publish
```

## ⚡ Tips de Productividad

1. **Usa el Extension Development Host** (F5) constantemente
2. **Hot reload** con `npm run watch`
3. **Output Channel** para debugging
4. **Extension Bisect** para encontrar conflictos
5. **Performance Profiler** para optimizar

## 🤝 Contribuciones

Si mejoras este skill:
- Agrega nuevos evals relevantes
- Documenta patterns adicionales
- Comparte ejemplos reales

## 📄 Licencia

Código abierto - úsalo libremente para tus proyectos.

---

**Creado para acelerar el desarrollo de extensiones VSCode con IA** 🚀

¿Listo para construir tu extensión? ¡Lee el SKILL.md y empieza a crear!
