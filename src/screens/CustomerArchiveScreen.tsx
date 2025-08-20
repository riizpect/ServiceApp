import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { Customer } from '../types';
import { customerStorage } from '../services/storage';

interface CustomerArchiveCardProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
}

const CustomerArchiveCard: React.FC<CustomerArchiveCardProps> = ({ customer, onPress }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sv-SE');
  };

  return (
    <TouchableOpacity 
      style={styles.customerCard} 
      onPress={() => onPress(customer)}
      activeOpacity={0.7}
    >
      <View style={styles.customerHeader}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <View style={styles.archivedBadge}>
          <Text style={styles.archivedBadgeText}>Arkiverad</Text>
        </View>
      </View>
      
      <View style={styles.customerDetails}>
        <Text style={styles.customerAddress}>{customer.address}</Text>
        <Text style={styles.customerPhone}>{customer.phone}</Text>
        {customer.email && (
          <Text style={styles.customerEmail}>{customer.email}</Text>
        )}
        {customer.contactPerson && (
          <Text style={styles.customerContact}>Kontakt: {customer.contactPerson}</Text>
        )}
        <Text style={styles.archiveDate}>
          Arkiverad: {customer.archivedAt ? formatDate(customer.archivedAt) : 'Okänt datum'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface CustomerArchiveScreenProps {
  navigation: any;
}

export const CustomerArchiveScreen: React.FC<CustomerArchiveScreenProps> = ({ navigation }) => {
  const [archivedCustomers, setArchivedCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadArchivedCustomers = async () => {
    try {
      setLoading(true);
      const customersData = await customerStorage.getArchived();
      const sortedCustomers = customersData.sort((a, b) => 
        new Date(b.archivedAt || 0).getTime() - new Date(a.archivedAt || 0).getTime()
      );
      setArchivedCustomers(sortedCustomers);
    } catch (error) {
      console.error('Error loading archived customers:', error);
      Alert.alert('Fel', 'Kunde inte ladda arkiverade kunder');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadArchivedCustomers();
    setRefreshing(false);
  };

  useEffect(() => {
    loadArchivedCustomers();
  }, []);

  const handleCustomerPress = (customer: Customer) => {
    navigation.navigate('CustomerDetail', { customerId: customer.id });
  };

  const handleUnarchiveCustomer = async (customer: Customer) => {
    Alert.alert(
      'Återställ kund',
      `Är du säker på att du vill återställa ${customer.name} från arkivet?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Återställ',
          onPress: async () => {
            try {
              await customerStorage.unarchive(customer.id);
              Alert.alert('Framgång', 'Kunden har återställts från arkivet');
              await loadArchivedCustomers();
            } catch (error) {
              console.error('Error unarchiving customer:', error);
              Alert.alert('Fel', 'Kunde inte återställa kunden');
            }
          },
        },
      ]
    );
  };

  const handleDeletePermanently = async (customer: Customer) => {
    Alert.alert(
      'Ta bort permanent',
      `Är du säker på att du vill ta bort ${customer.name} permanent? Detta kan inte ångras.`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort permanent',
          style: 'destructive',
          onPress: async () => {
            try {
              await customerStorage.deletePermanently(customer.id);
              Alert.alert('Framgång', 'Kunden har tagits bort permanent');
              await loadArchivedCustomers();
            } catch (error) {
              console.error('Error permanently deleting customer:', error);
              Alert.alert('Fel', 'Kunde inte ta bort kunden permanent');
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (customer: Customer) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={styles.unarchiveAction}
          onPress={() => handleUnarchiveCustomer(customer)}
        >
          <Text style={styles.actionText}>Återställ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeletePermanently(customer)}
        >
          <Text style={styles.actionText}>Ta bort</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📁</Text>
      <Text style={styles.emptyStateTitle}>Inga arkiverade kunder</Text>
      <Text style={styles.emptyStateSubtitle}>
        När du arkiverar en kund från kundlistan kommer den att visas här. Arkiverade kunder kan återställas eller tas bort permanent.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Tillbaka</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Arkiv</Text>
      <View style={{ width: 60 }} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      
      <FlatList
        data={archivedCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item)}
            rightThreshold={40}
          >
            <CustomerArchiveCard
              customer={item}
              onPress={handleCustomerPress}
            />
          </Swipeable>
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  listContainer: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    opacity: 0.8,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  archivedBadge: {
    backgroundColor: '#8E8E93',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  archivedBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  customerDetails: {
    gap: 4,
  },
  customerAddress: {
    fontSize: 14,
    color: '#6B6B6B',
    fontWeight: '500',
  },
  customerPhone: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  customerEmail: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  customerContact: {
    fontSize: 14,
    color: '#6B6B6B',
    fontStyle: 'italic',
  },
  archiveDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginRight: 16,
  },
  unarchiveAction: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 12,
    marginRight: 8,
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
}); 