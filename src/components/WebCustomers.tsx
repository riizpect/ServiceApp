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
  RefreshControl,
} from 'react-native';
import { Customer } from '../types';
import { getCustomers, customerStorage } from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';
import { LoadingSkeleton } from './LoadingSkeleton';

interface WebCustomersProps {
  onNavigate: (page: string, params?: any) => void;
}

export const WebCustomers: React.FC<WebCustomersProps> = ({ onNavigate }) => {
  const { colors } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      Alert.alert('Fel', 'Kunde inte ladda kunder');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

  const handleEdit = (customer: Customer) => {
    onNavigate('editcustomer', { customerId: customer.id });
  };

  const handleArchive = async (customer: Customer) => {
    Alert.alert(
      'Arkivera kund',
      `Är du säker på att du vill arkivera "${customer.name}"? Kunden kommer att flyttas till arkivet.`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Arkivera',
          style: 'destructive',
          onPress: async () => {
            try {
              await customerStorage.archive(customer.id);
              Alert.alert(
                'Kund arkiverad',
                `${customer.name} har arkiverats. Du kan hitta arkiverade kunder i arkivet.`,
                [
                  {
                    text: 'Visa arkiv',
                    onPress: () => onNavigate('customerarchive'),
                  },
                  { text: 'OK' },
                ]
              );
              await loadCustomers();
            } catch (error) {
              console.error('Error archiving customer:', error);
              Alert.alert('Fel', 'Kunde inte arkivera kunden');
            }
          },
        },
      ]
    );
  };

  const handleAddCustomer = () => {
    onNavigate('newcustomer');
  };

  const handleCustomerPress = (customer: Customer) => {
    onNavigate('customerdetail', { customerId: customer.id });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.text }]}>Kunder</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {filteredCustomers.length} kunder
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.archiveButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => onNavigate('customerarchive')}
            activeOpacity={0.8}
          >
            <Text style={[styles.archiveButtonText, { color: colors.text }]}>Arkiv</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddCustomer}
            activeOpacity={0.8}
          >
            <Text style={[styles.addButtonText, { color: colors.white }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Sök kunder..."
          placeholderTextColor={colors.textTertiary}
        />
      </View>
    </View>
  );

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      style={[styles.customerCard, { backgroundColor: colors.surface }]}
      onPress={() => handleCustomerPress(item)}
      activeOpacity={0.95}
    >
      <View style={styles.customerMain}>
        <View style={styles.customerInfo}>
          <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.customerMeta}>
            <Text style={[styles.customerPhone, { color: colors.textSecondary }]} numberOfLines={1}>
              📞 {item.phone}
            </Text>
            {item.email && (
              <Text style={[styles.customerEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                ✉️ {item.email}
              </Text>
            )}
          </View>
          <Text style={[styles.customerAddress, { color: colors.textSecondary }]} numberOfLines={1}>
            📍 {item.address}
          </Text>
        </View>
        
        <View style={styles.customerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => handleEdit(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.archiveActionButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => handleArchive(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.archiveActionText}>📁</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Inga kunder</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {searchQuery 
          ? 'Inga kunder matchar din sökning'
          : 'Du har inga kunder än. Lägg till din första kund för att komma igång.'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity 
          style={[styles.emptyActionButton, { backgroundColor: colors.primary }]}
          onPress={handleAddCustomer}
          activeOpacity={0.8}
        >
          <Text style={[styles.emptyActionText, { color: colors.white }]}>
            Lägg till första kunden
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {filteredCustomers.length > 0 ? (
        <FlatList
          data={filteredCustomers}
          renderItem={renderCustomer}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  archiveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  archiveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginTop: 16,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 24,
  },
  customerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  customerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
    marginRight: 16,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  customerMeta: {
    marginBottom: 8,
  },
  customerPhone: {
    fontSize: 14,
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 14,
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  archiveActionButton: {
    // Specific styling for archive button
  },
  archiveActionText: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyActionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 