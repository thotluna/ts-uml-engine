import type {
  ProgramNode,
  PackageNode,
  EntityNode,
  RelationshipNode,
  CommentNode
} from '../parser/ast/nodes';
import { ASTNodeType } from '../parser/ast/nodes';
import type { ASTVisitor } from '../parser/ast/visitor';
import { walkAST } from '../parser/ast/visitor';
import type {
  IRDiagram,
  IREntity,
  IRRelationship,
  IRMember
} from '../generator/ir/models';
import {
  IREntityType,
  IRRelationshipType,
  IRVisibility
} from '../generator/ir/models';
import { SymbolTable } from './symbol-table';

/**
 * Analizador Semántico que transforma el AST en una IR resuelta.
 * Implementa la lógica de "Dos Pasadas".
 */
export class SemanticAnalyzer {
  private symbolTable = new SymbolTable();
  private relationships: IRRelationship[] = [];
  private currentNamespace: string[] = [];

  /**
   * Ejecuta el análisis semántico completo.
   */
  public analyze(program: ProgramNode): IRDiagram {
    // Paso 1: Recolectar todas las declaraciones explícitas
    const declVisitor = new DeclarationVisitor(this.symbolTable, this.currentNamespace);
    walkAST(program, declVisitor);

    // Paso 2: Procesar relaciones y crear entidades implícitas
    this.currentNamespace = []; // Reset namespace para la segunda pasada
    const relVisitor = new RelationshipVisitor(this.symbolTable, this.relationships, this.currentNamespace);
    walkAST(program, relVisitor);

    // Paso 3: Inferencia Automática (Basado en tipos de miembros)
    this.inferRelationships();

    return {
      entities: this.symbolTable.getAllEntities(),
      relationships: this.relationships
    };
  }

  /**
   * Recorre todos los miembros de todas las entidades y crea relaciones implícitas
   * si el tipo de un miembro coincide con otra entidad conocida.
   */
  private inferRelationships(): void {
    const entities = this.symbolTable.getAllEntities();

    entities.forEach(entity => {
      entity.members.forEach(member => {
        const isMethod = Array.isArray(member.parameters);

        // 1. Inferir del tipo del atributo o retorno del método
        if (member.type) {
          // ESPECIFICACIÓN v0.8: Las relaciones in-line DEBEN tener un operador explícito
          if (member.relationshipKind) {
            const relType = mapRelationshipType(member.relationshipKind);
            this.inferFromType(entity.id, member.type, entity.namespace, member.name, relType, member.multiplicity);
          }
          // Si es un método, el tipo de retorno NO genera relación automática a menos que se use un operador (opcional en futuro)
          // por ahora mantenemos la pureza: Sin operador = Atributo/Método local.
        }

        // 2. Inferir de los parámetros del método (Solo si tienen operador explícito v0.8.2)
        if (member.parameters) {
          member.parameters.forEach(param => {
            if (param.relationshipKind) {
              const relType = mapRelationshipType(param.relationshipKind);
              this.inferFromType(entity.id, param.type, entity.namespace, param.name, relType);
            }
          });
        }
      });
    });
  }

  private inferFromType(
    fromFQN: string,
    typeName: string,
    fromNamespace?: string,
    label?: string,
    relType: IRRelationshipType = IRRelationshipType.ASSOCIATION,
    multiplicity?: string
  ): void {
    // Ignorar tipos primitivos comunes para no ensuciar innecesariamente
    const primitives = [
      'string', 'number', 'boolean', 'void', 'any', 'unknown', 'never', 'object',
      'cadena', 'fecha', 'entero', 'booleano', 'int', 'float', 'double', 'char',
      'horadía', 'date', 'time', 'datetime'
    ];
    if (primitives.includes(typeName.toLowerCase())) return;

    // Quitar marcas de array si las hay (ej: User[] -> User)
    const baseType = typeName.replace(/[\[\]]/g, '');

    const toFQN = this.symbolTable.resolveFQN(baseType, fromNamespace);

    // Solo creamos la relación si la entidad existe o es algo que vale la pena rastrear (no es primitivo)
    // Y verificamos que no exista ya una relación directa entre estas dos entidades
    if (this.shouldCreateInferredRel(fromFQN, toFQN, relType)) {
      this.relationships.push({
        from: fromFQN,
        to: toFQN,
        type: relType,
        label: label || '',
        toMultiplicity: multiplicity
      });
    }
  }

  private shouldCreateInferredRel(from: string, to: string, type: IRRelationshipType): boolean {
    // Evitar duplicados exactos del mismo tipo
    const exactMatch = this.relationships.some(rel => rel.from === from && rel.to === to && rel.type === type);
    if (exactMatch) return false;

    // Regla de Precedencia:
    // Si la nueva relación es de Dependencia (Uso) pero ya existe una relación estructural
    // más fuerte (Asociación, Composición, etc.), no creamos la de dependencia.
    if (type === IRRelationshipType.DEPENDENCY) {
      const strongerExists = this.relationships.some(rel =>
        rel.from === from &&
        rel.to === to &&
        rel.type !== IRRelationshipType.DEPENDENCY
      );
      if (strongerExists) return false;
    }

    return true;
  }
}

/**
 * Visitante para la primera pasada: Registro de entidades explícitas.
 */
class DeclarationVisitor implements ASTVisitor {
  constructor(
    private symbolTable: SymbolTable,
    private currentNamespace: string[]
  ) { }

  visitProgram(node: ProgramNode): void {
    node.body.forEach(stmt => walkAST(stmt, this));
  }

  visitPackage(node: PackageNode): void {
    this.currentNamespace.push(node.name);
    node.body.forEach(stmt => walkAST(stmt, this));
    this.currentNamespace.pop();
  }

