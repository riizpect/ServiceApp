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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Product, ProductCategory } from '../types';
import { productStorage, productCategoryStorage } from '../services/storage';
import { COLORS, EQUIPMENT_TYPES, PRODUCT_CATEGORIES, PRODUCT_CATEGORY_ICONS, PRODUCT_CATEGORY_COLORS } from '../constants';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackNavigationProp, RootStackRouteProp } from '../types';

interface EditProductScreenProps {
  navigation: RootStackNavigationProp;
  route: RootStackRouteProp<'EditProduct'>;
}

export const EditProductScreen: React.FC<EditProductScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
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

  const productId = route.params?.productId;

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
    loadCategories();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setInitialLoading(true);
      const productData = await productStorage.getById(productId);
      if (!productData) {
        Alert.alert('Fel', 'Produkten kunde inte hittas');
        navigation.goBack();
        return;
      }

      setProduct(productData);
      setFormData({
        name: productData.name || '',
        categoryId: productData.categoryId || '',
        type: productData.type || 'viper',
        serialNumber: productData.serialNumber || '',
        model: productData.model || '',
        location: productData.location || '',
        notes: productData.notes || '',
        isActive: productData.isActive ?? true,
        isStandalone: productData.isStandalone ?? true,
      });
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Fel', 'Kunde inte ladda produktinformation');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

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
    if (!validateForm() || !product) {
      return;
    }

    // Kontrollera att kategori finns
    if (!formData.categoryId) {
      Alert.alert('Fel', 'Du måste välja en kategori');
      return;
    }

    setLoading(true);
    try {
      const updatedProduct: Product = {
        ...product,
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        type: formData.type,
        serialNumber: formData.serialNumber.trim(),
        model: formData.model.trim(),
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        isActive: formData.isActive,
        isStandalone: formData.isStandalone,
        updatedAt: new Date(),
      };

      await productStorage.save(updatedProduct);
      Alert.alert('Framgång', 'Produkten har uppdaterats', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Fel', 'Kunde inte spara produkt');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Ta bort produkt',
      'Är du säker på att du vill ta bort denna produkt? Detta går inte att ångra.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await productStorage.delete(productId);
              Alert.alert('Framgång', 'Produkten har tagits bort', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Fel', 'Kunde inte ta bort produkt');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Laddar produkt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Produkt hittades inte</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Title style={[styles.title, { color: colors.text }]}>Redigera Produkt</Title>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Uppdatera produktinformation
            </Text>
          </View>

          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <Title style={[styles.sectionTitle, { color: colors.text }]}>Grundinformation</Title>
              
              <TextInput
                label="Produktnamn *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={[styles.input, { backgroundColor: colors.surface }]}
                mode="outlined"
                error={!!errors.name}
              />
              {errors.name && <HelperText type="error">{errors.name}</HelperText>}

              <SearchableDropdown
                label="Kategori *"
                placeholder="Välj kategori"
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                data={categories}
                getLabel={(item) => item.name}
                getValue={(item) => item.id}
                required={true}
              />
              {errors.categoryId && <HelperText type="error">{errors.categoryId}</HelperText>}

              <TextInput
                label="Serienummer *"
                value={formData.serialNumber}
                onChangeText={(text) => setFormData({ ...formData, serialNumber: text })}
                style={[styles.input, { backgroundColor: colors.surface }]}
                mode="outlined"
                error={!!errors.serialNumber}
              />
              {errors.serialNumber && <HelperText type="error">{errors.serialNumber}</HelperText>}

              <TextInput
                label="Modell"
                value={formData.model}
                onChangeText={(text) => setFormData({ ...formData, model: text })}
                style={[styles.input, { backgroundColor: colors.surface }]}
                mode="outlined"
              />

              <TextInput
                label="Plats"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                style={[styles.input, { backgroundColor: colors.surface }]}
                mode="outlined"
              />

              <TextInput
                label="Anteckningar"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                style={[styles.input, { backgroundColor: colors.surface }]}
                mode="outlined"
                multiline
                numberOfLines={3}
              />
            </Card.Content>
          </Card>

          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <Card.Content>
              <Title style={[styles.sectionTitle, { color: colors.text }]}>Inställningar</Title>
              
              <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Aktiv produkt</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                  color={colors.primary}
                />
              </View>

              <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Fristående produkt</Text>
                <Switch
                  value={formData.isStandalone}
                  onValueChange={(value) => setFormData({ ...formData, isStandalone: value })}
                  color={colors.primary}
                />
              </View>
            </Card.Content>
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              labelStyle={styles.buttonText}
            >
              Spara Ändringar
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={[styles.cancelButton, { borderColor: colors.border }]}
              labelStyle={[styles.buttonText, { color: colors.text }]}
            >
              Avbryt
            </Button>

            <Button
              mode="outlined"
              onPress={handleDelete}
              disabled={loading}
              style={[styles.deleteButton, { borderColor: '#EF4444' }]}
              labelStyle={[styles.buttonText, { color: '#EF4444' }]}
            >
              Ta Bort Produkt
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
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
  deleteButton: {
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 