import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Display } from '@/components/Display';
import { Keypad } from '@/components/Keypad';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/theme/useTheme';

/**
 * Main calculator screen.
 *
 * Layout (top → bottom):
 *   Toolbar (theme toggle + history button)
 *   Display (expression + result, flex: 1)
 *   Keypad  (5 × 4 grid, auto height)
 */
export default function CalculatorScreen() {
  const { colors } = useTheme();
  const [historyVisible, setHistoryVisible] = useState(false);

  const handleHistoryPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHistoryVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ErrorBoundary>
        {/* ── Toolbar ───────────────────────────────────────── */}
        <View style={styles.toolbar}>
          <ThemeToggle />
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={handleHistoryPress}
            activeOpacity={0.7}
          >
            <Text style={styles.historyIcon}>🕐</Text>
          </TouchableOpacity>
        </View>

        {/* ── Display ───────────────────────────────────────── */}
        <Display />

        {/* ── Keypad ────────────────────────────────────────── */}
        <Keypad />

        {/* ── History modal ─────────────────────────────────── */}
        <HistoryPanel
          visible={historyVisible}
          onClose={() => setHistoryVisible(false)}
        />
      </ErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIcon: { fontSize: 20 },
});
