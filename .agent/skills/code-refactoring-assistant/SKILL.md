---
name: code-refactoring-assistant
description: Expert guidance for refactoring TypeScript/JavaScript code, designing robust patterns for DSLs, and optimizing grammar performance. Use when improving code maintainability, applying design patterns (Visitor, Interpreter), removing left-recursion, or enhancing type safety in complex systems.
---

# Code Refactoring & DSL Optimization Assistant

A comprehensive guide for developers working with domain-specific languages and large-scale TypeScript/JavaScript applications.

## When to Use This Skill

Use this skill when the user wants to:

- Refactor TypeScript/JavaScript code for better maintainability (SOLID, DRY).
- Apply advanced design patterns to DSL implementations (Visitor, Interpreter, Factory).
- Optimize grammar performance (remove left-recursion, handle precedence).
- Improve type safety in Abstract Syntax Trees (ASTs).
- Transition from anemic models to rich domain entities.

## Design Patterns for DSLs

### 1. The Visitor Pattern
Perfect for decoupling AST structure from the operations performed on it (rendering, validation, code generation).

```typescript
interface ASTNode {
  accept(visitor: ASTVisitor): void;
}

interface ASTVisitor {
  visitClass(node: ClassNode): void;
  visitRelationship(node: RelationshipNode): void;
}
```

### 2. The Interpreter Pattern
Useful for simple DSLs where each node knows how to evaluate itself.

### 3. Builder Pattern for ASTs
Simplifies the construction of complex ASTs during the parsing phase.

## Grammar Optimization

### 1. Eliminating Left Recursion
Essential for top-down parsers (LL).
- **Direct**: `A -> Aα | β` becomes `A -> βA'`, `A' -> αA' | ε`.
- **Indirect**: Use repetition `A -> β (α)*` where possible.

### 2. Precedence and Associativity
Handle operator precedence by nesting rules:
`Expression -> Addition -> Multiplication -> Primary`.

### 3. Error Recovery
Implement "synchronization points" (like semicolons or closing braces) to allow the parser to continue after finding an error.

## TypeScript/JavaScript Refactoring

### 1. From Anemic to Rich Models
Encapsulate logic within entities instead of using plain interfaces.

### 2. Improving Type Safety
- Use `unknown` over `any`.
- Discriminated Unions for AST nodes.
- Type Guards for safe narrowing.

### 3. SOLID Principles in TS
- **Single Responsibility**: Decouple lexer, parser, and generator.
- **Dependency Inversion**: Use interfaces to depend on abstractions.

## Performance Tips
- Use lazy evaluation for expensive AST properties.
- Implement incremental parsing for IDE responsiveness.
- Optimize regex in lexers to avoid backtracking.
