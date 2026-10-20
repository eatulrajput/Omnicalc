import { useThemeStore } from '../themeStore';

describe('Theme Store (Zustand)', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system' });
  });

  it('initializes with "system" theme mode', () => {
    expect(useThemeStore.getState().mode).toBe('system');
  });

  it('sets theme mode explicitly', () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');

    useThemeStore.getState().setMode('light');
    expect(useThemeStore.getState().mode).toBe('light');
  });

  it('cycles through system -> light -> dark -> system', () => {
    expect(useThemeStore.getState().mode).toBe('system');

    useThemeStore.getState().cycleMode();
    expect(useThemeStore.getState().mode).toBe('light');

    useThemeStore.getState().cycleMode();
    expect(useThemeStore.getState().mode).toBe('dark');

    useThemeStore.getState().cycleMode();
    expect(useThemeStore.getState().mode).toBe('system');
  });
});
