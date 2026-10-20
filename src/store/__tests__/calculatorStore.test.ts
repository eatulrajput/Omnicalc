import { useCalculatorStore } from '../calculatorStore';

describe('Calculator Store (Zustand)', () => {
  beforeEach(() => {
    // Reset state before each test
    useCalculatorStore.setState({
      expression: '',
      currentInput: '0',
      displayValue: '0',
      previousExpression: '',
      justEvaluated: false,
      error: null,
      history: [],
      openParenCount: 0,
    });
  });

  describe('Initial State', () => {
    it('initializes with default zero values', () => {
      const state = useCalculatorStore.getState();
      expect(state.currentInput).toBe('0');
      expect(state.displayValue).toBe('0');
      expect(state.expression).toBe('');
      expect(state.justEvaluated).toBe(false);
      expect(state.error).toBeNull();
      expect(state.history).toEqual([]);
    });
  });

  describe('Digit & Decimal Input', () => {
    it('replaces initial 0 with the entered digit', () => {
      useCalculatorStore.getState().inputDigit('5');
      expect(useCalculatorStore.getState().currentInput).toBe('5');
      expect(useCalculatorStore.getState().displayValue).toBe('5');
    });

    it('appends multiple digits', () => {
      useCalculatorStore.getState().inputDigit('1');
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().inputDigit('3');
      expect(useCalculatorStore.getState().currentInput).toBe('123');
    });

    it('prevents multiple leading zeros', () => {
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputDigit('0');
      expect(useCalculatorStore.getState().currentInput).toBe('0');
    });

    it('handles decimal point correctly', () => {
      useCalculatorStore.getState().inputDigit('3');
      useCalculatorStore.getState().inputDecimal();
      useCalculatorStore.getState().inputDigit('1');
      useCalculatorStore.getState().inputDigit('4');
      expect(useCalculatorStore.getState().currentInput).toBe('3.14');
    });

    it('ignores duplicate decimal points in a single number', () => {
      useCalculatorStore.getState().inputDigit('3');
      useCalculatorStore.getState().inputDecimal();
      useCalculatorStore.getState().inputDecimal();
      useCalculatorStore.getState().inputDigit('5');
      expect(useCalculatorStore.getState().currentInput).toBe('3.5');
    });
  });

  describe('Operators & Evaluation', () => {
    it('commits number and operator to expression', () => {
      useCalculatorStore.getState().inputDigit('1');
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().inputOperator('+');

      expect(useCalculatorStore.getState().expression).toBe('12+');
      expect(useCalculatorStore.getState().currentInput).toBe('');
    });

    it('replaces operator if user presses another operator immediately', () => {
      useCalculatorStore.getState().inputDigit('5');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().inputOperator('×');

      expect(useCalculatorStore.getState().expression).toBe('5×');
    });

    it('evaluates addition correctly', () => {
      useCalculatorStore.getState().inputDigit('7');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().inputDigit('8');
      useCalculatorStore.getState().evaluate();

      const state = useCalculatorStore.getState();
      expect(state.displayValue).toBe('15');
      expect(state.currentInput).toBe('15');
      expect(state.justEvaluated).toBe(true);
      expect(state.history.length).toBe(1);
      expect(state.history[0]?.expression).toBe('7+8');
      expect(state.history[0]?.result).toBe('15');
    });

    it('allows continuing calculation with an operator after evaluate', () => {
      useCalculatorStore.getState().inputDigit('5');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().inputDigit('5');
      useCalculatorStore.getState().evaluate(); // 10

      useCalculatorStore.getState().inputOperator('×');
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().evaluate(); // 20

      expect(useCalculatorStore.getState().displayValue).toBe('20');
      expect(useCalculatorStore.getState().history.length).toBe(2);
    });

    it('appends operator when expression ends with a closing parenthesis and currentInput is empty', () => {
      useCalculatorStore.setState({ expression: '(5)', currentInput: '' });
      useCalculatorStore.getState().inputOperator('+');
      expect(useCalculatorStore.getState().expression).toBe('(5)+');
    });
  });

  describe('Sign Toggle (±)', () => {
    it('negates a positive number', () => {
      useCalculatorStore.getState().inputDigit('4');
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().toggleSign();
      expect(useCalculatorStore.getState().currentInput).toBe('-42');
    });

    it('reverts a negative number back to positive', () => {
      useCalculatorStore.getState().inputDigit('9');
      useCalculatorStore.getState().toggleSign();
      useCalculatorStore.getState().toggleSign();
      expect(useCalculatorStore.getState().currentInput).toBe('9');
    });

    it('does nothing when input is 0', () => {
      useCalculatorStore.getState().toggleSign();
      expect(useCalculatorStore.getState().currentInput).toBe('0');
    });
  });

  describe('Clear (C) and All Clear (AC)', () => {
    it('clears current input on first clear (C) without resetting expression', () => {
      useCalculatorStore.getState().inputDigit('1');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().inputDigit('9');

      useCalculatorStore.getState().clear(); // C
      expect(useCalculatorStore.getState().currentInput).toBe('0');
      expect(useCalculatorStore.getState().expression).toBe('1+');
    });

    it('resets entire state on second clear (AC)', () => {
      useCalculatorStore.getState().inputDigit('1');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().clear(); // C
      useCalculatorStore.getState().clear(); // AC

      expect(useCalculatorStore.getState().expression).toBe('');
      expect(useCalculatorStore.getState().currentInput).toBe('0');
    });
  });

  describe('Backspace', () => {
    it('removes the last digit from multi-digit input', () => {
      useCalculatorStore.getState().inputDigit('1');
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().inputDigit('3');
      useCalculatorStore.getState().backspace();

      expect(useCalculatorStore.getState().currentInput).toBe('12');
    });

    it('resets to 0 when deleting the last remaining digit', () => {
      useCalculatorStore.getState().inputDigit('9');
      useCalculatorStore.getState().backspace();

      expect(useCalculatorStore.getState().currentInput).toBe('0');
    });
  });

  describe('History Actions', () => {
    it('clears history tape', () => {
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().evaluate();
      expect(useCalculatorStore.getState().history.length).toBe(1);

      useCalculatorStore.getState().clearHistory();
      expect(useCalculatorStore.getState().history.length).toBe(0);
    });

    it('loads entry from history into current input', () => {
      const entry = {
        id: '1',
        expression: '100+200',
        result: '300',
        timestamp: Date.now(),
      };
      useCalculatorStore.getState().loadFromHistory(entry);

      expect(useCalculatorStore.getState().currentInput).toBe('300');
      expect(useCalculatorStore.getState().displayValue).toBe('300');
      expect(useCalculatorStore.getState().justEvaluated).toBe(true);
    });
  });

  describe('Error State & Recovery', () => {
    it('recovers from error state when a digit is entered', () => {
      useCalculatorStore.setState({ error: 'Cannot divide by zero', displayValue: 'Cannot divide by zero' });
      useCalculatorStore.getState().inputDigit('7');

      expect(useCalculatorStore.getState().error).toBeNull();
      expect(useCalculatorStore.getState().currentInput).toBe('7');
      expect(useCalculatorStore.getState().displayValue).toBe('7');
    });

    it('retains previousExpression when entering a digit after evaluate without error', () => {
      useCalculatorStore.setState({ justEvaluated: true, previousExpression: '10+20', error: null });
      useCalculatorStore.getState().inputDigit('3');

      expect(useCalculatorStore.getState().currentInput).toBe('3');
      expect(useCalculatorStore.getState().previousExpression).toBe('10+20');
      expect(useCalculatorStore.getState().justEvaluated).toBe(false);
    });

    it('ignores operator inputs while in error state', () => {
      useCalculatorStore.setState({ error: 'Cannot divide by zero', expression: '5+' });
      useCalculatorStore.getState().inputOperator('×');

      expect(useCalculatorStore.getState().expression).toBe('5+');
    });

    it('resets state on backspace when in error or just evaluated', () => {
      useCalculatorStore.setState({ error: 'Invalid expression', displayValue: 'Invalid' });
      useCalculatorStore.getState().backspace();
      expect(useCalculatorStore.getState().currentInput).toBe('0');
      expect(useCalculatorStore.getState().error).toBeNull();

      useCalculatorStore.setState({ justEvaluated: true, currentInput: '42' });
      useCalculatorStore.getState().backspace();
      expect(useCalculatorStore.getState().currentInput).toBe('0');
      expect(useCalculatorStore.getState().justEvaluated).toBe(false);
    });

    it('starts fresh with decimal after evaluation', () => {
      useCalculatorStore.setState({ justEvaluated: true, currentInput: '50' });
      useCalculatorStore.getState().inputDecimal();

      expect(useCalculatorStore.getState().currentInput).toBe('0.');
      expect(useCalculatorStore.getState().justEvaluated).toBe(false);
    });

    it('handles inputDecimal when currentInput is empty string', () => {
      useCalculatorStore.setState({ currentInput: '' });
      useCalculatorStore.getState().inputDecimal();
      expect(useCalculatorStore.getState().currentInput).toBe('0.');
    });
  });

  describe('Percentage (inputPercent)', () => {
    it('does nothing when input is 0 or empty', () => {
      useCalculatorStore.setState({ currentInput: '0' });
      useCalculatorStore.getState().inputPercent();
      expect(useCalculatorStore.getState().currentInput).toBe('0');

      useCalculatorStore.setState({ currentInput: '' });
      useCalculatorStore.getState().inputPercent();
      expect(useCalculatorStore.getState().currentInput).toBe('');
    });

    it('calculates standalone percentage', () => {
      useCalculatorStore.getState().inputDigit('5');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputPercent();
      expect(useCalculatorStore.getState().currentInput).toBe('0.5');
    });

    it('calculates markup percentage with addition (a + b%)', () => {
      // 100 + 20% -> 100 + 20
      useCalculatorStore.getState().inputDigit('1');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputPercent();

      expect(useCalculatorStore.getState().currentInput).toBe('20');
      expect(useCalculatorStore.getState().displayValue).toBe('20');
    });

    it('calculates discount percentage with subtraction (a - b%)', () => {
      // 200 - 10% -> 200 - 20
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputOperator('-');
      useCalculatorStore.getState().inputDigit('1');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputPercent();

      expect(useCalculatorStore.getState().currentInput).toBe('20');
    });

    it('handles markup percentage when base expression contains unclosed parentheses (auto-closing them)', () => {
      // (50+50 is unclosed before +
      useCalculatorStore.setState({ expression: '(50+50+', currentInput: '10' });
      useCalculatorStore.getState().inputPercent();
      expect(useCalculatorStore.getState().currentInput).toBe('10');
      expect(useCalculatorStore.getState().displayValue).toBe('10');
    });

    it('falls back to simple division by 100 when base expression evaluation fails or base is empty', () => {
      // 1÷0 causes division by zero error in baseExpr
      useCalculatorStore.setState({ expression: '1÷0+', currentInput: '50' });
      useCalculatorStore.getState().inputPercent();
      expect(useCalculatorStore.getState().currentInput).toBe('0.5');

      // Empty baseExpr: leading operator '+'
      useCalculatorStore.setState({ expression: '+', currentInput: '25' });
      useCalculatorStore.getState().inputPercent();
      expect(useCalculatorStore.getState().currentInput).toBe('0.25');
    });

    it('handles multiplication and division percentage (× and ÷)', () => {
      // 50 × 20% -> 50 × 0.2
      useCalculatorStore.getState().inputDigit('5');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputOperator('×');
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputPercent();

      expect(useCalculatorStore.getState().currentInput).toBe('0.2');

      // 50 ÷ 25% -> 50 ÷ 0.25
      useCalculatorStore.setState({ expression: '50÷', currentInput: '25' });
      useCalculatorStore.getState().inputPercent();
      expect(useCalculatorStore.getState().currentInput).toBe('0.25');
    });
  });

  describe('Smart Parentheses (inputParen)', () => {
    it('ignores paren input in error state', () => {
      useCalculatorStore.setState({ error: 'Error', expression: '' });
      useCalculatorStore.getState().inputParen();
      expect(useCalculatorStore.getState().expression).toBe('');
    });

    it('starts fresh with open paren after evaluate', () => {
      useCalculatorStore.setState({ justEvaluated: true });
      useCalculatorStore.getState().inputParen();

      expect(useCalculatorStore.getState().expression).toBe('(');
      expect(useCalculatorStore.getState().openParenCount).toBe(1);
      expect(useCalculatorStore.getState().justEvaluated).toBe(false);
    });

    it('inserts implicit multiplication when opening paren after typing a number', () => {
      useCalculatorStore.getState().inputDigit('5');
      useCalculatorStore.getState().inputParen();

      expect(useCalculatorStore.getState().expression).toBe('5×(');
      expect(useCalculatorStore.getState().openParenCount).toBe(1);
    });

    it('closes parenthesis when an open paren exists and input is present', () => {
      useCalculatorStore.getState().inputParen(); // '('
      useCalculatorStore.getState().inputDigit('4');
      useCalculatorStore.getState().inputParen(); // closes ')'

      expect(useCalculatorStore.getState().expression).toBe('(4)');
      expect(useCalculatorStore.getState().openParenCount).toBe(0);
    });

    it('closes nested parentheses when currentInput is empty and last character is a right parenthesis', () => {
      useCalculatorStore.setState({ expression: '((5)', currentInput: '', openParenCount: 1 });
      useCalculatorStore.getState().inputParen();

      expect(useCalculatorStore.getState().expression).toBe('((5))');
      expect(useCalculatorStore.getState().openParenCount).toBe(0);
    });
  });

  describe('Evaluation Edge Cases', () => {
    it('does nothing on evaluate if already in error state', () => {
      useCalculatorStore.setState({ error: 'Cannot divide by zero', displayValue: 'Cannot divide by zero' });
      useCalculatorStore.getState().evaluate();
      expect(useCalculatorStore.getState().error).toBe('Cannot divide by zero');
    });

    it('strips trailing operators before evaluation', () => {
      useCalculatorStore.getState().inputDigit('5');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().inputDigit('3');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().evaluate();

      expect(useCalculatorStore.getState().displayValue).toBe('8');
    });

    it('auto-closes open parentheses on evaluate', () => {
      useCalculatorStore.getState().inputParen(); // '('
      useCalculatorStore.getState().inputDigit('2');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().inputDigit('3');
      useCalculatorStore.getState().evaluate(); // auto closes with ')'

      expect(useCalculatorStore.getState().displayValue).toBe('5');
    });

    it('evaluates expression with negative current input wrapped in parentheses', () => {
      useCalculatorStore.getState().inputDigit('1');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().inputOperator('+');
      useCalculatorStore.getState().inputDigit('4');
      useCalculatorStore.getState().toggleSign(); // -4
      useCalculatorStore.getState().evaluate();

      expect(useCalculatorStore.getState().displayValue).toBe('6');
    });

    it('sets error state when evaluation fails (e.g. division by zero)', () => {
      useCalculatorStore.getState().inputDigit('9');
      useCalculatorStore.getState().inputOperator('÷');
      useCalculatorStore.getState().inputDigit('0');
      useCalculatorStore.getState().evaluate();

      expect(useCalculatorStore.getState().error).toBe('Cannot divide by zero');
      expect(useCalculatorStore.getState().displayValue).toBe('Cannot divide by zero');
      expect(useCalculatorStore.getState().justEvaluated).toBe(true);
    });

    it('does nothing when expression is empty or zero', () => {
      useCalculatorStore.setState({ expression: '', currentInput: '0' });
      useCalculatorStore.getState().evaluate();
      expect(useCalculatorStore.getState().history.length).toBe(0);
    });
  });
});
