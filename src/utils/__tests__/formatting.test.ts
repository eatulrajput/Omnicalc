import {
  formatDisplayNumber,
  formatExpression,
  calculateFontSize,
} from '../formatting';

describe('Formatting Utilities', () => {
  describe('formatDisplayNumber', () => {
    it('returns "0" for empty input', () => {
      expect(formatDisplayNumber('')).toBe('0');
    });

    it('formats integers with thousands separators', () => {
      expect(formatDisplayNumber('1000')).toBe('1,000');
      expect(formatDisplayNumber('1000000')).toBe('1,000,000');
      expect(formatDisplayNumber('42')).toBe('42');
    });

    it('formats decimal numbers preserving decimal part without commas in decimals', () => {
      expect(formatDisplayNumber('1234567.8901')).toBe('1,234,567.8901');
    });

    it('handles negative numbers correctly', () => {
      expect(formatDisplayNumber('-5000')).toBe('-5,000');
      expect(formatDisplayNumber('-12345.67')).toBe('-12,345.67');
    });

    it('handles numbers starting with a decimal point', () => {
      expect(formatDisplayNumber('.5')).toBe('0.5');
    });

    it('preserves scientific notation strings without modifying', () => {
      expect(formatDisplayNumber('1.23e15')).toBe('1.23e15');
      expect(formatDisplayNumber('5.6E-12')).toBe('5.6E-12');
    });
  });

  describe('formatExpression', () => {
    it('returns empty string for empty input', () => {
      expect(formatExpression('')).toBe('');
    });

    it('replaces ASCII hyphens with unicode minus sign (−)', () => {
      expect(formatExpression('5-3')).toBe('5 − 3');
    });

    it('adds consistent spacing around operators', () => {
      expect(formatExpression('2+3×4÷2')).toBe('2 + 3 × 4 ÷ 2');
    });

    it('handles spaces around parentheses properly', () => {
      expect(formatExpression('( 2 + 3 ) × 4')).toBe('(2 + 3) × 4');
    });
  });

  describe('calculateFontSize', () => {
    it('returns base font size for short numbers (<= 7 digits) and uses default base size', () => {
      expect(calculateFontSize('12345')).toBe(56);
      expect(calculateFontSize('12345', 40)).toBe(40);
      expect(calculateFontSize('1234567', 56)).toBe(56);
    });

    it('scales down for medium length numbers', () => {
      expect(calculateFontSize('123456789', 56)).toBe(56 * 0.8);
    });

    it('scales down progressively for longer numbers', () => {
      expect(calculateFontSize('123456789012', 56)).toBe(56 * 0.65);
      expect(calculateFontSize('1234567890123456', 56)).toBe(56 * 0.5);
      expect(calculateFontSize('123456789012345678', 56)).toBe(56 * 0.4);
    });

    it('ignores formatting characters (commas, dots, spaces, signs) in length count', () => {
      // "1,234.5" has 5 digits
      expect(calculateFontSize('1,234.5', 56)).toBe(56);
      // "-1,234,567" has 7 digits
      expect(calculateFontSize('-1,234,567', 56)).toBe(56);
    });
  });
});
