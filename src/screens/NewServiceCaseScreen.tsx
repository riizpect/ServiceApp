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
import { Chip, Card, IconButton, Button, TextInput } from 'react-native-paper';
import { ServiceCase, Customer, Product } from '../types';
import { serviceCaseStorage, customerStorage, productStorage, checklistItemStorage } from '../services/storage';
import { EQUIPMENT_TYPES, VIPER_CHECKLIST, POWERTRAXX_CHECKLIST, COLORS } from '../constants';
import { SearchableDropdown } from '../components/SearchableDropdown';

// Utility function för att generera ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

interface NewServiceCaseScreenProps {
  navigation: any;
}

export const NewServiceCaseScreen: React.FC<NewServiceCaseScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [equipmentType, setEquipmentType] = useState<ServiceCase['equipmentType']>('viper');
  const [equipmentSerialNumber, setEquipmentSerialNumber] = useState('');
  const [priority, setPriority] = useState<ServiceCase['priority']>('medium');
  const [scheduledDate, setScheduledDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadCustomers();
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
    } else {
      // Återställ till standardvärden om ingen produkt är vald
      setEquipmentType('viper');
      setEquipmentSerialNumber('');
    }
  }, [selectedProductId, products]);

  const loadCustomers = async () => {
    try {
      const customersData = await customerStorage.getAll();
      setCustomers(customersData);
      if (customersData.length > 0) {
        setSelectedCustomerId(customersData[0].id);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
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

  const getDefaultChecklist = (type: ServiceCase['equipmentType']) => {
    switch (type) {
      case 'viper':
        return VIPER_CHECKLIST;
      case 'powertraxx':
        return POWERTRAXX_CHECKLIST;
      default:
        return VIPER_CHECKLIST;
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Fel', 'Titel är obligatorisk');
      return;
    }

    if (!selectedCustomerId) {
      Alert.alert('Fel', 'Välj en kund');
      return;
    }

    try {
      setLoading(true);

      // Skapa nytt serviceärende
      const newServiceCase: ServiceCase = {
        id: generateId(), // Generera ID direkt här
        customerId: selectedCustomerId,
        productId: selectedProductId || undefined,
        title: title.trim(),
        description: description.trim(),
        status: 'pending',
        priority,
        equipmentType,
        equipmentSerialNumber: equipmentSerialNumber.trim(),
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        location: location.trim(),
        notes: notes.trim(),
        images: [],
        checklistItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Spara serviceärende
      await serviceCaseStorage.save(newServiceCase);

      // Skapa standard checklista
      const defaultChecklist = getDefaultChecklist(equipmentType);
      for (const item of defaultChecklist) {
        await checklistItemStorage.save({
          id: generateId(),
          serviceCaseId: newServiceCase.id,
          title: item.title,
          category: item.category,
          isCompleted: false,
          order: item.order,
        });
      }

      Alert.alert(
        'Framgång', 
        'Serviceärende skapat!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving service case:', error);
      Alert.alert('Fel', 'Kunde inte spara serviceärende');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Avbryt</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nytt Serviceärende</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Spara</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Kund */}
        <Card style={styles.card}>
          <Card.Content>
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
          </Card.Content>
        </Card>

        {/* Produkt */}
        <Card style={styles.card}>
          <Card.Content>
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
          </Card.Content>
        </Card>

        {/* Titel */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Titel *</Text>
            <TextInput
              label="Titel"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              placeholder="Ange titel för serviceärendet"
              maxLength={100}
            />
          </Card.Content>
        </Card>

        {/* Beskrivning */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Beskrivning</Text>
            <TextInput
              label="Beskrivning"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              placeholder="Beskriv vad som behöver göras"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </Card.Content>
        </Card>

        {/* Prioritet */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Prioritet</Text>
            <View style={styles.prioritySelector}>
              <Chip
                selected={priority === 'low'}
                onPress={() => setPriority('low')}
                style={[styles.priorityChip, priority === 'low' && styles.selectedChip]}
                textStyle={[styles.priorityChipText, priority === 'low' && styles.selectedChipText]}
              >
                Låg
              </Chip>
              <Chip
                selected={priority === 'medium'}
                onPress={() => setPriority('medium')}
                style={[styles.priorityChip, priority === 'medium' && styles.selectedChip]}
                textStyle={[styles.priorityChipText, priority === 'medium' && styles.selectedChipText]}
              >
                Medium
              </Chip>
              <Chip
                selected={priority === 'high'}
                onPress={() => setPriority('high')}
                style={[styles.priorityChip, priority === 'high' && styles.selectedChip]}
                textStyle={[styles.priorityChipText, priority === 'high' && styles.selectedChipText]}
              >
                Hög
              </Chip>
              <Chip
                selected={priority === 'urgent'}
                onPress={() => setPriority('urgent')}
                style={[styles.priorityChip, priority === 'urgent' && styles.selectedChip]}
                textStyle={[styles.priorityChipText, priority === 'urgent' && styles.selectedChipText]}
              >
                Akut
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Planerat datum */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Planerat datum</Text>
            <TextInput
              label="Datum (YYYY-MM-DD)"
              value={scheduledDate}
              onChangeText={setScheduledDate}
              style={styles.input}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              placeholder="2024-01-15"
              maxLength={10}
            />
          </Card.Content>
        </Card>

        {/* Plats */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Plats</Text>
            <TextInput
              label="Plats"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              placeholder="Ange plats för service"
              maxLength={100}
            />
          </Card.Content>
        </Card>

        {/* Anteckningar */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Anteckningar</Text>
            <TextInput
              label="Anteckningar"
              value={notes}
              onChangeText={setNotes}
              style={styles.input}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              placeholder="Lägg till extra anteckningar"
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </Card.Content>
        </Card>
      </View>
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
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
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  form: {
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
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
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
  equipmentSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  equipmentChip: {
    backgroundColor: COLORS.surfaceSecondary,
    borderColor: COLORS.border,
  },
  equipmentChipText: {
    color: COLORS.text,
  },
  prioritySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  priorityChip: {
    backgroundColor: COLORS.surfaceSecondary,
    borderColor: COLORS.border,
  },
  priorityChipText: {
    color: COLORS.text,
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