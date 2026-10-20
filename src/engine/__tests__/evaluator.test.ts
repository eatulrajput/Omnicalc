import Decimal from 'decimal.js';
import { evaluate } from '../evaluator';
import { parse } from '../parser';
import { tokenize } from '../tokenizer';
import { CalculationError } from '../types';

function evaluateString(expr: string): Decimal {
  return evaluate(parse(tokenize(expr)));
}

describe('Evaluator', () => {
  describe('Basic arithmetic', () => {
    it('evaluates addition', () => {
      expect(evaluateString('10 + 25')).toEqual(new Decimal('35'));
    });

    it('evaluates subtraction', () => {
      expect(evaluateString('100 - 37')).toEqual(new Decimal('63'));
    });

    it('evaluates multiplication', () => {
      expect(evaluateString('7 × 8')).toEqual(new Decimal('56'));
    });

    it('evaluates division', () => {
      expect(evaluateString('144 ÷ 12')).toEqual(new Decimal('12'));
    });
  });

  describe('Precision & Decimal.js advantages', () => {
    it('avoids IEEE-754 binary floating-point error (0.1 + 0.2 = 0.3)', () => {
      const result = evaluateString('0.1 + 0.2');
      expect(result.toString()).toBe('0.3');
    });

    it('handles high precision division', () => {
      const result = evaluateString('1 ÷ 3');
      expect(result.toString().startsWith('0.33333333333333333333')).toBe(true);
    });

    it('computes large numbers without precision loss', () => {
      const result = evaluateString('999999999999999 + 1');
      expect(result.toString()).toBe('1000000000000000');
    });
  });

  describe('Order of operations & parentheses', () => {
    it('evaluates multiplication before addition', () => {
      expect(evaluateString('2 + 3 × 4')).toEqual(new Decimal('14'));
    });

    it('evaluates parentheses first', () => {
      expect(evaluateString('(2 + 3) × 4')).toEqual(new Decimal('20'));
    });

    it('handles nested parentheses', () => {
      expect(evaluateString('((2 + 3) × (4 - 1)) ÷ 3')).toEqual(new Decimal('5'));
    });

    it('evaluates unary minus', () => {
      expect(evaluateString('-5 + 3')).toEqual(new Decimal('-2'));
      expect(evaluateString('-(5 + 3)')).toEqual(new Decimal('-8'));
      expect(evaluateString('- -5')).toEqual(new Decimal('5'));
    });
  });

  describe('Error handling', () => {
    it('throws DIVIDE_BY_ZERO when dividing by 0', () => {
      expect(() => evaluateString('42 ÷ 0')).toThrow(CalculationError.DIVIDE_BY_ZERO);
    });

    it('throws DIVIDE_BY_ZERO when dividing by expression that evaluates to 0', () => {
      expect(() => evaluateString('42 ÷ (5 - 5)')).toThrow(CalculationError.DIVIDE_BY_ZERO);
    });

    it('throws OVERFLOW on extremely large numbers (> 1e999)', () => {
      const huge = '1e500';
      expect(() => evaluateString(`${huge} × ${huge}`)).toThrow(CalculationError.OVERFLOW);

      const node = {
        type: 'BinaryOp' as const,
        operator: '×',
        left: { type: 'Number' as const, value: new Decimal('1e500') },
        right: { type: 'Number' as const, value: new Decimal('1e500') },
      };
      expect(() => evaluate(node)).toThrow(CalculationError.OVERFLOW);
    });

    it('throws INVALID_EXPRESSION on unsupported unary operator', () => {
      const node = {
        type: 'UnaryOp' as const,
        operator: '+',
        operand: { type: 'Number' as const, value: new Decimal('5') },
      };
      expect(() => evaluate(node)).toThrow(CalculationError.INVALID_EXPRESSION);
    });

    it('throws INVALID_EXPRESSION on unsupported binary operator', () => {
      const node = {
        type: 'BinaryOp' as const,
        operator: '%',
        left: { type: 'Number' as const, value: new Decimal('5') },
        right: { type: 'Number' as const, value: new Decimal('2') },
      };
      expect(() => evaluate(node as any)).toThrow(CalculationError.INVALID_EXPRESSION);
    });

    it('throws UNKNOWN on unrecognized AST node type', () => {
      const node = {
        type: 'CustomNode',
      };
      expect(() => evaluate(node as any)).toThrow(CalculationError.UNKNOWN);
    });
  });
});
