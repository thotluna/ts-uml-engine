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

    return {
      entities: this.symbolTable.getAllEntities(),
      relationships: this.relationships
    };
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
      isImplicit: false
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
        parameters: m.parameters?.map((p: any) => ({ name: p.name, type: p.typeAnnotation }))
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
      type: this.mapRelationshipType(node.kind)
    };

    if (node.fromMultiplicity) irRel.fromMultiplicity = node.fromMultiplicity;
    if (node.toMultiplicity) irRel.toMultiplicity = node.toMultiplicity;

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
        isImplicit: true
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
      type: this.mapRelationshipType(kind)
    });
  }

  private mapRelationshipType(kind: string): IRRelationshipType {
    if (kind.includes('>>')) return IRRelationshipType.INHERITANCE;
    if (kind.includes('>I')) return IRRelationshipType.IMPLEMENTATION;
    if (kind.includes('>+')) return IRRelationshipType.COMPOSITION;
    if (kind.includes('>o')) return IRRelationshipType.AGGREGATION;
    if (kind.includes('>')) return IRRelationshipType.ASSOCIATION;
    return IRRelationshipType.DEPENDENCY;
  }
}
