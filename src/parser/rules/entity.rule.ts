import type { Token } from '../../lexer/token.types';
import { TokenType } from '../../lexer/token.types';
import type {
  EntityNode,
  MemberNode,
  RelationshipHeaderNode,
  AttributeNode,
  MethodNode,
  ParameterNode
} from '../ast/nodes';
import { ASTNodeType } from '../ast/nodes';
import type { ParserContext } from '../parser.context';
import type { StatementRule } from '../rule.types';

export class EntityRule implements StatementRule {
  public parse(context: ParserContext): EntityNode | null {
    if (!context.match(TokenType.KW_CLASS, TokenType.KW_INTERFACE, TokenType.KW_ENUM)) {
      return null;
    }

    const token = context.prev();
    let type: any = ASTNodeType.CLASS;
    if (token.type === TokenType.KW_INTERFACE) type = ASTNodeType.INTERFACE;
    if (token.type === TokenType.KW_ENUM) type = ASTNodeType.ENUM;

    const nameToken = context.consume(TokenType.IDENTIFIER, "Se esperaba el nombre de la entidad");

    // Parse relationship list in header
    const relationships: RelationshipHeaderNode[] = [];
    if (context.match(TokenType.OP_INHERIT, TokenType.OP_IMPLEMENT, TokenType.OP_COMP, TokenType.OP_AGREG, TokenType.OP_USE,
      TokenType.KW_EXTENDS, TokenType.KW_IMPLEMENTS, TokenType.KW_COMP, TokenType.KW_AGREG, TokenType.KW_USE)) {
      do {
        const kind = context.prev().value;
        const target = context.consume(TokenType.IDENTIFIER, "Se esperaba el nombre del objetivo de la relación").value;
        relationships.push({
          type: ASTNodeType.RELATIONSHIP,
          kind,
          target,
          line: context.prev().line,
          column: context.prev().column
        });
      } while (context.match(TokenType.COMMA) && context.match(TokenType.OP_INHERIT, TokenType.OP_IMPLEMENT, TokenType.OP_COMP, TokenType.OP_AGREG, TokenType.OP_USE,
        TokenType.KW_EXTENDS, TokenType.KW_IMPLEMENTS, TokenType.KW_COMP, TokenType.KW_AGREG, TokenType.KW_USE));
    }

    // Parse body members
    let body: MemberNode[] | undefined = undefined;
    if (context.match(TokenType.LBRACE)) {
      body = [];
      while (!context.check(TokenType.RBRACE) && !context.isAtEnd()) {
        const member = this.parseMember(context);
        if (member) body.push(member);
      }
      context.consume(TokenType.RBRACE, "Se esperaba '}'");
    }

    return {
      type,
      name: nameToken.value,
      relationships,
      body,
      line: token.line,
      column: token.column
    };
  }

  private parseMember(context: ParserContext): MemberNode | null {
    if (context.check(TokenType.COMMENT)) {
      const token = context.consume(TokenType.COMMENT, "");
      return {
        type: ASTNodeType.COMMENT,
        value: token.value,
        line: token.line,
        column: token.column
      };
    }

    // Visibilidad opcional
    let visibility = 'public';
    if (context.match(TokenType.VIS_PUB, TokenType.VIS_PRIV, TokenType.VIS_PROT, TokenType.VIS_PACK)) {
      visibility = context.prev().value;
    } else if (context.match(TokenType.KW_PUBLIC, TokenType.KW_PRIVATE, TokenType.KW_PROTECTED, TokenType.KW_INTERNAL)) {
      visibility = context.prev().value;
    }

    const isStatic = context.match(TokenType.KW_STATIC);
    const isAbstract = context.match(TokenType.KW_ABSTRACT);

    const nameToken = context.consume(TokenType.IDENTIFIER, "Se esperaba el nombre del miembro");

    if (context.check(TokenType.LPAREN)) {
      return this.parseMethod(context, nameToken, visibility, isStatic, isAbstract);
    } else {
      return this.parseAttribute(context, nameToken, visibility, isStatic);
    }
  }

  private parseAttribute(context: ParserContext, name: Token, visibility: string, isStatic: boolean): AttributeNode {
    context.consume(TokenType.COLON, "Se esperaba ':' después del nombre del atributo");

    const typeToken = context.consume(TokenType.IDENTIFIER, "Se esperaba el tipo del atributo");
    let multiplicity: string | undefined = undefined;

    if (context.match(TokenType.LBRACKET)) {
      multiplicity = '[';
      while (!context.check(TokenType.RBRACKET) && !context.isAtEnd()) {
        multiplicity += context.advance().value;
      }
      multiplicity += context.consume(TokenType.RBRACKET, "Se esperaba ']'").value;
    }

    return {
      type: ASTNodeType.ATTRIBUTE,
      name: name.value,
      visibility,
      isStatic,
      typeAnnotation: typeToken.value,
      multiplicity,
      line: name.line,
      column: name.column
    };
  }

  private parseMethod(context: ParserContext, name: Token, visibility: string, isStatic: boolean, isAbstract: boolean): MethodNode {
    context.consume(TokenType.LPAREN, "");
    const parameters: ParameterNode[] = [];

    if (!context.check(TokenType.RPAREN)) {
      do {
        const paramName = context.consume(TokenType.IDENTIFIER, "Se esperaba el nombre del parámetro");
        context.consume(TokenType.COLON, "Se esperaba ':'");
        const paramType = context.consume(TokenType.IDENTIFIER, "Se esperaba el tipo del parámetro");
        parameters.push({
          type: ASTNodeType.PARAMETER,
          name: paramName.value,
          typeAnnotation: paramType.value,
          line: paramName.line,
          column: paramName.column
        });
      } while (context.match(TokenType.COMMA));
    }

    context.consume(TokenType.RPAREN, "Se esperaba ')' después de los parámetros");

    let returnType: string | undefined = undefined;
    if (context.match(TokenType.COLON)) {
      returnType = context.consume(TokenType.IDENTIFIER, "Se esperaba el tipo de retorno").value;
    }

    return {
      type: ASTNodeType.METHOD,
      name: name.value,
      visibility,
      isStatic,
      isAbstract,
      parameters,
      returnType,
      line: name.line,
      column: name.column
    };
  }
}
