import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebLayout } from './WebLayout';
import { WebDashboard } from './WebDashboard';
import { ServiceCasesScreen } from '../screens/ServiceCasesScreen';
import { CustomersScreen } from '../screens/CustomersScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import ContractsScreen from '../screens/ContractsScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { ServiceLogListScreen } from '../screens/ServiceLogListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export const WebApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <WebDashboard onNavigate={setCurrentPage} />;
      case 'servicecases':
        return <ServiceCasesScreen />;
      case 'customers':
        return <CustomersScreen />;
      case 'products':
        return <ProductsScreen />;
      case 'contracts':
        return <ContractsScreen />;
      case 'reminders':
        return <RemindersScreen />;
      case 'servicelogs':
        return <ServiceLogListScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <WebDashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <WebLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderPage()}
    </WebLayout>
  );
}; 