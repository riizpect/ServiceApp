import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { Searchbar, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ServiceCase, Customer, Product } from '../types';
import { serviceCaseStorage, customerStorage, productStorage } from '../services/storage';
import { COLORS } from '../constants';

interface SearchResult {
  id: string;
  type: 'serviceCase' | 'customer' | 'product';
  title: string;
  subtitle: string;
  data: ServiceCase | Customer | Product;
}

interface GlobalSearchProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  visible,
  onClose,
  navigation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const [serviceCases, customers, products] = await Promise.all([
        serviceCaseStorage.getAll(),
        customerStorage.getAll(),
        productStorage.getAll(),
      ]);

      const searchResults: SearchResult[] = [];

      // Sök i serviceärenden
      serviceCases.forEach(case_ => {
        if (
          case_.title.toLowerCase().includes(query.toLowerCase()) ||
          case_.description.toLowerCase().includes(query.toLowerCase()) ||
          case_.equipmentSerialNumber?.toLowerCase().includes(query.toLowerCase())
        ) {
          searchResults.push({
            id: case_.id,
            type: 'serviceCase',
            title: case_.title,
            subtitle: `Status: ${case_.status} | ${case_.equipmentSerialNumber || 'Inget serienummer'}`,
            data: case_,
          });
        }
      });

      // Sök i kunder
      customers.forEach(customer => {
        if (
          customer.name.toLowerCase().includes(query.toLowerCase()) ||
          customer.address.toLowerCase().includes(query.toLowerCase()) ||
          customer.phone.includes(query) ||
          customer.email?.toLowerCase().includes(query.toLowerCase())
        ) {
          searchResults.push({
            id: customer.id,
            type: 'customer',
            title: customer.name,
            subtitle: `${customer.address} | ${customer.phone}`,
            data: customer,
          });
        }
      });

      // Sök i produkter
      products.forEach(product => {
        if (
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.serialNumber.toLowerCase().includes(query.toLowerCase()) ||
          product.model?.toLowerCase().includes(query.toLowerCase())
        ) {
          searchResults.push({
            id: product.id,
            type: 'product',
            title: product.name,
            subtitle: `SN: ${product.serialNumber} | ${product.model || 'Ingen modell'}`,
            data: product,
          });
        }
      });

      // Sortera efter relevans (titel matchar först)
      searchResults.sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase().startsWith(query.toLowerCase());
        const bTitleMatch = b.title.toLowerCase().startsWith(query.toLowerCase());
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return a.title.localeCompare(b.title);
      });

      setResults(searchResults.slice(0, 20)); // Begränsa till 20 resultat
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleResultPress = (result: SearchResult) => {
    onClose();
    setSearchQuery('');
    
    switch (result.type) {
      case 'serviceCase':
        navigation.navigate('ServiceCaseDetail', { serviceCaseId: result.id });
        break;
      case 'customer':
        navigation.navigate('CustomerDetail', { customerId: result.id });
        break;
      case 'product':
        navigation.navigate('ProductDetail', { productId: result.id });
        break;
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'serviceCase': return '🔧';
      case 'customer': return '👥';
      case 'product': return '📦';
    }
  };

  const getResultColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'serviceCase': return COLORS.primary;
      case 'customer': return COLORS.secondary;
      case 'product': return COLORS.accent;
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity onPress={() => handleResultPress(item)} activeOpacity={0.7}>
      <Card style={styles.resultCard}>
        <Card.Content style={styles.resultContent}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultIcon, { backgroundColor: getResultColor(item.type) }]}>
              <Text style={styles.resultIconText}>{getResultIcon(item.type)}</Text>
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.resultSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>
            </View>
            <IconButton
              icon="chevron-right"
              size={20}
              iconColor={COLORS.textTertiary}
            />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Avbryt</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sök</Text>
            <View style={styles.placeholder} />
          </View>
          
          <Searchbar
            placeholder="Sök efter ärenden, kunder, produkter..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.textSecondary}
            inputStyle={styles.searchInput}
            autoFocus
          />
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.resultsContainer}
          ListEmptyComponent={
            searchQuery.trim() ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {loading ? 'Söker...' : 'Inga resultat hittades'}
                </Text>
                <Text style={styles.emptySubtext}>
                  Prova att söka på något annat
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Börja skriva för att söka</Text>
                <Text style={styles.emptySubtext}>
                  Sök efter serviceärenden, kunder eller produkter
                </Text>
              </View>
            )
          }
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 60,
  },
  searchBar: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 16,
    color: COLORS.text,
  },
  resultsContainer: {
    padding: 16,
  },
  resultCard: {
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 0,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultContent: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultIconText: {
    fontSize: 18,
    color: COLORS.textInverse,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 