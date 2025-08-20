import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';
import { Customer, ServiceCase } from '../types';
import { customerStorage, serviceCaseStorage, reminderStorage } from '../services/storage';
import { GlobalSearch } from '../components/GlobalSearch';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

const { width: screenWidth } = Dimensions.get('window');

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

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.9);

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
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
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

  const renderModernHeader = () => (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.modernHeader}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Animated.Text 
            style={[styles.greeting, { opacity: fadeAnim }]}
          >
            {getGreeting()}
          </Animated.Text>
          <Animated.Text 
            style={[styles.welcomeTitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            Översikt
          </Animated.Text>
          <Animated.Text 
            style={[styles.welcomeSubtitle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            Snabb översikt över ditt arbete
          </Animated.Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchVisible(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            style={styles.searchButtonGradient}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderAnimatedStatCard = ({ 
    title, 
    value, 
    icon, 
    gradient, 
    onPress, 
    delay = 0 
  }: {
    title: string;
    value: number;
    icon: string;
    gradient: readonly [string, string];
    onPress: () => void;
    delay?: number;
  }) => {
    const cardAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.9);

    useEffect(() => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(cardAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.statCardContainer,
          {
            opacity: cardAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.statCard}
          onPress={onPress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCardGradient}
          >
            <View style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>{icon}</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>{value}</Text>
                <Text style={styles.statLabel}>{title}</Text>
              </View>
            </View>
            <View style={styles.statCardOverlay} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderStatsGrid = () => (
    <Animated.View 
      style={[
        styles.statsGrid,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      {renderAnimatedStatCard({
        title: 'Aktiva ärenden',
        value: stats.activeServiceCases,
        icon: '🔧',
        gradient: ['#3B82F6' as const, '#1D4ED8' as const],
        onPress: () => navigation.navigate('Main', { 
          screen: 'ServiceCases',
          params: { initialFilter: 'active' }
        }),
        delay: 100,
      })}
      
      {renderAnimatedStatCard({
        title: 'Kunder',
        value: stats.totalCustomers,
        icon: '👥',
        gradient: ['#10B981' as const, '#059669' as const],
        onPress: () => navigation.navigate('Main', { screen: 'Customers' }),
        delay: 200,
      })}
      
      {renderAnimatedStatCard({
        title: 'Påminnelser',
        value: stats.activeReminders,
        icon: '⏰',
        gradient: ['#F59E0B' as const, '#D97706' as const],
        onPress: () => navigation.navigate('Reminders'),
        delay: 300,
      })}
      
      {renderAnimatedStatCard({
        title: 'Avslutade',
        value: stats.completedServiceCases,
        icon: '✅',
        gradient: ['#8B5CF6' as const, '#7C3AED' as const],
        onPress: () => navigation.navigate('Main', { 
          screen: 'ServiceCases',
          params: { initialFilter: 'completed' }
        }),
        delay: 400,
      })}
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View 
      style={[
        styles.quickActionsContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Text style={styles.sectionTitle}>Snabbåtgärder</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('NewServiceCase')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.1)', 'rgba(29, 78, 216, 0.05)']}
            style={styles.quickActionGradient}
          >
            <Text style={styles.quickActionIcon}>➕</Text>
            <Text style={styles.quickActionText}>Nytt ärende</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('NewCustomer')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
            style={styles.quickActionGradient}
          >
            <Text style={styles.quickActionIcon}>👤</Text>
            <Text style={styles.quickActionText}>Ny kund</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('NewReminder')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.05)']}
            style={styles.quickActionGradient}
          >
            <Text style={styles.quickActionIcon}>⏰</Text>
            <Text style={styles.quickActionText}>Påminnelse</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => setSearchVisible(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(124, 58, 237, 0.05)']}
            style={styles.quickActionGradient}
          >
            <Text style={styles.quickActionIcon}>🔍</Text>
            <Text style={styles.quickActionText}>Sök</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderRecentActivity = () => {
    const recentCases = serviceCases
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    return (
      <Animated.View 
        style={[
          styles.recentActivityContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Text style={styles.sectionTitle}>Senaste aktivitet</Text>
        {recentCases.length > 0 ? (
          recentCases.map((serviceCase, index) => (
            <TouchableOpacity
              key={serviceCase.id}
              style={styles.activityCard}
              onPress={() => navigation.navigate('ServiceCaseDetail', { 
                serviceCaseId: serviceCase.id 
              })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']}
                style={styles.activityCardGradient}
              >
                <View style={styles.activityContent}>
                  <View style={styles.activityLeft}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {serviceCase.title}
                    </Text>
                    <Text style={styles.activityCustomer} numberOfLines={1}>
                      {serviceCase.customer?.name || 'Okänd kund'}
                    </Text>
                  </View>
                  <View style={styles.activityRight}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: STATUS_COLORS[serviceCase.status] }
                    ]}>
                      <Text style={styles.statusText}>
                        {getStatusText(serviceCase.status)}
                      </Text>
                    </View>
                    <Text style={styles.activityDate}>
                      {formatDate(serviceCase.updatedAt)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Ingen aktivitet än</Text>
            <Text style={styles.emptyStateSubtext}>
              Skapa ditt första serviceärende för att komma igång
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderModernHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
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
  modernHeader: {
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
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
  searchButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  statCardContainer: {
    flex: 1,
    minWidth: '48%',
  },
  statCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statCardGradient: {
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
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
  quickActionsContainer: {
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  quickActionGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
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
  recentActivityContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  activityCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  activityCardGradient: {
    padding: 16,
    borderRadius: 12,
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLeft: {
    flex: 1,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  activityCustomer: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  activityDate: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
}); 