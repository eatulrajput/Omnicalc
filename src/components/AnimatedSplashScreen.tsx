import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

const SPLASH_IMAGE = require('../../assets/images/splash-screen.png');

interface Props {
  isAppReady: boolean;
  onAnimationComplete: () => void;
}

export function AnimatedSplashScreen({ isAppReady, onAnimationComplete }: Props) {
  const containerOpacity = useSharedValue(1);
  const logoScale = useSharedValue(1);
  const logoOpacity = useSharedValue(1);

  useEffect(() => {
    if (isAppReady) {
      // Hide the native splash screen as our animated one is now visible on top
      SplashScreen.hideAsync().then(() => {
        // Run animation
        // 1. Pop the logo slightly using spring
        // 2. Scale up and fade out
        logoScale.value = withSequence(
          withSpring(0.9, { damping: 10, stiffness: 100 }),
          withTiming(1.8, { duration: 400, easing: Easing.in(Easing.ease) })
        );

        logoOpacity.value = withDelay(
          250,
          withTiming(0, { duration: 250 })
        );

        containerOpacity.value = withDelay(
          350,
          withTiming(0, { duration: 300 }, (finished) => {
            if (finished) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
      }).catch((e) => {
        // Fallback in case hideAsync fails for some reason
        console.warn("Error hiding splash screen:", e);
        runOnJS(onAnimationComplete)();
      });
    }
  }, [isAppReady]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      <Animated.Image
        source={SPLASH_IMAGE}
        style={[styles.logo, logoStyle]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F4F0E6', // Matches the background color in app.json
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  logo: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
  },
});
