import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/useTheme';

type ButtonVariant = 'number' | 'operator' | 'function' | 'equals';

interface CalcButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = { damping: 15, stiffness: 400 };

/**
 * Individual calculator button with:
 * - Variant-based styling (number / operator / function / equals)
 * - Scale-down press animation via Reanimated
 * - Haptic feedback on tap
 */
export function CalcButton({
  label,
  onPress,
  variant = 'number',
  size,
}: CalcButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  const handlePress = () => {
    const style =
      variant === 'equals'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : variant === 'operator'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;

    Haptics.impactAsync(style);
    onPress();
  };

  // Resolve colours from the theme
  const bgColor: Record<ButtonVariant, string> = {
    number: colors.numberButton,
    operator: colors.operatorButton,
    function: colors.functionButton,
    equals: colors.equalsButton,
  };

  const textColor: Record<ButtonVariant, string> = {
    number: colors.textPrimary,
    operator: colors.textOnOperator,
    function: colors.textOnFunction,
    equals: colors.textOnEquals,
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        styles.button,
        {
          width: size,
          height: size,
          backgroundColor: bgColor[variant],
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: textColor[variant],
            fontSize: variant === 'function' ? size * 0.35 : size * 0.4,
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '300',
  },
});
