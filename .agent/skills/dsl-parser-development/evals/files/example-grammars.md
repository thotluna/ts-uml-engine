# Example UML DSL Grammars

This file contains example grammars for your UML DSL in different formalisms.

## EBNF Grammar (Documentation-friendly)

```ebnf
(* UML DSL Grammar - EBNF *)

Program         ::= Declaration*

Declaration     ::= ClassDecl
                  | InterfaceDecl
                  | RelationshipDecl
                  | NoteDecl

ClassDecl       ::= 'class' Identifier Inheritance? '{' ClassMember* '}'

InterfaceDecl   ::= 'interface' Identifier '{' InterfaceMember* '}'

ClassMember     ::= Visibility? (Attribute | Method)

InterfaceMember ::= Method

Attribute       ::= Identifier ':' Type DefaultValue?

Method          ::= Identifier '(' ParameterList? ')' (':' Type)?

ParameterList   ::= Parameter (',' Parameter)*

Parameter       ::= Identifier ':' Type

Inheritance     ::= 'extends' Identifier (',' Identifier)*
                  | 'implements' Identifier (',' Identifier)*

RelationshipDecl ::= Identifier Multiplicity? Arrow Multiplicity? Identifier (':' String)?

Arrow           ::= '->'          (* Association *)
                  | '-->'         (* Dependency *)
                  | '<|--'        (* Inheritance *)
                  | 'o--'         (* Aggregation *)
                  | '*--'         (* Composition *)

Multiplicity    ::= '"' MultiplicityValue '"'

MultiplicityValue ::= '1' | '0..1' | '1..*' | '0..*' | '*' | Number

Type            ::= 'String' | 'Number' | 'Boolean' | 'Date' | Identifier | ArrayType

ArrayType       ::= Type '[' ']'

Visibility      ::= '+' | '-' | '#' | '~'

DefaultValue    ::= '=' Expression

NoteDecl        ::= 'note' ('for' Identifier)? String

Identifier      ::= Letter (Letter | Digit | '_')*

String          ::= '"' Character* '"'

Number          ::= Digit+

Expression      ::= String | Number | 'true' | 'false' | 'null'

Letter          ::= 'a'..'z' | 'A'..'Z'

Digit           ::= '0'..'9'

Character       ::= (* Any character except " *)
```

## Tree-sitter Grammar (For VSCode Extension)

```javascript
// grammar.js for Tree-sitter
module.exports = grammar({
  name: 'uml',

  extras: $ => [
    /\s/,
    $.comment,
  ],

  rules: {
    source_file: $ => repeat($._declaration),

    _declaration: $ => choice(
      $.class_declaration,
      $.interface_declaration,
      $.relationship_declaration,
      $.note_declaration,
    ),

    class_declaration: $ => seq(
      'class',
      field('name', $.identifier),
      optional($.inheritance),
      '{',
      repeat($.class_member),
      '}'
    ),

    interface_declaration: $ => seq(
      'interface',
      field('name', $.identifier),
      '{',
      repeat($.method),
      '}'
    ),

    class_member: $ => seq(
      optional($.visibility),
      choice(
        $.attribute,
        $.method
      )
    ),

    attribute: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $.type),
      optional($.default_value)
    ),

    method: $ => seq(
      field('name', $.identifier),
      '(',
      optional($.parameter_list),
      ')',
      optional(seq(':', field('return_type', $.type)))
    ),

    parameter_list: $ => seq(
      $.parameter,
      repeat(seq(',', $.parameter))
    ),

    parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $.type)
    ),

    inheritance: $ => choice(
      seq('extends', commaSep1($.identifier)),
      seq('implements', commaSep1($.identifier))
    ),

    relationship_declaration: $ => seq(
      field('from', $.identifier),
      optional(field('from_multiplicity', $.multiplicity)),
      field('arrow', $.arrow),
      optional(field('to_multiplicity', $.multiplicity)),
      field('to', $.identifier),
      optional(seq(':', field('label', $.string)))
    ),

    arrow: $ => choice(
      '->',      // Association
      '-->',     // Dependency
      '<|--',    // Inheritance
      'o--',     // Aggregation
      '*--'      // Composition
    ),

    multiplicity: $ => seq(
      '"',
      choice('1', '0..1', '1..*', '0..*', '*', $.number),
      '"'
    ),

    type: $ => choice(
      'String',
      'Number',
      'Boolean',
      'Date',
      $.identifier,
      $.array_type
    ),

    array_type: $ => seq(
      $.type,
      '[',
      ']'
    ),

    visibility: $ => choice('+', '-', '#', '~'),

    default_value: $ => seq('=', $.expression),

    expression: $ => choice(
      $.string,
      $.number,
      'true',
      'false',
      'null'
    ),

    note_declaration: $ => seq(
      'note',
      optional(seq('for', $.identifier)),
      $.string
    ),

    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    string: $ => seq(
      '"',
      repeat(choice(
        /[^"\\]/,
        /\\./
      )),
      '"'
    ),

    number: $ => /\d+(\.\d+)?/,

    comment: $ => token(choice(
      seq('//', /.*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
    )),
  }
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
```

