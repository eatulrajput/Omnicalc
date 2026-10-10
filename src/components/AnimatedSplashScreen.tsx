import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  withSequence,
  withSpring,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

const SPLASH_IMAGE = require('../../assets/images/splash-screen.png');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  isAppReady: boolean;
  onAnimationComplete: () => void;
}

export function AnimatedSplashScreen({ isAppReady, onAnimationComplete }: Props) {
  // ── Background gradient orbs ──
  const orbProgress = useSharedValue(0);
  const orbFloat = useSharedValue(0);

  // ── Abstract particle dots ──
  const particlesOpacity = useSharedValue(0);
  const particlesFloat = useSharedValue(0);

  // ── Logo ──
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const logoGlowScale = useSharedValue(0);
  const logoGlowOpacity = useSharedValue(0);

  // ── Shimmer across logo ──
  const shimmerX = useSharedValue(-SCREEN_WIDTH);

  // ── Container exit ──
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync()
        .then(() => {
          // ════════════════ ENTRANCE ════════════════

          // 1. Gradient orbs bloom in (0ms)
          orbProgress.value = withTiming(1, {
            duration: 1000,
            easing: Easing.out(Easing.cubic),
          });

          // Floating motion for orbs
          orbFloat.value = withRepeat(
            withSequence(
              withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
          );

          // 2. Particle dots appear (300ms)
          particlesOpacity.value = withDelay(
            300,
            withTiming(1, { duration: 800 })
          );
          particlesFloat.value = withRepeat(
            withSequence(
              withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
          );

          // 3. Glow behind logo (200ms)
          logoGlowScale.value = withDelay(
            200,
            withSpring(1, { damping: 12, stiffness: 60 })
          );
          logoGlowOpacity.value = withDelay(
            200,
            withSequence(
              withTiming(0.7, { duration: 500 }),
              withRepeat(
                withSequence(
                  withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                  withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                true
              )
            )
          );

          // 4. Logo bounces in (300ms)
          logoOpacity.value = withDelay(
            300,
            withTiming(1, { duration: 500 })
          );
          logoScale.value = withDelay(
            300,
            withSpring(1, { damping: 8, stiffness: 80, mass: 0.9 })
          );

          // 5. Shimmer sweep (800ms)
          shimmerX.value = withDelay(
            800,
            withTiming(SCREEN_WIDTH, {
              duration: 900,
              easing: Easing.inOut(Easing.ease),
            })
          );

          // ════════════════ EXIT (at ~1800ms) ════════════════

          // Logo pops slightly then scales up + fades
          logoScale.value = withDelay(
            300,
            withSequence(
              // spring in
              withSpring(1, { damping: 8, stiffness: 80, mass: 0.9 }),
              // hold
              withDelay(900, withSequence(
                // pop
                withSpring(0.92, { damping: 10, stiffness: 200 }),
                // expand + fade
                withTiming(1.6, { duration: 350, easing: Easing.in(Easing.ease) })
              ))
            )
          );
          logoOpacity.value = withDelay(
            300,
            withSequence(
              withTiming(1, { duration: 500 }),
              withDelay(1150, withTiming(0, { duration: 250 }))
            )
          );

          // Fade glow out
          logoGlowScale.value = withDelay(
            2000,
            withTiming(2, { duration: 400 })
          );

          // Fade container out
          containerOpacity.value = withDelay(
            2100,
            withTiming(0, { duration: 350 }, (finished) => {
              if (finished) {
                runOnJS(onAnimationComplete)();
              }
            })
          );
        })
        .catch((e) => {
          console.warn('Error hiding splash screen:', e);
          runOnJS(onAnimationComplete)();
        });
    }
  }, [isAppReady]);

  // ═══════════════════════ ANIMATED STYLES ═══════════════════════

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  // ── Gradient orb styles ──
  const orb1Style = useAnimatedStyle(() => ({
    opacity: interpolate(orbProgress.value, [0, 1], [0, 0.6]),
    transform: [
      { translateX: interpolate(orbFloat.value, [0, 1], [-20, 20]) },
      { translateY: interpolate(orbFloat.value, [0, 1], [-15, 15]) },
      { scale: interpolate(orbProgress.value, [0, 1], [0.3, 1]) },
    ],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    opacity: interpolate(orbProgress.value, [0, 1], [0, 0.45]),
    transform: [
      { translateX: interpolate(orbFloat.value, [0, 1], [15, -25]) },
      { translateY: interpolate(orbFloat.value, [0, 1], [10, -20]) },
      { scale: interpolate(orbProgress.value, [0, 1], [0.4, 1]) },
    ],
  }));

  const orb3Style = useAnimatedStyle(() => ({
    opacity: interpolate(orbProgress.value, [0, 1], [0, 0.35]),
    transform: [
      { translateX: interpolate(orbFloat.value, [0, 1], [10, -10]) },
      { translateY: interpolate(orbFloat.value, [0, 1], [20, -5]) },
      { scale: interpolate(orbProgress.value, [0, 1], [0.5, 1.1]) },
    ],
  }));

  // ── Floating particle styles ──
  const particleGroupStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value * 0.5,
  }));
  const particle1Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particlesFloat.value, [0, 1], [0, -30]) },
      { translateX: interpolate(particlesFloat.value, [0, 1], [0, 12]) },
    ],
  }));
  const particle2Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particlesFloat.value, [0, 1], [0, 20]) },
      { translateX: interpolate(particlesFloat.value, [0, 1], [0, -18]) },
    ],
  }));
  const particle3Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particlesFloat.value, [0, 1], [0, -15]) },
      { translateX: interpolate(particlesFloat.value, [0, 1], [0, 22]) },
    ],
  }));
  const particle4Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particlesFloat.value, [0, 1], [0, 25]) },
      { translateX: interpolate(particlesFloat.value, [0, 1], [0, -8]) },
    ],
  }));
  const particle5Style = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(particlesFloat.value, [0, 1], [0, -22]) },
      { translateX: interpolate(particlesFloat.value, [0, 1], [0, -15]) },
    ],
  }));

  // ── Glow behind logo ──
  const glowStyle = useAnimatedStyle(() => ({
    opacity: logoGlowOpacity.value,
    transform: [{ scale: logoGlowScale.value }],
  }));

  // ── Logo ──
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  // ── Shimmer ──
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      {/* ── Base background matching app.json splash color ── */}
      <View style={styles.base} />

      {/* ── Abstract gradient orbs ── */}
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
      <Animated.View style={[styles.orb, styles.orb3, orb3Style]} />

      {/* ── Floating particles ── */}
      <Animated.View style={[styles.particleGroup, particleGroupStyle]}>
        <Animated.View style={[styles.particle, styles.p1, particle1Style]} />
        <Animated.View style={[styles.particle, styles.p2, particle2Style]} />
        <Animated.View style={[styles.particle, styles.p3, particle3Style]} />
        <Animated.View style={[styles.particle, styles.p4, particle4Style]} />
        <Animated.View style={[styles.particle, styles.p5, particle5Style]} />
      </Animated.View>

      {/* ── Soft glow behind logo ── */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* ── Logo ── */}
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Animated.Image source={SPLASH_IMAGE} style={styles.logoImage} />
        {/* Shimmer overlay */}
        <Animated.View style={[styles.shimmerOverlay]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

// ═══════════════════════ CONSTANTS & STYLES ═══════════════════════

const LOGO_SIZE = 280;
const GLOW_SIZE = LOGO_SIZE * 1.8;
const ORB_BASE = SCREEN_WIDTH * 1.1;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
    overflow: 'hidden',
    backgroundColor: '#F4F0E6',
  },

  // Matches the native splash background from app.json
  base: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F4F0E6',
  },

  // ── Gradient orbs: large soft circles that create an abstract gradient ──
  orb: {
    position: 'absolute',
  },
  orb1: {
    // Warm amber / yellow accent — top-left area
    width: ORB_BASE,
    height: ORB_BASE,
    borderRadius: ORB_BASE / 2,
    backgroundColor: 'rgba(235, 221, 44, 0.18)',
    top: -ORB_BASE * 0.35,
    left: -ORB_BASE * 0.3,
  },
  orb2: {
    // Soft sage / olive — bottom-right area
    width: ORB_BASE * 0.85,
    height: ORB_BASE * 0.85,
    borderRadius: (ORB_BASE * 0.85) / 2,
    backgroundColor: 'rgba(183, 194, 155, 0.2)',
    bottom: -ORB_BASE * 0.25,
    right: -ORB_BASE * 0.25,
  },
  orb3: {
    // Warm peach / cream — center-bottom area
    width: ORB_BASE * 0.7,
    height: ORB_BASE * 0.7,
    borderRadius: (ORB_BASE * 0.7) / 2,
    backgroundColor: 'rgba(227, 198, 155, 0.15)',
    bottom: SCREEN_HEIGHT * 0.15,
    left: SCREEN_WIDTH * 0.1,
  },

  // ── Floating decorative particles ──
  particleGroup: {
    ...StyleSheet.absoluteFill,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(235, 221, 44, 0.35)',
  },
  p1: { width: 6, height: 6, top: '18%', left: '22%' },
  p2: { width: 4, height: 4, top: '30%', right: '18%' },
  p3: { width: 5, height: 5, top: '65%', left: '15%' },
  p4: { width: 3, height: 3, top: '72%', right: '25%' },
  p5: { width: 7, height: 7, top: '45%', right: '12%' },

  // ── Soft glow behind logo ──
  glow: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    backgroundColor: 'rgba(235, 221, 44, 0.08)',
  },

  // ── Logo ──
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    resizeMode: 'contain',
  },

  // ── Shimmer sweep across logo ──
  shimmerOverlay: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    borderRadius: 8,
  },
  shimmer: {
    position: 'absolute',
    top: -20,
    width: 50,
    height: LOGO_SIZE + 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ rotate: '15deg' }],
  },
});
