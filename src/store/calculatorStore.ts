import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '../utils/storage';
import Decimal from 'decimal.js';
import { calculate } from '../engine';
import type { HistoryEntry } from '../engine';

const MAX_HISTORY = 500;

// ─── State shape ───────────────────────────────────────────
interface CalculatorState {
  /** Expression parts already committed (e.g. "12+34×") */
  expression: string;
  /** The number currently being composed (e.g. "5") */
  currentInput: string;
  /** What the primary display shows */
  displayValue: string;
  /** The full expression that was last evaluated */
  previousExpression: string;
  /** True right after pressing = */
  justEvaluated: boolean;
  /** User-facing error message */
  error: string | null;
  /** Circular buffer of past calculations (max 500) */
  history: HistoryEntry[];
  /** Tracks unmatched open parentheses */
  openParenCount: number;

  // ── Actions ──────────────────────────────────────────────
  inputDigit: (digit: string) => void;
  inputDecimal: () => void;
  inputOperator: (operator: string) => void;
  inputPercent: () => void;
  inputParen: () => void;
  toggleSign: () => void;
  evaluate: () => void;
  clear: () => void;
  backspace: () => void;
  clearHistory: () => void;
  loadFromHistory: (entry: HistoryEntry) => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      expression: '',
      currentInput: '0',
      displayValue: '0',
      previousExpression: '',
      justEvaluated: false,
      error: null,
      history: [],
      openParenCount: 0,

      // ── Digit input ────────────────────────────────────────
      inputDigit: (digit: string) => {
        const s = get();

        if (s.justEvaluated || s.error) {
          set({
            expression: '',
            currentInput: digit,
            displayValue: digit,
            previousExpression: s.error ? '' : s.previousExpression,
            justEvaluated: false,
            error: null,
          });
          return;
        }

        // Prevent leading zeros (allow "0." though)
        const newInput = s.currentInput === '0' ? digit : s.currentInput + digit;
        set({ currentInput: newInput, displayValue: newInput });
      },

      // ── Decimal point ──────────────────────────────────────
      inputDecimal: () => {
        const s = get();

        if (s.justEvaluated) {
          set({
            expression: '',
            currentInput: '0.',
            displayValue: '0.',
            justEvaluated: false,
            error: null,
          });
          return;
        }

        if (s.currentInput.includes('.')) return;

        const newInput =
          s.currentInput === '' || s.currentInput === '0'
            ? '0.'
            : s.currentInput + '.';
        set({ currentInput: newInput, displayValue: newInput });
      },

      // ── Operator input (+, -, ×, ÷) ────────────────────────
      inputOperator: (operator: string) => {
        const s = get();
        if (s.error) return;

        // Continue from previous result
        if (s.justEvaluated) {
          set({
            expression: s.displayValue + operator,
            currentInput: '',
            justEvaluated: false,
            previousExpression: '',
          });
          return;
        }

        // Replace trailing operator if the user changes their mind
        if (s.currentInput === '' && s.expression.length > 0) {
          const last = s.expression[s.expression.length - 1];
          if (last && ['+', '-', '×', '÷'].includes(last)) {
            set({ expression: s.expression.slice(0, -1) + operator });
            return;
          }
        }

        set({
          expression: s.expression + s.currentInput + operator,
          currentInput: '',
        });
      },

      // ── Percentage ─────────────────────────────────────────
      // Standard behaviour:
      //   a + b%  →  a + (a × b / 100)   (markup)
      //   a − b%  →  a − (a × b / 100)
      //   a × b%  →  a × (b / 100)
      //   a ÷ b%  →  a ÷ (b / 100)
      //   b%      →  b / 100
      inputPercent: () => {
        const s = get();
        if (s.currentInput === '' || s.currentInput === '0') return;

        const currentValue = new Decimal(s.currentInput);

        // Locate the last operator in the committed expression
        const lastOpIndex = Math.max(
          s.expression.lastIndexOf('+'),
          s.expression.lastIndexOf('-'),
          s.expression.lastIndexOf('×'),
          s.expression.lastIndexOf('÷'),
        );

        if (lastOpIndex === -1) {
          // Standalone percentage → divide by 100
          const result = currentValue.dividedBy(100);
          const str = stripTrailingZeros(result.toFixed());
          set({ currentInput: str, displayValue: str });
          return;
        }

        const lastOp = s.expression[lastOpIndex];

        if (lastOp === '+' || lastOp === '-') {
          // Evaluate the base (everything before the last operator)
          const baseExpr = s.expression.substring(0, lastOpIndex);
          if (baseExpr) {
            // Auto-close open parentheses in baseExpr to prevent parser errors
            const openParens = (baseExpr.match(/\(/g) || []).length;
            const closeParens = (baseExpr.match(/\)/g) || []).length;
            const parensToClose = openParens - closeParens;
            
            let safeBaseExpr = baseExpr;
            for (let i = 0; i < parensToClose; i++) {
              safeBaseExpr += ')';
            }

            const baseResult = calculate(safeBaseExpr);
            if (!baseResult.error) {
              const base = new Decimal(baseResult.value);
              const pctValue = base.times(currentValue).dividedBy(100);
              const str = stripTrailingZeros(pctValue.toFixed());
              set({ currentInput: str, displayValue: str });
              return;
            }
          }
          // Fallback to simple /100
          const fallback = currentValue.dividedBy(100);
          const str = stripTrailingZeros(fallback.toFixed());
          set({ currentInput: str, displayValue: str });
        } else {
          // × or ÷ → just divide by 100
          const result = currentValue.dividedBy(100);
          const str = stripTrailingZeros(result.toFixed());
          set({ currentInput: str, displayValue: str });
        }
      },