## ANTLR4 Grammar (Alternative)

```antlr
grammar UML;

program: declaration* EOF ;

declaration
    : classDecl
    | interfaceDecl
    | relationshipDecl
    | noteDecl
    ;

classDecl
    : 'class' ID inheritance? '{' classMember* '}'
    ;

interfaceDecl
    : 'interface' ID '{' method* '}'
    ;

classMember
    : visibility? (attribute | method)
    ;

attribute
    : ID ':' type defaultValue?
    ;

method
    : ID '(' parameterList? ')' (':' type)?
    ;

parameterList
    : parameter (',' parameter)*
    ;

parameter
    : ID ':' type
    ;

inheritance
    : 'extends' ID (',' ID)*
    | 'implements' ID (',' ID)*
    ;

relationshipDecl
    : ID multiplicity? arrow multiplicity? ID (':' STRING)?
    ;

arrow
    : '->'      // Association
    | '-->'     // Dependency
    | '<|--'    // Inheritance
    | 'o--'     // Aggregation
    | '*--'     // Composition
    ;

multiplicity
    : '"' ('1' | '0..1' | '1..*' | '0..*' | '*' | NUMBER) '"'
    ;

type
    : 'String'
    | 'Number'
    | 'Boolean'
    | 'Date'
    | ID
    | type '[' ']'  // Array type
    ;

visibility
    : '+' | '-' | '#' | '~'
    ;

defaultValue
    : '=' expression
    ;

expression
    : STRING
    | NUMBER
    | 'true'
    | 'false'
    | 'null'
    ;

noteDecl
    : 'note' ('for' ID)? STRING
    ;

// Lexer rules
ID: [a-zA-Z_][a-zA-Z0-9_]* ;
STRING: '"' (~["\r\n])* '"' ;
NUMBER: [0-9]+ ('.' [0-9]+)? ;

WS: [ \t\r\n]+ -> skip ;
LINE_COMMENT: '//' ~[\r\n]* -> skip ;
BLOCK_COMMENT: '/*' .*? '*/' -> skip ;
```

## Example UML DSL Code

Here's what code in your DSL might look like:

```uml
// User management system

class User {
    - id: Number
    - username: String
    - email: String
    - createdAt: Date
    + getProfile(): UserProfile
    + updateEmail(newEmail: String): Boolean
}

class UserProfile {
    - bio: String
    - avatar: String
    - preferences: Preferences
}

class Preferences {
    - theme: String = "light"
    - notifications: Boolean = true
}

interface Auditable {
    getAuditLog(): AuditEntry[]
}

class Order implements Auditable {
    - id: Number
    - total: Number
    - items: OrderItem[]
    + calculate(): Number
    + getAuditLog(): AuditEntry[]
}

// Relationships
User "1" -> "0..1" UserProfile : "has"
User "1" -> "0..*" Order : "places"
UserProfile "1" -> "1" Preferences : "contains"
Order "1" o-- "1..*" OrderItem : "includes"

note for User "Users can have multiple orders but only one profile"
```

## Comparison of Grammar Formalisms

| Formalism | Best For | Pros | Cons |
|-----------|----------|------|------|
| **EBNF** | Documentation, specification | Human-readable, standard | Not executable |
| **Tree-sitter** | VSCode extensions, IDEs | Incremental parsing, error recovery | C-based, learning curve |
| **ANTLR4** | Complex grammars, multi-language | Powerful, mature tooling | Overkill for simple DSLs |
| **PEG** | Web apps, TypeScript projects | Simple, JavaScript-native | Performance on large files |

## Next Steps for Your Project

1. Choose Tree-sitter for VSCode integration
2. Implement the grammar.js file
3. Generate the parser with tree-sitter CLI
4. Create syntax highlighting queries
5. Build VSCode extension with Language Server Protocol
6. Add semantic validation
7. Implement diagram generation from AST

Good luck with your UML DSL project! 🚀
