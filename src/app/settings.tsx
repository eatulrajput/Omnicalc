import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/theme/useTheme';
import { useThemeStore, type ThemeMode } from '@/store/themeStore';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

const themeOptions: { label: string; value: ThemeMode; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { label: 'Light', value: 'light', icon: 'sunny' },
  { label: 'Dark', value: 'dark', icon: 'moon' },
  { label: 'System Default', value: 'system', icon: 'settings-outline' },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { mode, setMode } = useThemeStore();

  const handleSelect = (selectedMode: ThemeMode) => {
    Haptics.selectionAsync();
    setMode(selectedMode);
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true, 
          title: 'Settings',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
        }} 
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {themeOptions.map((option, index) => {
              const isSelected = mode === option.value;
              const isLast = index === themeOptions.length - 1;
              
              return (
                <View key={option.value}>
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => handleSelect(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <Ionicons 
                        name={option.icon} 
                        size={22} 
                        color={isSelected ? colors.accent : colors.textPrimary} 
                        style={styles.icon} 
                      />
                      <Text style={[
                        styles.optionText, 
                        { color: isSelected ? colors.accent : colors.textPrimary },
                        isSelected && styles.optionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                    
                    {isSelected && (
                      <Ionicons name="checkmark" size={24} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                  
                  {!isLast && (
                    <View style={[styles.divider, { backgroundColor: colors.background }]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ABOUT</Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Ionicons 
                  name="information-circle-outline" 
                  size={22} 
                  color={colors.textPrimary} 
                  style={styles.icon} 
                />
                <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                  App Version
                </Text>
              </View>
              <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                {Constants.expoConfig?.version || '1.0.0'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 50,
  },
  versionText: {
    fontSize: 16,
  }
});
