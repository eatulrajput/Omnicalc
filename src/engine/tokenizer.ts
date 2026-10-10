import { Token, TokenType } from './types';

/**
 * Tokenizes a mathematical expression string into an array of tokens.
 * Handles multi-digit numbers, decimals, operators (+ - × ÷), and parentheses.
 */
export function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  const chars = expression.trim();
  let i = 0;

  while (i < chars.length) {
    const char = chars[i]!;

    // Skip whitespace
    if (char === ' ') {
      i++;
      continue;
    }

    // Numbers (including decimals)
    if (isDigit(char) || (char === '.' && i + 1 < chars.length && isDigit(chars[i + 1]!))) {
      const lastToken = tokens[tokens.length - 1];
      if (lastToken && lastToken.type === TokenType.RIGHT_PAREN) {
        tokens.push({ type: TokenType.OPERATOR, value: '×' });
      }

      let num = '';
      let hasDot = false;
      while (i < chars.length && (isDigit(chars[i]!) || chars[i] === '.')) {
        if (chars[i] === '.') {
          if (hasDot) break; // Second dot → stop
          hasDot = true;
        }
        num += chars[i];
        i++;
      }
      tokens.push({ type: TokenType.NUMBER, value: num });
      continue;
    }

    // Operators
    if (isOperator(char)) {
      tokens.push({ type: TokenType.OPERATOR, value: char });
      i++;
      continue;
    }

    // Left parenthesis
    if (char === '(') {
      const lastToken = tokens[tokens.length - 1];
      if (lastToken && (lastToken.type === TokenType.RIGHT_PAREN || lastToken.type === TokenType.NUMBER)) {
        tokens.push({ type: TokenType.OPERATOR, value: '×' });
      }

      tokens.push({ type: TokenType.LEFT_PAREN, value: '(' });
      i++;
      continue;
    }

    // Right parenthesis
    if (char === ')') {
      tokens.push({ type: TokenType.RIGHT_PAREN, value: ')' });
      i++;
      continue;
    }

    // Skip unknown characters
    i++;
  }

  return tokens;
}

function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

function isOperator(char: string): boolean {
  return char === '+' || char === '-' || char === '×' || char === '÷';
}
