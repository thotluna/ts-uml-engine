# Proyecto: ts-uml-engine (Core)

> [!NOTE]
> Proyecto de carácter académico enfocado en el aprendizaje de compiladores y DSLs.
> Este repositorio contendrá las 3 etapas del compilador (Lexer, Parser, Generator/Intermediate Rep).
> Servirá como motor para una futura extensión de VS Code y un Playground Web.

## Roadmap de Implementación

### Fase 0: Pre-requisitos y Alineación (DOCUMENTACIÓN)
- [x] Análisis de la especificación técnica (UMLTS v0.8)
- [x] Definición de la arquitectura del compilador (Lexer -> Parser -> Mapper/Generator)
- [x] Definición del contrato de salida del AST (Esquema JSON)
- [x] Documentación de la gramática formal (EBNF-like)
- [x] Definición de estrategia de Git y Convención de Commits

### Fase 1: Entorno y Lexer (Análisis Léxico)
- [x] Configuración de entorno (TS, pnpm, vitest, nodemon)
- [x] Definición de Tokens (Keywords, Symbols, Identifiers)
- [x] Refactorización del Lexer (Principio Open-Closed / Matchers)
- [x] Implementación del Lexer (Lógica base)
- [x] Validación de tokens y manejo de errores léxicos (Tests passing)
- [x] PR creada y lista para merge [#1](https://github.com/thotluna/ts-uml-engine/pull/1)

### Fase 2: Parser (Análisis Sintáctico)
- [/] Definición de la Gramática (EBNF/Formal)
- [/] Implementación de Nodos del AST (Interfaces)
- [ ] Implementación del Recursive Descent Parser
- [ ] Manejo de errores sintácticos y recuperación
- [ ] Validación con casos de prueba complejos

### Fase 3: Generator / Intermediate Representation
- [ ] Mapeo de AST a estructura de datos de Diagrama
- [ ] Implementación del generador de Mermaid (como primera salida)
- [ ] Exportación de esquema para integraciones externas
