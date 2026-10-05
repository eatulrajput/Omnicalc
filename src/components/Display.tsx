import React, { useRef } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';
import { useCalculatorStore } from '../store/calculatorStore';
import {
  formatDisplayNumber,
  formatExpression,
  calculateFontSize,
} from '../utils/formatting';

/**
 * Calculator display area.
 *
 * - Secondary line (top):  the expression being built or the last evaluated expression.
 * - Primary line (bottom): the current number or result, with auto-scaling font.
 *
 * Swipe left on the display to backspace.
 */
export function Display() {
  const { colors } = useTheme();

  const expression = useCalculatorStore((s) => s.expression);
  const currentInput = useCalculatorStore((s) => s.currentInput);
  const displayValue = useCalculatorStore((s) => s.displayValue);
  const previousExpression = useCalculatorStore((s) => s.previousExpression);
  const justEvaluated = useCalculatorStore((s) => s.justEvaluated);
  const error = useCalculatorStore((s) => s.error);
  const backspace = useCalculatorStore((s) => s.backspace);

  // ── Swipe-left to backspace ──────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 30 && Math.abs(gs.dy) < 30,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -50) {
          backspace();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
    }),
  ).current;

  // ── Build expression text for secondary display ──────────
  let expressionText = '';
  if (justEvaluated && previousExpression) {
    expressionText = formatExpression(previousExpression) + ' =';
  } else if (expression) {
    let full = expression;
    if (currentInput) {
      full +=
        currentInput.startsWith('-') && expression
          ? `(${currentInput})`
          : currentInput;
    }
    expressionText = formatExpression(full);
  }

  // ── Format primary display ───────────────────────────────
  const formattedDisplay = error
    ? displayValue
    : formatDisplayNumber(displayValue);
  const fontSize = calculateFontSize(formattedDisplay);

  return (
    <View
      {...panResponder.panHandlers}
      style={[styles.container, { backgroundColor: colors.displayBg }]}
    >
      {/* Expression line */}
      <Text
        style={[styles.expression, { color: colors.textSecondary }]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {expressionText || ' '}
      </Text>

      {/* Main display */}
      <Text
        style={[
          styles.display,
          {
            color: error ? colors.error : colors.textPrimary,
            fontSize,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.3}
      >
        {formattedDisplay}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
  },
  expression: {
    fontSize: 22,
    fontWeight: '300',
    textAlign: 'right',
    alignSelf: 'stretch',
    marginBottom: 12,
    letterSpacing: 1,
    opacity: 0.85,
  },
  display: {
    fontSize: 56,
    fontWeight: '200',
    textAlign: 'right',
    alignSelf: 'stretch',
    letterSpacing: 0.5,
  },
});
