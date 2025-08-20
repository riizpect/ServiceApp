import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ResponsiveSidebarLayout } from '../components/ResponsiveLayout';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ServiceCasesScreen } from '../screens/ServiceCasesScreen';
import { CustomersScreen } from '../screens/CustomersScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { ServiceLogListScreen } from '../screens/ServiceLogListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import ContractsScreen from '../screens/ContractsScreen';

const WebNavigator: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: '📊', route: 'Dashboard' },
    { name: 'Serviceärenden', icon: '🔧', route: 'ServiceCases' },
    { name: 'Kunder', icon: '👥', route: 'Customers' },
    { name: 'Produkter', icon: '📦', route: 'Products' },
    { name: 'Service-avtal', icon: '📋', route: 'Contracts' },
    { name: 'Påminnelser', icon: '⏰', route: 'Reminders' },
    { name: 'Serviceloggar', icon: '📝', route: 'ServiceLogList' },
    { name: 'Inställningar', icon: '⚙️', route: 'Settings' },
  ];

  const renderSidebar = () => (
    <View style={[styles.sidebar, { backgroundColor: colors.surface }]}>
      <View style={styles.sidebarHeader}>
        <Text style={[styles.sidebarTitle, { color: colors.text }]}>
          ServiceApp
        </Text>
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Ionicons 
            name={sidebarCollapsed ? "chevron-forward" : "chevron-back"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={[
              styles.menuItem,
              route.name === item.route && { backgroundColor: colors.primary + '20' }
            ]}
            onPress={() => navigation.navigate(item.route as any)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            {!sidebarCollapsed && (
              <Text style={[
                styles.menuText,
                { color: route.name === item.route ? colors.primary : colors.text }
              ]}>
                {item.name}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMainContent = () => {
    const currentRoute = route.name as string;
    
    const renderScreen = () => {
      switch (currentRoute) {
        case 'Dashboard':
          return <DashboardScreen />;
        case 'ServiceCases':
          return <ServiceCasesScreen />;
        case 'Customers':
          return <CustomersScreen />;
        case 'Products':
          return <ProductsScreen />;
        case 'Contracts':
          return <ContractsScreen />;
        case 'Reminders':
          return <RemindersScreen />;
        case 'ServiceLogList':
          return <ServiceLogListScreen />;
        case 'Settings':
          return <SettingsScreen />;
        default:
          return <DashboardScreen />;
      }
    };

    return (
      <View style={[styles.mainContent, { backgroundColor: colors.background }]}>
        {renderScreen()}
      </View>
    );
  };

  return (
    <ResponsiveSidebarLayout
      sidebar={renderSidebar()}
      main={renderMainContent()}
      collapsed={sidebarCollapsed}
    />
  );
};

const styles = StyleSheet.create({
  sidebar: {
    height: '100%',
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  collapseButton: {
    padding: 8,
    borderRadius: 8,
  },
  menuContainer: {
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
});

export default WebNavigator; 