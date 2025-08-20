import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { NewServiceCaseScreen } from '../screens/NewServiceCaseScreen';
import { EditServiceCaseScreen } from '../screens/EditServiceCaseScreen';
import { NewCustomerScreen } from '../screens/NewCustomerScreen';
import { EditCustomerScreen } from '../screens/EditCustomerScreen';
import { NewProductScreen } from '../screens/NewProductScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ServiceLogScreen } from '../screens/ServiceLogScreen';
import { ServiceLogListScreen } from '../screens/ServiceLogListScreen';
import { NewServiceLogEntryScreen } from '../screens/NewServiceLogEntryScreen';
import { CustomerDetailScreen } from '../screens/CustomerDetailScreen';
import { ServiceCaseDetailScreen } from '../screens/ServiceCaseDetailScreen';
import { CustomerArchiveScreen } from '../screens/CustomerArchiveScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { NewReminderScreen } from '../screens/NewReminderScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { RootStackParamList } from '../types';
import { EditProductScreen } from '../screens/EditProductScreen';
// Service Contract screens
import ContractsScreen from '../screens/ContractsScreen';
import CreateContractScreen from '../screens/CreateContractScreen';
import ContractDetailsScreen from '../screens/ContractDetailsScreen';
import EditContractScreen from '../screens/EditContractScreen';
// Settings screens
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ThemeSettingsScreen } from '../screens/ThemeSettingsScreen';
import { ExportDataScreen } from '../screens/ExportDataScreen';
import { ImportDataScreen } from '../screens/ImportDataScreen';
import { BackupScreen } from '../screens/BackupScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={isAuthenticated ? "Main" : "Login"}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="NewServiceCase" component={NewServiceCaseScreen} />
      <Stack.Screen name="EditServiceCase" component={EditServiceCaseScreen} />
      <Stack.Screen name="NewCustomer" component={NewCustomerScreen} />
      <Stack.Screen name="EditCustomer" component={EditCustomerScreen} />
      <Stack.Screen name="NewProduct" component={NewProductScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ServiceLog" component={ServiceLogScreen} />
      <Stack.Screen name="ServiceLogList" component={ServiceLogListScreen} />
      <Stack.Screen name="NewServiceLogEntry" component={NewServiceLogEntryScreen} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
      <Stack.Screen name="ServiceCaseDetail" component={ServiceCaseDetailScreen} />
      <Stack.Screen name="CustomerArchive" component={CustomerArchiveScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="NewReminder" component={NewReminderScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
      {/* Service Contract screens */}
      <Stack.Screen name="Contracts" component={ContractsScreen} />
      <Stack.Screen name="CreateContract" component={CreateContractScreen} />
      <Stack.Screen name="ContractDetails" component={ContractDetailsScreen} />
      <Stack.Screen name="EditContract" component={EditContractScreen} />
      {/* Settings screens */}
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
      <Stack.Screen name="ExportData" component={ExportDataScreen} />
      <Stack.Screen name="ImportData" component={ImportDataScreen} />
      <Stack.Screen name="Backup" component={BackupScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
    </Stack.Navigator>
  );
}; 