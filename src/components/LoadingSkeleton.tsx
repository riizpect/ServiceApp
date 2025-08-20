import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

interface CardSkeletonProps {
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showBadges?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showImage = false,
  showTitle = true,
  showDescription = true,
  showBadges = true,
}) => (
  <View style={styles.cardSkeleton}>
    <View style={styles.cardHeader}>
      {showImage && <LoadingSkeleton width={60} height={60} borderRadius={30} />}
      <View style={styles.cardContent}>
        {showTitle && <LoadingSkeleton height={18} style={styles.titleSkeleton} />}
        {showDescription && <LoadingSkeleton height={14} style={styles.descriptionSkeleton} />}
      </View>
    </View>
    {showBadges && (
      <View style={styles.badgesSkeleton}>
        <LoadingSkeleton width={80} height={24} borderRadius={12} />
        <LoadingSkeleton width={60} height={24} borderRadius={12} />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border,
  },
  cardSkeleton: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  titleSkeleton: {
    marginBottom: 8,
  },
  descriptionSkeleton: {
    marginBottom: 4,
  },
  badgesSkeleton: {
    flexDirection: 'row',
    gap: 8,
  },
}); 