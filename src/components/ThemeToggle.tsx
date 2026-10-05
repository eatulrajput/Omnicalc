import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, type ThemeMode } from '../store/themeStore';

const modeIcons: Record<ThemeMode, string> = {
  light: '☀️',
  dark: '🌙',
  system: '⚙️',
};

/**
 * Small icon button that cycles through light → dark → system themes.
 */
export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode);
  const cycleMode = useThemeStore((s) => s.cycleMode);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cycleMode();
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{modeIcons[mode]}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 20 },
});
