/**
 * Display formatting utilities for Omnicalc.
 */

/**
 * Adds locale-aware digit grouping to a numeric string.
 * e.g. "1234567.89" → "1,234,567.89"
 */
export function formatDisplayNumber(value: string): string {
  if (!value || value === '') return '0';

  // Don't format error / text strings
  if (value.includes('e') || value.includes('E')) return value;

  const isNegative = value.startsWith('-');
  const absValue = isNegative ? value.slice(1) : value;

  const parts = absValue.split('.');
  const integerPart = parts[0] || '0';
  const decimalPart = parts[1];

  // Add comma grouping to the integer portion
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  let result = grouped;
  if (decimalPart !== undefined) {
    result += '.' + decimalPart;
  }

  return isNegative ? '-' + result : result;
}

/**
 * Adds spaces around operators for a readable expression display.
 * Replaces ASCII hyphen-minus with the proper minus sign (−).
 */
export function formatExpression(expression: string): string {
  if (!expression) return '';

  return expression
    .replace(/-/g, '−')                    // Replace hyphen with minus sign
    .replace(/([+−×÷])/g, ' $1 ')         // Space around operators
    .replace(/\(\s+/g, '(')               // Remove space after (
    .replace(/\s+\)/g, ')')               // Remove space before )
    .replace(/\s+/g, ' ')                 // Collapse multiple spaces
    .trim();
}

/**
 * Calculates a responsive font size based on text length
 * so the display number always fits on screen.
 */
export function calculateFontSize(
  text: string,
  baseFontSize: number = 56,
): number {
  const length = text.replace(/[,.\s−-]/g, '').length;

  if (length <= 7) return baseFontSize;
  if (length <= 9) return baseFontSize * 0.8;
  if (length <= 12) return baseFontSize * 0.65;
  if (length <= 16) return baseFontSize * 0.5;
  return baseFontSize * 0.4;
}
