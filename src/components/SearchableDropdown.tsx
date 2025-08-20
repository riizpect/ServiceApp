import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput as RNTextInput,
} from 'react-native';
import { TextInput, IconButton, Card } from 'react-native-paper';
import { COLORS } from '../constants';

interface SearchableDropdownProps<T> {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  data: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  getSubLabel?: (item: T) => string;
  required?: boolean;
  disabled?: boolean;
}

export function SearchableDropdown<T>({
  label,
  placeholder,
  value,
  onValueChange,
  data,
  getLabel,
  getValue,
  getSubLabel,
  required = false,
  disabled = false,
}: SearchableDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const searchInputRef = useRef<RNTextInput>(null);

  const selectedItem = data.find(item => getValue(item) === value);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(data);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = data.filter(item =>
      getLabel(item).toLowerCase().includes(query) ||
      (getSubLabel && getSubLabel(item).toLowerCase().includes(query))
    );
    setFilteredData(filtered);
  }, [data, searchQuery, getLabel, getSubLabel]);

  const handleSelect = (item: T) => {
    onValueChange(getValue(item));
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onValueChange('');
    setIsOpen(false);
    setSearchQuery('');
  };

  const openModal = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchQuery('');
      setFilteredData(data);
      // Focus search input after modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      
      <TouchableOpacity
        style={[styles.dropdownButton, disabled && styles.disabled]}
        onPress={openModal}
        disabled={disabled}
      >
        <View style={styles.dropdownContent}>
          {selectedItem ? (
            <View style={styles.selectedItem}>
              <Text style={styles.selectedLabel}>{getLabel(selectedItem)}</Text>
              {getSubLabel && (
                <Text style={styles.selectedSubLabel}>{getSubLabel(selectedItem)}</Text>
              )}
            </View>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
        </View>
        <IconButton
          icon={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          iconColor={COLORS.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setIsOpen(false)}
              iconColor={COLORS.text}
            />
            <Text style={styles.modalTitle}>{label}</Text>
            <View style={{ width: 48 }} />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              placeholder="Sök..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              left={<TextInput.Icon icon="magnify" />}
            />
          </View>

          <FlatList
            data={filteredData}
            keyExtractor={(item) => getValue(item)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.itemContent}>
                  <Text style={styles.itemLabel}>{getLabel(item)}</Text>
                  {getSubLabel && (
                    <Text style={styles.itemSubLabel}>{getSubLabel(item)}</Text>
                  )}
                </View>
                {getValue(item) === value && (
                  <IconButton
                    icon="check"
                    size={20}
                    iconColor={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Inga resultat hittades' : 'Inga alternativ tillgängliga'}
                </Text>
              </View>
            }
            style={styles.list}
          />

          {value && (
            <View style={styles.clearButton}>
              <TouchableOpacity
                style={styles.clearButtonInner}
                onPress={handleClear}
              >
                <Text style={styles.clearButtonText}>Rensa val</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  dropdownButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  disabled: {
    opacity: 0.5,
  },
  dropdownContent: {
    flex: 1,
  },
  selectedItem: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedSubLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    fontSize: 16,
    color: COLORS.textTertiary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  itemSubLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  clearButton: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  clearButtonInner: {
    backgroundColor: COLORS.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 