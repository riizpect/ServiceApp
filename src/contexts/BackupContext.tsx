import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BackupSettings {
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string; // HH:mm format
  cloudBackupEnabled: boolean;
  localBackupEnabled: boolean;
  lastBackupDate?: string;
}

interface BackupContextType {
  settings: BackupSettings;
  updateSetting: (key: keyof BackupSettings, value: any) => void;
  updateSettings: (newSettings: Partial<BackupSettings>) => void;
  createBackup: () => Promise<any>;
  restoreBackup: (backupData: any) => Promise<void>;
  resetToDefaults: () => void;
}

const defaultSettings: BackupSettings = {
  autoBackupEnabled: true,
  backupFrequency: 'weekly',
  backupTime: '02:00',
  cloudBackupEnabled: false,
  localBackupEnabled: true,
};

const BackupContext = createContext<BackupContextType | undefined>(undefined);

export const useBackup = () => {
  const context = useContext(BackupContext);
  if (!context) {
    throw new Error('useBackup must be used within a BackupProvider');
  }
  return context;
};

interface BackupProviderProps {
  children: React.ReactNode;
}

export const BackupProvider: React.FC<BackupProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<BackupSettings>(defaultSettings);

  useEffect(() => {
    // Ladda sparade backup-inställningar från AsyncStorage
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('backupSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.log('Kunde inte ladda backup-inställningar:', error);
    }
  };

  const saveSettings = async (newSettings: BackupSettings) => {
    try {
      await AsyncStorage.setItem('backupSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.log('Kunde inte spara backup-inställningar:', error);
    }
  };

  const updateSetting = (key: keyof BackupSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const updateSettings = (newSettings: Partial<BackupSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const createBackup = async () => {
    try {
      // Här skulle vi normalt skapa en riktig backup
      // För nu simulerar vi bara
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: 'Simulerad backup-data'
      };
      
      // Spara backup-metadata
      updateSetting('lastBackupDate', new Date().toISOString());
      
      console.log('Backup skapad:', backupData);
      return backupData;
    } catch (error) {
      console.log('Kunde inte skapa backup:', error);
      throw error;
    }
  };

  const restoreBackup = async (backupData: any) => {
    try {
      // Här skulle vi normalt återställa från backup
      console.log('Backup återställd:', backupData);
    } catch (error) {
      console.log('Kunde inte återställa backup:', error);
      throw error;
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
  };

  const value: BackupContextType = {
    settings,
    updateSetting,
    updateSettings,
    createBackup,
    restoreBackup,
    resetToDefaults,
  };

  return (
    <BackupContext.Provider value={value}>
      {children}
    </BackupContext.Provider>
  );
}; 