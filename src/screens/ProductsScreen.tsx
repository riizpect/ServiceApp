import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FAB, Searchbar, Card, IconButton, Chip, SegmentedButtons } from 'react-native-paper';
import { Product, ProductCategory } from '../types';
import { productStorage, productCategoryStorage } from '../services/storage';
import { ROUTES, COLORS, PRODUCT_CATEGORIES, PRODUCT_CATEGORY_ICONS, PRODUCT_CATEGORY_COLORS } from '../constants';
import { SearchableDropdown } from '../components/SearchableDropdown';

interface ProductCardProps {
  product: Product;
  category?: ProductCategory;
  onPress: (product: Product) => void;
  onEdit?: (product: Product) => void;
  rightAction?: React.ReactNode;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, category, onPress, onEdit, rightAction }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sv-SE');
  };

  const getCategoryColor = () => {
    if (category?.color) return category.color;
    return PRODUCT_CATEGORY_COLORS.other;
  };

  return (
    <TouchableOpacity onPress={() => onPress(product)} activeOpacity={0.7}>
      <Card style={styles.productCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productSerial}>SN: {product.serialNumber}</Text>
            </View>
            {onEdit && (
              <IconButton
                icon="pencil"
                size={16}
                iconColor={COLORS.textSecondary}
                onPress={() => onEdit(product)}
                style={styles.editButton}
              />
            )}
          </View>
          
          <View style={styles.productDetails}>
            {category && (
              <Chip 
                style={[styles.categoryChip, { backgroundColor: getCategoryColor() }]}
                textStyle={styles.categoryChipText}
                icon={PRODUCT_CATEGORY_ICONS[category.name as keyof typeof PRODUCT_CATEGORY_ICONS] || 'help-circle-outline'}
              >
                {category.name}
              </Chip>
            )}
            
            {product.model && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Modell</Text>
                <Text style={styles.detailValue}>{product.model}</Text>
              </View>
            )}
            
            {product.location && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Plats</Text>
                <Text style={styles.detailValue}>{product.location}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.cardFooter}>
            <Chip 
              style={[styles.statusChip, { backgroundColor: product.isActive ? COLORS.success : COLORS.textTertiary }]}
              textStyle={styles.statusChipText}
            >
              {product.isActive ? 'Aktiv' : 'Inaktiv'}
            </Chip>
            <Text style={styles.dateText}>
              Skapad {formatDate(product.createdAt)}
            </Text>
          </View>
        </Card.Content>
        {rightAction && <View style={styles.rightActionContainer}>{rightAction}</View>}
      </Card>
    </TouchableOpacity>
  );
};

interface ProductsScreenProps {
  navigation: any;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('ProductsScreen - Loading data...');
      
      const [allProducts, categoriesData] = await Promise.all([
        productStorage.getAll(),
        productCategoryStorage.getAll()
      ]);
      
      console.log('ProductsScreen - All products:', allProducts.length, allProducts);
      console.log('ProductsScreen - Categories:', categoriesData.length, categoriesData);
      
      // Ladda in ALLA produkter (både aktiva och inaktiva)
      const sortedProducts = allProducts.sort((a, b) => a.name.localeCompare(b.name));
      // Filtrera bort dubbletter av kategorier baserat på namn (case-insensitive)
      const uniqueCategories = [];
      const seen = new Set();
      for (const c of categoriesData) {
        const key = c.name.trim().toLowerCase();
        if (!seen.has(key)) {
          uniqueCategories.push(c);
          seen.add(key);
        }
      }
      const sortedCategories = uniqueCategories.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(sortedProducts);
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Fel', 'Kunde inte ladda produkter');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(p => p.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(p => !p.isActive);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.serialNumber.toLowerCase().includes(query) ||
        product.model?.toLowerCase().includes(query) ||
        product.location?.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, statusFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Uppdatera listan när skärmen får fokus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleProductPress = (product: Product) => {
    navigation.navigate(ROUTES.PRODUCT_DETAIL, { productId: product.id });
  };

  const handleEditProduct = (product: Product) => {
    navigation.navigate(ROUTES.EDIT_PRODUCT, { productId: product.id });
  };

