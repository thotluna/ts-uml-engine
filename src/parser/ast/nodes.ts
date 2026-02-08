export enum ASTNodeType {
  PROGRAM = 'Program',
  PACKAGE = 'Package',
  CLASS = 'Class',
  INTERFACE = 'Interface',
  ENUM = 'Enum',
  METHOD = 'Method',
  ATTRIBUTE = 'Attribute',
  PARAMETER = 'Parameter',
  RELATIONSHIP = 'Relationship',
  COMMENT = 'Comment'
}

export interface ASTNode {
  type: ASTNodeType;
  line: number;
  column: number;
}

export interface ProgramNode extends ASTNode {
  type: ASTNodeType.PROGRAM;
  body: StatementNode[];
  diagnostics?: import('../diagnostic.types').Diagnostic[];
}

export type StatementNode =
  | PackageNode
  | EntityNode
  | RelationshipNode
  | CommentNode;

export interface PackageNode extends ASTNode {
  type: ASTNodeType.PACKAGE;
  name: string;
  body: StatementNode[];
}

export type EntityType = ASTNodeType.CLASS | ASTNodeType.INTERFACE | ASTNodeType.ENUM;

export interface EntityNode extends ASTNode {
  type: EntityType;
  name: string;
  relationships: RelationshipHeaderNode[];
  body: MemberNode[] | undefined;
}

export interface RelationshipHeaderNode extends ASTNode {
  type: ASTNodeType.RELATIONSHIP;
  kind: string; // >>, >I, >*, etc.
  target: string;
}

export type MemberNode = MethodNode | AttributeNode | CommentNode;

export interface AttributeNode extends ASTNode {
  type: ASTNodeType.ATTRIBUTE;
  name: string;
  visibility: string;
  isStatic: boolean;
  typeAnnotation: string;
  multiplicity: string | undefined;
}

export interface MethodNode extends ASTNode {
  type: ASTNodeType.METHOD;
  name: string;
  visibility: string;
  isStatic: boolean;
  isAbstract: boolean;
  parameters: ParameterNode[];
  returnType: string | undefined;
}

export interface ParameterNode extends ASTNode {
  type: ASTNodeType.PARAMETER;
  name: string;
  typeAnnotation: string;
}

export interface RelationshipNode extends ASTNode {
  type: ASTNodeType.RELATIONSHIP;
  from: string;
  fromMultiplicity: string | undefined;
  to: string;
  toMultiplicity: string | undefined;
  kind: string;
}

export interface CommentNode extends ASTNode {
  type: ASTNodeType.COMMENT;
  value: string;
}
