import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, Platform, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardScreen } from '../screens/DashboardScreen';
import { useTheme } from '../contexts/ThemeContext';
import { ServiceCasesScreen } from '../screens/ServiceCasesScreen';
import { CustomersScreen } from '../screens/CustomersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ServiceLogListScreen } from '../screens/ServiceLogListScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import ContractsScreen from '../screens/ContractsScreen';

const Tab = createBottomTabNavigator();

const MoreModal = ({ visible, onClose }: { 
  visible: boolean; 
  onClose: () => void; 
}) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const moreOptions = [
    { name: 'ServiceLogList', label: 'Serviceloggar', icon: '📝', screen: ServiceLogListScreen },
    { name: 'Reminders', label: 'Påminnelser', icon: '⏰', screen: RemindersScreen },
    { name: 'Products', label: 'Produkter', icon: '📦', screen: ProductsScreen },
    { name: 'Contracts', label: 'Service-avtal', icon: '📋', screen: null },
  ];

  const handleOptionPress = (option: any) => {
    console.log('Navigating to:', option.name);
    onClose();
    try {
      if (option.name === 'Contracts') {
        navigation.navigate('Contracts' as never);
      } else {
        navigation.navigate(option.name as never);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { 
            backgroundColor: colors.surface,
            shadowColor: colors.shadowStrong
          }
        ]}>
          <View style={[
            styles.modalHeader,
            { borderBottomColor: colors.borderLight }
          ]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Fler funktioner</Text>
            <TouchableOpacity onPress={onClose} style={[
              styles.closeButton,
              { 
                backgroundColor: colors.surfaceSecondary,
                shadowColor: colors.shadowMedium
              }
            ]}>
              <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.optionsContainer}>
            {moreOptions.map((option) => (
              <TouchableOpacity
                key={option.name}
                style={[
                  styles.optionItem,
                  { 
                    backgroundColor: colors.surfaceSecondary,
                    shadowColor: colors.shadowMedium
                  }
                ]}
                onPress={() => handleOptionPress(option)}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                <Text style={[styles.optionArrow, { color: colors.textTertiary }]}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [moreModalVisible, setMoreModalVisible] = useState(false);

  const renderTabIcon = (routeName: string, focused: boolean) => {
    const icons = {
      Dashboard: focused ? '📊' : '📊',
      ServiceCases: focused ? '🔧' : '🔧',
      Customers: focused ? '👥' : '👥',
      More: focused ? '⋯' : '⋯',
      Settings: focused ? '⚙️' : '⚙️',
    };

    return (
      <View style={styles.iconContainer}>
        <Text style={[
          styles.icon,
          focused && styles.iconFocused
        ]}>
          {icons[routeName as keyof typeof icons]}
        </Text>
      </View>
    );
  };

  const renderTabLabel = (routeName: string, focused: boolean) => {
    const labels = {
      Dashboard: 'Översikt',
      ServiceCases: 'Service',
      Customers: 'Kunder',
      More: 'Mer',
      Settings: 'Inställningar',
    };

    return (
      <Text style={[
        styles.label,
        dynamicStyles.label,
        focused && [styles.labelFocused, dynamicStyles.labelFocused]
      ]} numberOfLines={1}>
        {labels[routeName as keyof typeof labels]}
      </Text>
    );
  };

  const dynamicStyles = {
    tabBar: {
      backgroundColor: colors.surface,
      borderTopColor: colors.borderLight,
      shadowColor: colors.shadowStrong,
    },
    label: { color: colors.textTertiary },
    labelFocused: { color: colors.primary },
    modalContent: {
      backgroundColor: colors.surface,
      shadowColor: colors.shadowStrong,
    },
    modalHeader: { borderBottomColor: colors.borderLight },
    modalTitle: { color: colors.text },
    closeButton: {
      backgroundColor: colors.surfaceSecondary,
      shadowColor: colors.shadowMedium,
    },
    closeButtonText: { color: colors.textSecondary },
    optionItem: {
      backgroundColor: colors.surfaceSecondary,
      shadowColor: colors.shadowMedium,
    },
    optionLabel: { color: colors.text },
    optionArrow: { color: colors.textTertiary },
  };

  return (
    <>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => renderTabIcon(route.name, focused),
        tabBarLabel: ({ focused }) => renderTabLabel(route.name, focused),
        tabBarStyle: [
          styles.tabBar,
          dynamicStyles.tabBar,
          {
            paddingBottom: insets.bottom + 8,
            paddingTop: 12,
            height: 80 + insets.bottom,
          }
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarAccessibilityLabel: 'Översikt',
        }}
      />
      <Tab.Screen 
        name="ServiceCases" 
        component={ServiceCasesScreen}
        options={{
          tabBarAccessibilityLabel: 'Serviceärenden',
        }}
      />
      <Tab.Screen 
        name="Customers" 
        component={CustomersScreen}
        options={{
          tabBarAccessibilityLabel: 'Kunder',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarAccessibilityLabel: 'Inställningar',
        }}
      />
        <Tab.Screen 
          name="More" 
          component={View}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setMoreModalVisible(true);
            },
          }}
          options={{
            tabBarAccessibilityLabel: 'Fler funktioner',
          }}
        />
    </Tab.Navigator>

      <MoreModal 
        visible={moreModalVisible}
        onClose={() => setMoreModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarItem: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
    height: 32,
  },
  icon: {
    fontSize: 24,
    marginBottom: 2,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
    transform: [{ scale: 1.3 }],
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  labelFocused: {
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '60%',
    minHeight: 200,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsContainer: {
    padding: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 20,
    width: 36,
    textAlign: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  optionArrow: {
    fontSize: 20,
    fontWeight: '600',
  },
});

export default MainTabNavigator; 