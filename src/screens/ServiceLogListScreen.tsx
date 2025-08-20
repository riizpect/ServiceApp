import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, Pressable, ScrollView, Image, View as RNView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, ROUTES, SERVICE_LOG_TYPES } from '../constants';
import { RootStackParamList } from '../types';
import { serviceLogStorage, customerStorage, serviceCaseStorage } from '../services/storage';
import { Chip, IconButton } from 'react-native-paper';
import { Image as RNImage, Modal as RNModal } from 'react-native';

// const MOCK_LOGS = [
//   {
//     id: '1',
//     date: new Date(),
//     customer: 'Sahlgrenska Universitetssjukhuset',
//     type: 'Statusuppdatering',
//     typeIcon: '🔄',
//     summary: 'VIPER-bår servad och testad',
//     technician: 'Anna',
//   },
//   {
//     id: '2',
//     date: new Date(Date.now() - 86400000),
//     customer: 'Karolinska Universitetssjukhuset',
//     type: 'Del bytt',
//     typeIcon: '🔧',
//     summary: 'Batteri bytt på PowerTraxx-stol',
//     technician: 'Erik',
//   },
//   {
//     id: '3',
//     date: new Date(Date.now() - 2 * 86400000),
//     customer: 'Sahlgrenska Universitetssjukhuset',
//     type: 'Anteckning',
//     typeIcon: '📝',
//     summary: 'Noterat slitage på hjul, åtgärd behövs vid nästa service',
//     technician: 'Anna',
//   },
//   {
//     id: '4',
//     date: new Date(Date.now() - 3 * 86400000),
//     customer: 'Danderyds Sjukhus',
//     type: 'Kontroll',
//     typeIcon: '✅',
//     summary: 'Rutinkontroll av VIPER-bårar',
//     technician: 'Erik',
//   },
//   {
//     id: '5',
//     date: new Date(Date.now() - 4 * 86400000),
//     customer: 'Karolinska Universitetssjukhuset',
//     type: 'Problem',
//     typeIcon: '⚠️',
//     summary: 'Batteri laddar inte, behöver bytas',
//     technician: 'Anna',
//   },
// ];

const TYPE_COLORS: { [key: string]: string } = {
  'Statusuppdatering': COLORS.info,
  'Del bytt': COLORS.primary,
  'Anteckning': COLORS.warning,
  'Kontroll': COLORS.success,
  'Problem': COLORS.error,
};

const SORT_OPTIONS = [
  { label: 'Senaste först', value: 'latest' },
  { label: 'Äldst först', value: 'oldest' },
];

