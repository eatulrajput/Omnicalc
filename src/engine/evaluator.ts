import Decimal from 'decimal.js';
import { ASTNode, CalculationError } from './types';

const MAX_VALUE = new Decimal('1e999');

/**
 * Recursively evaluates an AST node using Decimal.js for
 * arbitrary-precision arithmetic. Never coerces through
 * native JavaScript `Number`.
 */
export function evaluate(node: ASTNode): Decimal {
  switch (node.type) {
    case 'Number':
      return node.value;

    case 'UnaryOp': {
      if (node.operator === '-') {
        return evaluate(node.operand).neg();
      }
      throw new Error(CalculationError.INVALID_EXPRESSION);
    }

    case 'BinaryOp': {
      const left = evaluate(node.left);
      const right = evaluate(node.right);

      let result: Decimal;

      switch (node.operator) {
        case '+':
          result = left.plus(right);
          break;
        case '-':
          result = left.minus(right);
          break;
        case '×':
          result = left.times(right);
          break;
        case '÷':
          if (right.isZero()) {
            throw new Error(CalculationError.DIVIDE_BY_ZERO);
          }
          result = left.dividedBy(right);
          break;
        default:
          throw new Error(CalculationError.INVALID_EXPRESSION);
      }

      // Overflow guard
      if (result.abs().greaterThan(MAX_VALUE)) {
        throw new Error(CalculationError.OVERFLOW);
      }

      return result;
    }

    default:
      throw new Error(CalculationError.UNKNOWN);
  }
}
