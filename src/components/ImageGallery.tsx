import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants';

interface ImageGalleryProps {
  images: string[];
  title?: string;
  maxImagesToShow?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const thumbnailSize = (screenWidth - 60) / 3; // 3 images per row with padding

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  title = 'Bilder',
  maxImagesToShow = 6,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const displayedImages = images.slice(0, maxImagesToShow);
  const hasMoreImages = images.length > maxImagesToShow;

  const openImage = (imageUri: string, index: number) => {
    setSelectedImage(imageUri);
    setImageIndex(index);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (imageIndex < images.length - 1) {
      setImageIndex(imageIndex + 1);
      setSelectedImage(images[imageIndex + 1]);
    }
  };

  const previousImage = () => {
    if (imageIndex > 0) {
      setImageIndex(imageIndex - 1);
      setSelectedImage(images[imageIndex - 1]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>{images.length} bilder</Text>
      </View>

      <View style={styles.imageGrid}>
        {displayedImages.map((uri, index) => (
          <TouchableOpacity
            key={index}
            style={styles.imageWrapper}
            onPress={() => openImage(uri, index)}
            activeOpacity={0.8}
          >
            <Image source={{ uri }} style={styles.thumbnail} />
            {index === maxImagesToShow - 1 && hasMoreImages && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>+{images.length - maxImagesToShow}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImage}
      >
        <StatusBar hidden />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeImage} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {imageIndex + 1} av {images.length}
            </Text>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              if (newIndex !== imageIndex) {
                setImageIndex(newIndex);
                setSelectedImage(images[newIndex]);
              }
            }}
            style={styles.imageScrollView}
          >
            {images.map((uri, index) => (
              <View key={index} style={styles.fullImageContainer}>
                <Image source={{ uri }} style={styles.fullImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>

          {images.length > 1 && (
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navButton, imageIndex === 0 && styles.navButtonDisabled]}
                onPress={previousImage}
                disabled={imageIndex === 0}
              >
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.navButton, imageIndex === images.length - 1 && styles.navButtonDisabled]}
                onPress={nextImage}
                disabled={imageIndex === images.length - 1}
              >
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  count: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: thumbnailSize,
    height: thumbnailSize,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSecondary,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: COLORS.textInverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  imageScrollView: {
    flex: 1,
  },
  fullImageContainer: {
    width: screenWidth,
    height: screenHeight - 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: screenWidth,
    height: screenHeight - 140,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 