  visitEntity(node: EntityNode): void {
    const namespace = this.currentNamespace.join('.');
    const fqn = namespace ? `${namespace}.${node.name}` : node.name;

    const entity: IREntity = {
      id: fqn,
      name: node.name,
      type: this.mapEntityType(node.type),
      members: this.mapMembers(node.body || []),
      isImplicit: false,
      isAbstract: (node.type === ASTNodeType.CLASS) && (node as any).isAbstract === true
    };

    if (namespace) {
      entity.namespace = namespace;
    }

    this.symbolTable.register(entity);
  }

  visitRelationship(node: RelationshipNode): void {
    // En la primera pasada ignoramos las relaciones standalone
  }

  visitComment(node: CommentNode): void {
    // Ignoramos comentarios
  }

  private mapEntityType(type: ASTNodeType): IREntityType {
    switch (type) {
      case ASTNodeType.INTERFACE: return IREntityType.INTERFACE;
      case ASTNodeType.ENUM: return IREntityType.ENUM;
      default: return IREntityType.CLASS;
    }
  }

  private mapMembers(members: any[]): IRMember[] {
    return members
      .filter(m => m.type !== ASTNodeType.COMMENT)
      .map(m => ({
        name: m.name,
        type: m.typeAnnotation || m.returnType,
        visibility: this.mapVisibility(m.visibility),
        isStatic: m.isStatic || false,
        isAbstract: m.isAbstract || false,
        parameters: m.parameters?.map((p: any) => ({
          name: p.name,
          type: p.typeAnnotation,
          relationshipKind: p.relationshipKind
        })),
        relationshipKind: m.relationshipKind,
        multiplicity: m.multiplicity
      }));
  }

  private mapVisibility(v: string): IRVisibility {
    switch (v) {
      case '-': return IRVisibility.PRIVATE;
      case '#': return IRVisibility.PROTECTED;
      case '~': return IRVisibility.INTERNAL;
      default: return IRVisibility.PUBLIC;
    }
  }
}

/**
 * Visitante para la segunda pasada: Resolución de relaciones e implicidades.
 */
class RelationshipVisitor implements ASTVisitor {
  constructor(
    private symbolTable: SymbolTable,
    private relationships: IRRelationship[],
    private currentNamespace: string[]
  ) { }

  visitProgram(node: ProgramNode): void {
    node.body.forEach(stmt => walkAST(stmt, this));
  }

  visitPackage(node: PackageNode): void {
    this.currentNamespace.push(node.name);
    node.body.forEach(stmt => walkAST(stmt, this));
    this.currentNamespace.pop();
  }

  visitEntity(node: EntityNode): void {
    const namespace = this.currentNamespace.join('.');
    const fromFQN = this.symbolTable.resolveFQN(node.name, namespace);

    // Procesar headers (class A >> B)
    node.relationships.forEach(rel => {
      const toFQN = this.resolveOrRegisterImplicit(rel.target, namespace);
      this.addRelationship(fromFQN, toFQN, rel.kind);
    });
  }

  visitRelationship(node: RelationshipNode): void {
    const namespace = this.currentNamespace.join('.');
    const fromFQN = this.resolveOrRegisterImplicit(node.from, namespace);
    const toFQN = this.resolveOrRegisterImplicit(node.to, namespace);

    const irRel: IRRelationship = {
      from: fromFQN,
      to: toFQN,
      type: mapRelationshipType(node.kind)
    };

    if (node.fromMultiplicity) irRel.fromMultiplicity = node.fromMultiplicity;
    if (node.toMultiplicity) irRel.toMultiplicity = node.toMultiplicity;
    if (node.label) irRel.label = node.label;

    this.relationships.push(irRel);
  }

  visitComment(node: CommentNode): void { }

  private resolveOrRegisterImplicit(name: string, namespace: string): string {
    const fqn = this.symbolTable.resolveFQN(name, namespace);

    if (!this.symbolTable.has(fqn)) {
      const entity: IREntity = {
        id: fqn,
        name: name,
        type: IREntityType.CLASS,
        members: [],
        isImplicit: true,
        isAbstract: false
      };

      if (fqn.includes('.')) {
        entity.namespace = fqn.substring(0, fqn.lastIndexOf('.'));
      }

      this.symbolTable.register(entity);
    }

    return fqn;
  }

  private addRelationship(from: string, to: string, kind: string): void {
    this.relationships.push({
      from,
      to,
      type: mapRelationshipType(kind)
    });
  }
}

/**
 * Mapea el operador de relación del DSL a un tipo de la IR.
 * Centralizado para uso en el SemanticAnalyzer y Visitors.
 */
function mapRelationshipType(kind: string): IRRelationshipType {
  const k = kind.trim();
  if (k === '>>' || k === '>extends') return IRRelationshipType.INHERITANCE;
  if (k === '>I' || k === '>implements') return IRRelationshipType.IMPLEMENTATION;
  if (k === '>*' || k === '>comp') return IRRelationshipType.COMPOSITION;
  if (k === '>+' || k === '>agreg') return IRRelationshipType.AGGREGATION;
  if (k === '>-' || k === '>use') return IRRelationshipType.DEPENDENCY;

  // Fallback por prefijos
  if (k.startsWith('>>')) return IRRelationshipType.INHERITANCE;
  if (k.startsWith('>I')) return IRRelationshipType.IMPLEMENTATION;
  if (k.startsWith('>*')) return IRRelationshipType.COMPOSITION;
  if (k.startsWith('>+')) return IRRelationshipType.AGGREGATION;
  if (k.startsWith('>-')) return IRRelationshipType.DEPENDENCY;

  // El operador > solo se permite para enums o como fallback si no hay símbolo, 
  // pero el usuario lo considera ambiguo para clases.
  return IRRelationshipType.ASSOCIATION;
}
