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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../constants';
import { Customer, RootStackParamList } from '../types';
import { getCustomers, customerStorage } from '../services/storage';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const CustomersScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
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
    navigation.navigate('EditCustomer', { customerId: customer.id });
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
                    onPress: () => navigation.navigate('CustomerArchive'),
                  },
                  { text: 'OK' },
                ]
              );
              await loadCustomers(); // Ladda om listan
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
    navigation.navigate('NewCustomer');
  };

  const handleCustomerPress = (customer: Customer) => {
    navigation.navigate('CustomerDetail', { customerId: customer.id });
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
        <Text style={styles.title}>Kunder</Text>
          <Text style={styles.subtitle}>
            {filteredCustomers.length} kunder
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.archiveButton}
            onPress={() => navigation.navigate('CustomerArchive')}
            activeOpacity={0.8}
          >
            <Text style={styles.archiveButtonText}>Arkiv</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCustomer}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Sök kunder..."
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>
    </View>
  );

  const renderCustomer = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      style={styles.customerCard}
      onPress={() => handleCustomerPress(item)}
      activeOpacity={0.95}
    >
      <View style={styles.customerMain}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.customerMeta}>
            <Text style={styles.customerPhone} numberOfLines={1}>
              📞 {item.phone}
            </Text>
            {item.email && (
              <Text style={styles.customerEmail} numberOfLines={1}>
                ✉️ {item.email}
              </Text>
            )}
          </View>
          <Text style={styles.customerAddress} numberOfLines={1}>
            📍 {item.address}
          </Text>
        </View>
        
        <View style={styles.customerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEdit(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.archiveActionButton]}
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
      <Text style={styles.emptyTitle}>Inga kunder</Text>
      <Text style={styles.emptyText}>
        {searchQuery 
          ? 'Inga kunder matchar din sökning'
          : 'Du har inga kunder än. Lägg till din första kund för att komma igång.'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity 
          style={styles.emptyButton}
          onPress={handleAddCustomer}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyButtonText}>Lägg till kund</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Laddar kunder...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
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
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  archiveButton: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  archiveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
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
  customerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
  },
  customerMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  customerMeta: {
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  customerEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  customerAddress: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontWeight: '400',
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
  },
  archiveActionButton: {
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  archiveActionText: {
    fontSize: 14,
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