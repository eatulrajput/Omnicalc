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
  background: '#F3F2E9',
  surface: '#F3F2E9',
  displayBg: '#F3F2E9',
  numberButton: '#E3E1D4',
  operatorButton: '#D5D5BB',
  functionButton: '#D5D5BB',
  equalsButton: '#EBDD2C', // Yellow for AC and =
  textPrimary: '#1E1E1E',
  textSecondary: '#888888',
  textOnOperator: '#1E1E1E',
  textOnFunction: '#1E1E1E',
  textOnEquals: '#1E1E1E',
  error: '#FF3B30',
  accent: '#EBDD2C',
  historyBg: '#FFFFFF',
  historyItem: '#F3F2E9',
  border: '#D5D5BB',
  shadow: 'rgba(0,0,0,0.05)',
};
