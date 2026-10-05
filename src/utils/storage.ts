import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

const inMemoryStore = new Map<string, string>();

/**
 * Safe storage engine for Zustand persistence.
 * Tries AsyncStorage; if the native module is null or throws an error (e.g. in Expo Go environment),
 * silently falls back to an in-memory Map so the application never crashes on state updates.
 */
export const safeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(name);
      return value;
    } catch {
      return inMemoryStore.get(name) ?? null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
      inMemoryStore.set(name, value);
    } catch {
      inMemoryStore.set(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
      inMemoryStore.delete(name);
    } catch {
      inMemoryStore.delete(name);
    }
  },
};
