# Guía de Actualización: Soporte de Documentación en TS-UML

Esta guía detalla los cambios necesarios en la biblioteca `TS-UML` para capturar comentarios de documentación (`/** ... */`) y habilitar hovers enriquecidos en la extensión de VS Code.

## 1. Definir el nuevo tipo de Token
**Archivo:** `src/token.ts`

Añade `DOC_COMMENT` al enum `TokenType`:
```typescript
export enum TokenType {
  // ... anteriores tokens
  COMMENT = 'COMMENT',         // //
  DOC_COMMENT = 'DOC_COMMENT', // /** ... */
  DOT = 'DOT',                 // .
  // ... restos de tokens
}
```

## 2. Actualizar la regla de Comentarios
**Archivo:** `src/lexer/comment.rule.ts`

Modifica el método `match` para detectar bloques JSDoc:
```typescript
match(input: string): TokenMatch | null {
  // Detectar comentarios de bloque JSDoc
  const blockResult = input.match(/^\/\*\*[\s\S]*?\*\//);
  if (blockResult) {
    return { type: TokenType.DOC_COMMENT, value: blockResult[0], size: blockResult[0].length };
  }

  // Comentarios de línea normales
  const result = input.match(/^\/\/.*/);
  if (!result) return null;

  return { type: TokenType.COMMENT, value: result[0], size: result[0].length };
}
```

## 3. Permitir que el Lexer emita el token de doc
**Archivo:** `src/lexer/lexer.ts`

En `processMatch`, asegúrate de que `DOC_COMMENT` **no** se ignore:
```typescript
private processMatch(match: TokenMatch): Token | null {
  // Solo se saltan espacios y comentarios de línea normales
  const skip = [TokenType.WHITESPACE, TokenType.COMMENT].includes(match.type);
  const token = !skip
    ? { type: match.type, value: match.value, line: this.line }
    : null;

  this.updateState(match.value, match.size);
  return token;
}
```

## 4. Añadir el campo al AST
**Archivo:** `src/parsers/types.ts`

Añade `documentation` a la interfaz base `ASTNode`:
```typescript
export interface ASTNode {
  type: string;
  fqn?: string;
  documentation?: string; // Nuevo campo opcional
}
```

## 5. Capturar la documentación en el Parser
**Archivo:** `src/parsers/parser.ts`

Actualiza el método `parseNext` para recoger el último JSDoc visto:
```typescript
public parseNext(): ASTNode | null {
  let lastDocComment: string | undefined;

  // Consumir comentarios y capturar el último JSDoc
  while (!this.isAtEnd() && (this.peek().type === TokenType.DOC_COMMENT || this.peek().type === TokenType.COMMENT)) {
    const t = this.consume();
    if (t.type === TokenType.DOC_COMMENT) {
      lastDocComment = t.value;
    }
  }

  if (this.isAtEnd()) return null;
  let token = this.peek();

  // ... (lógica de abstract e IDENTIFIER existente)

  if (token.type === TokenType.ENTITY) {
    const subParser = this.entityParsers.get(token.value);
    if (subParser) {
      const node = subParser.parse(this, isAbstract);
      if (node && lastDocComment) {
        node.documentation = lastDocComment; // Asignar documentación encontrada
      }
      return node;
    }
  }
  
  // Repetir la asignación de 'node.documentation = lastDocComment' 
  // en los retornos de Relaciones si se desea soporte para ellas.

  // ... (resto del método)
}
```

---
**Nota:** Una vez aplicados estos cambios, recuerda ejecutar `npm run build` en la biblioteca para que la extensión pueda consumir la nueva estructura.
