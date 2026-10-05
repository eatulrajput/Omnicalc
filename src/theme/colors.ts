/**
 * Theme colour palettes for Omnicalc.
 *
 * Dark theme uses OLED-friendly pure black with warm amber accents.
 * Light theme uses soft grays with the same amber accent family.
 */

export interface ThemeColors {
  background: string;
  surface: string;
  displayBg: string;
  numberButton: string;
  operatorButton: string;
  functionButton: string;
  equalsButton: string;
  textPrimary: string;
  textSecondary: string;
  textOnOperator: string;
  textOnFunction: string;
  textOnEquals: string;
  error: string;
  accent: string;
  historyBg: string;
  historyItem: string;
  border: string;
  shadow: string;
}

export const darkTheme: ThemeColors = {
  background: '#000000',
  surface: '#1C1C1E',
  displayBg: '#000000',
  numberButton: '#2A2A2E',
  operatorButton: '#FF9F0A',
  functionButton: '#636366',
  equalsButton: '#FF9F0A',
  textPrimary: '#FFFFFF',
  textSecondary: '#98989D',
  textOnOperator: '#FFFFFF',
  textOnFunction: '#FFFFFF',
  textOnEquals: '#FFFFFF',
  error: '#FF453A',
  accent: '#FF9F0A',
  historyBg: '#1C1C1E',
  historyItem: '#2C2C2E',
  border: '#38383A',
  shadow: 'rgba(0,0,0,0.4)',
};

export const lightTheme: ThemeColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  displayBg: '#F2F2F7',
  numberButton: '#FFFFFF',
  operatorButton: '#FF9F0A',
  functionButton: '#D1D1D6',
  equalsButton: '#FF9F0A',
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textOnOperator: '#FFFFFF',
  textOnFunction: '#1C1C1E',
  textOnEquals: '#FFFFFF',
  error: '#FF3B30',
  accent: '#FF9F0A',
  historyBg: '#FFFFFF',
  historyItem: '#F2F2F7',
  border: '#C6C6C8',
  shadow: 'rgba(0,0,0,0.08)',
};
