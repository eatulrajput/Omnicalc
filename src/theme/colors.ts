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
  background: '#17181A',
  surface: '#17181A',
  displayBg: '#17181A',
  numberButton: '#2E2F31',
  operatorButton: '#D5D5BB',
  functionButton: '#D5D5BB',
  equalsButton: '#EBDD2C',
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textOnOperator: '#1E1E1E',
  textOnFunction: '#1E1E1E',
  textOnEquals: '#1E1E1E',
  error: '#FF453A',
  accent: '#EBDD2C',
  historyBg: '#17181A',
  historyItem: '#2E2F31',
  border: '#2E2F31',
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
