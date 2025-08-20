import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { ServiceCase } from '../types';
import { STATUS_COLORS, PRIORITY_COLORS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackNavigationProp } from '../types';

interface ServiceCaseCardProps {
  serviceCase: ServiceCase;
  customerName?: string;
  onStatusChange?: (serviceCaseId: string, newStatus: string) => void;
  onPriorityChange?: (serviceCaseId: string, newPriority: string) => void;
  onEdit?: (serviceCase: ServiceCase) => void;
  onDelete?: (serviceCaseId: string) => void;
}

const ServiceCaseCard: React.FC<ServiceCaseCardProps> = React.memo(({
  serviceCase,
  customerName,
  onStatusChange,
  onPriorityChange,
  onEdit,
  onDelete,
}) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { colors } = useTheme();
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  // Memoize expensive calculations
  const statusText = useMemo(() => {
    switch (serviceCase.status) {
      case 'pending': return 'Väntar';
      case 'in_progress': return 'Pågår';
      case 'completed': return 'Avslutat';
      case 'cancelled': return 'Avbrutet';
      default: return 'Okänd';
    }
  }, [serviceCase.status]);

  const priorityText = useMemo(() => {
    switch (serviceCase.priority) {
      case 'low': return 'Låg';
      case 'medium': return 'Medium';
      case 'high': return 'Hög';
      case 'urgent': return 'Akut';
      default: return 'Medium';
    }
  }, [serviceCase.priority]);

  const priorityColor = useMemo(() => {
    return PRIORITY_COLORS[serviceCase.priority] || PRIORITY_COLORS.medium;
  }, [serviceCase.priority]);

  // Memoize callback functions
  const handleCardPress = useCallback(() => {
    navigation.navigate('ServiceCaseDetail', { serviceCaseId: serviceCase.id });
  }, [navigation, serviceCase.id]);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(serviceCase);
    }
  }, [onEdit, serviceCase]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Ta bort serviceärende',
      'Är du säker på att du vill ta bort detta serviceärende?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: () => onDelete && onDelete(serviceCase.id),
        },
      ]
    );
  }, [onDelete, serviceCase.id]);

  const handlePriorityButtonPress = useCallback(() => {
    setShowPriorityModal(true);
  }, []);

  const handlePrioritySelection = useCallback((priority: ServiceCase['priority']) => {
    if (onPriorityChange) {
      onPriorityChange(serviceCase.id, priority);
    }
    setShowPriorityModal(false);
    // Återställ kortet till ursprungspositionen efter val
    hidePriorityButton();
  }, [onPriorityChange, serviceCase.id]);

  const handleModalClose = () => {
    setShowPriorityModal(false);
    // Återställ kortet till ursprungspositionen när modalen stängs
    hidePriorityButton();
  };

  const revealPriorityButton = () => {
    Animated.spring(translateX, {
      toValue: -80,
      useNativeDriver: true,
    }).start();
  };

  const hidePriorityButton = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    const { translationX } = event.nativeEvent;
    
    if (event.nativeEvent.state === State.END) {
      if (translationX < -50) {
        // Swipe left - show priority button
        revealPriorityButton();
      } else {
        // Reset position
        hidePriorityButton();
      }
    }
  };

  const dynamicStyles = {
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      shadowColor: colors.shadow,
    },
    title: {
      color: colors.text,
    },
    description: {
      color: colors.textSecondary,
    },
    customerName: {
      color: colors.textSecondary,
    },
    statusBadge: {
      backgroundColor: STATUS_COLORS[serviceCase.status],
    },
  };

  const priorityOptions: { value: ServiceCase['priority']; label: string }[] = [
    { value: 'low', label: 'Låg' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'Hög' },
    { value: 'urgent', label: 'Akut' },
  ];

  return (
    <View style={styles.container}>
      {/* Priority Button (always behind card) */}
      <View style={styles.priorityButtonContainer}>
        <TouchableOpacity
          style={[styles.priorityButton, { backgroundColor: priorityColor }]}
          onPress={handlePriorityButtonPress}
          activeOpacity={0.8}
        >
          <Text style={styles.priorityButtonText}>Prioritering</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.card,
            dynamicStyles.card,
            { 
              borderLeftColor: priorityColor,
              transform: [{ translateX }]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.content}
            onPress={handleCardPress}
            activeOpacity={0.8}
          >
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={[styles.title, dynamicStyles.title]} numberOfLines={1}>
                  {serviceCase.title}
                </Text>
                {customerName && (
                  <Text style={[styles.customerName, dynamicStyles.customerName]} numberOfLines={1}>
                    {customerName}
                  </Text>
                )}
              </View>
              <View style={styles.badgeContainer}>
                <View style={[styles.statusBadge, dynamicStyles.statusBadge]}>
                  <Text style={styles.statusText}>
                    {statusText}
                  </Text>
                </View>
              </View>
            </View>

            {serviceCase.description && (
              <Text style={[styles.description, dynamicStyles.description]} numberOfLines={2}>
                {serviceCase.description}
              </Text>
            )}

            <View style={styles.footer}>
              <View style={styles.equipmentInfo}>
                <Text style={[styles.equipmentText, dynamicStyles.description]}>
                  {serviceCase.equipmentType} • {serviceCase.equipmentSerialNumber}
                </Text>
                <Text style={[styles.priorityText, dynamicStyles.description]}>
                  Prioritet: {priorityText}
                </Text>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleEdit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonText}>Redigera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Ta bort</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* Priority Selection Modal */}
      <Modal
        visible={showPriorityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleModalClose}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Välj prioritering
            </Text>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priorityOption,
                  serviceCase.priority === option.value && styles.selectedPriorityOption,
                  { borderColor: colors.border }
                ]}
                onPress={() => handlePrioritySelection(option.value)}
              >
                <View style={[styles.priorityIndicator, { backgroundColor: PRIORITY_COLORS[option.value] || PRIORITY_COLORS.medium }]} />
                <Text style={[styles.priorityOptionText, { color: colors.text }]}>
                  {option.label}
                </Text>
                {serviceCase.priority === option.value && (
                  <Text style={styles.selectedText}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleModalClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Avbryt
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    position: 'relative',
  },
  priorityButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 0, // Ligger bakom kortet
  },
  priorityButton: {
    width: 80,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  priorityButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    zIndex: 1, // Ligger ovanpå prioriteringsknappen
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 12,
    fontWeight: '400',
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentText: {
    fontSize: 11,
    fontWeight: '400',
    marginBottom: 2,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 12,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPriorityOption: {
    backgroundColor: '#F1F5F9',
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ServiceCaseCard; 