import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  FadeIn
} from 'react-native-reanimated';

type CourseSkeletonProps = {
  width: number;
};

const CourseSkeleton = ({ width }: CourseSkeletonProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  // Animation for the shimmer effect
  const opacity = useSharedValue(0.5);
  
  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);
  
  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Determine if this is a full-width card based on width
  const isFullWidth = width > 500; // Adjust based on your UI needs
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          width, 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          // Make full-width cards slightly shorter for better visual balance
          height: isFullWidth ? 175 : 200
        },
        shimmerStyle
      ]}
      entering={FadeIn.duration(300)}
    >
      {/* Course code placeholder */}
      <View 
        style={[
          styles.smallBar, 
          { backgroundColor: isDark ? colors.border : colors.secondaryBackground, width: 60 }
        ]}
      />
      
      {/* Title placeholder - first line */}
      <View 
        style={[
          styles.titleBar, 
          { backgroundColor: isDark ? colors.border : colors.secondaryBackground, width: isFullWidth ? '70%' : '85%' }
        ]}
      />
      
      {/* Title placeholder - second line */}
      <View 
        style={[
          styles.titleBar, 
          { 
            backgroundColor: isDark ? colors.border : colors.secondaryBackground, 
            width: isFullWidth ? '50%' : '60%', 
            height: 16
          }
        ]}
      />
      
      {/* Description placeholder - first line */}
      <View
        style={[
          styles.bodyBar,
          { backgroundColor: isDark ? colors.border : colors.secondaryBackground, width: isFullWidth ? '80%' : '90%' }
        ]}
      />
      
      {/* Description placeholder - second line */}
      <View
        style={[
          styles.bodyBar,
          { backgroundColor: isDark ? colors.border : colors.secondaryBackground, width: isFullWidth ? '65%' : '75%' }
        ]}
      />
      
      {/* Badge placeholders */}
      <View style={[styles.badgeRow, isFullWidth && { marginTop: 'auto' }]}>
        <View 
          style={[
            styles.badge, 
            { backgroundColor: isDark ? colors.border : colors.secondaryBackground }
          ]}
        />
        
        <View 
          style={[
            styles.badge, 
            { backgroundColor: isDark ? colors.border : colors.secondaryBackground }
          ]}
        />
        
        {isFullWidth && (
          <View 
            style={[
              styles.badge, 
              { backgroundColor: isDark ? colors.border : colors.secondaryBackground }
            ]}
          />
        )}
      </View>
      
      {/* Arrow button placeholder - position differently based on layout */}
      <View
        style={[
          styles.actionButton,
          { 
            backgroundColor: isDark ? colors.border : colors.secondaryBackground,
            position: 'absolute',
            right: SPACING.md,
            top: isFullWidth ? SPACING.md : undefined,
            bottom: isFullWidth ? undefined : SPACING.md
          }
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  smallBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  titleBar: {
    height: 18,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  bodyBar: {
    height: 12,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  badge: {
    width: 70,
    height: 20,
    borderRadius: 10,
  },
  actionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  }
});

export default CourseSkeleton;
