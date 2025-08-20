import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, IconButton, Chip, Divider } from 'react-native-paper';
import { Product, ProductCategory } from '../types';
import { productStorage, productCategoryStorage } from '../services/storage';
import { COLORS, EQUIPMENT_TYPES, PRODUCT_CATEGORY_ICONS, PRODUCT_CATEGORY_COLORS } from '../constants';

interface ProductDetailScreenProps {
  navigation: any;
  route: any;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ navigation, route }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productStorage.getById(productId);
      
      if (!productData) {
        Alert.alert('Fel', 'Kunde inte hitta produkten');
        navigation.goBack();
        return;
      }
      
      setProduct(productData);
      
      // Ladda kategori
      if (productData.categoryId) {
        const categoryData = await productCategoryStorage.getById(productData.categoryId);
        setCategory(categoryData);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Fel', 'Kunde inte ladda produktdata');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sv-SE');
  };

  const getCategoryColor = () => {
    if (category?.color) return category.color;
    return PRODUCT_CATEGORY_COLORS.other;
  };

  const handleEdit = () => {
    navigation.navigate('EditProduct', { productId: product?.id });
  };

  const handleDelete = async () => {
    if (!product) return;

    Alert.alert(
      'Ta bort produkt',
      `Är du säker på att du vill ta bort "${product.name}"? Detta kan inte ångras.`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              await productStorage.delete(product.id);
              Alert.alert('Framgång', `${product.name} har tagits bort`);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Fel', 'Kunde inte ta bort produkten');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laddar produkt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produkten kunde inte hittas</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={COLORS.text}
        />
        <Text style={styles.headerTitle}>Produktdetaljer</Text>
        <View style={styles.headerActions}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={handleEdit}
            iconColor={COLORS.primary}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={handleDelete}
            iconColor={COLORS.error}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.productHeader}>
              <Title style={styles.productName}>{product.name}</Title>
              <Chip 
                style={[styles.statusChip, { backgroundColor: product.isActive ? COLORS.success : COLORS.textTertiary }]}
                textStyle={styles.statusChipText}
              >
                {product.isActive ? 'Aktiv' : 'Inaktiv'}
              </Chip>
            </View>

            {category && (
              <Chip 
                style={[styles.categoryChip, { backgroundColor: getCategoryColor() }]}
                textStyle={styles.categoryChipText}
                icon={PRODUCT_CATEGORY_ICONS[category.name as keyof typeof PRODUCT_CATEGORY_ICONS] || 'help-circle-outline'}
              >
                {category.name}
              </Chip>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Grundinformation</Title>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Serienummer</Text>
              <Text style={styles.detailValue}>{product.serialNumber}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Typ</Text>
              <Text style={styles.detailValue}>{EQUIPMENT_TYPES[product.type]}</Text>
            </View>

            {product.model && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Modell</Text>
                <Text style={styles.detailValue}>{product.model}</Text>
              </View>
            )}

            {product.location && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Plats</Text>
                <Text style={styles.detailValue}>{product.location}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Typ</Text>
              <Text style={styles.detailValue}>
                {product.isStandalone ? 'Fristående produkt' : 'Kundkopplad produkt'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {product.notes && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Anteckningar</Title>
              <Text style={styles.notesText}>{product.notes}</Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Metadata</Title>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Skapad</Text>
              <Text style={styles.detailValue}>{formatDate(product.createdAt)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Senast uppdaterad</Text>
              <Text style={styles.detailValue}>{formatDate(product.updatedAt)}</Text>
            </View>
          </Card.Content>
        </Card>
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
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  categoryChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
}); 