import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Customer, ServiceCase, ServiceReminder } from '../types';
import { customerStorage, serviceCaseStorage, reminderStorage } from '../services/storage';
import { LoadingSkeleton } from './LoadingSkeleton';
import { useTheme } from '../contexts/ThemeContext';

interface WebDashboardProps {
  onNavigate: (page: string) => void;
}

export const WebDashboard: React.FC<WebDashboardProps> = ({ onNavigate }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceCases, setServiceCases] = useState<ServiceCase[]>([]);
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);
  const [stats, setStats] = useState({
    totalServiceCases: 0,
    activeServiceCases: 0,
    completedServiceCases: 0,
    totalCustomers: 0,
    activeReminders: 0,
    overdueReminders: 0,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [customersData, serviceCasesData, remindersData] = await Promise.all([
        customerStorage.getAll(),
        serviceCaseStorage.getAllWithCustomers(),
        reminderStorage.getAll(),
      ]);

      setCustomers(customersData);
      setServiceCases(serviceCasesData);
      setReminders(remindersData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const calculatedStats = useMemo(() => {
    const activeCases = serviceCases.filter(case_ => 
      case_.status === 'pending' || case_.status === 'in_progress'
    );
    const completedCases = serviceCases.filter(case_ => 
      case_.status === 'completed'
    );
    const activeReminders = reminders.filter(reminder => !reminder.isCompleted);
    const overdueReminders = reminders.filter(reminder => 
      !reminder.isCompleted && new Date(reminder.dueDate) < new Date()
    );

    return {
      totalServiceCases: serviceCases.length,
      activeServiceCases: activeCases.length,
      completedServiceCases: completedCases.length,
      totalCustomers: customers.length,
      activeReminders: activeReminders.length,
      overdueReminders: overdueReminders.length,
    };
  }, [serviceCases, customers, reminders]);

  useEffect(() => {
    setStats(calculatedStats);
  }, [calculatedStats]);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'God morgon';
    if (hour < 18) return 'God eftermiddag';
    return 'God kväll';
  }, []);

  const renderWelcomeHeader = () => (
    <View style={styles.welcomeHeader}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}</Text>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Översikt</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Snabb översikt över ditt arbete
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statsRow}>
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: colors.surface }]}
          onPress={() => onNavigate('servicecases')}
        >
          <View style={styles.statContent}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Text style={styles.statIcon}>🔧</Text>
            </View>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{stats.activeServiceCases}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Aktiva ärenden</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: colors.surface }]}
          onPress={() => onNavigate('customers')}
        >
          <View style={styles.statContent}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.accentBlue + '20' }]}>
              <Text style={styles.statIcon}>👥</Text>
            </View>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{stats.totalCustomers}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Kunder</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsRow}>
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: colors.surface }]}
          onPress={() => onNavigate('reminders')}
        >
          <View style={styles.statContent}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.accentOrange + '20' }]}>
              <Text style={styles.statIcon}>⏰</Text>
            </View>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{stats.activeReminders}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Påminnelser</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.statCard, { backgroundColor: colors.surface }]}
          onPress={() => onNavigate('servicecases')}
        >
          <View style={styles.statContent}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.accentGreen + '20' }]}>
              <Text style={styles.statIcon}>✅</Text>
            </View>
            <View style={styles.statTextContainer}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{stats.completedServiceCases}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avslutade</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Snabbåtgärder</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: colors.surface }]}
          onPress={() => onNavigate('servicecases')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={styles.quickActionIconText}>➕</Text>
          </View>
          <Text style={[styles.quickActionText, { color: colors.text }]}>Nytt ärende</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: colors.surface }]}
          onPress={() => onNavigate('customers')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={styles.quickActionIconText}>👤</Text>
          </View>
          <Text style={[styles.quickActionText, { color: colors.text }]}>Ny kund</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: colors.surface }]}
          onPress={() => onNavigate('products')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={styles.quickActionIconText}>📦</Text>
          </View>
          <Text style={[styles.quickActionText, { color: colors.text }]}>Ny produkt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickActionCard, { backgroundColor: colors.surface }]}
          onPress={() => onNavigate('reminders')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={styles.quickActionIconText}>⏰</Text>
          </View>
          <Text style={[styles.quickActionText, { color: colors.text }]}>Påminnelse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderWelcomeHeader()}
      {renderStatsGrid()}
      {renderQuickActions()}
    </ScrollView>
  );

  return (
    <View style={styles.webContainer}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  welcomeHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  statsGrid: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statIcon: {
    fontSize: 24,
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    minWidth: 120,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIconText: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 