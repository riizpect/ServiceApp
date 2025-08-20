import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import MainTabNavigator from './MainTabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { NewServiceCaseScreen } from '../screens/NewServiceCaseScreen';
import { EditServiceCaseScreen } from '../screens/EditServiceCaseScreen';
import { NewCustomerScreen } from '../screens/NewCustomerScreen';
import { EditCustomerScreen } from '../screens/EditCustomerScreen';
import { NewProductScreen } from '../screens/NewProductScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ServiceLogScreen } from '../screens/ServiceLogScreen';
import { NewServiceLogEntryScreen } from '../screens/NewServiceLogEntryScreen';
import { CustomerDetailScreen } from '../screens/CustomerDetailScreen';
import { ServiceCaseDetailScreen } from '../screens/ServiceCaseDetailScreen';
import { CustomerArchiveScreen } from '../screens/CustomerArchiveScreen';
import { COLORS } from '../constants';
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.textSecondary }}>Laddar...</Text>
  </View>
);

export const AuthNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        // Autentiserade användare
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="NewServiceCase" component={NewServiceCaseScreen} />
          <Stack.Screen name="EditServiceCase" component={EditServiceCaseScreen} />
          <Stack.Screen name="NewCustomer" component={NewCustomerScreen} />
          <Stack.Screen name="EditCustomer" component={EditCustomerScreen} />
          <Stack.Screen name="NewProduct" component={NewProductScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="ServiceLog" component={ServiceLogScreen} />
          <Stack.Screen name="NewServiceLogEntry" component={NewServiceLogEntryScreen} />
          <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
          <Stack.Screen name="ServiceCaseDetail" component={ServiceCaseDetailScreen} />
          <Stack.Screen name="CustomerArchive" component={CustomerArchiveScreen} />
        </>
      ) : (
        // Icke-autentiserade användare
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}; 