  const handleDeleteProduct = async (product: Product) => {
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
              // Ta bort produkten från listan omedelbart för bättre UX
              setProducts(prev => prev.filter(p => p.id !== product.id));
              Alert.alert('Framgång', `${product.name} har tagits bort`);
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Fel', 'Kunde inte ta bort produkten');
            }
          },
        },
      ]
    );
  };

  const handleReactivateProduct = async (product: Product) => {
    try {
      await productStorage.save({ ...product, isActive: true, updatedAt: new Date() });
      await loadData();
      Alert.alert('Framgång', `${product.name} har återaktiverats!`);
    } catch (error) {
      Alert.alert('Fel', 'Kunde inte återaktivera produkten');
    }
  };

  const renderRightActions = (product: Product) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.editAction]}
          onPress={() => handleEditProduct(product)}
        >
          <IconButton icon="pencil" size={20} iconColor="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={() => handleDeleteProduct(product)}
        >
          <IconButton icon="delete" size={20} iconColor="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleAddNew = () => {
    navigation.navigate(ROUTES.NEW_PRODUCT);
  };

  const getCategoryButtons = () => {
    const buttons = [
      { value: 'all', label: 'Alla', icon: 'view-list' },
    ];
    
    categories.forEach(category => {
      buttons.push({
        value: category.id,
        label: category.name,
        icon: PRODUCT_CATEGORY_ICONS[category.name as keyof typeof PRODUCT_CATEGORY_ICONS] || 'help-circle-outline'
      });
    });
    
    return buttons;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {searchQuery || selectedCategory !== 'all' 
          ? 'Inga produkter hittades' 
          : 'Inga produkter i katalogen än'
        }
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery || selectedCategory !== 'all'
          ? 'Prova att ändra sökfältet eller kategorin'
          : 'Lägg till produkter för att komma igång'
        }
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Tillbaka</Text>
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.headerTitle}>Produkter</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
              <Text style={styles.addButtonText}>+ Lägg till produkt</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Produktkatalog</Text>
        </View>
      </View>
      
      {/* Status filterrad */}
      <View style={styles.statusFilterRow}>
        <TouchableOpacity
          style={[styles.statusFilterButton, statusFilter === 'all' && styles.statusFilterButtonActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.statusFilterText, statusFilter === 'all' && styles.statusFilterTextActive]}>Alla</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusFilterButton, statusFilter === 'active' && styles.statusFilterButtonActive]}
          onPress={() => setStatusFilter('active')}
        >
          <Text style={[styles.statusFilterText, statusFilter === 'active' && styles.statusFilterTextActive]}>Aktiva</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusFilterButton, statusFilter === 'inactive' && styles.statusFilterButtonActive]}
          onPress={() => setStatusFilter('inactive')}
        >
          <Text style={[styles.statusFilterText, statusFilter === 'inactive' && styles.statusFilterTextActive]}>Inaktiva</Text>
        </TouchableOpacity>
      </View>
      
      <Searchbar
        placeholder="Sök produkter..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.textSecondary}
        inputStyle={styles.searchInput}
      />
      
      <View style={styles.filterContainer}>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownButtonText} numberOfLines={1}>
              {selectedCategory === 'all' ? 'Alla kategorier' : (categories.find(c => c.id === selectedCategory)?.name || 'Kategori')}
            </Text>
          </TouchableOpacity>
          {categoryDropdownOpen && (
            <View style={styles.dropdownMenu}>
              <TextInput
                style={styles.dropdownSearchInput}
                placeholder="Sök kategori..."
                value={categorySearch}
                onChangeText={setCategorySearch}
                placeholderTextColor={COLORS.textTertiary}
                autoFocus
              />
              <ScrollView style={{ maxHeight: 180 }}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCategory('all');
                    setCategoryDropdownOpen(false);
                    setCategorySearch('');
                  }}
                >
                  <Text style={styles.dropdownItemText}>Alla kategorier</Text>
                </TouchableOpacity>
                {categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase())).map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCategory(cat.id);
                      setCategoryDropdownOpen(false);
                      setCategorySearch('');
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderProduct = ({ item }: { item: Product }) => {
    const category = categories.find(c => c.id === item.categoryId);
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        rightThreshold={40}
      >
        <ProductCard
          product={item}
          category={category}
          onPress={handleProductPress}
          onEdit={handleEditProduct}
          // Visa återaktivera-knapp om produkten är inaktiv
          rightAction={
            !item.isActive ? (
              <TouchableOpacity
                style={styles.reactivateButton}
                onPress={() => handleReactivateProduct(item)}
              >
                <Text style={styles.reactivateButtonText}>Återaktivera</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laddar produkter...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {renderHeader()}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
    </View>
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
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  searchBar: {
    marginBottom: 12,
    backgroundColor: COLORS.surfaceSecondary,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
    color: COLORS.text,
  },
  filterContainer: {
    marginBottom: 8,
  },
  dropdownContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  dropdownButton: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    zIndex: 10,
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
    padding: 8,
  },
  dropdownSearchInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  categoryFilter: {
    marginBottom: 8,
  },
  segmentedButtons: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  productCard: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    elevation: 0,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  cardContent: {
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  productSerial: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  editButton: {
    margin: 0,
  },
  productDetails: {
    marginBottom: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
  },
  editAction: {
    backgroundColor: COLORS.primary,
  },
  deleteAction: {
    backgroundColor: COLORS.error,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  addButtonText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  statusFilterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: 8,
  },
  statusFilterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusFilterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusFilterTextActive: {
    color: COLORS.textInverse,
    fontWeight: '700',
  },
  reactivateButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  reactivateButtonText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  rightActionContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginRight: 8,
  },
}); 