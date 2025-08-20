import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Chip,
  Card,
  IconButton,
  Divider,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ServiceCase, Customer, Product } from '../types';
import { serviceCaseStorage, customerStorage, productStorage } from '../services/storage';
import { ROUTES, COLORS, EQUIPMENT_TYPES, STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import { SearchableDropdown } from '../components/SearchableDropdown';

interface EditServiceCaseScreenProps {
  navigation: any;
}

export const EditServiceCaseScreen: React.FC<EditServiceCaseScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const { serviceCaseId } = route.params as { serviceCaseId: string };
  
  const [serviceCase, setServiceCase] = useState<ServiceCase | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ServiceCase['status']>('pending');
  const [priority, setPriority] = useState<ServiceCase['priority']>('medium');
  const [equipmentType, setEquipmentType] = useState<ServiceCase['equipmentType']>('viper');
  const [equipmentSerialNumber, setEquipmentSerialNumber] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCustomerId]);

  // Uppdatera utrustningstyp och serienummer när produkt väljs
  useEffect(() => {
    if (selectedProductId) {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      if (selectedProduct) {
        // Konvertera produkttyp till serviceärende-typ
        let serviceEquipmentType: ServiceCase['equipmentType'];
        switch (selectedProduct.type) {
          case 'viper':
          case 'powertraxx':
            serviceEquipmentType = selectedProduct.type;
            break;
          case 'transcend':
          case 'fixed':
          case 'other':
          default:
            serviceEquipmentType = 'other';
            break;
        }
        setEquipmentType(serviceEquipmentType);
        setEquipmentSerialNumber(selectedProduct.serialNumber || '');
      }
    }
  }, [selectedProductId, products]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Ladda serviceärende
      const caseData = await serviceCaseStorage.getById(serviceCaseId);
      if (!caseData) {
        Alert.alert('Fel', 'Kunde inte hitta serviceärendet');
        navigation.goBack();
        return;
      }
      
      setServiceCase(caseData);
      
      // Sätt formulärfält
      setTitle(caseData.title);
      setDescription(caseData.description);
      setStatus(caseData.status);
      setPriority(caseData.priority);
      setEquipmentType(caseData.equipmentType);
      setEquipmentSerialNumber(caseData.equipmentSerialNumber || '');
      setSelectedCustomerId(caseData.customerId);
      setSelectedProductId(caseData.productId || '');
      setScheduledDate(caseData.scheduledDate ? caseData.scheduledDate.toISOString().split('T')[0] : '');
      
      // Ladda kunder
      const customersData = await customerStorage.getAll();
      setCustomers(customersData);
      
      // Ladda alla fristående produkter från katalogen
      const productsData = await productStorage.getStandaloneProducts();
      setProducts(productsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Fel', 'Kunde inte ladda data');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      // Ladda produkter baserat på vald kund
      if (selectedCustomerId) {
        const productsData = await productStorage.getByCustomerId(selectedCustomerId);
        setProducts(productsData);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSave = async () => {
    if (!serviceCase) return;
    
    if (!title.trim()) {
      Alert.alert('Fel', 'Titel är obligatorisk');
      return;
    }
    
    if (!selectedCustomerId) {
      Alert.alert('Fel', 'Välj en kund');
      return;
    }

    try {
      setSaving(true);
      
      const updatedServiceCase: ServiceCase = {
        ...serviceCase,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        equipmentType,
        equipmentSerialNumber: equipmentSerialNumber.trim(),
        customerId: selectedCustomerId,
        productId: selectedProductId || undefined,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        updatedAt: new Date(),
      };
      
      await serviceCaseStorage.update(serviceCaseId, updatedServiceCase);
      
      Alert.alert('Framgång', 'Serviceärendet har uppdaterats', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error saving service case:', error);
      Alert.alert('Fel', 'Kunde inte spara serviceärendet');
    } finally {
      setSaving(false);
    }
  };

  const getStatusButtons = () => [
    { value: 'pending', label: 'Väntar', icon: 'clock-outline' },
    { value: 'in_progress', label: 'Pågår', icon: 'play-circle-outline' },
    { value: 'completed', label: 'Klart', icon: 'check-circle-outline' },
    { value: 'cancelled', label: 'Avbrutet', icon: 'close-circle-outline' },
  ];

  const getPriorityButtons = () => [
    { value: 'low', label: 'Låg', icon: 'flag-outline' },
    { value: 'medium', label: 'Medium', icon: 'flag-outline' },
    { value: 'high', label: 'Hög', icon: 'flag-outline' },
    { value: 'urgent', label: 'Akut', icon: 'flag-outline' },
  ];

  const getEquipmentButtons = () => [
    { value: 'viper', label: 'VIPER', icon: 'medical-bag' },
    { value: 'powertraxx', label: 'PowerTraxx', icon: 'seat' },
    { value: 'other', label: 'Annan', icon: 'help-circle-outline' },
  ];

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laddar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            iconColor={COLORS.text}
          />
          <Text style={styles.headerTitle}>Redigera serviceärende</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Grundinformation</Text>
              
              <TextInput
                label="Titel *"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />
              
              <TextInput
                label="Beskrivning"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                multiline
                numberOfLines={3}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Status & Prioritet</Text>
              
              <Text style={styles.fieldLabel}>Status</Text>
              <SegmentedButtons
                value={status}
                onValueChange={setStatus as (value: string) => void}
                buttons={getStatusButtons()}
                style={styles.segmentedButtons}
              />
              
              <Text style={styles.fieldLabel}>Prioritet</Text>
              <SegmentedButtons
                value={priority}
                onValueChange={setPriority as (value: string) => void}
                buttons={getPriorityButtons()}
                style={styles.segmentedButtons}
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Kund & Utrustning</Text>
              
              <SearchableDropdown
                label="Kund"
                placeholder="Välj kund..."
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
                data={customers}
                getLabel={(customer) => customer.name}
                getValue={(customer) => customer.id}
                getSubLabel={(customer) => `${customer.address} • ${customer.phone}`}
                required={true}
                disabled={customers.length === 0}
              />
              
              {selectedCustomer && (
                <View style={styles.selectedCustomerInfo}>
                  <Text style={styles.selectedCustomerLabel}>Vald kund:</Text>
                  <Text style={styles.selectedCustomerName}>{selectedCustomer.name}</Text>
                  <Text style={styles.selectedCustomerDetails}>
                    {selectedCustomer.phone} • {selectedCustomer.email}
                  </Text>
                </View>
              )}

              <SearchableDropdown
                label="Produkt"
                placeholder={selectedCustomerId ? "Välj produkt (valfritt)..." : "Välj kund först..."}
                value={selectedProductId}
                onValueChange={setSelectedProductId}
                data={products}
                getLabel={(product) => product.name}
                getValue={(product) => product.id}
                getSubLabel={(product) => `${product.serialNumber} • ${EQUIPMENT_TYPES[product.type]}`}
                required={false}
                disabled={!selectedCustomerId || products.length === 0}
              />
              
              {selectedProductId && (
                <View style={styles.productInfo}>
                  <Text style={styles.productInfoText}>
                    Utrustningstyp: {EQUIPMENT_TYPES[equipmentType]}
                  </Text>
                  {equipmentSerialNumber && (
                    <Text style={styles.productInfoText}>
                      Serienummer: {equipmentSerialNumber}
                    </Text>
                  )}
                </View>
              )}
              {selectedCustomerId && products.length === 0 && (
                <Text style={styles.noProductsText}>
                  Denna kund har inga registrerade produkter
                </Text>
              )}
              
              <TextInput
                label="Planerat datum (YYYY-MM-DD)"
                value={scheduledDate}
                onChangeText={setScheduledDate}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                placeholder="2024-01-15"
              />
            </Card.Content>
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving || !title.trim() || !selectedCustomerId}
            style={styles.saveButton}
            buttonColor={COLORS.primary}
          >
            Spara ändringar
          </Button>
        </View>
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  customerSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  customerChip: {
    backgroundColor: COLORS.surfaceSecondary,
    borderColor: COLORS.border,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  customerChipText: {
    color: COLORS.text,
  },
  selectedChipText: {
    color: 'white',
  },
  selectedCustomerInfo: {
    backgroundColor: COLORS.surfaceSecondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedCustomerLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  selectedCustomerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  selectedCustomerDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  productSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  productChip: {
    backgroundColor: COLORS.surfaceSecondary,
    borderColor: COLORS.border,
  },
  productChipText: {
    color: COLORS.text,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  saveButton: {
    borderRadius: 8,
  },
  productInfo: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  productInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  noProductsText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
}); 