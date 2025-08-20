import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import { IconButton, Chip } from 'react-native-paper';
import { ServiceCase } from '../types';
import { COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../constants';

interface BulkActionsProps {
  selectedCases: ServiceCase[];
  onStatusChange: (serviceCases: ServiceCase[], newStatus: ServiceCase['status']) => void;
  onPriorityChange: (serviceCases: ServiceCase[], newPriority: ServiceCase['priority']) => void;
  visible: boolean;
  onClose: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCases,
  onStatusChange,
  onPriorityChange,
  visible,
  onClose,
}) => {
  const [animation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const getStatusOptions = () => [
    { status: 'pending' as const, label: 'Väntar', icon: 'clock-outline', color: STATUS_COLORS.pending },
    { status: 'in_progress' as const, label: 'Pågår', icon: 'play-circle-outline', color: STATUS_COLORS.in_progress },
    { status: 'completed' as const, label: 'Klar', icon: 'check-circle-outline', color: STATUS_COLORS.completed },
    { status: 'cancelled' as const, label: 'Avbruten', icon: 'close-circle-outline', color: STATUS_COLORS.cancelled },
  ];

  const getPriorityOptions = () => [
    { priority: 'low' as const, label: 'Låg', icon: 'flag-outline', color: PRIORITY_COLORS.low },
    { priority: 'medium' as const, label: 'Medium', icon: 'flag', color: PRIORITY_COLORS.medium },
    { priority: 'high' as const, label: 'Hög', icon: 'flag-variant', color: PRIORITY_COLORS.high },
    { priority: 'urgent' as const, label: 'Akut', icon: 'flag-variant-outline', color: PRIORITY_COLORS.urgent },
  ];

  const handleStatusChange = (newStatus: ServiceCase['status']) => {
    onStatusChange(selectedCases, newStatus);
    onClose();
  };

  const handlePriorityChange = (newPriority: ServiceCase['priority']) => {
    onPriorityChange(selectedCases, newPriority);
    onClose();
  };

  const getCurrentStatusCounts = () => {
    const counts = { pending: 0, in_progress: 0, completed: 0, cancelled: 0 };
    selectedCases.forEach(case_ => {
      counts[case_.status]++;
    });
    return counts;
  };

  const getCurrentPriorityCounts = () => {
    const counts = { low: 0, medium: 0, high: 0, urgent: 0 };
    selectedCases.forEach(case_ => {
      counts[case_.priority]++;
    });
    return counts;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: animation,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Massåtgärder</Text>
            <Text style={styles.subtitle}>
              {selectedCases.length} ärende{selectedCases.length !== 1 ? 'n' : ''} valda
            </Text>
          </View>

          <ScrollView style={styles.selectedCasesList} showsVerticalScrollIndicator={false}>
            {selectedCases.map((serviceCase, index) => (
              <View key={serviceCase.id} style={styles.selectedCaseItem}>
                <Text style={styles.caseTitle} numberOfLines={1}>
                  {index + 1}. {serviceCase.title}
                </Text>
                <View style={styles.caseBadges}>
                  <Chip 
                    style={[styles.caseStatusChip, { backgroundColor: STATUS_COLORS[serviceCase.status] }]}
                    textStyle={styles.caseStatusText}
                  >
                    {serviceCase.status === 'pending' ? 'Väntar' : 
                     serviceCase.status === 'in_progress' ? 'Pågår' :
                     serviceCase.status === 'completed' ? 'Klar' : 'Avbruten'}
                  </Chip>
                  <Chip 
                    style={[styles.casePriorityChip, { backgroundColor: PRIORITY_COLORS[serviceCase.priority] }]}
                    textStyle={styles.casePriorityText}
                  >
                    {serviceCase.priority === 'low' ? 'Låg' :
                     serviceCase.priority === 'medium' ? 'Medium' :
                     serviceCase.priority === 'high' ? 'Hög' : 'Akut'}
                  </Chip>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ändra status för alla</Text>
            <View style={styles.optionsGrid}>
              {getStatusOptions().map((option) => (
                <TouchableOpacity
                  key={option.status}
                  style={styles.optionButton}
                  onPress={() => handleStatusChange(option.status)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                    <IconButton
                      icon={option.icon}
                      size={20}
                      iconColor="white"
                      style={styles.iconButton}
                    />
                  </View>
                  <Text style={styles.optionLabel}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionCount}>
                    {getCurrentStatusCounts()[option.status]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ändra prioritet för alla</Text>
            <View style={styles.optionsGrid}>
              {getPriorityOptions().map((option) => (
                <TouchableOpacity
                  key={option.priority}
                  style={styles.optionButton}
                  onPress={() => handlePriorityChange(option.priority)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                    <IconButton
                      icon={option.icon}
                      size={20}
                      iconColor="white"
                      style={styles.iconButton}
                    />
                  </View>
                  <Text style={styles.optionLabel}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionCount}>
                    {getCurrentPriorityCounts()[option.priority]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Avbryt</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  selectedCasesList: {
    maxHeight: 120,
    marginBottom: 20,
  },
  selectedCaseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    marginBottom: 8,
  },
  caseTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  caseBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  caseStatusChip: {
    height: 20,
    borderRadius: 10,
  },
  caseStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  casePriorityChip: {
    height: 20,
    borderRadius: 10,
  },
  casePriorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconButton: {
    margin: 0,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  optionCount: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.surfaceSecondary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
}); 