const DATE_FILTERS = [
  { label: 'Alla', value: 'all' },
  { label: 'Idag', value: 'today' },
  { label: 'Senaste veckan', value: 'week' },
  { label: 'Senaste månaden', value: 'month' },
];

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const ServiceLogListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCustomer, setFilterCustomer] = useState('Alla');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [filterType, setFilterType] = useState('Alla');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [typeSearch, setTypeSearch] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [sort, setSort] = useState<'latest' | 'oldest'>('latest');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [modalLog, setModalLog] = useState<any | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  // Add state for customer names
  const [customerNames, setCustomerNames] = useState<{ [id: string]: string }>({});
  const [serviceCaseNames, setServiceCaseNames] = useState<{ [id: string]: string }>({});
  const [fullImage, setFullImage] = useState<string | null>(null);
  const [fullImageIndex, setFullImageIndex] = useState<number | null>(null);
  const [fullImageLoading, setFullImageLoading] = useState(false);

  // Extra safety: ensure logs is always an array
  const safeLogs = Array.isArray(logs) ? logs : [];
  console.log('ServiceLogListScreen logs:', safeLogs);
  const safeFilterCustomer = typeof filterCustomer === 'string' ? filterCustomer : '';
  const safeFilterType = typeof filterType === 'string' ? filterType : '';
  const safeSearch = typeof search === 'string' ? search : '';

  // Enhanced filtering and sorting logic
  const filteredLogs = safeLogs
    .filter(log => {
      // Customer filter
      const customerMatch = safeFilterCustomer === 'Alla' || (log.customer || '').toLowerCase() === safeFilterCustomer.toLowerCase();
      
      // Type filter
      const typeMatch = safeFilterType === 'Alla' || (log.type || '').toLowerCase() === safeFilterType.toLowerCase();
      
      // Date filter
      const now = new Date();
      const logDate = new Date(log.timestamp || log.date);
      let dateMatch = true;
      
      switch (filterDate) {
        case 'today':
          dateMatch = logDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = logDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateMatch = logDate >= monthAgo;
          break;
        default:
          dateMatch = true;
      }
      
      // Search filter
      const searchMatch = 
        (log.summary || '').toLowerCase().includes(safeSearch.toLowerCase()) ||
        (log.customer || '').toLowerCase().includes(safeSearch.toLowerCase()) ||
        (log.type || '').toLowerCase().includes(safeSearch.toLowerCase()) ||
        (log.technician || '').toLowerCase().includes(safeSearch.toLowerCase());
      
      return customerMatch && typeMatch && dateMatch && searchMatch;
    })
    .sort((a, b) => {
      const aDate = new Date(a.timestamp || a.date).getTime();
      const bDate = new Date(b.timestamp || b.date).getTime();
      return sort === 'latest' ? bDate - aDate : aDate - bDate;
    });

  // Unique customers/types for filter
  const customers = ['Alla', ...Array.from(new Set(safeLogs.map(l => l.customer || '').filter(Boolean)))];
  const filteredCustomers = customers.filter(c => (c || '').toLowerCase().includes((customerSearch || '').toLowerCase()));
  const types = ['Alla', ...Array.from(new Set(safeLogs.map(l => l.type || '').filter(Boolean)))];
  const filteredTypes = types.filter(t => (t || '').toLowerCase().includes((typeSearch || '').toLowerCase()));

  const showLogDetails = (log: typeof logs[0]) => {
    setModalLog(log);
  };

  const handleAddNewLog = () => {
    // Navigate to new service log entry screen
    // Since this is a general service log list, we'll need to handle the case where no specific service case is selected
    Alert.alert(
      'Ny servicelogg',
      'För att skapa en ny servicelogg, gå till Service-fliken och välj ett serviceärende först.',
      [
        {
          text: 'Gå till Service',
          onPress: () => {
            // Navigate to the ServiceCases tab within Main navigator
            navigation.navigate('Main', { screen: 'ServiceCases' });
          }
        },
        {
          text: 'Avbryt',
          style: 'cancel'
        }
      ]
    );
  };

  // --- PATCH: Safe rendering helpers ---
  const safeString = (val: any) => (typeof val === 'string' ? val : val ? String(val) : '');
  const safeDate = (val: any) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      return d;
    } catch {
      return '';
    }
  };
  const safeDateString = (val: any) => {
    const d = safeDate(val);
    return d && typeof d !== 'string' ? d.toLocaleDateString('sv-SE') : '';
  };
  const safeTimeString = (val: any) => {
    const d = safeDate(val);
    return d && typeof d !== 'string' ? d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }) : '';
  };

  const renderCalendarView = () => {
    const today = new Date();
    const todayLogs = safeLogs.filter(log => {
      const logDate = safeDate(log.timestamp || log.date);
      return logDate && typeof logDate !== 'string' && logDate.toDateString() === today.toDateString();
    });
    
    return (
      <View style={styles.calendarView}>
        <Text style={styles.calendarTitle}>Dagens loggar ({todayLogs.length})</Text>
        {todayLogs.length > 0 ? (
          todayLogs.map((log, idx) => {
            const customerName = getCustomerName(log);
            const typeLabel = SERVICE_LOG_TYPES[log.type as keyof typeof SERVICE_LOG_TYPES] || safeString(log.type);
            return (
              <TouchableOpacity
                key={log.id || idx}
                style={styles.calendarLogItem}
                onPress={() => showLogDetails(log)}
              >
                <Text style={styles.calendarLogTime}>{safeTimeString(log.timestamp || log.date)}</Text>
                <Text style={styles.calendarLogCustomer}>{customerName}</Text>
                <Text style={styles.calendarLogSummary}>{safeString(log.title)}</Text>
                <Text style={styles.calendarLogContent}>{safeString(log.content)}</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.calendarEmpty}>Inga loggar idag</Text>
        )}
      </View>
    );
  };

  // Load logs from storage
  const loadLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await serviceLogStorage.getAll();
      // Sort by date, newest first
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(allLogs);
    } catch (error) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadLogs();
    }, [])
  );

  // Fetch customer names for all logs with customerId
  useEffect(() => {
    const fetchCustomerNames = async () => {
      const ids = Array.from(new Set(safeLogs.map(l => l.customerId).filter(Boolean)));
      const names: { [id: string]: string } = {};
      for (const id of ids) {
        if (!customerNames[id]) {
          const customer = await customerStorage.getById(id);
          names[id] = customer?.name || 'Okänd kund';
        }
      }
      setCustomerNames(prev => ({ ...prev, ...names }));
    };
    fetchCustomerNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  // Fetch customer names through service cases
  useEffect(() => {
    const fetchServiceCaseCustomerNames = async () => {
      const serviceCaseIds = Array.from(new Set(safeLogs.map(l => l.serviceCaseId).filter(Boolean)));
      const names: { [id: string]: string } = {};
      
      for (const serviceCaseId of serviceCaseIds) {
        if (!serviceCaseNames[serviceCaseId]) {
          const serviceCase = await serviceCaseStorage.getById(serviceCaseId);
          if (serviceCase?.customerId) {
            const customer = await customerStorage.getById(serviceCase.customerId);
            names[serviceCaseId] = customer?.name || 'Okänd kund';
          } else {
            names[serviceCaseId] = 'Okänd kund';
          }
        }
      }
      setServiceCaseNames(prev => ({ ...prev, ...names }));
    };
    fetchServiceCaseCustomerNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  // Helper to get customer name for a log
  const getCustomerName = (log: any) => {
    // First try to get customer name through service case
    if (log.serviceCaseId && serviceCaseNames[log.serviceCaseId]) {
      return serviceCaseNames[log.serviceCaseId];
    }
    // Fallback to direct customerId if available
    if (log.customerId && customerNames[log.customerId]) {
      return customerNames[log.customerId];
    }
    // Fallback to direct customer field if available
    if (log.customer) {
      return log.customer;
    }
    return 'Okänd kund';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.fernoLogo}>
              <Text style={styles.fernoLogoText}>FN</Text>
            </View>
            <Text style={styles.title}>Serviceloggen</Text>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 18, marginTop: 40 }}>
            Laddar loggar...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (logs.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.fernoLogo}>
              <Text style={styles.fernoLogoText}>FN</Text>
            </View>
            <Text style={styles.title}>Serviceloggen</Text>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.textSecondary, fontSize: 18, marginTop: 40 }}>
            Inga loggar än
          </Text>
          <Text style={{ color: COLORS.textTertiary, fontSize: 14, marginTop: 8 }}>
            Skapa din första serviceloggrad via ett serviceärende
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.fernoLogo}>
            <Text style={styles.fernoLogoText}>FN</Text>
          </View>
          <Text style={styles.title}>Serviceloggen</Text>
        </View>
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <Text style={styles.calendarButtonText}>
            {showCalendar ? '📋' : '📅'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showCalendar ? (
        renderCalendarView()
      ) : (
        <>
          <View style={styles.filters}>
            <TextInput
              style={styles.searchInput}
              placeholder="Sök i serviceloggen..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={COLORS.textTertiary}
            />
            <View style={styles.filterDropdownsRow}>
              {/* Customer Dropdown */}
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownIcon}>👤</Text>
                  <Text style={styles.dropdownButtonText} numberOfLines={1}>{filterCustomer}</Text>
                </TouchableOpacity>
                {customerDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    <TextInput
                      style={styles.dropdownSearchInput}
                      placeholder="Sök kund..."
                      value={customerSearch}
                      onChangeText={setCustomerSearch}
                      placeholderTextColor={COLORS.textTertiary}
                      autoFocus
                    />
                    <ScrollView style={{ maxHeight: 180 }}>
                      {filteredCustomers.map((c) => (
                        <TouchableOpacity
                          key={c}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setFilterCustomer(c);
                            setCustomerDropdownOpen(false);
                            setCustomerSearch('');
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{c}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              
              {/* Type Dropdown */}
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setTypeDropdownOpen(!typeDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownIcon}>🏷️</Text>
                  <Text style={styles.dropdownButtonText} numberOfLines={1}>{filterType}</Text>
                </TouchableOpacity>
                {typeDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    <TextInput
                      style={styles.dropdownSearchInput}
                      placeholder="Sök kategori..."
                      value={typeSearch}
                      onChangeText={setTypeSearch}
                      placeholderTextColor={COLORS.textTertiary}
                      autoFocus
                    />
                    <ScrollView style={{ maxHeight: 180 }}>
                      {filteredTypes.map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setFilterType(t);
                            setTypeDropdownOpen(false);
                            setTypeSearch('');
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              
              {/* Date Filter Dropdown */}
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setDateDropdownOpen(!dateDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownIcon}>📅</Text>
                  <Text style={styles.dropdownButtonText} numberOfLines={1}>
                    {DATE_FILTERS.find(f => f.value === filterDate)?.label}
                  </Text>
                </TouchableOpacity>
                {dateDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    {DATE_FILTERS.map((filter) => (
                      <TouchableOpacity
                        key={filter.value}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setFilterDate(filter.value);
                          setDateDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{filter.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Sort Dropdown */}
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setSortDropdownOpen(!sortDropdownOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownIcon}>↕️</Text>
                  <Text style={styles.dropdownButtonText} numberOfLines={1}>{SORT_OPTIONS.find(o => o.value === sort)?.label}</Text>
                </TouchableOpacity>
                {sortDropdownOpen && (
                  <View style={styles.dropdownMenu}>
                    {SORT_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSort(option.value as 'latest' | 'oldest');
                          setSortDropdownOpen(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
          
          <FlatList
            data={filteredLogs}
            keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const typeLabel = SERVICE_LOG_TYPES[item.type as keyof typeof SERVICE_LOG_TYPES] || safeString(item.type);
              const customerName = getCustomerName(item);
              // Assign a color per customer for visual separation
              const customerColor = `hsl(${(customerName.charCodeAt(0) * 37) % 360}, 60%, 92%)`;
              return (
                <TouchableOpacity
                  style={[styles.logCard, { backgroundColor: customerColor, borderLeftWidth: 6, borderLeftColor: COLORS.primary }]}
                  activeOpacity={0.85}
                  onPress={() => showLogDetails(item)}
                >
                  <View style={styles.logHeader}>
                    <Chip style={[styles.typeChip, { backgroundColor: TYPE_COLORS[safeString(item.type)] || COLORS.info }]} textStyle={[styles.typeChipText, { color: 'white' }]}>
                      {typeLabel}
                    </Chip>
                    <Text style={styles.logDate}>{safeDateString(item.timestamp || item.date)}</Text>
                    {item.isImportant && (
                      <IconButton icon="star" size={18} iconColor={COLORS.accent} style={styles.importantIcon} />
                    )}
                  </View>
                  <Text style={styles.logCustomer} numberOfLines={1}>{customerName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.logTitle} numberOfLines={1}>{safeString(item.title)}</Text>
                    {item.location && (
                      <Text style={styles.logLocation} numberOfLines={1}> • {safeString(item.location)}</Text>
                    )}
                  </View>
                  <Text style={styles.logContent} numberOfLines={2} ellipsizeMode="tail">{safeString(item.content)}</Text>
                  {item.images && Array.isArray(item.images) && item.images.length > 0 && (
                    <RNView style={styles.imageRow}>
                      {item.images.slice(0, 3).map((img: string, idx: number) => (
                        <TouchableOpacity 
                          key={idx} 
                          onPress={() => { 
                            console.log('Trying to open image:', img);
                            setFullImage(img); 
                            setFullImageIndex(idx); 
                          }}
                        >
                          <RNImage 
                            source={{ uri: img, cache: 'force-cache' }} 
                            style={styles.logImageThumb}
                            onError={(error) => {
                              console.log('Thumbnail image error:', error.nativeEvent);
                            }}
                          />
                        </TouchableOpacity>
                      ))}
                      {item.images.length > 3 && (
                        <Text style={styles.moreImagesText}>+{item.images.length - 3}</Text>
                      )}
                    </RNView>
                  )}
                  {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                    <RNView style={styles.tagsRow}>
                      {item.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <Chip key={idx} style={styles.tagChip} textStyle={styles.tagText}>{tag}</Chip>
                      ))}
                      {item.tags.length > 3 && (
                        <Text style={styles.moreTagsText}>+{item.tags.length - 3} till</Text>
                      )}
                    </RNView>
                  )}
                  {item.technician && (
                    <Text style={styles.logTechnician} numberOfLines={1}>Tekniker: {safeString(item.technician)}</Text>
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>Inga loggar hittades.</Text>}
          />
        </>
      )}
      
      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={handleAddNewLog}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      
      {/* Modal for log details */}
      <RNModal
        visible={!!modalLog}
        transparent
        animationType="fade"
        onRequestClose={() => setModalLog(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalLog(null)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{SERVICE_LOG_TYPES[modalLog?.type as keyof typeof SERVICE_LOG_TYPES] || safeString(modalLog?.type)}</Text>
            <Text style={styles.modalCustomer}>{modalLog?.customerId ? customerNames[modalLog.customerId] || '...' : (modalLog?.customer || '')}</Text>
            <Text style={styles.modalSummary}>{safeString(modalLog?.title)}</Text>
            <Text style={styles.modalSummary}>{safeString(modalLog?.content)}</Text>
            {modalLog?.location && (
              <Text style={styles.modalTechDate}>Plats: {safeString(modalLog?.location)}</Text>
            )}
            {modalLog?.tags && Array.isArray(modalLog.tags) && modalLog.tags.length > 0 && (
              <RNView style={styles.tagsRow}>
                {modalLog.tags.map((tag: string, idx: number) => (
                  <Chip key={idx} style={styles.tagChip} textStyle={styles.tagText}>{tag}</Chip>
                ))}
              </RNView>
            )}
            {modalLog?.images && Array.isArray(modalLog.images) && modalLog.images.length > 0 && (
              <RNView style={styles.imageRow}>
                {modalLog.images.map((img: string, idx: number) => (
                  <TouchableOpacity 
                    key={idx} 
                    onPress={() => { 
                      console.log('Trying to open image from modal:', img);
                      setFullImage(img); 
                      setFullImageIndex(idx); 
                    }}
                  >
                    <RNImage 
                      source={{ uri: img, cache: 'force-cache' }} 
                      style={styles.logImageThumb}
                      onError={(error) => {
                        console.log('Modal thumbnail image error:', error.nativeEvent);
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </RNView>
            )}
            {modalLog?.isImportant && (
              <IconButton icon="star" size={20} iconColor={COLORS.accent} style={styles.importantIcon} />
            )}
            {modalLog?.technician && (
              <Text style={styles.modalTechDate}>Tekniker: {safeString(modalLog?.technician)}</Text>
            )}
            <Text style={styles.modalTechDate}>Datum: {safeDateString(modalLog?.timestamp || modalLog?.date)}</Text>
            {modalLog?.serviceCaseId && (
              <TouchableOpacity style={styles.modalCaseButton} onPress={() => {
                setModalLog(null);
                navigation.navigate('ServiceCaseDetail', { serviceCaseId: modalLog.serviceCaseId });
              }}>
                <Text style={styles.modalCaseButtonText}>Visa ärende</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalLog(null)}>
              <Text style={styles.modalCloseButtonText}>Stäng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </RNModal>

      {/* Simple working image modal */}
      <RNModal
        visible={!!fullImage}
        transparent
        animationType="fade"
        onRequestClose={() => { 
          console.log('Closing image modal');
          setFullImage(null); 
          setFullImageIndex(null); 
        }}
      >
        <View style={styles.simpleImageModal}>
          {/* Header with close button */}
          <View style={styles.imageModalHeader}>
            <TouchableOpacity 
              style={styles.imageModalCloseButton}
              onPress={() => {
                console.log('Close button pressed');
                setFullImage(null);
                setFullImageIndex(null);
              }}
            >
              <Text style={styles.imageModalCloseText}>✕ Stäng</Text>
            </TouchableOpacity>
          </View>
          
          {/* Image container */}
          <View style={styles.imageModalContent}>
            {fullImageLoading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.imageLoadingText}>Laddar bild...</Text>
              </View>
            )}
            
            {fullImage && (
              <View style={styles.imageWrapper}>
                <RNImage
                  source={{ uri: fullImage }}
                  style={styles.simpleFullImage}
                  resizeMode="contain"
                  onLoadStart={() => {
                    console.log('Image loading started for:', fullImage);
                    setFullImageLoading(true);
                  }}
                  onLoadEnd={() => {
                    console.log('Image loading ended successfully');
                    setFullImageLoading(false);
                  }}
                  onError={(error) => {
                    console.log('Image loading error:', error.nativeEvent);
                    setFullImageLoading(false);
                    Alert.alert('Fel', 'Kunde inte ladda bilden. Kontrollera att bilden finns.');
                  }}
                />
              </View>
            )}
            
            {/* Debug info */}
            <Text style={styles.debugText}>
              URI: {fullImage ? fullImage.substring(0, 30) + '...' : 'Ingen URI'}
            </Text>
            
            {/* Test buttons */}
            <View style={styles.testButtonsContainer}>
              <TouchableOpacity 
                style={styles.testButton}
                onPress={() => {
                  console.log('Testing with picsum image');
                  setFullImage('https://picsum.photos/400/300');
                }}
              >
                <Text style={styles.testButtonText}>Test Picsum</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.testButton}
                onPress={() => {
                  console.log('Testing with placeholder image');
                  setFullImage('https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Test');
                }}
              >
                <Text style={styles.testButtonText}>Test Placeholder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RNModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fernoLogo: {
    backgroundColor: COLORS.fernoRed,
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fernoLogoText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  calendarButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  calendarButtonText: {
    fontSize: 24,
    color: COLORS.text,
  },
  filters: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 8,
  },
  filterDropdownsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dropdownContainer: {
    position: 'relative',
    marginRight: 6,
    minWidth: 80,
    flexShrink: 1,
  },
  dropdownButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    minWidth: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '600',
    flexShrink: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    zIndex: 100,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    padding: 6,
  },
  dropdownSearchInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 6,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: 14,
    color: COLORS.text,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    maxWidth: 120,
  },
  chipTextActive: {
    color: COLORS.textInverse,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  logCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTypeIcon: {
    fontSize: 20,
    marginRight: 7,
  },
  logType: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    maxWidth: 100,
  },
  logDate: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginLeft: 'auto',
    marginRight: 2,
  },
  logTitle: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 2,
    fontWeight: '600',
  },
  logContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
    fontWeight: '400',
  },
  logCustomer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  logSummary: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 2,
    fontWeight: '500',
  },
  logTechnician: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textTertiary,
    marginTop: 32,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  fabIcon: {
    color: COLORS.textInverse,
    fontSize: 32,
    fontWeight: '900',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  modalCustomer: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  modalSummary: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalTechDate: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginBottom: 2,
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  modalCloseButtonText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  calendarView: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  calendarLogItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  calendarLogTime: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  calendarLogCustomer: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  calendarLogSummary: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  calendarLogContent: {
    fontSize: 13,
    color: COLORS.textTertiary,
    lineHeight: 18,
  },
  calendarEmpty: {
    textAlign: 'center',
    color: COLORS.textTertiary,
    marginTop: 32,
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeChip: {
    marginRight: 8,
    height: 28,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceSecondary,
    minWidth: 80,
  },
  typeChipText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  importantIcon: {
    margin: 0,
    marginLeft: 4,
    alignSelf: 'center',
  },
  logLocation: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
  logImageThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: COLORS.surfaceSecondary,
  },
  moreImagesText: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginLeft: 4,
    alignSelf: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  tagChip: {
    marginRight: 6,
    backgroundColor: COLORS.surfaceSecondary,
    height: 22,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginLeft: 4,
    alignSelf: 'center',
  },
  modalCaseButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  modalCaseButtonText: {
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    marginTop: 10,
  },
  simpleImageModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 50,
    paddingRight: 20,
    paddingBottom: 10,
  },
  imageModalCloseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageModalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageWrapper: {
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 20,
  },
  simpleFullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imageLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  imageLoadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  testButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  testButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: '600',
  },
}); 