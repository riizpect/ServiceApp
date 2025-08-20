import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface WebLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const WebLayout: React.FC<WebLayoutProps> = ({
  children,
  currentPage,
  onPageChange,
}) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'servicecases', name: 'Serviceärenden', icon: '🔧' },
    { id: 'customers', name: 'Kunder', icon: '👥' },
    { id: 'products', name: 'Produkter', icon: '📦' },
    { id: 'contracts', name: 'Service-avtal', icon: '📋' },
    { id: 'reminders', name: 'Påminnelser', icon: '⏰' },
    { id: 'servicelogs', name: 'Serviceloggar', icon: '📝' },
    { id: 'settings', name: 'Inställningar', icon: '⚙️' },
  ];

  const isDesktop = width > 1024;
  const isTablet = width > 768 && width <= 1024;

  const renderSidebar = () => (
    <View style={[
      styles.sidebar,
      { 
        backgroundColor: colors.surface,
        width: sidebarCollapsed ? 60 : 280,
        borderRightColor: colors.border
      }
    ]}>
      <View style={styles.sidebarHeader}>
        {!sidebarCollapsed && (
          <Text style={[styles.sidebarTitle, { color: colors.text }]}>
            ServiceApp
          </Text>
        )}
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <Text style={[styles.collapseIcon, { color: colors.textSecondary }]}>
            {sidebarCollapsed ? '›' : '‹'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              currentPage === item.id && { 
                backgroundColor: colors.primary + '15',
                borderLeftColor: colors.primary,
                borderLeftWidth: 3
              }
            ]}
            onPress={() => onPageChange(item.id)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            {!sidebarCollapsed && (
              <Text style={[
                styles.menuText,
                { 
                  color: currentPage === item.id ? colors.primary : colors.text,
                  fontWeight: currentPage === item.id ? '600' : '400'
                }
              ]}>
                {item.name}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={[
      styles.header,
      { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border
      }
    ]}>
      <View style={styles.headerContent}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>
          {menuItems.find(item => item.id === currentPage)?.name || 'Dashboard'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: colors.textSecondary }]}>
              🔔
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: colors.textSecondary }]}>
              👤
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderSidebar()}
      <View style={styles.mainArea}>
        {renderHeader()}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    height: '100vh',
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  collapseButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  collapseIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuContainer: {
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    borderLeftWidth: 0,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 15,
    flex: 1,
  },
  mainArea: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    height: 70,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  headerButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 32,
    overflow: 'auto',
  },
}); 