import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { ServiceContract, ContractType, ContractStatus, ContractService, ServiceFrequency, RootStackNavigationProp, RootStackRouteProp } from '../types';
import { contractStorage } from '../services/contractStorage';
import { customerStorage } from '../services/customerStorage';
import SearchableDropdown from '../components/SearchableDropdown';
import { Validation } from '../utils/validation';
import { ErrorHandler } from '../utils/errorHandler';

const EditContractScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RootStackRouteProp<'EditContract'>>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  
  // Form state
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contractType, setContractType] = useState<ContractType>('basic');
  const [status, setStatus] = useState<ContractStatus>('pending');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [renewalPeriod, setRenewalPeriod] = useState(12);
  const [totalValue, setTotalValue] = useState('');
  const [monthlyValue, setMonthlyValue] = useState('');
  const [terms, setTerms] = useState('');
  const [notes, setNotes] = useState('');
  
  // Services state
  const [services, setServices] = useState<ContractService[]>([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [newService, setNewService] = useState<Partial<ContractService>>({
    name: '',
    description: '',
    frequency: 'monthly',
    included: true,
    price: 0,
  });

  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      const allCustomers = await customerStorage.getAllCustomers();
      setCustomers(allCustomers.map(c => ({ id: c.id, name: c.name })));
    } catch (error) {
      ErrorHandler.handleError(error, 'Fel vid laddning av kunder');
    }
  }, []);

  const loadContract = useCallback(async () => {
    try {
      setLoading(true);
      const contract = await contractStorage.getContractById(route.params.contractId);
      if (contract) {
        setCustomerId(contract.customerId);
        setTitle(contract.title);
        setDescription(contract.description || '');
        setContractType(contract.contractType);
        setStatus(contract.status);
        setStartDate(contract.startDate);
        setEndDate(contract.endDate);
        setAutoRenewal(contract.autoRenewal);
        setRenewalPeriod(contract.renewalPeriod || 12);
        setTotalValue(contract.totalValue.toString());
        setMonthlyValue(contract.monthlyValue?.toString() || '');
        setTerms(contract.terms);
        setNotes(contract.notes || '');
        setServices(contract.services);
      }
    } catch (error) {
      ErrorHandler.handleError(error, 'Fel vid laddning av avtal');
    } finally {
      setLoading(false);
    }
  }, [route.params.contractId]);

  useEffect(() => {
    loadCustomers();
    loadContract();
  }, [loadCustomers, loadContract]);

  const handleAddService = useCallback(() => {
    if (!newService.name?.trim()) {
      Alert.alert('Fel', 'Service-namn är obligatoriskt');
      return;
    }

    const service: ContractService = {
      id: Date.now().toString(),
      name: newService.name,
      description: newService.description || '',
      frequency: newService.frequency || 'monthly',
      included: newService.included || true,
      price: newService.price || 0,
      notes: newService.notes || '',
    };

    setServices([...services, service]);
    setNewService({
      name: '',
      description: '',
      frequency: 'monthly',
      included: true,
      price: 0,
    });
    setShowServiceForm(false);
  }, [newService, services]);

  const handleRemoveService = useCallback((serviceId: string) => {
    setServices(services.filter(s => s.id !== serviceId));
  }, [services]);

  const handleSaveContract = useCallback(async () => {
    try {
      // Validation
      if (!customerId) {
        Alert.alert('Fel', 'Välj en kund');
        return;
      }
      if (!title.trim()) {
        Alert.alert('Fel', 'Avtalstitel är obligatoriskt');
        return;
      }
      if (!Validation.isValidAmount(totalValue)) {
        Alert.alert('Fel', 'Ange ett giltigt totalvärde');
        return;
      }
      if (startDate >= endDate) {
        Alert.alert('Fel', 'Slutdatum måste vara efter startdatum');
        return;
      }

      setSaving(true);

             // Load existing contract to preserve contractNumber and createdAt
       const existingContract = await contractStorage.getContractById(route.params.contractId);
       if (!existingContract) {
         throw new Error('Avtalet kunde inte hittas');
       }

       const contract: ServiceContract = {
         id: route.params.contractId,
         customerId,
         contractNumber: existingContract.contractNumber,
         title: title.trim(),
         description: description.trim(),
         contractType,
         status,
         startDate,
         endDate,
         autoRenewal,
         renewalPeriod: autoRenewal ? renewalPeriod : undefined,
         totalValue: parseFloat(totalValue),
         monthlyValue: monthlyValue ? parseFloat(monthlyValue) : undefined,
         services,
         terms: terms.trim(),
         notes: notes.trim(),
         createdAt: existingContract.createdAt,
         updatedAt: new Date(),
       };

      await contractStorage.saveContract(contract);
      Alert.alert('Framgång', 'Service-avtal uppdaterat!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      ErrorHandler.handleError(error, 'Fel vid uppdatering av avtal');
    } finally {
      setSaving(false);
    }
  }, [route.params.contractId, customerId, title, description, contractType, status, startDate, endDate, autoRenewal, renewalPeriod, totalValue, monthlyValue, services, terms, notes, navigation]);

  const contractTypeOptions = [
    { label: 'Basic', value: 'basic' },
    { label: 'Premium', value: 'premium' },
    { label: 'Enterprise', value: 'enterprise' },
    { label: 'Custom', value: 'custom' },
  ];

  const statusOptions = [
    { label: 'Väntande', value: 'pending' },
    { label: 'Aktivt', value: 'active' },
    { label: 'Pausat', value: 'paused' },
    { label: 'Utgånget', value: 'expired' },
    { label: 'Avbrutet', value: 'cancelled' },
  ];

  const frequencyOptions = [
    { label: 'Månadsvis', value: 'monthly' },
    { label: 'Kvartalsvis', value: 'quarterly' },
    { label: 'Halvårsvis', value: 'biannual' },
    { label: 'Årligen', value: 'annual' },
    { label: 'På begäran', value: 'on-demand' },
  ];

  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('sv-SE');
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Laddar avtal...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Redigera Service-avtal</Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveContract}
          disabled={saving}
        >
          <Text style={[styles.saveButtonText, { color: colors.white }]}>
            {saving ? 'Sparar...' : 'Spara'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Customer Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Kund</Text>
          <SearchableDropdown
            data={customers}
            value={customerId}
            onValueChange={setCustomerId}
            placeholder="Välj kund"
            labelKey="name"
            valueKey="id"
          />
        </View>

        {/* Contract Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Avtalsdetaljer</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Avtalstitel"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Beskrivning (valfritt)"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <SearchableDropdown
            data={contractTypeOptions}
            value={contractType}
            onValueChange={(value) => setContractType(value as ContractType)}
            placeholder="Välj avtalstyp"
            labelKey="label"
            valueKey="value"
          />

          <SearchableDropdown
            data={statusOptions}
            value={status}
            onValueChange={(value) => setStatus(value as ContractStatus)}
            placeholder="Välj status"
            labelKey="label"
            valueKey="value"
          />
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tidsperiod</Text>
          
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: colors.text }]}>
              Startdatum: {formatDate(startDate)}
            </Text>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={[styles.dateButtonText, { color: colors.text }]}>
              Slutdatum: {formatDate(endDate)}
            </Text>
            <Ionicons name="calendar" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>Automatisk förnyelse</Text>
            <Switch
              value={autoRenewal}
              onValueChange={setAutoRenewal}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {autoRenewal && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              placeholder="Förnyelseperiod (månader)"
              placeholderTextColor={colors.textSecondary}
              value={renewalPeriod.toString()}
              onChangeText={(text) => setRenewalPeriod(parseInt(text) || 12)}
              keyboardType="numeric"
            />
          )}
        </View>

        {/* Financial */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ekonomi</Text>
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Totalvärde (SEK)"
            placeholderTextColor={colors.textSecondary}
            value={totalValue}
            onChangeText={setTotalValue}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Månadsvärde (SEK, valfritt)"
            placeholderTextColor={colors.textSecondary}
            value={monthlyValue}
            onChangeText={setMonthlyValue}
            keyboardType="numeric"
          />
        </View>

        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tjänster</Text>
            <TouchableOpacity
              style={[styles.addServiceButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowServiceForm(true)}
            >
              <Ionicons name="add" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {services.map((service) => (
            <View key={service.id} style={[styles.serviceItem, { backgroundColor: colors.card }]}>
              <View style={styles.serviceInfo}>
                <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                <Text style={[styles.serviceFrequency, { color: colors.textSecondary }]}>
                  {frequencyOptions.find(f => f.value === service.frequency)?.label}
                </Text>
                {service.price > 0 && (
                  <Text style={[styles.servicePrice, { color: colors.primary }]}>
                    {service.price} SEK
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveService(service.id)}
                style={[styles.removeServiceButton, { backgroundColor: colors.error }]}
              >
                <Ionicons name="trash" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}

          {showServiceForm && (
            <View style={[styles.serviceForm, { backgroundColor: colors.card }]}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Service-namn"
                placeholderTextColor={colors.textSecondary}
                value={newService.name}
                onChangeText={(text) => setNewService({ ...newService, name: text })}
              />
              
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Beskrivning (valfritt)"
                placeholderTextColor={colors.textSecondary}
                value={newService.description}
                onChangeText={(text) => setNewService({ ...newService, description: text })}
                multiline
                numberOfLines={2}
              />

              <SearchableDropdown
                data={frequencyOptions}
                value={newService.frequency}
                onValueChange={(value) => setNewService({ ...newService, frequency: value as ServiceFrequency })}
                placeholder="Frekvens"
                labelKey="label"
                valueKey="value"
              />

              <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Inkluderat i avtalet</Text>
                <Switch
                  value={newService.included}
                  onValueChange={(value) => setNewService({ ...newService, included: value })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>

              {!newService.included && (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Pris (SEK)"
                  placeholderTextColor={colors.textSecondary}
                  value={newService.price?.toString() || ''}
                  onChangeText={(text) => setNewService({ ...newService, price: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
              )}

              <View style={styles.serviceFormActions}>
                <TouchableOpacity
                  style={[styles.serviceFormButton, { backgroundColor: colors.primary }]}
                  onPress={handleAddService}
                >
                  <Text style={[styles.serviceFormButtonText, { color: colors.white }]}>Lägg till</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.serviceFormButton, { backgroundColor: colors.border }]}
                  onPress={() => setShowServiceForm(false)}
                >
                  <Text style={[styles.serviceFormButtonText, { color: colors.text }]}>Avbryt</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Terms and Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Villkor & Anteckningar</Text>
          
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Avtalsvillkor"
            placeholderTextColor={colors.textSecondary}
            value={terms}
            onChangeText={setTerms}
            multiline
            numberOfLines={4}
          />
          
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Anteckningar (valfritt)"
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}
    </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dateButtonText: {
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
  },
  addServiceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceFrequency: {
    fontSize: 14,
    marginBottom: 2,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeServiceButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceForm: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  serviceFormActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  serviceFormButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  serviceFormButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default EditContractScreen; 