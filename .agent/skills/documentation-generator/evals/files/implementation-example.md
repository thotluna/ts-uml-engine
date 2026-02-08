# Referencia de API: Clase `UMLAnalyzer`

Clase encargada de procesar el AST generado por Tree-sitter y extraer métricas de calidad.

## Métodos

### `analyze(tree: Tree): AnalysisResult`
Analiza un árbol sintáctico completo.

**Parámetros:**
| Nombre | Tipo | Descripción |
| :--- | :--- | :--- |
| `tree` | `Tree` | El árbol generado por el parser de UML. |

**Retorno:**
- `AnalysisResult`: Objeto que contiene el conteo de clases, relaciones y posibles dependencias circulares.

**Ejemplo:**
```typescript
const analyzer = new UMLAnalyzer();
const metrics = analyzer.analyze(myTree);
console.log(`Clases detectadas: ${metrics.classCount}`);