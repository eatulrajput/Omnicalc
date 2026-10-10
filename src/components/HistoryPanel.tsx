import React from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
import { useCalculatorStore } from '../store/calculatorStore';
import { formatExpression, formatDisplayNumber } from '../utils/formatting';
import type { HistoryEntry } from '../engine';
import Ionicons from '@react-native-vector-icons/ionicons';

interface HistoryPanelProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Slide-up modal displaying the calculation history tape.
 * Tapping an item loads its result into the calculator.
 */
export function HistoryPanel({ visible, onClose }: HistoryPanelProps) {
  const { colors } = useTheme();
  const history = useCalculatorStore((s) => s.history);
  const clearHistory = useCalculatorStore((s) => s.clearHistory);
  const loadFromHistory = useCalculatorStore((s) => s.loadFromHistory);

  const handleItemPress = (entry: HistoryEntry) => {
    loadFromHistory(entry);
    onClose();
  };

  const renderItem = ({ item }: { item: HistoryEntry }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: colors.historyItem }]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.historyExpression, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {formatExpression(item.expression)}
      </Text>
      <Text
        style={[styles.historyResult, { color: colors.textPrimary }]}
        numberOfLines={1}
      >
        = {formatDisplayNumber(item.result)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: colors.historyBg }]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              History
            </Text>

            <View style={styles.headerActions}>
              {history.length > 0 && (
                <TouchableOpacity
                  onPress={clearHistory}
                  style={styles.clearBtn}
                >
                  <Text style={[styles.clearText, { color: colors.error }]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={[styles.closeText, { color: colors.accent }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List or empty state */}
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={56} color={colors.textSecondary} style={styles.emptyIcon} />
              <Text
                style={[styles.emptyTitle, { color: colors.textSecondary }]}
              >
                No calculations yet
              </Text>
              <Text
                style={[styles.emptySub, { color: colors.textSecondary }]}
              >
                Your calculation history will appear here
              </Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, paddingTop: 60 },
  container: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  clearBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  clearText: { fontSize: 16, fontWeight: '500' },
  closeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  closeText: { fontSize: 16, fontWeight: '600' },
  listContent: { padding: 16, gap: 8 },
  historyItem: { borderRadius: 12, padding: 16 },
  historyExpression: { fontSize: 14, marginBottom: 4 },
  historyResult: { fontSize: 22, fontWeight: '500' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyIcon: { marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '500', marginBottom: 8 },
  emptySub: { fontSize: 14 },
});
