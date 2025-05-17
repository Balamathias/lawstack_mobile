import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useCourse } from '@/services/hooks/courses';
import { useUser } from '@/services/hooks/auth';
import { useCreateChat } from '@/services/hooks/chat';
import Loader from '../Loader';

const CourseDetail = () => {
  const { course_id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  // Course data fetching
  const { data: courseData, isLoading: courseLoading } = useCourse(course_id as string);
  const { data: userData } = useUser();
  const { mutate: createChat, isPending: isCreatingChat } = useCreateChat();
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const descriptionHeight = useSharedValue(80);
  const isDescriptionExpanded = useSharedValue(false);
  const [expanded, setExpanded] = useState(false);
  
  // Extract course data
  const course = courseData?.data;
  
  useEffect(() => {
    // Animate header on load
    headerOpacity.value = withTiming(1, { duration: 500 });
  }, []);
  
  // Handle back button
  const handleBack = () => {
    router.back();
  };
  
  // Handle description toggle
  const toggleDescription = () => {
    setExpanded(!expanded);
    isDescriptionExpanded.value = !isDescriptionExpanded.value;
    descriptionHeight.value = withSpring(
      isDescriptionExpanded.value ? 300 : 80, 
      { damping: 14, stiffness: 100 }
    );
  };
  
  // Start a course-related chat
  const handleStartChat = () => {
    if (!course) return;
    
    createChat({
      title: `Chat about ${course.name}`,
      chat_type: 'course_specific',
      course_id: course.id
    }, {
      onSuccess: (data) => {
        if (data?.data?.id) {
          router.push(`/chat/${data.data.id}`);
        }
      },
      onError: (error) => {
        console.error('Error creating chat:', error);
      }
    });
  };
  
  // Start a quiz for this course
  const handleStartQuiz = () => {
    if (!course) return;
    router.push(`/quiz?course_id=${course.id}` as any);
  };
  
  // Animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value
  }));
  
  const descriptionStyle = useAnimatedStyle(() => ({
    height: descriptionHeight.value
  }));

  // Loading state
  if (courseLoading) {
    return (
      <Loader />
    );
  }
  
  // Error state
  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Course Not Found
          </Text>
          <Text style={[styles.errorMessage, { color: colors.secondaryText }]}>
            We couldn't find the course you're looking for. It may have been removed or you don't have access to it.
          </Text>
          <TouchableOpacity 
            style={[styles.errorButton, { backgroundColor: colors.primary }]}
            onPress={handleBack}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Determine level styles and colors
  const getLevelColors = () => {
    const levelNum = typeof course.level === 'string' 
      ? parseInt(course.level.toString().replace(/\D/g, ''), 10) 
      : course.level;
    
    switch (levelNum) {
      case 100:
        return ['#3B82F6', '#2563EB'];
      case 200:
        return ['#10B981', '#059669'];
      case 300:
        return ['#F59E0B', '#D97706'];
      case 400:
        return ['#8B5CF6', '#6D28D9'];
      case 500:
      case 600:
        return ['#EC4899', '#BE185D'];
      default:
        return [colors.primary, colors.primaryDark];
    }
  };
  
  const levelColors = getLevelColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Animated header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            paddingTop: insets.top,
            backgroundColor: colors.background 
          },
          headerStyle
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text 
          style={[styles.headerTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {course.code}
        </Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="more-vert" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Course info card */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(200)}
          style={[
            styles.card, 
            { 
              // backgroundColor: isDark ? colors.card : colors.card,
              // borderColor: `${colors.border}80`
            }
          ]}
        >
          {/* Decorative elements */}
          <View style={[styles.cardDecoration1, { backgroundColor: `${levelColors[0]}0D` }]} />
          <View style={[styles.cardDecoration2, { backgroundColor: `${levelColors[1]}0D` }]} />
          
          {/* Top border */}
          {/* <LinearGradient
            colors={levelColors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardBorder}
          /> */}
          
          <View style={styles.courseCodeContainer}>
            <Animated.View 
              entering={SlideInRight.duration(500).delay(400)}
              style={[
                styles.courseCodeBadge, 
                { backgroundColor: `${levelColors[0]}20` }
              ]}
            >
              <MaterialIcons name="book" size={16} color={levelColors[0]} />
              <Text style={[styles.courseCodeText, { color: levelColors[0] }]}>
                {course.code}
              </Text>
            </Animated.View>
          </View>
          
          <Text style={[styles.courseTitle, { color: colors.text }]}>
            {course.name}
          </Text>
          
          {/* Description section */}
          {course.description && (
            <Animated.View style={[styles.descriptionContainer, descriptionStyle]}>
              <View style={styles.descriptionBorder}>
                <View style={[styles.descriptionAccent, { backgroundColor: colors.primary }]} />
              </View>
              <Text 
                style={[
                  styles.courseDescription, 
                  { color: colors.secondaryText }
                ]}
                numberOfLines={expanded ? undefined : 3}
              >
                {course.description}
              </Text>
              
              <TouchableOpacity 
                style={styles.expandButton} 
                onPress={toggleDescription}
              >
                <Text style={{ color: colors.primary }}>
                  {expanded ? 'Show less' : 'Read more'}
                </Text>
                <MaterialIcons 
                  name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                  size={18} 
                  color={colors.primary} 
                />
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* Course metadata section */}
          <Animated.View
            entering={FadeIn.duration(500).delay(600)}
            style={styles.metadataSection}
          >
            <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>
              COURSE INFORMATION
            </Text>

            <View style={styles.metadataGrid}>
              {course.level && (
                <View style={styles.metadataItem}>
                  <MaterialIcons name="grade" size={14} color={colors.secondaryText} />
                  <Text style={[styles.metadataText, { color: colors.secondaryText }]}>
                    {course.level} level
                  </Text>
                </View>
              )}
              
              {course.credit_units && (
                <View style={styles.metadataItem}>
                  <MaterialIcons name="stars" size={14} color={colors.secondaryText} />
                  <Text style={[styles.metadataText, { color: colors.secondaryText }]}>
                    {course.credit_units} Credit Units
                  </Text>
                </View>
              )}
              
              {course.institution_name && (
                <View style={styles.metadataItem}>
                  <MaterialIcons name="school" size={14} color={colors.secondaryText} />
                  <Text style={[styles.metadataText, { color: colors.secondaryText }]}>
                    {course.institution_name}
                  </Text>
                </View>
              )}
              
              {course.duration && (
                <View style={styles.metadataItem}>
                  <MaterialIcons name="calendar-month" size={14} color={colors.secondaryText} />
                  <Text style={[styles.metadataText, { color: colors.secondaryText }]}>
                    {course.duration} {parseInt(course.duration) > 1 ? 'Years' : 'Year'}
                  </Text>
                </View>
              )}
            </View>


          </Animated.View>

          {/* Action buttons */}
          <Animated.View
            entering={FadeIn.duration(500).delay(800)}
            style={styles.actionButtons}
          >
            <TouchableOpacity
              style={[styles.actionButton, styles.PQButton]}
              onPress={() => {
                router.push(`/past-questions?course_id=${course.id}` as any);
              }}
            >
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <MaterialIcons name="question-answer" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                See Past Questions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.quizButton]}
              onPress={handleStartQuiz}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <MaterialIcons name="psychology" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Practice Quiz</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.chatButton]}
              onPress={handleStartChat}
              disabled={isCreatingChat}
            >
              <LinearGradient
                colors={levelColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <MaterialIcons name="chat" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>
                {isCreatingChat ? 'Starting Chat...' : 'Course Chat'}
              </Text>
              {isCreatingChat && (
                <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>

            
          </Animated.View>
        </Animated.View>
        
        {/* Past questions section */}
        {/* <Animated.View
          entering={FadeInDown.duration(500).delay(1000)}
          style={styles.questionsSection}
        > 
          <CourseQuestions courseId={course.id} />
        </Animated.View> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerRight: {
    width: 40,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl * 2,
  },
  card: {
    borderRadius: 8,
    padding: SPACING.lg,
    // borderWidth: 1,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  cardDecoration1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.5,
  },
  cardDecoration2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.5,
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  courseCodeContainer: {
    marginBottom: SPACING.md,
  },
  courseCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    gap: 4,
  },
  courseCodeText: {
    fontWeight: '600',
    fontSize: 14,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  descriptionContainer: {
    marginBottom: SPACING.xl,
    // overflow: 'hidden',
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },
  descriptionBorder: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  descriptionAccent: {
    width: 3,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  courseDescription: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    paddingLeft: SPACING.lg,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
    padding: SPACING.xs,
  },
  metadataSection: {
    marginBottom: SPACING.lg,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  metadataText: {
    fontSize: 12,
    fontWeight: '400',
  },
  metadataIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    letterSpacing: 0.5,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButtons: {
    gap: SPACING.md,
    marginTop: SPACING.xxl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quizButton: {
    marginBottom: SPACING.xs,
  },
  chatButton: {
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  PQButton: {
    backgroundColor: '#4CAF50',
  },
  questionsSection: {
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flex: 1,
    height: 1,
    marginLeft: SPACING.md,
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    borderRadius: 12,
    gap: SPACING.md,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  comingSoonText: {
    textAlign: 'center',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  errorMessage: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: SPACING.xl,
  },
  errorButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CourseDetail;