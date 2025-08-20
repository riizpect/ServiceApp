import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Utökade färger för mörkt läge
const LIGHT_COLORS = {
  // Primära färger - Ferno branding
  primary: '#E31837', // Ferno röd
  primaryLight: '#FF1F3D',
  primaryDark: '#B31414',
  
  // Sekundära färger - Professionella toner
  secondary: '#2C3E50', // Mörk blå-grå
  secondaryLight: '#34495E',
  accent: '#3498DB', // Ljusblå accent
  
  // Bakgrundsfärger - Eleganta toner
  background: '#F8FAFC', // Mycket ljusgrå bakgrund
  surface: '#FFFFFF', // Ren vit
  surfaceSecondary: '#F1F5F9', // Ljusgrå yta
  surfaceTertiary: '#E2E8F0', // Medium grå yta
  
  // Textfärger - Professionell typografi
  text: '#1E293B', // Mörk text
  textSecondary: '#64748B', // Medium grå text
  textTertiary: '#94A3B8', // Ljusgrå text
  textInverse: '#FFFFFF', // Vit text
  
  // Statusfärger - Mjuka toner
  success: '#10B981', // Grön
  successLight: '#34D399',
  warning: '#F59E0B', // Orange
  warningLight: '#FBBF24',
  error: '#EF4444', // Röd
  errorLight: '#F87171',
  info: '#3B82F6', // Blå
  infoLight: '#60A5FA',
  
  // Gränser och skuggor - Subtila
  border: '#E2E8F0', // Ljusgrå border
  borderLight: '#F1F5F9', // Mycket ljus border
  borderDark: '#CBD5E1', // Mörkare border
  shadow: 'rgba(0, 0, 0, 0.04)', // Mycket mjuk skugga
  shadowMedium: 'rgba(0, 0, 0, 0.08)', // Medium skugga
  shadowStrong: 'rgba(0, 0, 0, 0.12)', // Starkare skugga
  
  // Övriga
  overlay: 'rgba(0, 0, 0, 0.3)', // Mjuk overlay
  disabled: '#CBD5E1', // Grå för inaktiverade element
  
  // Gradient och specialfärger
  gradientStart: '#E31837',
  gradientEnd: '#B31414',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
  
  // Ferno-specifika färger
  fernoRed: '#E31837',
  fernoRedLight: '#FF1F3D',
  fernoRedDark: '#B31414',
};

const DARK_COLORS = {
  // Primära färger - Ferno branding (samma)
  primary: '#E31837', // Ferno röd
  primaryLight: '#FF1F3D',
  primaryDark: '#B31414',
  
  // Sekundära färger - Anpassade för mörkt läge
  secondary: '#E2E8F0', // Ljusare blå-grå
  secondaryLight: '#F1F5F9',
  accent: '#60A5FA', // Ljusare blå accent
  
  // Bakgrundsfärger - Mörka toner
  background: '#0F172A', // Mörk bakgrund
  surface: '#1E293B', // Mörk yta
  surfaceSecondary: '#334155', // Mörkare yta
  surfaceTertiary: '#475569', // Medium mörk yta
  
  // Textfärger - Ljusare för mörkt läge
  text: '#F8FAFC', // Ljus text
  textSecondary: '#CBD5E1', // Medium ljus text
  textTertiary: '#94A3B8', // Ljusgrå text
  textInverse: '#0F172A', // Mörk text
  
  // Statusfärger - Anpassade för mörkt läge
  success: '#34D399', // Ljusare grön
  successLight: '#6EE7B7',
  warning: '#FBBF24', // Ljusare orange
  warningLight: '#FCD34D',
  error: '#F87171', // Ljusare röd
  errorLight: '#FCA5A5',
  info: '#60A5FA', // Ljusare blå
  infoLight: '#93C5FD',
  
  // Gränser och skuggor - Mörka
  border: '#334155', // Mörk border
  borderLight: '#475569', // Medium mörk border
  borderDark: '#64748B', // Ljusare border
  shadow: 'rgba(0, 0, 0, 0.3)', // Mörk skugga
  shadowMedium: 'rgba(0, 0, 0, 0.4)', // Medium mörk skugga
  shadowStrong: 'rgba(0, 0, 0, 0.5)', // Starkare mörk skugga
  
  // Övriga
  overlay: 'rgba(0, 0, 0, 0.6)', // Mörkare overlay
  disabled: '#64748B', // Mörkare grå för inaktiverade element
  
  // Gradient och specialfärger
  gradientStart: '#E31837',
  gradientEnd: '#B31414',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  
  // Ferno-specifika färger (samma)
  fernoRed: '#E31837',
  fernoRedLight: '#FF1F3D',
  fernoRedDark: '#B31414',
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colors: typeof LIGHT_COLORS;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Ladda sparad tema från AsyncStorage
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.log('Kunde inte ladda tema:', error);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.log('Kunde inte spara tema:', error);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const isDark = theme === 'dark';

  const value: ThemeContextType = {
    theme,
    colors,
    toggleTheme,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 