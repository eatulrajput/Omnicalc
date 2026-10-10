import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';
import * as Haptics from 'expo-haptics';
import Ionicons from '@react-native-vector-icons/ionicons';

interface ThemeSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

const themeOptions: { label: string; value: ThemeMode; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { label: 'Light', value: 'light', icon: 'sunny' },
  { label: 'Dark', value: 'dark', icon: 'moon' },
  { label: 'System Default', value: 'system', icon: 'settings-outline' },
];

export function ThemeSelectorModal({ visible, onClose }: ThemeSelectorModalProps) {
  const { colors } = useTheme();
  const { mode, setMode } = useThemeStore();

  const handleSelect = (selectedMode: ThemeMode) => {
    Haptics.selectionAsync();
    setMode(selectedMode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.dialog, { backgroundColor: colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>Choose Theme</Text>
          
          {themeOptions.map((option) => {
            const isSelected = mode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionRow,
                  isSelected && { backgroundColor: colors.background }
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <Ionicons name={option.icon} size={20} color={isSelected ? colors.accent : colors.textPrimary} style={styles.icon} />
                <Text style={[
                  styles.optionText, 
                  { color: isSelected ? colors.accent : colors.textPrimary },
                  isSelected && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
  },
  optionTextSelected: {
    fontWeight: '600',
  }
});
