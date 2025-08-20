import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Customer } from '../types';
import { customerStorage } from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';

interface WebNewCustomerProps {
  onNavigate: (page: string, params?: any) => void;
}

export const WebNewCustomer: React.FC<WebNewCustomerProps> = ({ onNavigate }) => {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Fel', 'Kundnamn är obligatoriskt');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Fel', 'Telefonnummer är obligatoriskt');
      return;
    }

    try {
      setLoading(true);
      
      const newCustomer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        address: formData.address.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        isActive: true,
      };

      await customerStorage.create(newCustomer);
      
      Alert.alert(
        'Kund skapad',
        `${formData.name} har lagts till som ny kund.`,
        [
          {
            text: 'Visa alla kunder',
            onPress: () => onNavigate('customers'),
          },
          {
            text: 'Lägg till en till',
            onPress: () => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                notes: '',
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating customer:', error);
      Alert.alert('Fel', 'Kunde inte skapa kunden');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.name || formData.email || formData.phone || formData.address || formData.notes) {
      Alert.alert(
        'Avbryt',
        'Är du säker på att du vill avbryta? Alla ändringar kommer att gå förlorade.',
        [
          { text: 'Fortsätt redigera', style: 'cancel' },
          { text: 'Avbryt', style: 'destructive', onPress: () => onNavigate('customers') },
        ]
      );
    } else {
      onNavigate('customers');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>← Tillbaka</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Ny kund</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleCancel}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Avbryt</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary },
              loading && { opacity: 0.6 }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.saveButtonText, { color: colors.white }]}>
              {loading ? 'Sparar...' : 'Spara kund'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderForm = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.formSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Grundinformation</Text>
        
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Kundnamn *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border
            }]}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Ange kundnamn"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Telefonnummer *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border
            }]}
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            placeholder="Ange telefonnummer"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>E-postadress</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border
            }]}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Ange e-postadress"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Adress</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border
            }]}
            value={formData.address}
            onChangeText={(value) => handleInputChange('address', value)}
            placeholder="Ange adress"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Anteckningar</Text>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Noter</Text>
          <TextInput
            style={[styles.textArea, { 
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border
            }]}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            placeholder="Lägg till anteckningar om kunden..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderForm()}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    padding: 24,
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
}); 