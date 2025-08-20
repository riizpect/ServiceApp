import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { Customer, ServiceCase } from '../types';
import { customerStorage, serviceCaseStorage, reminderStorage } from '../services/storage';
import { GlobalSearch } from '../components/GlobalSearch';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

type NavigationProp = any;

interface DashboardStats {
  totalServiceCases: number;
  activeServiceCases: number;
  completedServiceCases: number;
  totalCustomers: number;
  activeReminders: number;
  overdueReminders: number;
}

const STATUS_COLORS = {
  pending: '#F59E0B',
  in_progress: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444',
};

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceCases, setServiceCases] = useState<ServiceCase[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalServiceCases: 0,
    activeServiceCases: 0,
    completedServiceCases: 0,
    totalCustomers: 0,
    activeReminders: 0,
    overdueReminders: 0,
  });

  const loadDashboardData = async () => {
    try {
      console.log('Dashboard - Loading data...');
      const [customersData, serviceCasesData, remindersData] = await Promise.all([
        customerStorage.getAll(),
        serviceCaseStorage.getAllWithCustomers(),
        reminderStorage.getAll(),
      ]);

      console.log('Dashboard - Loaded customers:', customersData.length, customersData);
      console.log('Dashboard - Loaded service cases with customers:', serviceCasesData.length, serviceCasesData);

      setCustomers(customersData);
      setServiceCases(serviceCasesData);
      setReminders(remindersData);

      // Beräkna statistik
      const activeCases = serviceCasesData.filter(case_ => 
        case_.status === 'pending' || case_.status === 'in_progress'
      );
      const completedCases = serviceCasesData.filter(case_ => 
        case_.status === 'completed'
      );
      const activeReminders = remindersData.filter(reminder => !reminder.isCompleted);
      const overdueReminders = remindersData.filter(reminder => 
        !reminder.isCompleted && new Date(reminder.dueDate) < new Date()
      );

      setStats({
        totalServiceCases: serviceCasesData.length,
        activeServiceCases: activeCases.length,
        completedServiceCases: completedCases.length,
        totalCustomers: customersData.length,
        activeReminders: activeReminders.length,
        overdueReminders: overdueReminders.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const getStatusText = (status: ServiceCase['status']) => {
    switch (status) {
      case 'pending': return 'Väntar';
      case 'in_progress': return 'Pågår';
      case 'completed': return 'Avslutat';
      case 'cancelled': return 'Avbrutet';
      default: return 'Okänd';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sv-SE');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'God morgon';
    if (hour < 18) return 'God eftermiddag';
    return 'God kväll';
  };

  const renderWelcomeHeader = () => (
    <View style={styles.welcomeHeader}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.welcomeTitle}>Översikt</Text>
          <Text style={styles.welcomeSubtitle}>
            Snabb översikt över ditt arbete
          </Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.searchButtonInner}>
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsGrid = () => (
    <View style={styles.statsGrid}>
      <TouchableOpacity 
        style={[styles.statCard, styles.statCardPrimary]}
        onPress={() => navigation.navigate('Main', { 
          screen: 'ServiceCases',
          params: { initialFilter: 'active' }
        })}
        activeOpacity={0.9}
      >
        <View style={styles.statContent}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>🔧</Text>
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statNumber}>{stats.activeServiceCases}</Text>
            <Text style={styles.statLabel}>Aktiva ärenden</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.statCard, styles.statCardSecondary]}
        onPress={() => navigation.navigate('Main', { screen: 'Customers' })}
        activeOpacity={0.9}
      >
        <View style={styles.statContent}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>👥</Text>
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statNumber}>{stats.totalCustomers}</Text>
            <Text style={styles.statLabel}>Kunder</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.statCard, styles.statCardWarning]}
        onPress={() => navigation.navigate('Reminders')}
        activeOpacity={0.9}
      >
        <View style={styles.statContent}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>⏰</Text>
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statNumber}>{stats.activeReminders}</Text>
            <Text style={styles.statLabel}>Påminnelser</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.statCard, styles.statCardSuccess]}
        onPress={() => navigation.navigate('Main', { 
          screen: 'ServiceCases',
          params: { initialFilter: 'completed' }
        })}
        activeOpacity={0.9}
      >
        <View style={styles.statContent}>
          <View style={styles.statIconContainer}>
            <Text style={styles.statIcon}>✅</Text>
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statNumber}>{stats.completedServiceCases}</Text>
            <Text style={styles.statLabel}>Avslutade</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('NewServiceCase')}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionIcon}>
            <Text style={styles.quickActionIconText}>➕</Text>
          </View>
          <Text style={styles.quickActionText}>Nytt ärende</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('NewCustomer')}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionIcon}>
            <Text style={styles.quickActionIconText}>👤</Text>
          </View>
          <Text style={styles.quickActionText}>Ny kund</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('NewProduct')}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionIcon}>
            <Text style={styles.quickActionIconText}>📦</Text>
          </View>
          <Text style={styles.quickActionText}>Ny produkt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('NewReminder')}
          activeOpacity={0.8}
        >
          <View style={styles.quickActionIcon}>
            <Text style={styles.quickActionIconText}>⏰</Text>
          </View>
          <Text style={styles.quickActionText}>Påminnelse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentActivity = () => {
    const recentServiceCases = serviceCases.slice(0, 3);

    return (
      <View style={styles.recentActivitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Senaste aktivitet</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Main', { screen: 'ServiceCases' })}
            activeOpacity={0.8}
          >
            <Text style={styles.seeAllText}>Se alla</Text>
          </TouchableOpacity>
        </View>
        
        {recentServiceCases.length > 0 ? (
          recentServiceCases.map((serviceCase) => (
            <TouchableOpacity
              key={serviceCase.id}
              style={styles.activityCard}
              onPress={() => navigation.navigate('ServiceCaseDetail', { serviceCaseId: serviceCase.id })}
              activeOpacity={0.95}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle} numberOfLines={1}>
                  {serviceCase.title}
                </Text>
                <View style={[
                  styles.activityStatus, 
                  { backgroundColor: STATUS_COLORS[serviceCase.status] }
                ]}>
                  <Text style={styles.activityStatusText}>{getStatusText(serviceCase.status)}</Text>
                </View>
              </View>
              <Text style={styles.activityCustomer}>
                {serviceCase.customer?.name || 'Okänd kund'}
              </Text>
              <Text style={styles.activityDate}>
                {formatDate(serviceCase.createdAt)}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>Inga serviceärenden än</Text>
            <Text style={styles.emptySubtext}>
              Skapa ditt första serviceärende för att komma igång
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeHeader()}
        {renderStatsGrid()}
        {renderQuickActions()}
        {renderRecentActivity()}
      </ScrollView>

      {searchVisible && (
        <GlobalSearch
          visible={searchVisible}
          onClose={() => setSearchVisible(false)}
          navigation={navigation}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  searchButton: {
    marginLeft: 16,
  },
  searchButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  searchIcon: {
    fontSize: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  statCardSecondary: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIcon: {
    fontSize: 20,
    fontWeight: '600',
  },
  statTextContainer: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  recentActivitySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  activityStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  activityCustomer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 