      // ── Smart parentheses ──────────────────────────────────
      inputParen: () => {
        const s = get();

        if (s.error) return;

        if (s.justEvaluated) {
          set({
            expression: '(',
            currentInput: '',
            displayValue: '',
            justEvaluated: false,
            error: null,
            previousExpression: '',
            openParenCount: 1,
          });
          return;
        }

        const lastChar =
          s.expression.length > 0
            ? s.expression[s.expression.length - 1]
            : null;

        // Decide: close an existing paren or open a new one
        const canClose =
          s.openParenCount > 0 &&
          (s.currentInput !== '' || lastChar === ')');

        if (canClose) {
          // Close parenthesis
          set({
            expression: s.expression + s.currentInput + ')',
            currentInput: '',
            openParenCount: s.openParenCount - 1,
          });
        } else {
          // Open parenthesis (add implicit × if needed)
          let prefix = s.expression;
          if (s.currentInput !== '' && s.currentInput !== '0') {
            prefix += s.currentInput + '×';
          }
          set({
            expression: prefix + '(',
            currentInput: '',
            openParenCount: s.openParenCount + 1,
          });
        }
      },

      // ── Toggle sign (±) ────────────────────────────────────
      toggleSign: () => {
        const s = get();
        if (s.currentInput === '0' || s.currentInput === '') return;

        const newInput = s.currentInput.startsWith('-')
          ? s.currentInput.slice(1)
          : '-' + s.currentInput;

        set({
          currentInput: newInput,
          displayValue: newInput,
          justEvaluated: false,
        });
      },

      // ── Evaluate (=) ──────────────────────────────────────
      evaluate: () => {
        const s = get();
        if (s.error) return;

        // Build the full expression string
        let fullExpression = s.expression;

        if (s.currentInput !== '') {
          // Wrap negative current input in parens so the parser handles it
          if (s.currentInput.startsWith('-') && s.expression) {
            fullExpression += `(${s.currentInput})`;
          } else {
            fullExpression += s.currentInput;
          }
        }

        // Auto-close any open parentheses
        for (let i = 0; i < s.openParenCount; i++) {
          fullExpression += ')';
        }

        // Strip trailing operator (if user pressed = right after an operator)
        fullExpression = fullExpression.replace(/[+\-×÷]+$/, '');

        if (!fullExpression || fullExpression === '0') return;

        const result = calculate(fullExpression);

        if (result.error) {
          set({
            error: result.error,
            displayValue: result.error,
            previousExpression: fullExpression,
            justEvaluated: true,
          });
          return;
        }

        // Push to history (circular buffer)
        const entry: HistoryEntry = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
          expression: fullExpression,
          result: result.value,
          timestamp: Date.now(),
        };

        const newHistory = [entry, ...s.history].slice(0, MAX_HISTORY);

        set({
          previousExpression: fullExpression,
          expression: '',
          currentInput: result.value,
          displayValue: result.value,
          justEvaluated: true,
          error: null,
          history: newHistory,
          openParenCount: 0,
        });
      },

      // ── Clear / All Clear ──────────────────────────────────
      clear: () => {
        const s = get();

        // C: clear current input only (if there is something to clear)
        if (
          s.currentInput !== '0' &&
          s.currentInput !== '' &&
          !s.justEvaluated &&
          !s.error
        ) {
          set({ currentInput: '0', displayValue: '0', error: null });
          return;
        }

        // AC: full reset
        set({
          expression: '',
          currentInput: '0',
          displayValue: '0',
          previousExpression: s.previousExpression,
          justEvaluated: false,
          error: null,
          openParenCount: 0,
        });
      },

      // ── Backspace ──────────────────────────────────────────
      backspace: () => {
        const s = get();

        if (s.justEvaluated || s.error) {
          set({
            expression: '',
            currentInput: '0',
            displayValue: '0',
            previousExpression: '',
            justEvaluated: false,
            error: null,
            openParenCount: 0,
          });
          return;
        }

        if (s.currentInput.length > 1) {
          const newInput = s.currentInput.slice(0, -1);
          set({ currentInput: newInput, displayValue: newInput });
        } else {
          set({ currentInput: '0', displayValue: '0' });
        }
      },

      // ── History management ─────────────────────────────────
      clearHistory: () => set({ history: [] }),

      loadFromHistory: (entry: HistoryEntry) =>
        set({
          expression: '',
          currentInput: entry.result,
          displayValue: entry.result,
          previousExpression: entry.expression,
          justEvaluated: true,
          error: null,
          openParenCount: 0,
        }),
    }),
    {
      name: 'omnicalc-calculator',
      storage: createJSONStorage(() => safeStorage),
      // Only persist history across app restarts
      partialize: (state) => ({ history: state.history }),
    },
  ),
);

// ── Helpers ────────────────────────────────────────────────
function stripTrailingZeros(str: string): string {
  if (str.includes('.')) {
    return str.replace(/\.?0+$/, '');
  }
  return str;
}
