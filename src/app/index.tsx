import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Ionicons from '@react-native-vector-icons/ionicons';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Display } from '@/components/Display';
import { Keypad } from '@/components/Keypad';
import { HistoryPanel } from '@/components/HistoryPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeSelectorModal } from '@/components/ThemeSelectorModal';
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
  const router = useRouter();
  const { colors } = useTheme();
  const [historyVisible, setHistoryVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [themeSelectorVisible, setThemeSelectorVisible] = useState(false);

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
            <Ionicons name="time-outline" size={24} color={colors.textSecondary} style={styles.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => setMenuVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color={colors.textSecondary} style={styles.icon} />
          </TouchableOpacity>

          <Modal
            visible={menuVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
              <View style={[styles.dropdownMenu, { backgroundColor: colors.background }]}>
                <TouchableOpacity style={styles.menuItem} onPress={() => {
                  setMenuVisible(false);
                  router.push('/settings');
                }}>
                  <Text style={[styles.menuText, { color: colors.textPrimary }]}>Settings</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => {
                  setMenuVisible(false);
                  setThemeSelectorVisible(true);
                }}>
                  <Text style={[styles.menuText, { color: colors.textPrimary }]}>Theme Mode</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>

          <ThemeSelectorModal 
            visible={themeSelectorVisible} 
            onClose={() => setThemeSelectorVisible(false)} 
          />
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

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dropdownMenu: {
    marginTop: 60,
    marginRight: 20,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(150,150,150,0.3)',
    marginHorizontal: 16,
  },
});
