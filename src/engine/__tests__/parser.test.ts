import Decimal from 'decimal.js';
import { parse } from '../parser';
import { tokenize } from '../tokenizer';
import { CalculationError } from '../types';

describe('Parser', () => {
  it('parses a single number literal', () => {
    const tokens = tokenize('42');
    const ast = parse(tokens);
    expect(ast).toEqual({
      type: 'Number',
      value: new Decimal('42'),
    });
  });

  it('parses simple addition', () => {
    const tokens = tokenize('1 + 2');
    const ast = parse(tokens);
    expect(ast).toEqual({
      type: 'BinaryOp',
      operator: '+',
      left: { type: 'Number', value: new Decimal('1') },
      right: { type: 'Number', value: new Decimal('2') },
    });
  });

  it('respects operator precedence: multiplication over addition', () => {
    // 2 + 3 × 4 => 2 + (3 × 4)
    const tokens = tokenize('2 + 3 × 4');
    const ast = parse(tokens);
    expect(ast).toEqual({
      type: 'BinaryOp',
      operator: '+',
      left: { type: 'Number', value: new Decimal('2') },
      right: {
        type: 'BinaryOp',
        operator: '×',
        left: { type: 'Number', value: new Decimal('3') },
        right: { type: 'Number', value: new Decimal('4') },
      },
    });
  });

  it('respects operator precedence: division over subtraction', () => {
    // 10 - 8 ÷ 2 => 10 - (8 ÷ 2)
    const tokens = tokenize('10 - 8 ÷ 2');
    const ast = parse(tokens);
    expect(ast).toEqual({
      type: 'BinaryOp',
      operator: '-',
      left: { type: 'Number', value: new Decimal('10') },
      right: {
        type: 'BinaryOp',
        operator: '÷',
        left: { type: 'Number', value: new Decimal('8') },
        right: { type: 'Number', value: new Decimal('2') },
      },
    });
  });

  it('handles parentheses to override operator precedence', () => {
    // (2 + 3) × 4
    const tokens = tokenize('(2 + 3) × 4');
    const ast = parse(tokens);
    expect(ast).toEqual({
      type: 'BinaryOp',
      operator: '×',
      left: {
        type: 'BinaryOp',
        operator: '+',
        left: { type: 'Number', value: new Decimal('2') },
        right: { type: 'Number', value: new Decimal('3') },
      },
      right: { type: 'Number', value: new Decimal('4') },
    });
  });

  it('handles unary minus', () => {
    const tokens = tokenize('-5');
    const ast = parse(tokens);
    expect(ast).toEqual({
      type: 'UnaryOp',
      operator: '-',
      operand: { type: 'Number', value: new Decimal('5') },
    });
  });

  it('handles unary minus on parenthesized expression', () => {
    const tokens = tokenize('-(3 + 4)');
    const ast = parse(tokens);
    expect(ast).toEqual({
      type: 'UnaryOp',
      operator: '-',
      operand: {
        type: 'BinaryOp',
        operator: '+',
        left: { type: 'Number', value: new Decimal('3') },
        right: { type: 'Number', value: new Decimal('4') },
      },
    });
  });

  it('handles unary plus by passing through operand', () => {
    const tokens = tokenize('+7');
    const ast = parse(tokens);
    expect(ast).toEqual({
      type: 'Number',
      value: new Decimal('7'),
    });
  });

  it('handles empty parentheses as 0', () => {
    const tokens = tokenize('()');
    const ast = parse(tokens);
    expect(ast).toEqual({
      type: 'Number',
      value: new Decimal('0'),
    });
  });

  it('throws on empty token array', () => {
    expect(() => parse([])).toThrow(CalculationError.INVALID_EXPRESSION);
  });

  it('throws on unclosed parenthesis', () => {
    const tokens = tokenize('(2 + 3');
    expect(() => parse(tokens)).toThrow(CalculationError.INVALID_EXPRESSION);
  });

  it('throws on unexpected trailing tokens', () => {
    const tokens = tokenize('2 + 3 4');
    expect(() => parse(tokens)).toThrow(CalculationError.INVALID_EXPRESSION);
  });

  it('throws on dangling operator', () => {
    const tokens = tokenize('2 +');
    expect(() => parse(tokens)).toThrow(CalculationError.INVALID_EXPRESSION);
  });

  it('throws on unexpected token when primary is expected', () => {
    const tokens = tokenize(')');
    expect(() => parse(tokens)).toThrow(CalculationError.INVALID_EXPRESSION);
  });
});
