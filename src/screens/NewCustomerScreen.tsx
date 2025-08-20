import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Customer } from '../types';
import { customerStorage } from '../services/storage';

interface NewCustomerScreenProps {
  navigation: any;
}

export const NewCustomerScreen: React.FC<NewCustomerScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Fel', 'Kundnamn är obligatoriskt');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Fel', 'Adress är obligatorisk');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Fel', 'Telefonnummer är obligatoriskt');
      return;
    }

    try {
      setLoading(true);

      const newCustomer: Customer = {
        id: '',
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
        notes: notes.trim() || undefined,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await customerStorage.save(newCustomer);

      Alert.alert(
        'Framgång', 
        'Kund skapad!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving customer:', error);
      Alert.alert('Fel', 'Kunde inte spara kund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Avbryt</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ny Kund</Text>
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
        {/* Kundnamn */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Kundnamn *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ange kundnamn"
            maxLength={100}
          />
        </View>

        {/* Adress */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Adress *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Ange fullständig adress"
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Telefon */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Telefon *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Ange telefonnummer"
            keyboardType="phone-pad"
            maxLength={20}
          />
        </View>

        {/* E-post */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>E-post</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Ange e-postadress"
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={100}
          />
        </View>

        {/* Kontaktperson */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Kontaktperson</Text>
          <TextInput
            style={styles.input}
            value={contactPerson}
            onChangeText={setContactPerson}
            placeholder="Ange kontaktperson"
            maxLength={100}
          />
        </View>

        {/* Anteckningar */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Anteckningar</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Lägg till extra anteckningar"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>
      </View>
        </ScrollView>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 48,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
}); 