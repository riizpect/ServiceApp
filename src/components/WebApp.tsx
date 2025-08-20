import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebLayout } from './WebLayout';
import { WebDashboard } from './WebDashboard';
import { WebCustomers } from './WebCustomers';
import { WebNewCustomer } from './WebNewCustomer';
import { ServiceCasesScreen } from '../screens/ServiceCasesScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import ContractsScreen from '../screens/ContractsScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { ServiceLogListScreen } from '../screens/ServiceLogListScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export const WebApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState<any>({});

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <WebDashboard onNavigate={handleNavigate} />;
      case 'servicecases':
        return <ServiceCasesScreen />;
      case 'customers':
        return <WebCustomers onNavigate={handleNavigate} />;
      case 'newcustomer':
        return <WebNewCustomer onNavigate={handleNavigate} />;
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
        return <WebDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <WebLayout
      currentPage={currentPage}
      onPageChange={handleNavigate}
    >
      {renderPage()}
    </WebLayout>
  );
}; 