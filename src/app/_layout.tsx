import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme/useTheme';

/**
 * Root layout — hides the header and syncs the status bar
 * style with the active theme.
 */
export default function RootLayout() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    </>
  );
}
