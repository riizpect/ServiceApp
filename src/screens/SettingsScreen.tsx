import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useBackup } from '../contexts/BackupContext';
import { addTestData, removeTestData, clearAllData } from '../services/storage';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { settings: notificationSettings, updateSetting: updateNotificationSetting } = useNotifications();
  const { settings: backupSettings, updateSetting: updateBackupSetting } = useBackup();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logga ut',
      'Är du säker på att du vill logga ut?',
      [
        { text: 'Avbryt', style: 'cancel' },
        { text: 'Logga ut', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Rensa all data',
      'Detta kommer att ta bort ALL data från appen. Detta går inte att ångra.',
      [
        { text: 'Avbryt', style: 'cancel' },
        { 
          text: 'Rensa allt', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setIsLoading(true);
              await clearAllData();
              Alert.alert('Data rensad', 'All data har tagits bort från appen.');
            } catch (error) {
              Alert.alert('Fel', 'Kunde inte rensa data');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleAddTestData = () => {
    Alert.alert(
      'Lägg till testdata',
      'Detta kommer att lägga till omfattande testdata för att simulera en app som används aktivt.',
      [
        { text: 'Avbryt', style: 'cancel' },
        { 
          text: 'Lägg till', 
          onPress: async () => {
            try {
              setIsLoading(true);
              await addTestData();
              Alert.alert('Testdata tillagd', 'Omfattande testdata har lagts till i appen.');
            } catch (error) {
              Alert.alert('Fel', 'Kunde inte lägga till testdata');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleRemoveTestData = () => {
    Alert.alert(
      'Ta bort testdata',
      'Detta kommer att ta bort endast testdata och behålla din riktiga data.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await removeTestData();
              Alert.alert('Testdata borttagen', 'Testdata har tagits bort från appen.');
            } catch (error) {
              Alert.alert('Fel', 'Kunde inte ta bort testdata');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Rensa cache',
      'Detta kommer att rensa appens cache och frigöra lagringsutrymme.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Rensa cache',
          onPress: () => {
            // Simulera cache-rensning
            Alert.alert('Cache rensad', 'Appens cache har rensats.');
          }
        },
      ]
    );
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    isDestructive = false,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem, 
        { 
          backgroundColor: colors.surface,
          shadowColor: colors.shadowMedium,
          borderColor: colors.borderLight
        },
        isDestructive && [
          styles.settingItemDestructive,
          { 
            borderLeftColor: colors.error,
            backgroundColor: colors.errorLight
          }
        ]
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={[
            styles.settingTitle, 
            { color: colors.text },
            isDestructive && { color: colors.error }
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.settingSubtitle, 
              { color: colors.textSecondary }
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent ? (
        rightComponent
      ) : onPress ? (
        <Text style={[
          styles.settingArrow, 
          { color: colors.textTertiary },
          isDestructive && { color: colors.error }
        ]}>
          ›
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  const renderSwitchItem = (
    icon: string,
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={[
      styles.settingItem,
      { 
        backgroundColor: colors.surface,
        shadowColor: colors.shadowMedium,
        borderColor: colors.borderLight
      }
    ]}>
      <View style={styles.settingItemLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderLight, true: colors.primary }}
        thumbColor={value ? colors.textInverse : colors.textSecondary}
        ios_backgroundColor={colors.borderLight}
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Bearbetar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Inställningar</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Hantera din app och data
          </Text>
        </View>

        {/* User Info */}
        {renderSection('Användare', (
          <View style={[
            styles.userCard, 
            { 
              backgroundColor: colors.surface,
              shadowColor: colors.shadowStrong,
              borderColor: colors.borderLight,
              borderLeftColor: colors.primary
            }
          ]}>
            <View style={styles.userInfo}>
              <Text style={styles.userIcon}>👤</Text>
              <View style={styles.userTextContainer}>
                <Text style={[styles.userName, { color: colors.text }]}>{user ? `${user.firstName} ${user.lastName}` : 'Tekniker'}</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'ingen@email.com'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.logoutButton,
                { 
                  backgroundColor: colors.errorLight,
                  shadowColor: colors.shadowMedium
                }
              ]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={[styles.logoutButtonText, { color: colors.error }]}>Logga ut</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* App Settings */}
        {renderSection('App', (
          <>
            {renderSwitchItem(
              '🔔',
              'Push-notifikationer',
              'Aktivera push-notifikationer för viktiga händelser',
              notificationSettings.pushNotifications,
              (value) => updateNotificationSetting('pushNotifications', value)
            )}
            {renderSwitchItem(
              '📧',
              'E-postnotifikationer',
              'Skicka notifikationer via e-post',
              notificationSettings.emailNotifications,
              (value) => updateNotificationSetting('emailNotifications', value)
            )}
            {renderSwitchItem(
              '⏰',
              'Påminnelser',
              'Aktivera påminnelser för schemalagda service',
              notificationSettings.reminderNotifications,
              (value) => updateNotificationSetting('reminderNotifications', value)
            )}
            {renderSwitchItem(
              '🌙',
              'Mörkt läge',
              'Byt mellan ljust och mörkt tema',
              isDark,
              toggleTheme
            )}
            {renderSwitchItem(
              '💾',
              'Automatisk säkerhetskopiering',
              'Skapa automatiska säkerhetskopior',
              backupSettings.autoBackupEnabled,
              (value) => updateBackupSetting('autoBackupEnabled', value)
            )}
            {renderSettingItem(
              '📊',
              'Statistik och rapporter',
              'Visa detaljerad statistik över ditt arbete',
              () => navigation.navigate('Statistics')
            )}
          </>
        ))}

        {/* Data Management */}
        {renderSection('Datahantering', (
          <>
            {renderSettingItem(
              '🗂️',
              'Rensa cache',
              'Frigör lagringsutrymme genom att rensa cache',
              handleClearCache
            )}
            {renderSettingItem(
              '📤',
              'Exportera data',
              'Exportera din data till en fil',
              () => navigation.navigate('ExportData')
            )}
            {renderSettingItem(
              '📥',
              'Importera data',
              'Importera data från en fil',
              () => navigation.navigate('ImportData')
            )}
            {renderSettingItem(
              '🔄',
              'Säkerhetskopiera',
              'Skapa en säkerhetskopia av din data',
              () => navigation.navigate('Backup')
            )}
          </>
        ))}

        {/* Test Data */}
        {renderSection('Testdata', (
          <>
            {renderSettingItem(
              '➕',
              'Lägg till testdata',
              'Lägg till omfattande testdata för att testa appen',
              handleAddTestData
            )}
            {renderSettingItem(
              '➖',
              'Ta bort testdata',
              'Ta bort endast testdata (behåll riktig data)',
              handleRemoveTestData
            )}
          </>
        ))}

        {/* Danger Zone */}
        {renderSection('Farlig zon', (
          <>
            {renderSettingItem(
              '🗑️',
              'Rensa all data',
              'Ta bort ALL data från appen (kan inte ångras)',
              handleClearData,
              true
            )}
          </>
        ))}

        {/* About */}
        {renderSection('Om appen', (
          <>
            {renderSettingItem(
              'ℹ️',
              'Om ServiceApp',
              'Version 1.0.0 - Ferno Norden',
              () => navigation.navigate('About')
            )}
            {renderSettingItem(
              '📞',
              'Kontakta support',
              'Få hjälp med appen',
              () => navigation.navigate('Support')
            )}
            {renderSettingItem(
              '📋',
              'Användarvillkor',
              'Läs användarvillkoren',
              () => navigation.navigate('Terms')
            )}
            {renderSettingItem(
              '🔒',
              'Integritetspolicy',
              'Läs vår integritetspolicy',
              () => navigation.navigate('Privacy')
            )}
          </>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            ServiceApp v1.0.0
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textTertiary }]}>
            Utvecklad för Ferno Norden
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  userCard: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  settingItemDestructive: {
    borderLeftWidth: 3,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
    textAlign: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 1,
    letterSpacing: 0.1,
  },
  settingSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  settingArrow: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  footerSubtext: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
}); 