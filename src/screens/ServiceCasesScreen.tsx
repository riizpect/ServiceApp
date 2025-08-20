import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../constants';
import { ServiceCase, RootStackParamList } from '../types';
import ServiceCaseCard from '../components/ServiceCaseCard';
import { getServiceCases, getCustomers, serviceCaseStorage } from '../services/storage';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const ServiceCasesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [serviceCases, setServiceCases] = useState<ServiceCase[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Alla');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hantera initialFilter från route params
  useEffect(() => {
    const params = route.params as any;
    if (params?.initialFilter) {
      switch (params.initialFilter) {
        case 'active':
          setFilterStatus('Aktiva');
          break;
        case 'completed':
          setFilterStatus('Klar');
          break;
        default:
          setFilterStatus('Alla');
      }
    }
  }, [route.params]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesData, customersData] = await Promise.all([
        getServiceCases(),
        getCustomers(),
      ]);
      setServiceCases(casesData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Fel', 'Kunde inte ladda data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getCustomerById = (customerId: string) => {
    return customers.find(customer => customer.id === customerId);
  };

  const handleStatusChange = async (serviceCaseId: string, newStatus: string) => {
    try {
      // Här skulle vi normalt uppdatera i databasen
      // För nu bara uppdaterar vi lokalt
      setServiceCases(prev => 
        prev.map(case_ => 
          case_.id === serviceCaseId 
            ? { ...case_, status: newStatus as ServiceCase['status'] }
            : case_
        )
      );
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte uppdatera status');
    }
  };

  const handlePriorityChange = async (serviceCaseId: string, newPriority: string) => {
    try {
      // Kontrollera om newPriority redan är ett giltigt priority-värde
      const validPriorities: ServiceCase['priority'][] = ['low', 'medium', 'high', 'urgent'];
      let finalPriority: ServiceCase['priority'] = 'medium';
      
      if (validPriorities.includes(newPriority as ServiceCase['priority'])) {
        // Om det redan är ett giltigt värde, använd det direkt
        finalPriority = newPriority as ServiceCase['priority'];
      } else {
        // Fallback för svenska texter (för bakåtkompatibilitet)
        const priorityMap: { [key: string]: 'low' | 'medium' | 'high' | 'urgent' } = {
          'Låg': 'low',
          'Medium': 'medium',
          'Hög': 'high',
          'Akut': 'urgent',
        };
        
        finalPriority = priorityMap[newPriority] || 'medium';
      }

      // Uppdatera lokalt state
      setServiceCases(prev => 
        prev.map(case_ => 
          case_.id === serviceCaseId 
            ? { ...case_, priority: finalPriority }
            : case_
        )
      );

      // Spara till AsyncStorage
      await serviceCaseStorage.update(serviceCaseId, { priority: finalPriority });
      
    } catch (error) {
      console.error('Error updating priority:', error);
      Alert.alert('Fel', 'Kunde inte uppdatera prioritet');
    }
  };

  const handleEdit = (serviceCase: ServiceCase) => {
    navigation.navigate('EditServiceCase', { serviceCaseId: serviceCase.id });
  };

  const handleDelete = async (serviceCaseId: string) => {
    try {
      setServiceCases(prev => prev.filter(case_ => case_.id !== serviceCaseId));
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte ta bort serviceärende');
    }
  };

  const handleAddServiceCase = () => {
    navigation.navigate('NewServiceCase');
  };

  const handleServiceCasePress = (serviceCase: ServiceCase) => {
    navigation.navigate('ServiceCaseDetail', { serviceCaseId: serviceCase.id });
  };

  // Mappning från svenska filtertexter till interna statusvärden
  const getStatusFromFilter = (filterText: string): ServiceCase['status'][] => {
    switch (filterText) {
      case 'Aktiva': return ['pending', 'in_progress'];
      case 'Pågående': return ['in_progress'];
      case 'Klar': return ['completed'];
      case 'Avbruten': return ['cancelled'];
      default: return [];
    }
  };

  const statusFilter = getStatusFromFilter(filterStatus);

  // Prioritet sortering (högsta först)
  const getPriorityOrder = (priority: ServiceCase['priority']) => {
    switch (priority) {
      case 'urgent': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  // Filtrera och sortera service cases
  const filteredCases = serviceCases
    .filter(case_ => {
      // Status filter
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(case_.status);
      
      // Search filter
      const matchesSearch = case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           case_.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           getCustomerById(case_.customerId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      // Sortera efter prioritet (högsta först)
      const priorityDiff = getPriorityOrder(b.priority) - getPriorityOrder(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Om samma prioritet, sortera efter datum (nyaste först)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
        <Text style={styles.title}>Serviceärenden</Text>
          <Text style={styles.subtitle}>
            {filteredCases.length} av {serviceCases.length} ärenden
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddServiceCase}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Sök ärenden, kunder..."
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['Alla', 'Aktiva', 'Pågående', 'Klar', 'Avbruten'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filterStatus === status && styles.filterChipActive
              ]}
              onPress={() => setFilterStatus(status)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterChipText,
                filterStatus === status && styles.filterChipTextActive
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.swipeHint}>
          💡 Swipea åt vänster för att ändra prioritering
        </Text>
      </View>
    </View>
  );

  const renderServiceCase = ({ item }: { item: ServiceCase }) => {
    const customer = getCustomerById(item.customerId);
    return (
      <ServiceCaseCard
        serviceCase={item}
        customerName={customer?.name}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔧</Text>
      <Text style={styles.emptyTitle}>Inga serviceärenden</Text>
      <Text style={styles.emptyText}>
        {searchQuery || filterStatus !== 'Alla' 
          ? 'Inga serviceärenden matchar din sökning'
          : 'Du har inga serviceärenden än. Skapa ditt första ärende för att komma igång.'
        }
      </Text>
      {!searchQuery && filterStatus === 'Alla' && (
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={handleAddServiceCase}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyButtonText}>Skapa serviceärende</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Laddar serviceärenden...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredCases}
        renderItem={renderServiceCase}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    fontWeight: '500',
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  filterChipTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  swipeHint: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 20,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
    fontWeight: '400',
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },
}); 