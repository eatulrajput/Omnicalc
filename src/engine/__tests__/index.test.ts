import * as Engine from '../index';

describe('Engine index barrel exports', () => {
  it('exports and executes core engine functions and enums', () => {
    expect(Engine.calculate('2 + 2')).toEqual({ value: '4' });
    const tokens = Engine.tokenize('3 × 3');
    expect(tokens.length).toBe(3);
    const ast = Engine.parse(tokens);
    expect(Engine.evaluate(ast).toString()).toBe('9');
    expect(Engine.CalculationError.DIVIDE_BY_ZERO).toBe('Cannot divide by zero');
    expect(Engine.TokenType.NUMBER).toBe('NUMBER');
  });
});

