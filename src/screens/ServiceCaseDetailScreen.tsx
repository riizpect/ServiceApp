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
import { Card, Chip, IconButton, Button, Divider } from 'react-native-paper';
import { ServiceCase, Customer, Product, ChecklistItem, ServiceImage } from '../types';
import { serviceCaseStorage, customerStorage, productStorage, checklistItemStorage } from '../services/storage';
import { STATUS_COLORS, PRIORITY_COLORS, EQUIPMENT_TYPES, COLORS } from '../constants';
import { ServiceCaseImageManager } from '../components/ServiceCaseImageManager';

interface ServiceCaseDetailScreenProps {
  navigation: any;
  route: { params: { serviceCaseId: string } };
}

export const ServiceCaseDetailScreen: React.FC<ServiceCaseDetailScreenProps> = ({ navigation, route }) => {
  const [serviceCase, setServiceCase] = useState<ServiceCase | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { serviceCaseId } = route.params;

  useEffect(() => {
    loadServiceCaseData();
  }, [serviceCaseId]);

  const loadServiceCaseData = async () => {
    try {
      setLoading(true);
      const serviceCaseData = await serviceCaseStorage.getById(serviceCaseId);
      if (serviceCaseData) {
        setServiceCase(serviceCaseData);
        
        // Ladda kunddata
        const customerData = await customerStorage.getById(serviceCaseData.customerId);
        setCustomer(customerData);
        
        // Ladda produktdata om det finns
        if (serviceCaseData.productId) {
          const productData = await productStorage.getById(serviceCaseData.productId);
          setProduct(productData);
        }
        
        // Ladda checklista
        const checklistData = await checklistItemStorage.getByServiceCaseId(serviceCaseId);
        setChecklistItems(checklistData);
      }
    } catch (error) {
      console.error('Error loading service case data:', error);
      Alert.alert('Fel', 'Kunde inte ladda serviceärende');
    } finally {
      setLoading(false);
    }
  };

  const handleEditServiceCase = () => {
    navigation.navigate('EditServiceCase', { serviceCaseId: serviceCaseId });
  };

  const handleDeleteServiceCase = () => {
    Alert.alert(
      'Ta bort serviceärende',
      `Är du säker på att du vill ta bort "${serviceCase?.title}"? Detta kan inte ångras.`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              await serviceCaseStorage.delete(serviceCaseId);
              Alert.alert('Framgång', 'Serviceärendet har tagits bort');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting service case:', error);
              Alert.alert('Fel', 'Kunde inte ta bort serviceärendet');
            }
          },
        },
      ]
    );
  };

  const handleOpenServiceLog = () => {
    navigation.navigate('ServiceLog', { serviceCaseId: serviceCaseId });
  };

  const handleChecklistItemToggle = async (item: ChecklistItem) => {
    try {
      const updatedItem = {
        ...item,
        isCompleted: !item.isCompleted,
        completedAt: !item.isCompleted ? new Date() : undefined,
      };
      
      await checklistItemStorage.save(updatedItem);
      await loadServiceCaseData(); // Ladda om data
    } catch (error) {
      console.error('Error updating checklist item:', error);
      Alert.alert('Fel', 'Kunde inte uppdatera checklista');
    }
  };

  const handleImagesChange = async (images: ServiceImage[]) => {
    if (!serviceCase) return;
    
    try {
      const updatedServiceCase = {
        ...serviceCase,
        images: images,
      };
      
      await serviceCaseStorage.save(updatedServiceCase);
      setServiceCase(updatedServiceCase);
    } catch (error) {
      console.error('Error updating images:', error);
      Alert.alert('Fel', 'Kunde inte uppdatera bilder');
    }
  };

  const getStatusText = (status: ServiceCase['status']) => {
    switch (status) {
      case 'pending': return 'Väntar';
      case 'in_progress': return 'Pågår';
      case 'completed': return 'Slutförd';
      case 'cancelled': return 'Avbruten';
      default: return status;
    }
  };

  const getPriorityText = (priority: ServiceCase['priority']) => {
    switch (priority) {
      case 'low': return 'Låg';
      case 'medium': return 'Medium';
      case 'high': return 'Hög';
      case 'urgent': return 'Akut';
      default: return priority;
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('sv-SE');
  };

  const handleChangeStatus = () => {
    if (!serviceCase) return;
    Alert.alert(
      'Ändra status',
      'Välj ny status för ärendet:',
      [
        { text: 'Väntar', onPress: () => updateStatus('pending') },
        { text: 'Pågår', onPress: () => updateStatus('in_progress') },
        { text: 'Slutförd', onPress: () => updateStatus('completed') },
        { text: 'Avbruten', onPress: () => updateStatus('cancelled') },
        { text: 'Avbryt', style: 'cancel' },
      ]
    );
  };

  const updateStatus = async (newStatus: ServiceCase['status']) => {
    if (!serviceCase) return;
    try {
      const updated = { ...serviceCase, status: newStatus, updatedAt: new Date() };
      await serviceCaseStorage.save(updated);
      setServiceCase(updated);
      // Ladda om data om du vill visa relaterade ändringar
      await loadServiceCaseData();
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte uppdatera status');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Laddar serviceärende...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!serviceCase) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Serviceärendet kunde inte hittas</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Tillbaka</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completedItems = checklistItems.filter(item => item.isCompleted).length;
  const totalItems = checklistItems.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={COLORS.text}
        />
        <Text style={styles.headerTitle}>Serviceärende</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="pencil"
            size={24}
            onPress={handleEditServiceCase}
            iconColor={COLORS.primary}
          />
          <IconButton
            icon="delete"
            size={24}
            onPress={handleDeleteServiceCase}
            iconColor={COLORS.error}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Huvudinformation */}
        <View style={styles.section}>
          <View style={styles.titleCard}>
            <Text style={styles.title}>{serviceCase.title}</Text>
            <View style={styles.statusRow}>
              <TouchableOpacity onPress={handleChangeStatus} activeOpacity={0.7}>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[serviceCase.status] }]}>
                <Text style={styles.statusText}>{getStatusText(serviceCase.status)}</Text>
              </View>
              </TouchableOpacity>
              <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[serviceCase.priority] }]}>
                <Text style={styles.priorityText}>{getPriorityText(serviceCase.priority)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Beskrivning */}
        {serviceCase.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beskrivning</Text>
            <View style={styles.infoCard}>
              <Text style={styles.descriptionText}>{serviceCase.description}</Text>
            </View>
          </View>
        )}

        {/* Kundinformation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kund</Text>
          <View style={styles.infoCard}>
            <Text style={styles.customerName}>{customer?.name || 'Okänd kund'}</Text>
            <Text style={styles.customerAddress}>{customer?.address}</Text>
            <Text style={styles.customerPhone}>{customer?.phone}</Text>
          </View>
        </View>

        {/* Produktinformation */}
        {product ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produkt</Text>
            <View style={styles.infoCard}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productType}>{EQUIPMENT_TYPES[product.type]}</Text>
              <Text style={styles.productSerial}>Serienummer: {product.serialNumber}</Text>
              {product.model && (
                <Text style={styles.productModel}>Modell: {product.model}</Text>
              )}
              {product.location && (
                <Text style={styles.productLocation}>Plats: {product.location}</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produkt</Text>
            <View style={styles.infoCard}>
              <Text style={styles.productName}>Ingen produkt kopplad</Text>
              <Text style={styles.productType}>{EQUIPMENT_TYPES[serviceCase.equipmentType]}</Text>
              {serviceCase.equipmentSerialNumber && (
                <Text style={styles.productSerial}>Serienummer: {serviceCase.equipmentSerialNumber}</Text>
              )}
            </View>
          </View>
        )}

        {/* Utrustning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Utrustning</Text>
          <View style={styles.infoCard}>
            <Text style={styles.equipmentType}>
              {EQUIPMENT_TYPES[serviceCase.equipmentType]}
            </Text>
            {serviceCase.equipmentSerialNumber && (
              <Text style={styles.serialNumber}>
                Serienummer: {serviceCase.equipmentSerialNumber}
              </Text>
            )}
            {serviceCase.location && (
              <Text style={styles.location}>Plats: {serviceCase.location}</Text>
            )}
          </View>
        </View>

        {/* Datum */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datum</Text>
          <View style={styles.infoCard}>
            <Text style={styles.dateText}>
              Skapat: {formatDate(serviceCase.createdAt)}
            </Text>
            {serviceCase.scheduledDate && (
              <Text style={styles.dateText}>
                Planerat: {formatDate(serviceCase.scheduledDate)}
              </Text>
            )}
            {serviceCase.completedDate && (
              <Text style={styles.dateText}>
                Slutfört: {formatDate(serviceCase.completedDate)}
              </Text>
            )}
          </View>
        </View>

        {/* Checklista */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Checklista ({completedItems}/{totalItems})
          </Text>
          {checklistItems.length > 0 ? (
            checklistItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.checklistItem, item.isCompleted && styles.checklistItemCompleted]}
                onPress={() => handleChecklistItemToggle(item)}
              >
                <View style={[styles.checkbox, item.isCompleted && styles.checkboxCompleted]}>
                  {item.isCompleted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.checklistContent}>
                  <Text style={[styles.checklistTitle, item.isCompleted && styles.checklistTitleCompleted]}>
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text style={styles.checklistDescription}>{item.description}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Ingen checklista tillgänglig</Text>
            </View>
          )}
        </View>

        {/* Anteckningar */}
        {serviceCase.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anteckningar</Text>
            <View style={styles.infoCard}>
              <Text style={styles.notesText}>{serviceCase.notes}</Text>
            </View>
          </View>
        )}

        {/* Bildbibliotek */}
        <View style={styles.section}>
          <ServiceCaseImageManager
            serviceCaseId={serviceCaseId}
            images={serviceCase.images || []}
            onImagesChange={handleImagesChange}
            title="Bildbibliotek"
          />
        </View>

        {/* Service-logg knapp */}
        <View style={styles.section}>
          <Button
            mode="contained"
            onPress={handleOpenServiceLog}
            style={styles.serviceLogButton}
            contentStyle={styles.serviceLogButtonContent}
            icon="notebook"
          >
            Öppna Service-logg
          </Button>
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
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
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
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  titleCard: {
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  descriptionText: {
    fontSize: 16,
    color: '#6B6B6B',
    lineHeight: 24,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: '#007AFF',
  },
  equipmentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  serialNumber: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  dateText: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  checklistItemCompleted: {
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  checklistTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  checklistDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
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
  notesText: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  productType: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  productSerial: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  productModel: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  serviceLogButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    marginTop: 8,
  },
  serviceLogButtonContent: {
    paddingVertical: 12,
  },
}); 