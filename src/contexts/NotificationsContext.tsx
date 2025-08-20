import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  reminderNotifications: boolean;
  serviceUpdates: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface NotificationsContextType {
  settings: NotificationSettings;
  updateSetting: (key: keyof NotificationSettings, value: boolean) => void;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: false,
  reminderNotifications: true,
  serviceUpdates: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  useEffect(() => {
    // Ladda sparade notifikationsinställningar från AsyncStorage
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.log('Kunde inte ladda notifikationsinställningar:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.log('Kunde inte spara notifikationsinställningar:', error);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  const value: NotificationsContextType = {
    settings,
    updateSetting,
    updateSettings,
    resetToDefaults,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}; 