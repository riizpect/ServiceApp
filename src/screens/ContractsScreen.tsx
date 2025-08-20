import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ServiceContract, ContractStatus, RootStackNavigationProp } from '../types';
import { contractStorage } from '../services/contractStorage';
import { customerStorage } from '../services/storage';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorHandler } from '../utils/errorHandler';

interface ContractWithCustomer extends ServiceContract {
  customerName?: string;
}

const ContractsScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { colors } = useTheme();
  const [contracts, setContracts] = useState<ContractWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const allContracts = await contractStorage.getAllContracts();
      const customers = await customerStorage.getAll();
      
      const contractsWithCustomers = allContracts.map(contract => {
        const customer = customers.find(c => c.id === contract.customerId);
        return {
          ...contract,
          customerName: customer?.name || 'Okänd kund',
        };
      });
      
      setContracts(contractsWithCustomers);
    } catch (error) {
      ErrorHandler.handle(error, 'Fel vid laddning av avtal');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadContracts();
    setRefreshing(false);
  }, [loadContracts]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const filteredContracts = useMemo(() => {
    if (!searchQuery.trim()) return contracts;
    
    const query = searchQuery.toLowerCase();
    return contracts.filter(contract =>
      contract.title.toLowerCase().includes(query) ||
      contract.contractNumber.toLowerCase().includes(query) ||
      contract.customerName?.toLowerCase().includes(query)
    );
  }, [contracts, searchQuery]);

  const getStatusColor = useCallback((status: ContractStatus) => {
    switch (status) {
      case 'active': return colors.success;
      case 'paused': return colors.warning;
      case 'expired': return colors.error;
      case 'cancelled': return colors.text;
      case 'pending': return colors.primary;
      default: return colors.text;
    }
  }, [colors]);

  const getStatusText = useCallback((status: ContractStatus) => {
    switch (status) {
      case 'active': return 'Aktivt';
      case 'paused': return 'Pausat';
      case 'expired': return 'Utgånget';
      case 'cancelled': return 'Avbrutet';
      case 'pending': return 'Väntande';
      default: return status;
    }
  }, []);

  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString('sv-SE');
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
    }).format(amount);
  }, []);

  const handleContractPress = useCallback((contract: ContractWithCustomer) => {
    navigation.navigate('ContractDetails', { contractId: contract.id });
  }, [navigation]);

  const handleCreateContract = useCallback(() => {
    navigation.navigate('CreateContract');
  }, [navigation]);

  const handleDeleteContract = useCallback(async (contract: ContractWithCustomer) => {
    Alert.alert(
      'Ta bort avtal',
      `Är du säker på att du vill ta bort avtalet "${contract.title}"?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              await contractStorage.deleteContract(contract.id);
              await loadContracts();
            } catch (error) {
              ErrorHandler.handle(error, 'Fel vid borttagning av avtal');
            }
          },
        },
      ]
    );
  }, [loadContracts]);

  const renderContractItem = useCallback(({ item }: { item: ContractWithCustomer }) => (
    <TouchableOpacity
      style={[styles.contractCard, { backgroundColor: colors.surface }]}
      onPress={() => handleContractPress(item)}
    >
      <View style={styles.contractHeader}>
        <View style={styles.contractInfo}>
          <Text style={[styles.contractTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.contractNumber, { color: colors.textSecondary }]}>
            {item.contractNumber}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.contractDetails}>
        <Text style={[styles.customerName, { color: colors.text }]}>
          {item.customerName}
        </Text>
        <Text style={[styles.contractDates, { color: colors.textSecondary }]}>
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
        <Text style={[styles.contractValue, { color: colors.primary }]}>
          {formatCurrency(item.totalValue)}
        </Text>
      </View>
      
      <View style={styles.contractActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('EditContract', { contractId: item.id })}
        >
          <Ionicons name="pencil" size={16} color={colors.textInverse} />
          <Text style={[styles.actionText, { color: colors.textInverse }]}>Redigera</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteContract(item)}
        >
          <Ionicons name="trash" size={16} color={colors.textInverse} />
          <Text style={[styles.actionText, { color: colors.textInverse }]}>Ta bort</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [colors, getStatusColor, getStatusText, formatDate, formatCurrency, handleContractPress, handleDeleteContract, navigation]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Service-avtal</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleCreateContract}
        >
          <Ionicons name="add" size={24} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredContracts}
        renderItem={renderContractItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Inga service-avtal hittades
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateContract}
            >
              <Text style={[styles.createButtonText, { color: colors.textInverse }]}>
                Skapa första avtalet
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  contractCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contractInfo: {
    flex: 1,
  },
  contractTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contractNumber: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contractDetails: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contractDates: {
    fontSize: 14,
    marginBottom: 4,
  },
  contractValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contractActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContractsScreen; 