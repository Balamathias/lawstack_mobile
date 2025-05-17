import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ViewStyle 
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Course } from '@/@types/db';

type CourseCardProps = {
  course: Course;
  width: number;
  index: number;
};

const CourseCard = ({ course, width, index }: CourseCardProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  
  // Determine if this is a full-width card or multi-column card
  const isFullWidth = width > 500; // Adjust based on your UI needs
  
  // Animation values
  const scale = useSharedValue(1);
  const elevation = useSharedValue(isDark ? 2 : 1);
  
  // Get pattern based on course name
  const getPattern = (): ViewStyle => {
    const patterns = [
      { 
        opacity: isDark ? 0.03 : 0.04,
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      },
      { 
        opacity: isDark ? 0.03 : 0.04,
        backgroundImage: 'linear-gradient(45deg, currentColor 1px, transparent 1px)',
        backgroundSize: '15px 15px',
      },
      { 
        opacity: isDark ? 0.03 : 0.04,
        backgroundImage: 'linear-gradient(0deg, currentColor 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      },
      { 
        opacity: isDark ? 0.025 : 0.035,
        backgroundImage: 'linear-gradient(30deg, currentColor 1px, transparent 1px)',
        backgroundSize: '12px 12px',
      },
    ];
    
    // Generate pattern index based on course name
    const hash = course.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return patterns[hash % patterns.length];
  };
  
  // Get level badge style
  const getLevelBadgeStyle = () => {
    const levelNum = typeof course.level === 'string' 
      ? parseInt(course.level.toString().replace(/\D/g, ''), 10) 
      : course.level;
    
    switch (levelNum) {
      case 100:
        return {
          bg: isDark ? '#1E40AF30' : '#DBEAFE',
          text: isDark ? '#93C5FD' : '#1E40AF',
        };
      case 200:
        return {
          bg: isDark ? '#065F4630' : '#DCFCE7',
          text: isDark ? '#86EFAC' : '#065F46',
        };
      case 300:
        return {
          bg: isDark ? '#92400E30' : '#FEF3C7',
          text: isDark ? '#FCD34D' : '#92400E',
        };
      case 400:
        return {
          bg: isDark ? '#6D28D930' : '#F3E8FF',
          text: isDark ? '#D8B4FE' : '#6D28D9',
        };
      case 500:
      case 600:
        return {
          bg: isDark ? '#BE185D30' : '#FCE7F3',
          text: isDark ? '#F9A8D4' : '#BE185D',
        };
      default:
        return {
          bg: isDark ? '#71717A30' : '#F4F4F5',
          text: isDark ? '#D4D4D8' : '#3F3F46',
        };
    }
  };
  
  // Animation styles
  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      elevation: elevation.value,
    };
  });
  
  // Press handlers
  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 150 });
    elevation.value = withTiming(isDark ? 4 : 2, { duration: 150 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    elevation.value = withTiming(isDark ? 2 : 1, { duration: 300 });
  };
  
  const handlePress = () => {
    router.push(`/courses/${course.id}` as any);
  };
  
  const levelStyle = getLevelBadgeStyle();
  const pattern = getPattern();
  const hasDescription = !!course.description && course.description.trim().length > 0;

  return (
    <Animated.View
      entering={FadeIn.delay(index * 100).duration(300)}
      style={[{ width }, styles.container]}
    >
      <Animated.View
        style={[
          styles.card,
          { 
            backgroundColor: colors.card, 
            borderColor: isDark ? `${colors.border}60` : colors.border,
            shadowColor: isDark ? '#000000' : colors.shadow,
            // Adjust height for full-width cards to look better
            height: isFullWidth ? 175 : 200
          },
          cardStyle
        ]}
      >
        <Pressable
          style={styles.pressable}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: `${colors.primary}10` }}
        >
          {/* Pattern background */}
          <View style={[styles.patternBg, { backgroundColor: colors.primary }]} />
          
          {/* Top decorative gradient */}
          <View style={styles.gradient} />
          
          {/* Content */}
          <View style={styles.content}>
            <View style={[
              styles.header, 
              // For full-width cards, use a different layout
              isFullWidth && styles.headerFullWidth
            ]}>
              <View style={styles.titleArea}>
                {course.code && (
                  <Text style={[styles.code, { color: colors.primary }]}>
                    {course.code}
                  </Text>
                )}
                
                <Text 
                  style={[styles.title, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {course.name}
                </Text>
              </View>
              
              <View 
                style={[
                  styles.arrowContainer,
                  { backgroundColor: `${colors.primary}15` }
                ]}
              >
                <MaterialIcons 
                  name="arrow-upward" 
                  size={14}
                  color={colors.primary}
                  style={styles.arrow}
                />
              </View>
            </View>
            
            {hasDescription && (
              <Text 
                style={[styles.description, { color: colors.secondaryText }]}
                numberOfLines={isFullWidth ? 1 : 2}
              >
                {course.description}
              </Text>
            )}
            
            {/* Tags row */}
            <View style={[styles.tagsRow, isFullWidth && { flexDirection: 'row' }]}>
              {/* Level badge */}
              {course.level && (
                <View 
                  style={[
                    styles.badge, 
                    { backgroundColor: levelStyle.bg }
                  ]}
                >
                  <MaterialIcons 
                    name="school" 
                    size={12} 
                    color={levelStyle.text} 
                    style={styles.badgeIcon}
                  />
                  <Text 
                    style={[styles.badgeText, { color: levelStyle.text }]}
                  >
                    {course.level}L
                  </Text>
                </View>
              )}
              
              {/* Course code badge */}
              <View 
                style={[
                  styles.badge, 
                  { backgroundColor: isDark ? `${colors.primary}20` : `${colors.primary}10` }
                ]}
              >
                <MaterialIcons 
                  name="book" 
                  size={12} 
                  color={colors.primary} 
                  style={styles.badgeIcon}
                />
                <Text 
                  style={[styles.badgeText, { color: colors.primary }]}
                  numberOfLines={1}
                >
                  {course.code}
                </Text>
              </View>
              
              {/* Duration badge */}
              {course.duration && (
                <View 
                  style={[
                    styles.badge, 
                    { backgroundColor: isDark ? '#0369A120' : '#E0F2FE' }
                  ]}
                >
                  <MaterialIcons 
                    name="schedule" 
                    size={12} 
                    color={isDark ? '#7DD3FC' : '#0369A1'} 
                    style={styles.badgeIcon}
                  />
                  <Text 
                    style={[
                      styles.badgeText, 
                      { color: isDark ? '#7DD3FC' : '#0369A1' }
                    ]}
                  >
                    {course.duration} {parseInt(course.duration) !== 1 ? 'yrs' : 'yr'}
                  </Text>
                </View>
              )}
              
              {/* Institution badge - Only show in full width mode */}
              {course.institution_name && isFullWidth && (
                <View 
                  style={[
                    styles.badge,
                    { backgroundColor: isDark ? '#71717A20' : '#F4F4F5' }
                  ]}
                >
                  <MaterialIcons 
                    name="account-balance" 
                    size={12} 
                    color={isDark ? '#D4D4D8' : '#3F3F46'} 
                    style={styles.badgeIcon}
                  />
                  <Text 
                    style={[
                      styles.badgeText,
                      { color: isDark ? '#D4D4D8' : '#3F3F46' }
                    ]}
                    numberOfLines={1}
                  >
                    {course.institution_name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  pressable: {
    flex: 1,
    position: 'relative',
  },
  patternBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.025,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: SPACING.md + 2,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  headerFullWidth: {
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
  },
  code: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    transform: [{ rotate: '45deg' }],
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: SPACING.lg,
    opacity: 0.8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 'auto',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginBottom: 4,
    marginRight: 4,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 100,
  },
});

export default CourseCard;
