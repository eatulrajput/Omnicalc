import Decimal from 'decimal.js';
import { Token, TokenType, ASTNode, CalculationError } from './types';

/**
 * Recursive descent parser that converts tokens into an AST.
 *
 * Grammar:
 *   expression → term (('+' | '-') term)*
 *   term       → unary (('×' | '÷') unary)*
 *   unary      → '-' unary | primary
 *   primary    → NUMBER | '(' expression ')'
 *
 * This naturally handles operator precedence (× ÷ before + -)
 * and unary minus (e.g., -5, -(3+4)).
 */
class Parser {
  private tokens: Token[];
  private currentTokenIndex: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.currentTokenIndex = 0;
  }

  parse(): ASTNode {
    const result = this.expression();
    if (this.currentTokenIndex < this.tokens.length) {
      throw new Error(CalculationError.INVALID_EXPRESSION);
    }
    return result;
  }

  private expression(): ASTNode {
    let left = this.term();

    while (this.currentTokenIndex < this.tokens.length && this.isAddSubOperator()) {
      const op = this.tokens[this.currentTokenIndex]!.value;
      this.currentTokenIndex++;
      const right = this.term();
      left = { type: 'BinaryOp', operator: op, left, right };
    }

    return left;
  }

  private term(): ASTNode {
    let left = this.unary();

    while (this.currentTokenIndex < this.tokens.length && this.isMulDivOperator()) {
      const op = this.tokens[this.currentTokenIndex]!.value;
      this.currentTokenIndex++;
      const right = this.unary();
      left = { type: 'BinaryOp', operator: op, left, right };
    }

    return left;
  }

  private unary(): ASTNode {
    if (this.currentTokenIndex < this.tokens.length) {
      if (this.isMinusOperator()) {
        this.currentTokenIndex++;
        const operand = this.unary();
        return { type: 'UnaryOp', operator: '-', operand };
      }
      if (this.isPlusOperator()) {
        this.currentTokenIndex++;
        // Unary plus doesn't change the value, just parse and return the operand
        return this.unary();
      }
    }
    return this.primary();
  }

  private primary(): ASTNode {
    const token = this.tokens[this.currentTokenIndex];

    if (!token) {
      throw new Error(CalculationError.INVALID_EXPRESSION);
    }

    // Number literal
    if (token.type === TokenType.NUMBER) {
      this.currentTokenIndex++;
      return { type: 'Number', value: new Decimal(token.value) };
    }

    // Parenthesized sub-expression
    if (token.type === TokenType.LEFT_PAREN) {
      this.currentTokenIndex++; // consume '('
      
      // Handle empty parentheses '()'
      if (
        this.currentTokenIndex < this.tokens.length &&
        this.tokens[this.currentTokenIndex]!.type === TokenType.RIGHT_PAREN
      ) {
        this.currentTokenIndex++; // consume ')'
        return { type: 'Number', value: new Decimal(0) };
      }

      const node = this.expression();

      if (
        this.currentTokenIndex >= this.tokens.length ||
        this.tokens[this.currentTokenIndex]!.type !== TokenType.RIGHT_PAREN
      ) {
        throw new Error(CalculationError.INVALID_EXPRESSION);
      }
      this.currentTokenIndex++; // consume ')'
      return node;
    }

    throw new Error(CalculationError.INVALID_EXPRESSION);
  }

  // ── Helpers ────────────────────────────────────────────────
  private isAddSubOperator(): boolean {
    const t = this.tokens[this.currentTokenIndex];
    return (
      t?.type === TokenType.OPERATOR &&
      (t.value === '+' || t.value === '-')
    );
  }

  private isMulDivOperator(): boolean {
    const t = this.tokens[this.currentTokenIndex];
    return (
      t?.type === TokenType.OPERATOR &&
      (t.value === '×' || t.value === '÷')
    );
  }

  private isMinusOperator(): boolean {
    const t = this.tokens[this.currentTokenIndex];
    return t?.type === TokenType.OPERATOR && t.value === '-';
  }

  private isPlusOperator(): boolean {
    const t = this.tokens[this.currentTokenIndex];
    return t?.type === TokenType.OPERATOR && t.value === '+';
  }
}

/**
 * Parse an array of tokens into an AST.
 * Throws CalculationError.INVALID_EXPRESSION on malformed input.
 */
export function parse(tokens: Token[]): ASTNode {
  if (tokens.length === 0) {
    throw new Error(CalculationError.INVALID_EXPRESSION);
  }
  return new Parser(tokens).parse();
}
