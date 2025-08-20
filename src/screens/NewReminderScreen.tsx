import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import { Customer, ServiceCase } from '../types';
import { customerStorage, serviceCaseStorage, reminderStorage } from '../services/storage';

// Simple dropdown component
const SimpleDropdown = ({ 
  data, 
  value, 
  onSelect, 
  placeholder, 
  displayKey 
}: {
  data: any[];
  value: any;
  onSelect: (item: any) => void;
  placeholder: string;
  displayKey: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={value ? styles.dropdownText : styles.dropdownPlaceholder}>
          {value ? value[displayKey] : placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(item);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item[displayKey]}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export const NewReminderScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceCases, setServiceCases] = useState<ServiceCase[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedServiceCase, setSelectedServiceCase] = useState<ServiceCase | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersData, serviceCasesData] = await Promise.all([
        customerStorage.getAll(),
        serviceCaseStorage.getAllWithCustomers(),
      ]);
      setCustomers(customersData);
      setServiceCases(serviceCasesData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Fel', 'Kunde inte ladda data');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Fel', 'Titel är obligatorisk');
      return;
    }

    if (!selectedCustomer) {
      Alert.alert('Fel', 'Välj en kund');
      return;
    }

    try {
      setLoading(true);
      
      const reminder = {
        id: '',
        customerId: selectedCustomer.id,
        serviceCaseId: selectedServiceCase?.id,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate,
        isCompleted: false,
        priority,
        createdAt: new Date(),
      };

      await reminderStorage.save(reminder);
      Alert.alert('Framgång', 'Påminnelse skapad!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert('Fel', 'Kunde inte skapa påminnelse');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredServiceCases = () => {
    if (!selectedCustomer) return [];
    return serviceCases.filter(case_ => case_.customerId === selectedCustomer.id);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE');
  };

  const addDays = (days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    setDueDate(newDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ny påminnelse</Text>
        <TouchableOpacity
          style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!title.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.textInverse} />
          ) : (
            <Text style={styles.saveButtonText}>Spara</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grundläggande information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Titel *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="T.ex. Rutinservice VIPER XTS"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Beskrivning</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Valfri beskrivning av påminnelsen..."
              placeholderTextColor={COLORS.textTertiary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Koppling</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kund *</Text>
            <SimpleDropdown
              data={customers}
              value={selectedCustomer}
              onSelect={setSelectedCustomer}
              placeholder="Välj kund"
              displayKey="name"
            />
          </View>

          {selectedCustomer && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Serviceärende (valfritt)</Text>
              <SimpleDropdown
                data={getFilteredServiceCases()}
                value={selectedServiceCase}
                onSelect={setSelectedServiceCase}
                placeholder="Välj serviceärende"
                displayKey="title"
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tidpunkt</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Förfallodatum</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(dueDate)}</Text>
              <View style={styles.quickDateButtons}>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => addDays(7)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickDateButtonText}>+1 vecka</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => addDays(30)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickDateButtonText}>+1 månad</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prioritet</Text>
            <View style={styles.priorityContainer}>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && styles.priorityButtonActive
                  ]}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    priority === p && styles.priorityButtonTextActive
                  ]}>
                    {p === 'low' ? 'Låg' : p === 'medium' ? 'Medium' : 'Hög'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  quickDateButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickDateButton: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickDateButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  priorityButtonTextActive: {
    color: COLORS.textInverse,
  },
  // New styles for SimpleDropdown
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  dropdownArrow: {
    fontSize: 16,
    color: COLORS.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textTertiary,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
}); 