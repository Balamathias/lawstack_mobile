import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  withDelay,
  FadeIn
} from 'react-native-reanimated';

type QuestionSkeletonProps = {
  delay?: number;
};

const QuestionSkeleton = ({ delay = 0 }: QuestionSkeletonProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  // Animation for the shimmer effect
  const opacity = useSharedValue(0.5);
  
  useEffect(() => {
    opacity.value = withDelay(
      delay, 
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800 }),
          withTiming(0.5, { duration: 800 })
        ),
        -1,
        true
      )
    );
  }, [delay]);
  
  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderColor: isDark ? `${colors.border}60` : colors.border,
        },
        shimmerStyle
      ]}
      entering={FadeIn.delay(delay).duration(300)}
    >
      <View style={styles.headerRow}>
        <View 
          style={[
            styles.numberCircle, 
            { backgroundColor: isDark ? colors.border : colors.secondaryBackground }
          ]}
        />
        
        <View 
          style={[
            styles.yearBadge, 
            { backgroundColor: isDark ? colors.border : colors.secondaryBackground }
          ]}
        />
      </View>
      
      <View style={styles.content}>
        <View 
          style={[
            styles.line, 
            { backgroundColor: isDark ? colors.border : colors.secondaryBackground, width: '90%' }
          ]}
        />
        <View 
          style={[
            styles.line, 
            { backgroundColor: isDark ? colors.border : colors.secondaryBackground, width: '100%' }
          ]}
        />
        <View 
          style={[
            styles.line, 
            { backgroundColor: isDark ? colors.border : colors.secondaryBackground, width: '70%' }
          ]}
        />
      </View>
      
      <View style={styles.footer}>
        <View 
          style={[
            styles.marks, 
            { backgroundColor: isDark ? colors.border : colors.secondaryBackground }
          ]}
        />
        
        <View 
          style={[
            styles.viewButton, 
            { backgroundColor: isDark ? colors.border : colors.secondaryBackground }
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.sm,
  },
  yearBadge: {
    width: 80,
    height: 22,
    borderRadius: 12,
  },
  content: {
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  line: {
    height: 14,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  marks: {
    width: 60,
    height: 16,
    borderRadius: 8,
  },
  viewButton: {
    width: 100,
    height: 16,
    borderRadius: 8,
  },
});

export default QuestionSkeleton;
