import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeStorage } from '../storage';

describe('safeStorage', () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await safeStorage.removeItem('test-key');
  });

  describe('Standard operations with AsyncStorage', () => {
    it('sets and gets an item via AsyncStorage', async () => {
      await safeStorage.setItem('key1', 'value1');
      const val = await safeStorage.getItem('key1');
      expect(val).toBe('value1');
    });

    it('removes an item via AsyncStorage', async () => {
      await safeStorage.setItem('key2', 'value2');
      await safeStorage.removeItem('key2');
      const val = await safeStorage.getItem('key2');
      expect(val).toBeNull();
    });
  });

  describe('Fallback to in-memory store when AsyncStorage fails', () => {
    it('falls back to in-memory store when AsyncStorage.setItem throws', async () => {
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage failure'));

      await expect(safeStorage.setItem('fallback-key', 'memory-val')).resolves.not.toThrow();
    });

    it('falls back to in-memory store when AsyncStorage.getItem throws', async () => {
      // First save into memory via failing setItem
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Set failure'));
      await safeStorage.setItem('fallback-key-2', 'stored-in-memory');

      // Then fail getItem
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Get failure'));
      const val = await safeStorage.getItem('fallback-key-2');
      expect(val).toBe('stored-in-memory');
    });

    it('returns null when AsyncStorage.getItem throws and key is not in in-memory store', async () => {
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Get failure'));
      const val = await safeStorage.getItem('nonexistent-key');
      expect(val).toBeNull();
    });

    it('handles errors gracefully in removeItem and removes from in-memory store', async () => {
      // Save in memory
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Set failure'));
      await safeStorage.setItem('fallback-key-3', 'val3');

      // Fail removeItem
      jest.spyOn(AsyncStorage, 'removeItem').mockRejectedValueOnce(new Error('Remove failure'));
      await expect(safeStorage.removeItem('fallback-key-3')).resolves.not.toThrow();

      // Ensure it was removed from in-memory store
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('Get failure'));
      const val = await safeStorage.getItem('fallback-key-3');
      expect(val).toBeNull();
    });
  });
});
