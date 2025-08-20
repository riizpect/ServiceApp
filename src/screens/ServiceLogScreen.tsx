import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { FAB, Searchbar, Card, IconButton, Chip, SegmentedButtons, Divider } from 'react-native-paper';
import { ServiceLogEntry, ServiceCase } from '../types';
import { serviceLogStorage, serviceCaseStorage } from '../services/storage';
import { ROUTES, COLORS, SERVICE_LOG_TYPES, SERVICE_LOG_ICONS, SERVICE_LOG_COLORS } from '../constants';
import { ImageGallery } from '../components/ImageGallery';

interface ServiceLogCardProps {
  entry: ServiceLogEntry;
  onPress: (entry: ServiceLogEntry) => void;
  onEdit?: (entry: ServiceLogEntry) => void;
}

const ServiceLogCard: React.FC<ServiceLogCardProps> = ({ entry, onPress, onEdit }) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('sv-SE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = () => {
    return SERVICE_LOG_COLORS[entry.type] || SERVICE_LOG_COLORS.note;
  };

  const getTypeIcon = () => {
    return SERVICE_LOG_ICONS[entry.type] || 'note-text';
  };

  return (
    <TouchableOpacity onPress={() => onPress(entry)} activeOpacity={0.7}>
      <Card style={styles.logCard}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.entryHeader}>
            <View style={styles.entryInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                {entry.isImportant && (
                  <IconButton
                    icon="star"
                    size={16}
                    iconColor={COLORS.accent}
                    style={styles.importantIcon}
                  />
                )}
              </View>
              <Text style={styles.entryTime}>{formatTime(entry.timestamp)}</Text>
            </View>
            {onEdit && (
              <IconButton
                icon="pencil"
                size={16}
                iconColor={COLORS.textSecondary}
                onPress={() => onEdit(entry)}
                style={styles.editButton}
              />
            )}
          </View>
          
          <View style={styles.entryDetails}>
            <Chip 
              style={[styles.typeChip, { backgroundColor: getTypeColor() }]}
              textStyle={styles.typeChipText}
              icon={getTypeIcon()}
            >
              {SERVICE_LOG_TYPES[entry.type]}
            </Chip>
            
            <Text style={styles.entryContent} numberOfLines={3}>
              {entry.content}
            </Text>
            
            {entry.images && entry.images.length > 0 && (
              <ImageGallery 
                images={entry.images} 
                maxImagesToShow={3}
                title=""
              />
            )}
            
            {entry.tags && entry.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {entry.tags.slice(0, 3).map((tag, index) => (
                  <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                    {tag}
                  </Chip>
                ))}
                {entry.tags.length > 3 && (
                  <Text style={styles.moreTags}>+{entry.tags.length - 3} till</Text>
                )}
              </View>
            )}
          </View>
          
          {entry.location && (
            <View style={styles.locationContainer}>
              <IconButton
                icon="map-marker"
                size={16}
                iconColor={COLORS.textSecondary}
              />
              <Text style={styles.locationText}>{entry.location}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

interface ServiceLogScreenProps {
  navigation: any;
  route: any;
}

export const ServiceLogScreen: React.FC<ServiceLogScreenProps> = ({ navigation, route }) => {
  const { serviceCaseId } = route.params;
  const [entries, setEntries] = useState<ServiceLogEntry[]>([]);
  const [serviceCase, setServiceCase] = useState<ServiceCase | null>(null);
  const [filteredEntries, setFilteredEntries] = useState<ServiceLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<ServiceLogEntry | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [entriesData, serviceCaseData] = await Promise.all([
        serviceLogStorage.getByServiceCaseId(serviceCaseId),
        serviceCaseStorage.getById(serviceCaseId)
      ]);
      
      setEntries(entriesData);
      setServiceCase(serviceCaseData);
    } catch (error) {
      console.error('Error loading service log:', error);
      Alert.alert('Fel', 'Kunde inte ladda service-logg');
    } finally {
      setLoading(false);
    }
  };

  // Snabb funktion för att rensa alla gamla loggar
  const clearAllOldLogs = async () => {
    Alert.alert(
      'Rensa alla loggar',
      'Vill du ta bort ALLA loggar från detta serviceärende? Detta går inte att ångra.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort alla',
          style: 'destructive',
          onPress: async () => {
            try {
              // Ta bort alla loggar för detta serviceärende
              for (const entry of entries) {
                await serviceLogStorage.delete(entry.id);
              }
              console.log(`Rensade ${entries.length} loggar`);
              await loadData(); // Ladda om listan
              Alert.alert('Framgång', `${entries.length} loggar har tagits bort`);
            } catch (error) {
              console.error('Error clearing logs:', error);
              Alert.alert('Fel', 'Kunde inte ta bort loggar');
            }
          },
        },
      ]
    );
  };


  const filterEntries = () => {
    let filtered = entries;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(entry => entry.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        entry.location?.toLowerCase().includes(query)
      );
    }

    setFilteredEntries(filtered);
  };

  useEffect(() => {
    filterEntries();
  }, [entries, searchQuery, selectedType]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [serviceCaseId]);

  // Uppdatera listan när skärmen får fokus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [serviceCaseId])
  );

  const handleEntryPress = (entry: ServiceLogEntry) => {
    setSelectedEntry(entry);
  };

  const handleEditEntry = (entry: ServiceLogEntry) => {
    navigation.navigate(ROUTES.EDIT_SERVICE_LOG_ENTRY, { 
      entryId: entry.id,
      serviceCaseId: serviceCaseId 
    });
  };

  const handleDeleteEntry = async (entry: ServiceLogEntry) => {
    Alert.alert(
      'Ta bort loggpost',
      `Är du säker på att du vill ta bort "${entry.title}"? Detta kan inte ångras.`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              await serviceLogStorage.delete(entry.id);
              // Ta bort posten från listan omedelbart för bättre UX
              setEntries(prev => prev.filter(e => e.id !== entry.id));
              Alert.alert('Framgång', `${entry.title} har tagits bort`);
            } catch (error) {
              console.error('Error deleting log entry:', error);
              Alert.alert('Fel', 'Kunde inte ta bort loggposten');
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (entry: ServiceLogEntry) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, styles.editAction]}
          onPress={() => handleEditEntry(entry)}
        >
          <IconButton icon="pencil" size={20} iconColor="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, styles.deleteAction]}
          onPress={() => handleDeleteEntry(entry)}
        >
          <IconButton icon="delete" size={20} iconColor="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleAddNew = () => {
    navigation.navigate(ROUTES.NEW_SERVICE_LOG_ENTRY, { serviceCaseId });
  };

  const getTypeButtons = () => {
    const buttons = [
      { value: 'all', label: 'Alla', icon: 'view-list' },
    ];
    
    Object.entries(SERVICE_LOG_TYPES).forEach(([key, value]) => {
      buttons.push({
        value: key,
        label: value,
        icon: SERVICE_LOG_ICONS[key as keyof typeof SERVICE_LOG_ICONS] || 'help-circle-outline'
      });
    });
    
    return buttons;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {searchQuery || selectedType !== 'all' 
          ? 'Inga loggposter hittades' 
          : 'Inga loggposter än'
        }
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery || selectedType !== 'all'
          ? 'Prova att ändra sökfältet eller typen'
          : 'Lägg till din första loggpost för att komma igång'
        }
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.searchHeader}>
      {serviceCase && (
        <Card style={styles.serviceCaseCard}>
          <Card.Content>
            <Text style={styles.serviceCaseTitle}>{serviceCase.title}</Text>
            <Text style={styles.serviceCaseStatus}>
              Status: {serviceCase.status} • Prioritet: {serviceCase.priority}
            </Text>
          </Card.Content>
        </Card>
      )}
      
      <Searchbar
        placeholder="Sök i loggposter..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.textSecondary}
      />
      
      <View style={styles.typeFilter}>
        <SegmentedButtons
          value={selectedType}
          onValueChange={setSelectedType}
          buttons={getTypeButtons()}
          style={styles.segmentedButtons}
        />
      </View>
    </View>
  );

  const renderEntry = ({ item }: { item: ServiceLogEntry }) => {
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item)}
        rightThreshold={40}
      >
        <ServiceLogCard
          entry={item}
          onPress={handleEntryPress}
          onEdit={handleEditEntry}
        />
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laddar service-logg...</Text>
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
        <Text style={styles.headerTitle}>Service-logg</Text>
        <IconButton
          icon="delete-sweep"
          size={24}
          onPress={clearAllOldLogs}
          iconColor={COLORS.error}
        />
      </View>
      
      {renderHeader()}
      
      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddNew}
        color="white"
      />

      {/* Modal för loggpost-detalj */}
      {selectedEntry && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedEntry.title}</Text>
            <Text style={styles.modalType}>{SERVICE_LOG_TYPES[selectedEntry.type]}</Text>
            <Text style={styles.modalDate}>{new Date(selectedEntry.timestamp).toLocaleString('sv-SE')}</Text>
            <Text style={styles.modalContentText}>{selectedEntry.content}</Text>
            {selectedEntry.images && selectedEntry.images.length > 0 && (
              <ImageGallery images={selectedEntry.images} maxImagesToShow={6} title="Bilder" />
            )}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setSelectedEntry(null);
                  navigation.navigate('ServiceCaseDetail', { serviceCaseId });
                }}
              >
                <Text style={styles.modalButtonText}>Visa serviceärende</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.surfaceSecondary }]}
                onPress={() => setSelectedEntry(null)}
              >
                <Text style={[styles.modalButtonText, { color: COLORS.text }]}>Stäng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  searchHeader: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  serviceCaseCard: {
    marginBottom: 12,
    backgroundColor: COLORS.surfaceSecondary,
  },
  serviceCaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceCaseStatus: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  searchBar: {
    marginBottom: 12,
    backgroundColor: COLORS.surfaceSecondary,
    elevation: 0,
  },
  typeFilter: {
    marginBottom: 8,
  },
  segmentedButtons: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  logCard: {
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  importantIcon: {
    margin: 0,
  },
  entryTime: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  editButton: {
    margin: 0,
  },
  entryDetails: {
    marginBottom: 12,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typeChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  entryContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  imagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: COLORS.surfaceSecondary,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  moreTags: {
    fontSize: 12,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 28,
    minWidth: 260,
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  modalType: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  modalDate: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginBottom: 8,
  },
  modalContentText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 8,
  },
  modalButtonText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
}); 