import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Card, Chip, IconButton, Button, FAB } from 'react-native-paper';
import { Customer, ServiceCase, Product } from '../types';
import { customerStorage, serviceCaseStorage, productStorage } from '../services/storage';
import { ROUTES, COLORS, EQUIPMENT_TYPES } from '../constants';

interface CustomerDetailScreenProps {
  navigation: any;
  route: { params: { customerId: string } };
}

export const CustomerDetailScreen: React.FC<CustomerDetailScreenProps> = ({ navigation, route }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [serviceCases, setServiceCases] = useState<ServiceCase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { customerId } = route.params;

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  // Uppdatera data när skärmen får fokus (t.ex. när man kommer tillbaka från NewProductScreen)
  useFocusEffect(
    React.useCallback(() => {
      loadCustomerData();
    }, [customerId])
  );

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const customerData = await customerStorage.getById(customerId);
      const cases = await serviceCaseStorage.getByCustomerId(customerId);
      const customerProducts = await productStorage.getByCustomerId(customerId);
      
      setCustomer(customerData);
      setServiceCases(cases);
      setProducts(customerProducts);
    } catch (error) {
      console.error('Error loading customer data:', error);
      Alert.alert('Fel', 'Kunde inte ladda kunddata');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = () => {
    navigation.navigate(ROUTES.EDIT_CUSTOMER, { customerId: customerId });
  };

  const handleAddProduct = () => {
    navigation.navigate(ROUTES.NEW_PRODUCT, { customerId: customerId });
  };

  const handleArchiveCustomer = () => {
    Alert.alert(
      'Arkivera kund',
      `Är du säker på att du vill arkivera ${customer?.name}? Kunden kommer att flyttas till arkivet.`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Arkivera',
          style: 'destructive',
          onPress: async () => {
            try {
              await customerStorage.archive(customerId);
              Alert.alert('Framgång', 'Kunden har arkiverats');
              navigation.goBack();
            } catch (error) {
              console.error('Error archiving customer:', error);
              Alert.alert('Fel', 'Kunde inte arkivera kunden');
            }
          },
        },
      ]
    );
  };

  const handleServiceCasePress = (serviceCase: ServiceCase) => {
    navigation.navigate('ServiceCaseDetail', { serviceCaseId: serviceCase.id });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sv-SE');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Laddar kunddata...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Kunden kunde inte hittas</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Tillbaka</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={COLORS.text}
        />
        <Text style={styles.headerTitle}>Kunddetaljer</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="pencil"
            size={24}
            onPress={handleEditCustomer}
            iconColor={COLORS.primary}
          />
          <IconButton
            icon="archive"
            size={24}
            onPress={handleArchiveCustomer}
            iconColor={COLORS.warning}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Kundinformation */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Kundinformation</Text>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerAddress}>{customer.address}</Text>
            <Text style={styles.customerPhone}>{customer.phone}</Text>
            {customer.email && (
              <Text style={styles.customerEmail}>{customer.email}</Text>
            )}
            {customer.contactPerson && (
              <Text style={styles.customerContact}>Kontakt: {customer.contactPerson}</Text>
            )}
            {customer.notes && (
              <Text style={styles.customerNotes}>{customer.notes}</Text>
            )}
            <Chip style={styles.dateChip} textStyle={styles.dateChipText}>
              Skapad {formatDate(customer.createdAt)}
            </Chip>
          </Card.Content>
        </Card>

        {/* Produkter */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Produkter ({products.length})</Text>
              <Button
                mode="outlined"
                onPress={handleAddProduct}
                icon="plus"
                compact
              >
                Lägg till
              </Button>
            </View>
            
            {products.length > 0 ? (
              products.map((product) => (
                <View key={product.id} style={styles.productItem}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productType}>{EQUIPMENT_TYPES[product.type]}</Text>
                    <Text style={styles.productSerial}>SN: {product.serialNumber}</Text>
                    {product.location && (
                      <Text style={styles.productLocation}>Plats: {product.location}</Text>
                    )}
                  </View>
                  <Chip style={styles.productChip} textStyle={styles.productChipText}>
                    {product.isActive ? 'Aktiv' : 'Inaktiv'}
                  </Chip>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Inga produkter registrerade</Text>
                <Text style={styles.emptyStateSubtext}>
                  Lägg till produkter som kunden äger
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Serviceärenden */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>
              Serviceärenden ({serviceCases.length})
            </Text>
            
            {serviceCases.length > 0 ? (
              serviceCases.map((serviceCase) => (
                <TouchableOpacity
                  key={serviceCase.id}
                  style={styles.serviceCaseItem}
                  onPress={() => handleServiceCasePress(serviceCase)}
                >
                  <View style={styles.serviceCaseInfo}>
                    <Text style={styles.serviceCaseTitle}>{serviceCase.title}</Text>
                    <Text style={styles.serviceCaseStatus}>
                      Status: {serviceCase.status === 'pending' ? 'Väntar' : 
                              serviceCase.status === 'in_progress' ? 'Pågår' :
                              serviceCase.status === 'completed' ? 'Slutförd' : 'Avbruten'}
                    </Text>
                    <Text style={styles.serviceCaseDate}>
                      Skapad: {formatDate(serviceCase.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Inga serviceärenden än</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddProduct}
        color="white"
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
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  customerAddress: {
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  customerContact: {
    fontSize: 16,
    color: '#6B6B6B',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  customerNotes: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
    lineHeight: 20,
  },
  customerDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  serviceCaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  serviceCaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  serviceCaseStatus: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  serviceCaseDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceSecondary,
    marginTop: 8,
  },
  dateChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  productSerial: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  productLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  productChip: {
    backgroundColor: COLORS.success,
  },
  productChipText: {
    color: 'white',
    fontSize: 12,
  },
  serviceCaseItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  serviceCaseInfo: {
    flex: 1,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
}); 