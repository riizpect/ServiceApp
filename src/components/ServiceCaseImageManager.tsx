import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { COLORS } from '../constants';
import { ServiceImage } from '../types';
import { ImageGallery } from './ImageGallery';

interface ServiceCaseImageManagerProps {
  serviceCaseId: string;
  images: ServiceImage[];
  onImagesChange: (images: ServiceImage[]) => void;
  title?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const ServiceCaseImageManager: React.FC<ServiceCaseImageManagerProps> = ({
  serviceCaseId,
  images,
  onImagesChange,
  title = 'Bildbibliotek',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedImageType, setSelectedImageType] = useState<ServiceImage['type']>('other');

  const imageTypes = [
    { type: 'damage', label: 'Skada', icon: '🔧' },
    { type: 'serial_number', label: 'Serienummer', icon: '🏷️' },
    { type: 'before_service', label: 'Före service', icon: '📸' },
    { type: 'after_service', label: 'Efter service', icon: '✅' },
    { type: 'other', label: 'Övrigt', icon: '📷' },
  ];

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Behörigheter krävs',
        'Kamera och mediebibliotek behövs för att ta och spara bilder.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const addImage = async (source: 'camera' | 'gallery') => {
    if (!(await requestPermissions())) return;

    try {
      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const newImage: ServiceImage = {
          id: Date.now().toString(), // Simple ID generation
          serviceCaseId,
          uri: result.assets[0].uri,
          type: selectedImageType,
          description: '',
          createdAt: new Date(),
        };

        const newImages = [...images, newImage];
        onImagesChange(newImages);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding image:', error);
      Alert.alert('Fel', 'Kunde inte lägga till bild');
    }
  };

  const removeImage = (imageId: string) => {
    Alert.alert(
      'Ta bort bild',
      'Är du säker på att du vill ta bort denna bild?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter(img => img.id !== imageId);
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  const getImagesByType = (type: ServiceImage['type']) => {
    return images.filter(img => img.type === type);
  };

  const getImageUris = () => {
    return images.map(img => img.uri);
  };

  const groupedImages = imageTypes.map(({ type, label, icon }) => ({
    type,
    label,
    icon,
    images: getImagesByType(type as ServiceImage['type']),
  })).filter(group => group.images.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Lägg till</Text>
        </TouchableOpacity>
      </View>

      {images.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyText}>
            Inga bilder tillagda än. Lägg till bilder för att dokumentera arbetet.
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          {/* All Images Gallery */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alla bilder ({images.length})</Text>
            <ImageGallery 
              images={getImageUris()} 
              maxImagesToShow={6}
              title=""
            />
          </View>

          {/* Grouped by Type */}
          {groupedImages.map((group) => (
            <View key={group.type} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {group.icon} {group.label} ({group.images.length})
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.imageRow}
              >
                {group.images.map((image) => (
                  <View key={image.id} style={styles.imageWrapper}>
                    <ImageGallery 
                      images={[image.uri]} 
                      maxImagesToShow={1}
                      title=""
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeImage(image.id)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
      )}

      {/* Add Image Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lägg till bild</Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Välj bildtyp:</Text>
            <ScrollView style={styles.typeList}>
              {imageTypes.map(({ type, label, icon }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    selectedImageType === type && styles.typeOptionSelected
                  ]}
                  onPress={() => setSelectedImageType(type as ServiceImage['type'])}
                >
                  <Text style={styles.typeIcon}>{icon}</Text>
                  <Text style={[
                    styles.typeLabel,
                    selectedImageType === type && styles.typeLabelSelected
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => addImage('camera')}
              >
                <Text style={styles.actionButtonIcon}>📷</Text>
                <Text style={styles.actionButtonText}>Ta bild</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => addImage('gallery')}
              >
                <Text style={styles.actionButtonIcon}>🖼️</Text>
                <Text style={styles.actionButtonText}>Välj från galleri</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  content: {
    gap: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  imageRow: {
    marginBottom: 8,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 16,
  },
  typeList: {
    maxHeight: 200,
    marginBottom: 24,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.surfaceSecondary,
  },
  typeOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  typeLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  typeLabelSelected: {
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  actionButtonText: {
    color: COLORS.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
}); 