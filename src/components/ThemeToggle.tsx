import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, type ThemeMode } from '../store/themeStore';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/useTheme';

const modeIcons: Record<ThemeMode, React.ComponentProps<typeof Ionicons>['name']> = {
  light: 'sunny',
  dark: 'moon',
  system: 'settings-outline',
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

  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name={modeIcons[mode]} size={20} color={colors.textPrimary} style={styles.icon} />
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
