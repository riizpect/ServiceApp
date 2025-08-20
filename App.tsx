import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { NotificationsProvider } from './src/contexts/NotificationsContext';
import { BackupProvider } from './src/contexts/BackupContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

const AppContent = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <>
      <StatusBar 
        style={isDark ? "light" : "dark"} 
        backgroundColor={colors.background} 
      />
      <NotificationsProvider>
        <BackupProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </BackupProvider>
      </NotificationsProvider>
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <ThemeProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </ThemeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
