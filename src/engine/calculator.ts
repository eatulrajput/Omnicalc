import Decimal from 'decimal.js';
import { tokenize } from './tokenizer';
import { parse } from './parser';
import { evaluate } from './evaluator';
import { CalculationResult, CalculationError } from './types';

/**
 * Public API – evaluates a mathematical expression string and
 * returns either the result or a user-friendly error.
 *
 * Pipeline: expression string → tokens → AST → Decimal result → formatted string
 */
export function calculate(expression: string): CalculationResult {
  try {
    if (!expression || expression.trim().length === 0) {
      return { value: '0' };
    }

    const tokens = tokenize(expression);
    if (tokens.length === 0) {
      return { value: '0' };
    }

    const ast = parse(tokens);
    const result = evaluate(ast);

    return { value: formatResult(result) };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : CalculationError.UNKNOWN;

    // Return known error messages directly
    if (
      Object.values(CalculationError).includes(message as CalculationError)
    ) {
      return { value: '0', error: message as CalculationError };
    }

    return { value: '0', error: CalculationError.UNKNOWN };
  }
}

// ── Formatting ──────────────────────────────────────────────

function formatResult(value: Decimal): string {
  if (value.isNaN()) return 'Error';
  if (!value.isFinite()) return 'Infinity';

  // Round to 15 significant digits to avoid excessive precision noise
  const rounded = value.toSignificantDigits(15);

  // Use exponential notation for very large / very small numbers
  if (
    !rounded.isZero() &&
    (rounded.abs().gte('1e15') || rounded.abs().lt('1e-10'))
  ) {
    return rounded
      .toExponential(10)
      .replace(/\.?0+e/, 'e'); // strip trailing zeros before 'e'
  }

  let str = rounded.toFixed();

  // Remove trailing zeros after the decimal point
  if (str.includes('.')) {
    str = str.replace(/\.?0+$/, '');
  }

  return str;
}
