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
  Title,
  HelperText,
  Switch,
  Divider,
} from 'react-native-paper';
import { Product, ProductCategory } from '../types';
import { productStorage, productCategoryStorage } from '../services/storage';
import { COLORS, EQUIPMENT_TYPES, PRODUCT_CATEGORIES, PRODUCT_CATEGORY_ICONS, PRODUCT_CATEGORY_COLORS } from '../constants';
import { SearchableDropdown } from '../components/SearchableDropdown';

interface NewProductScreenProps {
  navigation: any;
  route: any;
}

export const NewProductScreen: React.FC<NewProductScreenProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    type: 'viper' as keyof typeof EQUIPMENT_TYPES,
    serialNumber: '',
    model: '',
    location: '',
    notes: '',
    isActive: true,
    isStandalone: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      let categoriesData = await productCategoryStorage.getAll();
      // Om inga kategorier finns, skapa standardkategorier
      if (categoriesData.length === 0) {
        console.log('Inga produktkategorier hittades, skapar standardkategorier...');
        const defaultCategories = [
          {
            id: '',
            name: 'Bårar',
            description: 'Ferno VIPER och andra bårar',
            icon: 'medical-bag',
            color: '#EF4444',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '',
            name: 'Stolar',
            description: 'Transcend PowerTraxx och andra stolar',
            icon: 'seat',
            color: '#3B82F6',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '',
            name: 'Tillbehör',
            description: 'Tillbehör för bårar och stolar',
            icon: 'puzzle',
            color: '#10B981',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '',
            name: 'Reservdelar',
            description: 'Reservdelar till utrustning',
            icon: 'cog',
            color: '#F59E42',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '',
            name: 'Elektronik',
            description: 'Elektroniska tillbehör',
            icon: 'cpu-64-bit',
            color: '#6366F1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '',
            name: 'Vagnar',
            description: 'Transportvagnar',
            icon: 'cart',
            color: '#F472B6',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '',
            name: 'Lyftar',
            description: 'Lyftutrustning',
            icon: 'elevator-passenger',
            color: '#34D399',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '',
            name: 'Övrigt',
            description: 'Övriga produkter',
            icon: 'help-circle-outline',
            color: '#6B7280',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        // Spara standardkategorier om de inte redan finns (baserat på namn)
        for (const category of defaultCategories) {
          if (!categoriesData.some(c => c.name.trim().toLowerCase() === category.name.toLowerCase())) {
            await productCategoryStorage.save(category);
          }
        }
        // Hämta de nya kategorierna
        categoriesData = await productCategoryStorage.getAll();
        console.log('Standardkategorier skapade:', categoriesData.length);
      }
      // Filtrera bort dubbletter baserat på namn
      const uniqueCategories = [];
      const seen = new Set();
      for (const c of categoriesData) {
        const key = c.name.trim().toLowerCase();
        if (!seen.has(key)) {
          uniqueCategories.push(c);
          seen.add(key);
        }
      }
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Fel', 'Kunde inte ladda produktkategorier');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Produktnamn krävs';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Kategori krävs';
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serienummer krävs';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Kontrollera att kategori finns
    if (!formData.categoryId) {
      Alert.alert('Fel', 'Du måste välja en kategori');
      return;
    }

    setLoading(true);
    try {
      // Om produkten läggs till från en kundsida, koppla till kund
      let customerId = undefined;
      let isStandalone = true;
      if (route?.params?.customerId) {
        customerId = route.params.customerId;
        isStandalone = false;
      }

      const newProduct: Product = {
        id: '', // Will be generated by storage
        categoryId: formData.categoryId,
        name: formData.name.trim(),
        type: formData.type,
        serialNumber: formData.serialNumber.trim(),
        model: formData.model.trim() || undefined,
        location: formData.location.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        isActive: formData.isActive,
        isStandalone,
        customerId, // Koppla till kund om det finns
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Sparar produkt:', newProduct);
      await productStorage.save(newProduct);
      
      Alert.alert(
        'Framgång',
        `${newProduct.name} har lagts till i produktkatalogen`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Fel', `Kunde inte spara produkten: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };



  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Lägg till ny produkt</Title>
              
              <View style={styles.formSection}>
                <TextInput
                  label="Produktnamn *"
                  value={formData.name}
                  onChangeText={(text) => updateFormData('name', text)}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.name}
                  placeholder="t.ex. Ferno VIPER X2"
                />
                <HelperText type="error" visible={!!errors.name}>
                  {errors.name}
                </HelperText>
              </View>

              <View style={styles.formSection}>
                <SearchableDropdown
                  label="Kategori"
                  placeholder="Välj kategori"
                  value={formData.categoryId}
                  onValueChange={(value) => updateFormData('categoryId', value)}
                  data={categories}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.id}
                  required={true}
                />
                <HelperText type="error" visible={!!errors.categoryId}>
                  {errors.categoryId}
                </HelperText>
              </View>

              <View style={styles.formSection}>
                <SearchableDropdown
                  label="Typ"
                  placeholder="Välj typ"
                  value={formData.type}
                  onValueChange={(value) => updateFormData('type', value as keyof typeof EQUIPMENT_TYPES)}
                  data={Object.entries(EQUIPMENT_TYPES).map(([key, value]) => ({ id: key, name: value }))}
                  getLabel={(item) => item.name}
                  getValue={(item) => item.id}
                />
              </View>

              <View style={styles.formSection}>
                <TextInput
                  label="Serienummer *"
                  value={formData.serialNumber}
                  onChangeText={(text) => updateFormData('serialNumber', text)}
                  style={styles.input}
                  mode="outlined"
                  error={!!errors.serialNumber}
                  placeholder="t.ex. VIP123456"
                />
                <HelperText type="error" visible={!!errors.serialNumber}>
                  {errors.serialNumber}
                </HelperText>
              </View>

              <View style={styles.formSection}>
                <TextInput
                  label="Modell (valfritt)"
                  value={formData.model}
                  onChangeText={(text) => updateFormData('model', text)}
                  style={styles.input}
                  mode="outlined"
                  placeholder="t.ex. X2, PowerTraxx Pro"
                />
              </View>

              <View style={styles.formSection}>
                <TextInput
                  label="Plats (valfritt)"
                  value={formData.location}
                  onChangeText={(text) => updateFormData('location', text)}
                  style={styles.input}
                  mode="outlined"
                  placeholder="t.ex. Låda 1, Lager A"
                />
              </View>

              <View style={styles.formSection}>
                <TextInput
                  label="Anteckningar (valfritt)"
                  value={formData.notes}
                  onChangeText={(text) => updateFormData('notes', text)}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  placeholder="Lägg till extra information..."
                />
              </View>

              <Divider style={styles.divider} />

              <View style={styles.switchSection}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Aktiv produkt</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => updateFormData('isActive', value)}
                    color={COLORS.primary}
                  />
                </View>
                <HelperText type="info">
                  Inaktiva produkter visas inte i listor
                </HelperText>
              </View>

              <View style={styles.switchSection}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Fristående produkt</Text>
                  <Switch
                    value={formData.isStandalone}
                    onValueChange={(value) => updateFormData('isStandalone', value)}
                    color={COLORS.primary}
                  />
                </View>
                <HelperText type="info">
                  Fristående produkter kan kopplas till kunder senare
                </HelperText>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
              contentStyle={styles.buttonContent}
            >
              Lägg till produkt
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={styles.cancelButton}
              contentStyle={styles.buttonContent}
            >
              Avbryt
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  divider: {
    marginVertical: 16,
  },
  switchSection: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  cancelButton: {
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
}); 