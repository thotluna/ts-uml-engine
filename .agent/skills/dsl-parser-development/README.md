# DSL Design & Parser Development Skill

Un skill completo para Claude que proporciona experiencia experta en diseño de lenguajes específicos de dominio (DSLs) e implementación de parsers.

## 🎯 Propósito

Este skill ayuda a desarrolladores a:
- Diseñar sintaxis clara y expresiva para DSLs
- Escribir gramáticas formales (EBNF, BNF, PEG)
- Implementar parsers robustos con diferentes tecnologías
- Crear Abstract Syntax Trees (ASTs) bien estructurados
- Implementar validación semántica
- Manejar errores de forma clara y útil
- Optimizar el rendimiento del parser
- Integrar con herramientas de desarrollo (VSCode, etc.)

## 🚀 Casos de Uso

### Diseño de DSL para UML
```
Usuario: "Necesito diseñar la sintaxis de un DSL para diagramas UML"
Claude: [Propone múltiples opciones de sintaxis, gramática EBNF, considera audiencia]
```

### Resolución de Problemas de Parsing
```
Usuario: "Mi gramática es ambigua en ANTLR"
Claude: [Identifica problema, explica precedencia, proporciona solución]
```

### Implementación de Features
```
Usuario: "¿Cómo implemento error recovery en Tree-sitter?"
Claude: [Código concreto, estrategias, ejemplos prácticos]
```

### Optimización de Performance
```
Usuario: "Mi parser es lento con archivos grandes"
Claude: [Analiza causas, sugiere parsing incremental, memoización]
```

## 📋 Contenido del Skill

### Principios de Diseño
- Diseño centrado en el usuario
- Consistencia y predictibilidad
- Legibilidad primero
- Prevención y recuperación de errores

### Proceso de Diseño de Gramática
1. Definir conceptos del dominio
2. Diseñar sintaxis concreta
3. Escribir gramática formal
4. Considerar estructura léxica

### Tecnologías de Parsing
- **Tree-sitter**: Ideal para extensiones de VSCode
- **ANTLR4**: Para gramáticas complejas
- **PEG.js/Peggy**: Para proyectos JavaScript/TypeScript
- **Parsers recursivos**: Para aprender o casos simples

### Mejores Prácticas
- Diseño de AST con tipos y ubicaciones
- Análisis semántico con symbol tables
- Manejo de errores con mensajes claros
- Estrategias de optimización

### Testing
- Tests unitarios de reglas gramaticales
- Tests de integración con ejemplos reales
- Tests de recuperación de errores

## 🧪 Evaluaciones (Evals)

El skill incluye 6 evaluaciones que cubren:

1. **eval-0**: Diseño de gramática EBNF para DSL de UML
2. **eval-1**: Implementación de error recovery en Tree-sitter
3. **eval-2**: Resolución de ambigüedad y precedencia de operadores
4. **eval-3**: Diseño de AST estructurado con source locations
5. **eval-4**: Comparación de parser generators para VSCode
6. **eval-5**: Optimización de performance en parsers PEG

## 📦 Estructura del Skill

```
dsl-parser-skill/
├── SKILL.md              # Skill principal (guía completa)
├── README.md             # Este archivo
└── evals/
    ├── evals.json        # Casos de prueba
    └── files/            # Archivos de ejemplo (si necesarios)
```

## 🎓 Para Qué Proyectos es Útil

- ✅ Creación de DSLs para cualquier dominio
- ✅ Extensiones de VSCode con soporte de lenguajes
- ✅ Herramientas de análisis de código
- ✅ Compiladores e intérpretes
- ✅ Generadores de código
- ✅ Herramientas de configuración avanzadas
- ✅ Language Server Protocol (LSP) implementations

## 🔧 Cómo Usar Este Skill

### Opción 1: Usar con Claude en claude.ai

1. Sube el archivo `SKILL.md` a tu conversación
2. Pide a Claude que lo lea: "Lee este skill sobre DSL design"
3. Haz tus preguntas sobre diseño de DSL o parsers

### Opción 2: Integrar en tus propios proyectos

1. Copia el contenido del `SKILL.md`
2. Úsalo como parte de tus prompts al trabajar con LLMs
3. Referencia secciones específicas según necesites

### Opción 3: Ejecutar Evaluaciones

Si tienes acceso al skill-creator:
```
"Ejecuta las evaluaciones del skill dsl-parser-development"
```

## 💡 Ejemplos de Preguntas que el Skill Maneja Bien

- "Diseña una sintaxis para un DSL de [dominio específico]"
- "¿Cómo resuelvo esta ambigüedad en mi gramática?"
- "Compara ANTLR vs Tree-sitter para mi caso de uso"
- "Diseña el AST para mi lenguaje"
- "¿Cómo implemento validación semántica?"
- "Mi parser es lento, ¿cómo lo optimizo?"
- "¿Qué mensajes de error son más útiles?"
- "¿Cómo hago que el parser se recupere de errores?"

## 🎯 Tu Proyecto: DSL para UML

Este skill fue creado específicamente pensando en tu proyecto de DSL para diagramas UML con extensión de VSCode. Cubre todos los aspectos necesarios:

1. **Diseño de sintaxis** para clases, relaciones, atributos
2. **Gramáticas formales** para documentar y comunicar
3. **Tree-sitter** como tecnología recomendada para VSCode
4. **AST design** para procesar y generar diagramas
5. **Error handling** para buena experiencia de usuario
6. **Integración con VSCode** para LSP, syntax highlighting, etc.

## 📚 Próximos Skills Recomendados

Después de tener este skill funcionando, considera crear:
- **VSCode Extension Development**: Para la integración completa con el editor
- **UML Diagram Generation**: Para convertir el AST en diagramas visuales
- **Testing & Quality Assurance**: Para probar tu DSL y extensión

## 🤝 Contribuciones

Si mejoras este skill o encuentras casos de uso adicionales:
1. Agrega nuevos evals en `evals/evals.json`
2. Documenta patrones útiles en el `SKILL.md`
3. Comparte ejemplos de código en `evals/files/`

## 📄 Licencia

Este skill es de código abierto. Úsalo, modifícalo y compártelo libremente para tus proyectos.

---

**Creado para facilitar el desarrollo de DSLs con ayuda de IA generativa** 🚀
