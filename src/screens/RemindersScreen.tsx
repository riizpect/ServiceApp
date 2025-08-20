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
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ServiceReminder, RootStackParamList } from '../types';
import { reminderStorage, customerStorage } from '../services/storage';
import { COLORS } from '../constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ReminderCardProps {
  reminder: ServiceReminder & { customerName?: string };
  onPress: (reminder: ServiceReminder) => void;
  onToggleComplete: (reminder: ServiceReminder) => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ 
  reminder, 
  onPress, 
  onToggleComplete
}) => {
  const formatDate = (date: Date) => {
    const today = new Date();
    const reminderDate = new Date(date);
    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Idag';
    if (diffDays === 1) return 'Imorgon';
    if (diffDays === -1) return 'Igår';
    if (diffDays > 0) return `Om ${diffDays} dagar`;
    return `${Math.abs(diffDays)} dagar sedan`;
  };

  const isOverdue = new Date(reminder.dueDate) < new Date() && !reminder.isCompleted;
  const isToday = new Date(reminder.dueDate).toDateString() === new Date().toDateString();

  const getStatusColor = () => {
    if (reminder.isCompleted) return COLORS.success;
    if (isOverdue) return COLORS.error;
    if (isToday) return COLORS.warning;
    return COLORS.secondary;
  };

  return (
    <TouchableOpacity 
      style={[styles.reminderCard, isOverdue && styles.overdueCard]} 
      onPress={() => onPress(reminder)}
      activeOpacity={0.8}
    >
      <View style={styles.reminderContent}>
        <View style={styles.reminderInfo}>
          <Text style={[styles.reminderTitle, reminder.isCompleted && styles.completedText]}>
            {reminder.title}
          </Text>
          <Text style={styles.customerName}>{reminder.customerName || 'Okänd kund'}</Text>
        </View>
        
        <View style={styles.reminderMeta}>
          <Text style={[styles.dueDate, isOverdue && styles.overdueText]}>
            {formatDate(reminder.dueDate)}
          </Text>
          <TouchableOpacity 
            style={[styles.checkbox, reminder.isCompleted && styles.checkboxCompleted]}
            onPress={() => onToggleComplete(reminder)}
          >
            {reminder.isCompleted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
    </TouchableOpacity>
  );
};

export const RemindersScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [reminders, setReminders] = useState<(ServiceReminder & { customerName?: string })[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<(ServiceReminder & { customerName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadReminders = async () => {
    try {
      setLoading(true);
      const remindersData = await reminderStorage.getAll();
      const customers = await customerStorage.getAll();
      
      const remindersWithCustomers = remindersData.map(reminder => ({
        ...reminder,
        customerName: customers.find(c => c.id === reminder.customerId)?.name,
      }));
      
      setReminders(remindersWithCustomers);
    } catch (error) {
      console.error('Error loading reminders:', error);
      Alert.alert('Fel', 'Kunde inte ladda påminnelser');
    } finally {
      setLoading(false);
    }
  };

  const filterReminders = () => {
    let filtered = [...reminders];

    if (searchQuery.trim()) {
      filtered = filtered.filter(reminder =>
        reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sortera: försenade först, sedan idag, sedan kommande
    filtered.sort((a, b) => {
      const aDate = new Date(a.dueDate);
      const bDate = new Date(b.dueDate);
      const today = new Date();
      
      const aIsOverdue = aDate < today && !a.isCompleted;
      const bIsOverdue = bDate < today && !b.isCompleted;
      const aIsToday = aDate.toDateString() === today.toDateString();
      const bIsToday = bDate.toDateString() === today.toDateString();
      
      if (aIsOverdue && !bIsOverdue) return -1;
      if (!aIsOverdue && bIsOverdue) return 1;
      if (aIsToday && !bIsToday) return -1;
      if (!aIsToday && bIsToday) return 1;
      return aDate.getTime() - bDate.getTime();
    });

    setFilteredReminders(filtered);
  };

  useEffect(() => {
    filterReminders();
  }, [reminders, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReminders();
    setRefreshing(false);
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleReminderPress = (reminder: ServiceReminder) => {
    if (reminder.serviceCaseId) {
      navigation.navigate('ServiceCaseDetail', { serviceCaseId: reminder.serviceCaseId });
    }
  };

  const handleToggleComplete = async (reminder: ServiceReminder) => {
    try {
      const updatedReminder = {
        ...reminder,
        isCompleted: !reminder.isCompleted,
        completedAt: !reminder.isCompleted ? new Date() : undefined,
      };
      
      await reminderStorage.save(updatedReminder);
      await loadReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert('Fel', 'Kunde inte uppdatera påminnelse');
    }
  };

  const handleDeleteReminder = async (reminder: ServiceReminder) => {
    Alert.alert(
      'Ta bort påminnelse',
      `Är du säker på att du vill ta bort "${reminder.title}"?`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: async () => {
            try {
              await reminderStorage.delete(reminder.id);
              await loadReminders();
            } catch (error) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Fel', 'Kunde inte ta bort påminnelsen');
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (reminder: ServiceReminder) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDeleteReminder(reminder)}
    >
      <IconButton
        icon="delete"
        size={20}
        iconColor={COLORS.textInverse}
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>Inga påminnelser</Text>
      <Text style={styles.emptySubtext}>Skapa din första påminnelse genom att trycka på +</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
      <Text style={styles.title}>Påminnelser</Text>
          <Text style={styles.subtitle}>
            {filteredReminders.length} av {reminders.length} påminnelser
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNew}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
        onChangeText={setSearchQuery}
          placeholder="Sök påminnelser, kunder..."
          placeholderTextColor={COLORS.textTertiary}
        />
      </View>
    </View>
  );

  const handleAddNew = () => {
    navigation.navigate('NewReminder');
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
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={filteredReminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => renderRightActions(item)}
            rightThreshold={40}
          >
            <ReminderCard
              reminder={item}
              onPress={handleReminderPress}
              onToggleComplete={handleToggleComplete}
            />
          </Swipeable>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState()}
        showsVerticalScrollIndicator={false}
      />
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
    padding: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textInverse,
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: COLORS.text,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  reminderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  reminderContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flex: 1,
    marginRight: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  customerName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  reminderMeta: {
    alignItems: 'flex-end',
  },
  dueDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  overdueText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
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