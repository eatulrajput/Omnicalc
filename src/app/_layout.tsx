import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme/useTheme';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';

// Prevent the native splash screen from auto-hiding until our custom one is ready
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some errors */
});

/**
 * Root layout — hides the header and syncs the status bar
 * style with the active theme.
 */
export default function RootLayout() {
  const { isDark } = useTheme();
  const [appReady, setAppReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);

  useEffect(() => {
    // Perform any necessary asset loading/initialization here
    // For now we just mark the app as ready
    setAppReady(true);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      
      {!splashAnimationFinished && (
        <AnimatedSplashScreen 
          isAppReady={appReady}
          onAnimationComplete={() => setSplashAnimationFinished(true)} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
