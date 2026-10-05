import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { CalcButton } from './Button';
import { useCalculatorStore } from '../store/calculatorStore';

const GAP = 12;
const PADDING_H = 16;
const COLUMNS = 4;

/**
 * 5 × 4 calculator keypad grid.
 *
 * Row 1:  C/(AC)  ( )   %   ÷
 * Row 2:  7       8     9   ×
 * Row 3:  4       5     6   −
 * Row 4:  1       2     3   +
 * Row 5:  ±       0     .   =
 */
export function Keypad() {
  const { width } = useWindowDimensions();
  const buttonSize = (width - PADDING_H * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  // Pull only the primitive values needed for rendering
  const currentInput = useCalculatorStore((s) => s.currentInput);
  const justEvaluated = useCalculatorStore((s) => s.justEvaluated);
  const error = useCalculatorStore((s) => s.error);

  // Pull stable action references
  const inputDigit = useCalculatorStore((s) => s.inputDigit);
  const inputDecimal = useCalculatorStore((s) => s.inputDecimal);
  const inputOperator = useCalculatorStore((s) => s.inputOperator);
  const inputPercent = useCalculatorStore((s) => s.inputPercent);
  const inputParen = useCalculatorStore((s) => s.inputParen);
  const toggleSign = useCalculatorStore((s) => s.toggleSign);
  const evaluate = useCalculatorStore((s) => s.evaluate);
  const clear = useCalculatorStore((s) => s.clear);

  // Determine whether the clear button shows "C" or "AC"
  const clearLabel =
    currentInput !== '0' && currentInput !== '' && !justEvaluated && !error
      ? 'C'
      : 'AC';

  type Variant = 'number' | 'operator' | 'function' | 'equals';

  interface BtnDef {
    label: string;
    onPress: () => void;
    variant: Variant;
  }

  const rows: BtnDef[][] = [
    [
      { label: clearLabel, onPress: clear, variant: 'function' },
      { label: '( )', onPress: inputParen, variant: 'function' },
      { label: '%', onPress: inputPercent, variant: 'function' },
      { label: '÷', onPress: () => inputOperator('÷'), variant: 'operator' },
    ],
    [
      { label: '7', onPress: () => inputDigit('7'), variant: 'number' },
      { label: '8', onPress: () => inputDigit('8'), variant: 'number' },
      { label: '9', onPress: () => inputDigit('9'), variant: 'number' },
      { label: '×', onPress: () => inputOperator('×'), variant: 'operator' },
    ],
    [
      { label: '4', onPress: () => inputDigit('4'), variant: 'number' },
      { label: '5', onPress: () => inputDigit('5'), variant: 'number' },
      { label: '6', onPress: () => inputDigit('6'), variant: 'number' },
      { label: '−', onPress: () => inputOperator('-'), variant: 'operator' },
    ],
    [
      { label: '1', onPress: () => inputDigit('1'), variant: 'number' },
      { label: '2', onPress: () => inputDigit('2'), variant: 'number' },
      { label: '3', onPress: () => inputDigit('3'), variant: 'number' },
      { label: '+', onPress: () => inputOperator('+'), variant: 'operator' },
    ],
    [
      { label: '±', onPress: toggleSign, variant: 'function' },
      { label: '0', onPress: () => inputDigit('0'), variant: 'number' },
      { label: '.', onPress: inputDecimal, variant: 'number' },
      { label: '=', onPress: evaluate, variant: 'equals' },
    ],
  ];

  return (
    <View style={styles.container}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((btn, bi) => (
            <CalcButton
              key={bi}
              label={btn.label}
              onPress={btn.onPress}
              variant={btn.variant}
              size={buttonSize}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING_H,
    paddingBottom: 16,
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
