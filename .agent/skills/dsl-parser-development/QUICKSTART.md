# Guía Rápida de Inicio - DSL Parser Development Skill

## 🚀 Inicio Rápido

### Paso 1: Familiarízate con el Skill

Lee primero estos archivos en orden:
1. `README.md` - Visión general del skill
2. `SKILL.md` - Contenido completo del skill (es el más importante)
3. `evals/example-grammars.md` - Ejemplos prácticos

### Paso 2: Úsalo con Claude

#### Opción A: En una conversación de Claude

```
Tú: "Lee el archivo SKILL.md que acabo de subir"
Claude: [Lee el skill]

Tú: "Necesito diseñar la sintaxis para mi DSL de UML..."
Claude: [Responde usando el conocimiento del skill]
```

#### Opción B: Como referencia en tu proyecto

Copia secciones relevantes del `SKILL.md` en tus prompts cuando trabajes con IA en tu proyecto.

### Paso 3: Aplícalo a Tu Proyecto de UML DSL

## 🎯 Roadmap para Tu Proyecto UML

### Fase 1: Diseño (Semana 1)
- [ ] Definir conceptos del dominio UML que soportarás
- [ ] Diseñar sintaxis (usa el skill para evaluar opciones)
- [ ] Escribir gramática formal en EBNF
- [ ] Crear ejemplos de código en tu DSL
- [ ] Validar sintaxis con usuarios potenciales

**Pregunta a Claude (con el skill):**
> "Tengo estos conceptos UML: clases, interfaces, relaciones (asociación, herencia, composición, agregación), atributos, métodos con visibilidad. Mi audiencia son desarrolladores. Propón 2-3 opciones de sintaxis y recomienda la mejor con justificación."

### Fase 2: Implementación del Parser (Semana 2-3)
- [ ] Elegir tecnología: Tree-sitter (recomendado para VSCode)
- [ ] Instalar Tree-sitter CLI
- [ ] Crear proyecto Tree-sitter
- [ ] Implementar gramática (grammar.js)
- [ ] Generar parser
- [ ] Probar con ejemplos

**Pregunta a Claude:**
> "Muéstrame cómo crear un proyecto Tree-sitter desde cero para mi DSL de UML. Dame comandos exactos y estructura de archivos."

### Fase 3: AST y Validación (Semana 3-4)
- [ ] Diseñar estructura del AST en TypeScript
- [ ] Implementar visitor pattern
- [ ] Crear symbol table para validación
- [ ] Implementar validación semántica
- [ ] Escribir tests

**Pregunta a Claude:**
> "Basándome en la gramática que hemos diseñado, crea las interfaces TypeScript para mi AST. Incluye source locations y usa tipos bien definidos."

### Fase 4: Manejo de Errores (Semana 4)
- [ ] Implementar error recovery
- [ ] Diseñar mensajes de error útiles
- [ ] Agregar diagnósticos
- [ ] Testing de casos de error

**Pregunta a Claude:**
> "¿Cómo implemento error recovery en Tree-sitter para mi DSL? Dame ejemplos específicos de código y estrategias de sincronización."

### Fase 5: Extensión VSCode (Semana 5-6)
- [ ] Crear proyecto de extensión VSCode
- [ ] Integrar parser Tree-sitter
- [ ] Implementar syntax highlighting
- [ ] Agregar IntelliSense básico
- [ ] Implementar validación en tiempo real
- [ ] Publicar en modo dev

**Pregunta a Claude:**
> "Tengo mi parser Tree-sitter funcionando. ¿Cómo creo una extensión VSCode que use este parser? Muéstrame la estructura de archivos y configuración."

### Fase 6: Generación de Diagramas (Semana 6-8)
- [ ] Elegir librería de renderizado (PlantUML, Mermaid, D3, etc.)
- [ ] Implementar transformación AST → formato de diagrama
- [ ] Agregar preview en tiempo real
- [ ] Exportar a PNG/SVG/PDF

