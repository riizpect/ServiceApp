import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { IconButton } from 'react-native-paper';
import { COLORS } from '../constants';

interface ImagePickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  title?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 80) / 3; // 3 images per row with padding

export const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  title = 'Bilder',
}) => {
  const [loading, setLoading] = useState(false);

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

  const takePhoto = async () => {
    if (!(await requestPermissions())) return;
    if (images.length >= maxImages) {
      Alert.alert('Max antal bilder', `Du kan bara lägga till max ${maxImages} bilder.`);
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newImages = [...images, result.assets[0].uri];
        onImagesChange(newImages);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Fel', 'Kunde inte ta bild');
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    if (!(await requestPermissions())) return;
    if (images.length >= maxImages) {
      Alert.alert('Max antal bilder', `Du kan bara lägga till max ${maxImages} bilder.`);
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets) {
        const newUris = result.assets.map(asset => asset.uri);
        const newImages = [...images, ...newUris];
        onImagesChange(newImages);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Fel', 'Kunde inte välja bilder');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert(
      'Ta bort bild',
      'Är du säker på att du vill ta bort denna bild?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Ta bort',
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      'Lägg till bild',
      'Välj hur du vill lägga till bilder:',
      [
        { text: 'Ta bild', onPress: takePhoto },
        { text: 'Välj från galleri', onPress: pickFromGallery },
        { text: 'Avbryt', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{images.length}/{maxImages}</Text>
      </View>

      {images.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.imageScrollView}
          contentContainerStyle={styles.imageContainer}
        >
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {images.length < maxImages && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={showImageOptions}
          disabled={loading}
        >
          <Text style={styles.addButtonIcon}>📷</Text>
          <Text style={styles.addButtonText}>
            {images.length === 0 ? 'Lägg till bilder' : 'Lägg till fler'}
          </Text>
        </TouchableOpacity>
      )}

      {images.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyText}>
            Lägg till bilder för att dokumentera arbetet
          </Text>
        </View>
      )}
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
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  count: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  imageScrollView: {
    marginBottom: 12,
  },
  imageContainer: {
    paddingRight: 16,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
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
    shadowColor: COLORS.shadowStrong,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  removeButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  addButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
}); 