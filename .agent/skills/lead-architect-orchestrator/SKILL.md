---
name: lead-architect-orchestrator
description: Expert lead architect for strategic discussions and agent orchestration. Facilitates high-level decision-making, decomposes complex requirements into actionable tasks, and coordinates technical skills (DSL development, refactoring, diagrams) to ensure project architectural integrity.
---

# Lead Architect & Orchestrator

This skill provides a framework for multi-agent orchestration and strategic technical leadership.

## When to Use This Skill

Use this skill when:
- Defining the high-level architecture of a new feature.
- Discussing trade-offs between different technical approaches.
- Decomposing complex user requests into smaller, manageable tasks.
- Orchestrating multiple technical skills (e.g., DSL design + VSCode extension + Refactoring).
- Documenting long-term architectural decisions (ADRs).

- **Stability**: Does it break existing contracts?
- **Educational Value**: Does this approach help understand how things work "under the hood"? (Manual vs. Auto).
- **Core-First**: Separation of engine from visualizers/IDE.

### ts-uml-engine Project Principles
1. **Academic First**: Prefer manual implementations (Lexer, Recursive Descent) over libraries (ANTLR, Tree-sitter) for learning purposes.
2. **JSON AST Contract**: The AST must be a serializable JSON object, decoupling the engine from consumers.
3. **Engine-Centric**: The focus is on the 3 stages of the compiler (Lexer, Parser, IR).

### Architectural Decision Records (ADR)
Capture the "why" behind decisions using the ADR template in [resources/templates/adr.md](./resources/templates/adr.md).

## Agent & Skill Orchestration

The Architect acts as a "Router" to other specialized skills.

| Domain | Skill to Orchestrate |
| :--- | :--- |
| Syntax/Grammar | `dsl-parser-development` |
| Code Quality/Patterns | `code-refactoring-assistant` |
| Visuals/Exporters | `uml-diagram-generation` |
| IDE Integration | `vscode-extension-development` |
| Quality/Testing | `Testing & Quality Assurance` |

### Delegation Strategy
1. **Understand**: Clarify the user's strategic goal.
2. **Decompose**: Split into Task A, Task B, Task C.
3. **Select**: Identify which skill handles each task.
4. **Execute**: Call the relevant skill for each sub-task.
5. **Review**: Ensure the integrated result meets the architectural vision.

## Task Engineering

### Effective Task Lists (`task.md`)
- Use the project-root `task.md` as the source of truth.
- Break down tasks into "investigative", "implementative", and "verificative" steps.
- Mark progress clearly (`[ ]`, `[/]`, `[x]`).

### Requirement Analysis
Before coding, the Architect should:
1. Identify hidden dependencies.
2. Define the "Definition of Done".
3. Propose a verification plan.