**Esto necesitará el siguiente skill:** "UML Diagram Generation" (crear después)

## 📚 Recursos de Referencia Rápida

### Comandos Tree-sitter

```bash
# Instalar Tree-sitter CLI
npm install -g tree-sitter-cli

# Crear nuevo proyecto
tree-sitter init

# Generar parser
tree-sitter generate

# Probar gramática
tree-sitter test

# Ver parse tree
tree-sitter parse ejemplo.uml
```

### Estructura de Proyecto Recomendada

```
tu-proyecto/
├── tree-sitter-uml/          # Parser Tree-sitter
│   ├── grammar.js
│   ├── src/
│   └── test/
│
├── vscode-extension/          # Extensión VSCode
│   ├── syntaxes/
│   ├── src/
│   └── package.json
│
├── diagram-generator/         # Generador de diagramas
│   ├── src/
│   └── templates/
│
└── examples/                  # Ejemplos de código UML
    └── *.uml
```

## 🧪 Probar el Skill con Evaluaciones

Si tienes acceso al skill-creator de Anthropic:

```
"Ejecuta el eval-0 del skill dsl-parser-development"
```

Esto probará si Claude puede diseñar gramáticas EBNF correctamente usando este skill.

## 💡 Tips de Uso

1. **Lee el SKILL.md completo al menos una vez** - Contiene toda la sabiduría condensada
2. **Usa las evaluaciones como ejemplos** - Muestran el tipo de preguntas que el skill maneja bien
3. **Itera tu diseño** - No intentes crear la gramática perfecta de una vez
4. **Empieza simple** - Implementa características básicas primero
5. **Testing continuo** - Prueba con ejemplos reales desde el día 1

## 🤝 Preguntas Frecuentes

### ¿Debo usar Tree-sitter o ANTLR?
**Tree-sitter** para extensión VSCode. ANTLR si necesitas múltiples lenguajes de salida.

### ¿Necesito saber teoría de compiladores?
No para empezar. El skill te guía. Pero ayuda entender conceptos básicos.

### ¿Cuánto tiempo toma crear un DSL completo?
- DSL simple: 1-2 semanas
- DSL medio (como UML): 4-8 semanas
- DSL complejo: 3-6 meses

### ¿Puedo combinar este skill con otros?
¡Sí! Combínalo con:
- VSCode Extension Development (para la extensión)
- Testing & QA (para pruebas)
- UML Diagram Generation (para renderizado)

## 🎓 Siguientes Pasos

1. ✅ **Lee SKILL.md** - Entender todo el contenido
2. ✅ **Define tu sintaxis** - Diseña 2-3 opciones
3. ✅ **Escribe gramática EBNF** - Documenta formalmente
4. ✅ **Implementa en Tree-sitter** - Crea grammar.js
5. ✅ **Prueba con ejemplos** - Valida que funciona
6. ✅ **Crea extensión VSCode** - Integra el parser
7. ✅ **Agrega validación** - Errores útiles
8. ✅ **Genera diagramas** - El objetivo final

## 📞 ¿Necesitas Ayuda?

Cuando uses Claude con este skill, sé específico:

❌ **Malo:** "Ayúdame con mi parser"
✅ **Bueno:** "Tengo esta gramática EBNF [pega código]. ANTLR dice que es ambigua en la línea X. ¿Cómo la arreglo manteniendo la precedencia de operadores?"

❌ **Malo:** "¿Qué herramienta uso?"
✅ **Bueno:** "Estoy haciendo una extensión VSCode para un DSL que parsea archivos de 1000+ líneas. Necesito syntax highlighting, autocompletado e incremental parsing. ¿Tree-sitter o ANTLR?"

---

**¡Buena suerte con tu DSL de UML!** 🎨🚀

Si tienes preguntas o mejoras para este skill, documéntalas para futuras versiones.
