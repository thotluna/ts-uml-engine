---
name: testing-and-quality-assurance
description: Experto en estrategias de pruebas automatizadas, QA y observabilidad. Cubre desde Unit Testing y E2E hasta pruebas específicas para extensiones de VSCode y sistemas distribuidos.
---

# Testing & Quality Assurance Skill

Este skill proporciona metodologías y patrones de implementación para asegurar la robustez del software, con un enfoque especial en el ecosistema de TypeScript/Node.js y extensiones de VSCode.

## Áreas de Dominio

### 1. Niveles de Prueba
- **Unit Testing:** Pruebas atómicas de funciones y clases.
- **Integration Testing:** Validación de contratos entre módulos y servicios externos.
- **E2E (End-to-End):** Flujos de usuario completos (Playwright, Puppeteer).
- **Extension Testing:** Pruebas específicas en el Extension Development Host de VSCode.

### 2. Metodologías
- **TDD (Test Driven Development):** Red-Green-Refactor.
- **BDD (Behavior Driven Development):** Gherkin y especificaciones de comportamiento.
- **Snapshot Testing:** Validación de salidas visuales o estructuras de datos (AST, JSON).

### 3. Herramientas Recomendadas
- **Test Runners:** Vitest (recomendado por velocidad), Jest, Mocha.
- **Assertion Libraries:** Chai, Expect.
- **Mocks/Spies:** Sinon, vi (Vitest), Testdouble.

## Patrones de Diseño para Testeabilidad

- **Inyección de Dependencias:** Crucial para sustituir servicios reales por Mocks.
- **Pure Functions:** Facilitan las pruebas unitarias al no tener efectos secundarios.
- **Data Builders:** Patrón para crear objetos de prueba complejos de forma legible.

## Pruebas de Extensiones VSCode (Especialidad)

Para probar extensiones, el skill utiliza `@vscode/test-electron` para levantar una instancia real de VSCode y ejecutar tests sobre ella.

```typescript
// Patrón de activación en tests
async function activateExtension() {
    const ext = vscode.extensions.getExtension('publisher.id');
    await ext?.activate();
    return ext;
}