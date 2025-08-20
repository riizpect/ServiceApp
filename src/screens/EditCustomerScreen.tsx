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
  Card,
  IconButton,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Customer } from '../types';
import { customerStorage } from '../services/storage';
import { ROUTES, COLORS } from '../constants';

interface EditCustomerScreenProps {
  navigation: any;
}

export const EditCustomerScreen: React.FC<EditCustomerScreenProps> = ({ navigation }) => {
  const route = useRoute();
  const { customerId } = route.params as { customerId: string };
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      
      const customerData = await customerStorage.getById(customerId);
      if (!customerData) {
        Alert.alert('Fel', 'Kunde inte hitta kunden');
        navigation.goBack();
        return;
      }
      
      setCustomer(customerData);
      
      // Sätt formulärfält
      setName(customerData.name);
      setAddress(customerData.address);
      setPhone(customerData.phone);
      setEmail(customerData.email || '');
      setContactPerson(customerData.contactPerson || '');
      setNotes(customerData.notes || '');
      
    } catch (error) {
      console.error('Error loading customer:', error);
      Alert.alert('Fel', 'Kunde inte ladda kunddata');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!customer) return;
    
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
      setSaving(true);
      
      const updatedCustomer: Customer = {
        ...customer,
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
        notes: notes.trim() || undefined,
        updatedAt: new Date(),
      };
      
      await customerStorage.save(updatedCustomer);
      
      Alert.alert('Framgång', 'Kunden har uppdaterats', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error saving customer:', error);
      Alert.alert('Fel', 'Kunde inte spara kunden');
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.headerTitle}>Redigera kund</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Grundinformation</Text>
              
              <TextInput
                label="Kundnamn *"
                value={name}
                onChangeText={setName}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />
              
              <TextInput
                label="Adress *"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                multiline
                numberOfLines={2}
              />
              
              <TextInput
                label="Telefonnummer *"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                keyboardType="phone-pad"
              />
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Kontaktinformation</Text>
              
              <TextInput
                label="E-postadress"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                label="Kontaktperson"
                value={contactPerson}
                onChangeText={setContactPerson}
                style={styles.input}
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />
            </Card.Content>
          </Card>

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
                multiline
                numberOfLines={4}
                placeholder="Lägg till eventuella anteckningar om kunden..."
              />
            </Card.Content>
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving || !name.trim() || !address.trim() || !phone.trim()}
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
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
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
}); 