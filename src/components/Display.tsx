import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';
import { useCalculatorStore } from '../store/calculatorStore';
import { calculate } from '../engine';
import {
  formatDisplayNumber,
  formatExpression,
  calculateFontSize,
} from '../utils/formatting';

/**
 * Calculator display area.
 *
 * - Primary line (top):  the expression being built or the last evaluated expression.
 * - Secondary line (bottom): the live preview or current result, with auto-scaling font.
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
  const openParenCount = useCalculatorStore((s) => s.openParenCount);

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

  // ── Build expression text for primary display ──────────
  let expressionText = '';
  let fullExpression = '';
  if (justEvaluated && previousExpression) {
    expressionText = formatExpression(previousExpression);
  } else if (expression || currentInput) {
    let full = expression;
    if (currentInput) {
      full +=
        currentInput.startsWith('-') && expression
          ? `(${currentInput})`
          : currentInput;
    }
    expressionText = formatExpression(full);
    fullExpression = full;
  }

  // ── Live preview logic ──────────────────────────────────
  let previewText = '';
  if (justEvaluated) {
    previewText = error ? displayValue : formatDisplayNumber(displayValue);
  } else if (fullExpression) {
    // Auto-close any open parentheses for preview
    let safeExpr = fullExpression;
    for (let i = 0; i < openParenCount; i++) {
      safeExpr += ')';
    }
    // Strip trailing operator for preview
    safeExpr = safeExpr.replace(/[+\-×÷]+$/, '');

    if (safeExpr) {
      const result = calculate(safeExpr);
      if (!result.error) {
        previewText = formatDisplayNumber(result.value);
      } else {
        previewText = '';
      }
    }
  }

  const formattedDisplay = error ? displayValue : previewText;
  const largeTextForSizing = justEvaluated
    ? formattedDisplay
    : expressionText || '0';
  const fontSize = calculateFontSize(largeTextForSizing);

  // ── Animated Styles ──────────────────────────────────────
  const topStyle = useAnimatedStyle(() => {
    return {
      fontSize: withTiming(justEvaluated ? 32 : fontSize, { duration: 300 }),
      color: withTiming(
        justEvaluated
          ? colors.textSecondary
          : error
            ? colors.error
            : colors.textPrimary,
        { duration: 300 }
      ),
      opacity: withTiming(justEvaluated ? 0.85 : 1, { duration: 300 }),
    };
  }, [justEvaluated, fontSize, error, colors]);

  const bottomStyle = useAnimatedStyle(() => {
    return {
      fontSize: withTiming(justEvaluated ? fontSize : 32, { duration: 300 }),
      color: withTiming(
        justEvaluated
          ? error
            ? colors.error
            : colors.textPrimary
          : colors.textSecondary,
        { duration: 300 }
      ),
      opacity: withTiming(justEvaluated ? 1 : 0.85, { duration: 300 }),
    };
  }, [justEvaluated, fontSize, error, colors]);

  return (
    <View
      {...panResponder.panHandlers}
      style={[styles.container, { backgroundColor: colors.displayBg }]}
    >
      {/* Top text (Expression) */}
      <Animated.Text
        style={[styles.topTextLayout, styles.baseTypography, topStyle]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.3}
      >
        {expressionText || (justEvaluated ? ' ' : '0')}
      </Animated.Text>

      {/* Bottom text (Result/Preview) */}
      <Animated.Text
        style={[styles.baseTypography, bottomStyle]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.3}
      >
        {formattedDisplay}
      </Animated.Text>
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
  topTextLayout: {
    marginBottom: 12,
  },
  baseTypography: {
    fontWeight: '300',
    textAlign: 'right',
    alignSelf: 'stretch',
    letterSpacing: 0.5,
  },
});
