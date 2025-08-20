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
import { COLORS, EQUIPMENT_TYPES, PRODUCT_CATEGORY_ICONS, PRODUCT_CATEGORY_COLORS } from '../constants';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { useRoute, useNavigation } from '@react-navigation/native';

export const EditProductScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params as { productId: string };

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
    loadProduct();
  }, [productId]);

  const loadCategories = async () => {
    try {
      let categoriesData = await productCategoryStorage.getAll();
      if (categoriesData.length === 0) categoriesData = [];
      setCategories(categoriesData);
    } catch (error) {
      setCategories([]);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await productStorage.getById(productId);
      if (!product) {
        Alert.alert('Fel', 'Kunde inte hitta produkten');
        navigation.goBack();
        return;
      }
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        type: product.type,
        serialNumber: product.serialNumber,
        model: product.model || '',
        location: product.location || '',
        notes: product.notes || '',
        isActive: product.isActive,
        isStandalone: product.isStandalone,
      });
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte ladda produktdata');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Produktnamn krävs';
    if (!formData.categoryId) newErrors.categoryId = 'Kategori krävs';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Serienummer krävs';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const updatedProduct: Product = {
        id: productId,
        categoryId: formData.categoryId,
        name: formData.name.trim(),
        type: formData.type,
        serialNumber: formData.serialNumber.trim(),
        model: formData.model.trim() || undefined,
        location: formData.location.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        isActive: formData.isActive,
        isStandalone: formData.isStandalone,
        createdAt: new Date(), // Behåll ursprungligt värde om möjligt
        updatedAt: new Date(),
      };
      await productStorage.save(updatedProduct);
      Alert.alert('Framgång', 'Produkten har uppdaterats', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte spara produkten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Redigera produkt</Title>
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
                  placeholder="t.ex. 123456"
                />
                <HelperText type="error" visible={!!errors.serialNumber}>
                  {errors.serialNumber}
                </HelperText>
              </View>
              <View style={styles.formSection}>
                <TextInput
                  label="Modell"
                  value={formData.model}
                  onChangeText={(text) => updateFormData('model', text)}
                  style={styles.input}
                  mode="outlined"
                  placeholder="t.ex. X2"
                />
              </View>
              <View style={styles.formSection}>
                <TextInput
                  label="Plats"
                  value={formData.location}
                  onChangeText={(text) => updateFormData('location', text)}
                  style={styles.input}
                  mode="outlined"
                  placeholder="t.ex. Akutmottagning, Våning 2"
                />
              </View>
              <View style={styles.formSection}>
                <TextInput
                  label="Anteckningar"
                  value={formData.notes}
                  onChangeText={(text) => updateFormData('notes', text)}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Övrig information om produkten"
                  multiline
                  numberOfLines={2}
                />
              </View>
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
              Spara ändringar
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
  input: {
    backgroundColor: COLORS.surface,
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