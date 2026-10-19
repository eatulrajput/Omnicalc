import { tokenize } from '../tokenizer';
import { TokenType } from '../types';

describe('Tokenizer', () => {
  it('tokenizes single and multi-digit integers', () => {
    const tokens = tokenize('123');
    expect(tokens).toEqual([
      { type: TokenType.NUMBER, value: '123' },
    ]);
  });

  it('tokenizes decimal numbers', () => {
    const tokens = tokenize('3.14159');
    expect(tokens).toEqual([
      { type: TokenType.NUMBER, value: '3.14159' },
    ]);
  });

  it('handles numbers starting with a decimal point', () => {
    const tokens = tokenize('.5');
    expect(tokens).toEqual([
      { type: TokenType.NUMBER, value: '.5' },
    ]);
  });

  it('stops reading decimal at second dot', () => {
    const tokens = tokenize('1.2.3');
    // First token is 1.2, second token is .3
    expect(tokens).toEqual([
      { type: TokenType.NUMBER, value: '1.2' },
      { type: TokenType.NUMBER, value: '.3' },
    ]);
  });

  it('tokenizes all supported operators', () => {
    const tokens = tokenize('+ - × ÷');
    expect(tokens).toEqual([
      { type: TokenType.OPERATOR, value: '+' },
      { type: TokenType.OPERATOR, value: '-' },
      { type: TokenType.OPERATOR, value: '×' },
      { type: TokenType.OPERATOR, value: '÷' },
    ]);
  });

  it('tokenizes parentheses', () => {
    const tokens = tokenize('( 5 )');
    expect(tokens).toEqual([
      { type: TokenType.LEFT_PAREN, value: '(' },
      { type: TokenType.NUMBER, value: '5' },
      { type: TokenType.RIGHT_PAREN, value: ')' },
    ]);
  });

  it('inserts implicit multiplication between number and left parenthesis', () => {
    const tokens = tokenize('2(3)');
    expect(tokens).toEqual([
      { type: TokenType.NUMBER, value: '2' },
      { type: TokenType.OPERATOR, value: '×' },
      { type: TokenType.LEFT_PAREN, value: '(' },
      { type: TokenType.NUMBER, value: '3' },
      { type: TokenType.RIGHT_PAREN, value: ')' },
    ]);
  });

  it('inserts implicit multiplication between right parenthesis and left parenthesis', () => {
    const tokens = tokenize('(2)(3)');
    expect(tokens).toEqual([
      { type: TokenType.LEFT_PAREN, value: '(' },
      { type: TokenType.NUMBER, value: '2' },
      { type: TokenType.RIGHT_PAREN, value: ')' },
      { type: TokenType.OPERATOR, value: '×' },
      { type: TokenType.LEFT_PAREN, value: '(' },
      { type: TokenType.NUMBER, value: '3' },
      { type: TokenType.RIGHT_PAREN, value: ')' },
    ]);
  });

  it('inserts implicit multiplication between right parenthesis and number', () => {
    const tokens = tokenize('(2)3');
    expect(tokens).toEqual([
      { type: TokenType.LEFT_PAREN, value: '(' },
      { type: TokenType.NUMBER, value: '2' },
      { type: TokenType.RIGHT_PAREN, value: ')' },
      { type: TokenType.OPERATOR, value: '×' },
      { type: TokenType.NUMBER, value: '3' },
    ]);
  });

  it('handles arbitrary whitespace', () => {
    const tokens = tokenize('   42   +   8   ');
    expect(tokens).toEqual([
      { type: TokenType.NUMBER, value: '42' },
      { type: TokenType.OPERATOR, value: '+' },
      { type: TokenType.NUMBER, value: '8' },
    ]);
  });

  it('ignores invalid / unknown characters gracefully', () => {
    const tokens = tokenize('4 $ 2');
    expect(tokens).toEqual([
      { type: TokenType.NUMBER, value: '4' },
      { type: TokenType.NUMBER, value: '2' },
    ]);
  });

  it('tokenizes scientific notation numbers', () => {
    expect(tokenize('1e500')).toEqual([
      { type: TokenType.NUMBER, value: '1e500' },
    ]);
    expect(tokenize('2.5e-10')).toEqual([
      { type: TokenType.NUMBER, value: '2.5e-10' },
    ]);
    expect(tokenize('3e+8')).toEqual([
      { type: TokenType.NUMBER, value: '3e+8' },
    ]);
    expect(tokenize('1e')).toEqual([
      { type: TokenType.NUMBER, value: '1' },
    ]);
    expect(tokenize('1e+')).toEqual([
      { type: TokenType.NUMBER, value: '1' },
      { type: TokenType.OPERATOR, value: '+' },
    ]);
  });

  it('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   ')).toEqual([]);
  });
});
