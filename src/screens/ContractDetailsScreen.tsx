import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ServiceContract, ContractStatus, RootStackNavigationProp, RootStackRouteProp } from '../types';
import { contractStorage } from '../services/contractStorage';
import { customerStorage } from '../services/customerStorage';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { ErrorHandler } from '../utils/errorHandler';

const ContractDetailsScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RootStackRouteProp<'ContractDetails'>>();
  const { colors } = useTheme();
  const [contract, setContract] = useState<ServiceContract | null>(null);
  const [customerName, setCustomerName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadContractDetails = useCallback(async () => {
    try {
      setLoading(true);
      const contractData = await contractStorage.getContractById(route.params.contractId);
      if (contractData) {
        setContract(contractData);
        
        // Load customer name
        const customer = await customerStorage.getCustomerById(contractData.customerId);
        setCustomerName(customer?.name || 'Okänd kund');
      }
    } catch (error) {
      ErrorHandler.handleError(error, 'Fel vid laddning av avtalsdetaljer');
    } finally {
      setLoading(false);
    }
  }, [route.params.contractId]);

  useEffect(() => {
    loadContractDetails();
  }, [loadContractDetails]);

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

  const getContractTypeText = useCallback((type: string) => {
    switch (type) {
      case 'basic': return 'Basic';
      case 'premium': return 'Premium';
      case 'enterprise': return 'Enterprise';
      case 'custom': return 'Custom';
      default: return type;
    }
  }, []);

  const getFrequencyText = useCallback((frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'Månadsvis';
      case 'quarterly': return 'Kvartalsvis';
      case 'biannual': return 'Halvårsvis';
      case 'annual': return 'Årligen';
      case 'on-demand': return 'På begäran';
      default: return frequency;
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

  const handleEdit = useCallback(() => {
    if (contract) {
      navigation.navigate('EditContract', { contractId: contract.id });
    }
  }, [contract, navigation]);

  const handleDelete = useCallback(async () => {
    if (!contract) return;

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
              navigation.goBack();
            } catch (error) {
              ErrorHandler.handleError(error, 'Fel vid borttagning av avtal');
            }
          },
        },
      ]
    );
  }, [contract, navigation]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSkeleton />
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Avtalet kunde inte hittas
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Avtalsdetaljer</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Contract Header */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.contractHeader}>
            <Text style={[styles.contractTitle, { color: colors.text }]}>
              {contract.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) }]}>
              <Text style={styles.statusText}>
                {getStatusText(contract.status)}
              </Text>
            </View>
          </View>
          <Text style={[styles.contractNumber, { color: colors.textSecondary }]}>
            {contract.contractNumber}
          </Text>
          {contract.description && (
            <Text style={[styles.description, { color: colors.text }]}>
              {contract.description}
            </Text>
          )}
        </View>

        {/* Customer Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Kund</Text>
          <Text style={[styles.customerName, { color: colors.text }]}>
            {customerName}
          </Text>
        </View>

        {/* Contract Details */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Avtalsdetaljer</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Typ:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {getContractTypeText(contract.contractType)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Startdatum:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(contract.startDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Slutdatum:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(contract.endDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Automatisk förnyelse:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {contract.autoRenewal ? 'Ja' : 'Nej'}
            </Text>
          </View>
          
          {contract.autoRenewal && contract.renewalPeriod && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Förnyelseperiod:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {contract.renewalPeriod} månader
              </Text>
            </View>
          )}
        </View>

        {/* Financial */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ekonomi</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Totalvärde:</Text>
            <Text style={[styles.detailValue, { color: colors.primary, fontWeight: 'bold' }]}>
              {formatCurrency(contract.totalValue)}
            </Text>
          </View>
          
          {contract.monthlyValue && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Månadsvärde:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatCurrency(contract.monthlyValue)}
              </Text>
            </View>
          )}
        </View>

        {/* Services */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tjänster</Text>
          
          {contract.services.length === 0 ? (
            <Text style={[styles.noServices, { color: colors.textSecondary }]}>
              Inga tjänster definierade
            </Text>
          ) : (
            contract.services.map((service, index) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>
                    {service.name}
                  </Text>
                  <View style={[styles.serviceBadge, { 
                    backgroundColor: service.included ? colors.success : colors.warning 
                  }]}>
                    <Text style={styles.serviceBadgeText}>
                      {service.included ? 'Inkluderat' : 'Extra'}
                    </Text>
                  </View>
                </View>
                
                {service.description && (
                  <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                    {service.description}
                  </Text>
                )}
                
                <View style={styles.serviceDetails}>
                  <Text style={[styles.serviceFrequency, { color: colors.textSecondary }]}>
                    {getFrequencyText(service.frequency)}
                  </Text>
                  {service.price > 0 && (
                    <Text style={[styles.servicePrice, { color: colors.primary }]}>
                      {formatCurrency(service.price)}
                    </Text>
                  )}
                </View>
                
                {service.notes && (
                  <Text style={[styles.serviceNotes, { color: colors.textSecondary }]}>
                    {service.notes}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Terms */}
        {contract.terms && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Villkor</Text>
            <Text style={[styles.terms, { color: colors.text }]}>
              {contract.terms}
            </Text>
          </View>
        )}

        {/* Notes */}
        {contract.notes && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Anteckningar</Text>
            <Text style={[styles.notes, { color: colors.text }]}>
              {contract.notes}
            </Text>
          </View>
        )}

        {/* Metadata */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Metadata</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Skapat:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(contract.createdAt)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Senast uppdaterad:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(contract.updatedAt)}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 8,
  },
  contractTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
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
  contractNumber: {
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  noServices: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  serviceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  serviceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  serviceBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceFrequency: {
    fontSize: 14,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  serviceNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  terms: {
    fontSize: 16,
    lineHeight: 24,
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ContractDetailsScreen; 