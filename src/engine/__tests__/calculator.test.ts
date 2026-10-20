import { calculate } from '../calculator';
import { CalculationError } from '../types';

describe('Calculator Public API (calculate)', () => {
  describe('Valid expressions', () => {
    it('returns "0" for empty input or whitespace', () => {
      expect(calculate('')).toEqual({ value: '0' });
      expect(calculate('   ')).toEqual({ value: '0' });
    });

    it('calculates simple arithmetic', () => {
      expect(calculate('5 + 7')).toEqual({ value: '12' });
      expect(calculate('20 - 8')).toEqual({ value: '12' });
      expect(calculate('3 × 4')).toEqual({ value: '12' });
      expect(calculate('48 ÷ 4')).toEqual({ value: '12' });
    });

    it('calculates floating point expressions accurately', () => {
      expect(calculate('0.1 + 0.2')).toEqual({ value: '0.3' });
      expect(calculate('1.5 × 2.5')).toEqual({ value: '3.75' });
    });

    it('removes unnecessary trailing zeros after decimal point', () => {
      expect(calculate('2.5000 + 1.5000')).toEqual({ value: '4' });
      expect(calculate('10 ÷ 4')).toEqual({ value: '2.5' });
    });

    it('formats very large numbers using exponential notation', () => {
      const res = calculate('100000000000000 × 10'); // 1e15
      expect(res.value).toContain('e');
    });

    it('formats very small numbers using exponential notation', () => {
      const res = calculate('0.00000000001 ÷ 100'); // < 1e-10
      expect(res.value).toContain('e');
    });
  });

  describe('Error handling', () => {
    it('returns DIVIDE_BY_ZERO error object instead of crashing', () => {
      const result = calculate('10 ÷ 0');
      expect(result).toEqual({
        value: '0',
        error: CalculationError.DIVIDE_BY_ZERO,
      });
    });

    it('returns INVALID_EXPRESSION on incomplete / invalid expressions', () => {
      const result = calculate('5 +');
      expect(result).toEqual({
        value: '0',
        error: CalculationError.INVALID_EXPRESSION,
      });
    });

    it('returns INVALID_EXPRESSION on unbalanced parentheses', () => {
      const result = calculate('(5 + 3');
      expect(result).toEqual({
        value: '0',
        error: CalculationError.INVALID_EXPRESSION,
      });
    });

    it('returns "0" when expression contains only unsupported non-whitespace characters', () => {
      expect(calculate('$$$')).toEqual({ value: '0' });
    });

    it('returns UNKNOWN error when an unhandled exception occurs', () => {
      // Temporarily mock parse to throw a generic Error
      const parserModule = require('../parser');
      const spy = jest.spyOn(parserModule, 'parse').mockImplementationOnce(() => {
        throw new Error('Unexpected internal failure');
      });

      const result = calculate('1 + 1');
      expect(result).toEqual({
        value: '0',
        error: CalculationError.UNKNOWN,
      });

      spy.mockRestore();
    });

    it('returns UNKNOWN error when a non-Error is thrown', () => {
      const parserModule = require('../parser');
      const spy = jest.spyOn(parserModule, 'parse').mockImplementationOnce(() => {
        throw 'non-error string';
      });

      const result = calculate('1 + 1');
      expect(result).toEqual({
        value: '0',
        error: CalculationError.UNKNOWN,
      });

      spy.mockRestore();
    });

    it('formats NaN result as "Error"', () => {
      const Decimal = require('decimal.js').default || require('decimal.js');
      const evaluatorModule = require('../evaluator');
      const spy = jest.spyOn(evaluatorModule, 'evaluate').mockReturnValueOnce(new Decimal(NaN));

      const result = calculate('1 + 1');
      expect(result).toEqual({ value: 'Error' });
      spy.mockRestore();
    });

    it('formats infinite result as "Infinity"', () => {
      const Decimal = require('decimal.js').default || require('decimal.js');
      const evaluatorModule = require('../evaluator');
      const spy = jest.spyOn(evaluatorModule, 'evaluate').mockReturnValueOnce(new Decimal(Infinity));

      const result = calculate('1 + 1');
      expect(result).toEqual({ value: 'Infinity' });
      spy.mockRestore();
    });
  });
});
