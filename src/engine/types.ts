import Decimal from 'decimal.js';

// Configure Decimal.js for high precision
Decimal.set({ precision: 50, rounding: Decimal.ROUND_HALF_UP });

// ─── Token Types ───────────────────────────────────────────────
export enum TokenType {
  NUMBER = 'NUMBER',
  OPERATOR = 'OPERATOR',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
}

export interface Token {
  type: TokenType;
  value: string;
}

// ─── AST Node Types ────────────────────────────────────────────
export type ASTNode = NumberNode | BinaryOpNode | UnaryOpNode;

export interface NumberNode {
  type: 'Number';
  value: Decimal;
}

export interface BinaryOpNode {
  type: 'BinaryOp';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryOpNode {
  type: 'UnaryOp';
  operator: string;
  operand: ASTNode;
}

// ─── Error & Result Types ──────────────────────────────────────
export enum CalculationError {
  DIVIDE_BY_ZERO = 'Cannot divide by zero',
  OVERFLOW = 'Result too large',
  INVALID_EXPRESSION = 'Invalid expression',
  UNKNOWN = 'An error occurred',
}

export interface CalculationResult {
  value: string;
  error?: CalculationError;
}

// ─── History ───────────────────────────────────────────────────
export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}
