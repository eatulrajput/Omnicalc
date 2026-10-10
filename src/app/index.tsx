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
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleHistoryPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, { color: colors.textSecondary }]}>↺</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Text style={[styles.icon, { color: colors.textSecondary }]}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* ── Display ───────────────────────────────────────── */}
        <Display />

        {/* ── Chevron Toggle ─────────────────────────────────── */}
        <View style={styles.chevronContainer}>
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>
            {'< >'} 
          </Text>
        </View>

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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    fontWeight: '300',
  },
  chevronContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'flex-start',
  },
  chevron: {
    fontSize: 20,
    transform: [{ rotate: '90deg' }],
  },
});
