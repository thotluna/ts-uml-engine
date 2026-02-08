import type { Token } from './token.types';
import { TokenType } from './token.types';

export class Lexer {
  private input: string;
  private position: number = 0;
  private line: number = 1;
  private column: number = 1;

  private readonly KEYWORDS: Record<string, TokenType> = {
    'class': TokenType.KW_CLASS,
    'interface': TokenType.KW_INTERFACE,
    'enum': TokenType.KW_ENUM,
    'package': TokenType.KW_PACKAGE,
    'public': TokenType.KW_PUBLIC,
    'private': TokenType.KW_PRIVATE,
    'protected': TokenType.KW_PROTECTED,
    'internal': TokenType.KW_INTERNAL,
    'static': TokenType.KW_STATIC,
    'abstract': TokenType.KW_ABSTRACT,
  };

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      const char = this.peek();

      if (this.isWhitespace(char)) {
        this.consumeWhitespace();
        continue;
      }

      if (this.isAlpha(char) || char === '_') {
        tokens.push(this.readIdentifierOrKeyword());
        continue;
      }

      if (this.isDigit(char)) {
        tokens.push(this.readNumber());
        continue;
      }

      if (char === '/') {
        const comment = this.readComment();
        if (comment) {
          tokens.push(comment);
          continue;
        }
      }

      // Manejo de símbolos
      const token = this.readSymbol();
      if (token) {
        tokens.push(token);
        continue;
      }

      // Carácter desconocido
      tokens.push({
        type: TokenType.UNKNOWN,
        value: this.advance(),
        line: this.line,
        column: this.column - 1
      });
    }

    tokens.push({
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.column
    });

    return tokens;
  }

  private readIdentifierOrKeyword(): Token {
    const startColumn = this.column;
    const startLine = this.line;
    let value = '';

    while (!this.isAtEnd() && (this.isAlphaNumeric(this.peek()) || this.peek() === '_' || this.peek() === '.')) {
      value += this.advance();
    }

    const type = this.KEYWORDS[value] || TokenType.IDENTIFIER;

    return {
      type,
      value,
      line: startLine,
      column: startColumn
    };
  }

  private readNumber(): Token {
    const startColumn = this.column;
    const startLine = this.line;
    let value = '';

    while (!this.isAtEnd() && this.isDigit(this.peek())) {
      value += this.advance();
    }

    return { type: TokenType.NUMBER, value, line: startLine, column: startColumn };
  }

  private readSymbol(): Token | null {
    const char = this.peek();
    const startColumn = this.column;
    const startLine = this.line;

    if (char === '>') {
      this.advance();
      const next = this.peek();

      if (next === '>') { this.advance(); return { type: TokenType.OP_INHERIT, value: '>>', line: startLine, column: startColumn }; }
      if (next === 'I') { this.advance(); return { type: TokenType.OP_IMPLEMENT, value: '>I', line: startLine, column: startColumn }; }
      if (next === '*') { this.advance(); return { type: TokenType.OP_COMP, value: '>*', line: startLine, column: startColumn }; }
      if (next === '+') { this.advance(); return { type: TokenType.OP_AGREG, value: '>+', line: startLine, column: startColumn }; }
      if (next === '-') { this.advance(); return { type: TokenType.OP_USE, value: '>-', line: startLine, column: startColumn }; }

      if (this.isAlpha(next)) {
        let value = '>';
        while (!this.isAtEnd() && this.isAlpha(this.peek())) {
          value += this.advance();
        }
        if (value === '>extends') return { type: TokenType.KW_EXTENDS, value, line: startLine, column: startColumn };
        if (value === '>implements') return { type: TokenType.KW_IMPLEMENTS, value, line: startLine, column: startColumn };
        if (value === '>comp') return { type: TokenType.KW_COMP, value, line: startLine, column: startColumn };
        if (value === '>agreg') return { type: TokenType.KW_AGREG, value, line: startLine, column: startColumn };
        if (value === '>use') return { type: TokenType.KW_USE, value, line: startLine, column: startColumn };

        return { type: TokenType.OP_GENERIC_REL, value: '>', line: startLine, column: startColumn };
      }

      return { type: TokenType.OP_GENERIC_REL, value: '>', line: startLine, column: startColumn };
    }

    if (char === '.' && this.peekNext() === '.') {
      this.advance();
      this.advance();
      return { type: TokenType.RANGE, value: '..', line: startLine, column: startColumn };
    }

    const SYMBOLS: Record<string, TokenType> = {
      '{': TokenType.LBRACE, '}': TokenType.RBRACE,
      '(': TokenType.LPAREN, ')': TokenType.RPAREN,
      '[': TokenType.LBRACKET, ']': TokenType.RBRACKET,
      ':': TokenType.COLON, ',': TokenType.COMMA,
      '.': TokenType.DOT, '|': TokenType.PIPE,
      '*': TokenType.STAR, '+': TokenType.VIS_PUB,
      '-': TokenType.VIS_PRIV, '#': TokenType.VIS_PROT,
      '~': TokenType.VIS_PACK
    };

    if (SYMBOLS[char]) {
      return { type: SYMBOLS[char], value: this.advance(), line: startLine, column: startColumn };
    }

    return null;
  }

  private readComment(): Token | null {
    const startColumn = this.column;
    const startLine = this.line;
    let value = this.advance(); // consume first /

    const next = this.peek();

    if (next === '/') {
      // Comentario de línea
      while (!this.isAtEnd() && this.peek() !== '\n') {
        value += this.advance();
      }
      return { type: TokenType.COMMENT, value, line: startLine, column: startColumn };
    } else if (next === '*') {
      // Comentario de bloque
      value += this.advance(); // consume *
      while (!this.isAtEnd()) {
        if (this.peek() === '*' && this.peekNext() === '/') {
          value += this.advance(); // *
          value += this.advance(); // /
          break;
        }
        const char = this.advance();
        if (char === '\n') {
          this.line++;
          this.column = 1;
        }
        value += char;
      }
      return { type: TokenType.COMMENT, value, line: startLine, column: startColumn };
    }

    // No es un comentario, es un carácter desconocido (o un operador / si lo tuviéramos)
    return null;
  }

  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  private consumeWhitespace(): void {
    while (!this.isAtEnd() && this.isWhitespace(this.peek())) {
      const char = this.advance();
      if (char === '\n') {
        this.line++;
        this.column = 1;
      }
    }
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private peek(): string {
    return this.input[this.position] ?? '';
  }

  private peekNext(): string {
    return this.input[this.position + 1] ?? '';
  }

  private advance(): string {
    const char = this.input[this.position++];
    this.column++;
    return char;
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length;
  }
}
