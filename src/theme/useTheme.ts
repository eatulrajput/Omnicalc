import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { darkTheme, lightTheme, type ThemeColors } from './colors';

/**
 * Resolves the active color palette based on the user's stored
 * preference and the device's system appearance.
 */
export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const mode = useThemeStore((s) => s.mode);
  const systemScheme = useColorScheme();

  const isDark =
    mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  return {
    colors: isDark ? darkTheme : lightTheme,
    isDark,
  };
}
