# Advanced Patterns Catalog

## Relationship Handling in ASTs
Instead of storing full objects, use IDs and a central registry to avoid circular dependencies in JSON outputs.

## Visitor with Return Types
```typescript
interface NodeVisitor<T> {
  visit(node: ASTNode): T;
}
```

## Discriminated Unions for Node Types
```typescript
type ASTNode = ClassNode | MethodNode | PropertyNode;

interface ClassNode {
  kind: 'class';
  // ...
}
```
