import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  RefreshControl,
  useWindowDimensions,
  Keyboard,
  Platform
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import Animated, { 
  FadeIn,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Layout,
  FadeInDown
} from 'react-native-reanimated';
import { useQuestions } from '@/services/hooks/question';
import { Question } from '@/@types/db';
import debounce from 'lodash.debounce';
import QuestionItem from './QuestionItem';
import QuestionSkeleton from './QuestionSkeleton';
import EmptyState from '../common/EmptyState';
import { useCourse } from '@/services/hooks/courses';
import Loader from '../Loader';

type CourseQuestionsProps = {
  courseId: string;
};

const ITEMS_PER_PAGE = 10;

const CourseQuestions = ({ courseId }: CourseQuestionsProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  const { width } = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const isWideScreen = width >= 768;
  const listRef = useRef<FlatList>(null);

  // State
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Animated values
  const searchBarWidth = useSharedValue(0);
  const searchBarMaxWidth = useSharedValue(isWideScreen ? 300 : width - (SPACING.lg * 2 + 80));
  const searchBarOpacity = useSharedValue(0);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // Update search bar max width when screen size changes
  useEffect(() => {
    searchBarMaxWidth.value = isWideScreen ? 300 : width - (SPACING.lg * 2 + 80);
    if (isSearchVisible) {
      searchBarWidth.value = withTiming(searchBarMaxWidth.value);
    }
  }, [width, isWideScreen]);
  
  // Fetch questions
  const { data: questionsData, isPending, error, refetch } = useQuestions({
    params: {
      course: courseId,
      page,
      page_size: ITEMS_PER_PAGE,
      search: (searchQuery || undefined) as any
    }
  });

  const { data: courseData } = useCourse(courseId);
  const course = courseData?.data;

  const questions = questionsData?.data || [];
  const totalCount = questionsData?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasMore = page < totalPages;
  
  // Search functionality with debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };
  
  // Toggle search bar visibility
  const toggleSearch = () => {
    if (!isSearchVisible) {
      setIsSearchVisible(true);
      searchBarWidth.value = withTiming(searchBarMaxWidth.value, { duration: 300 });
      searchBarOpacity.value = withTiming(1, { duration: 300 });
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      Keyboard.dismiss();
      searchBarOpacity.value = withTiming(0, { duration: 300 });
      searchBarWidth.value = withTiming(0, { duration: 300 }, () => {
        setIsSearchVisible(false);
        setSearchQuery('');
        debouncedSearch('');
      });
    }
  };
  
  // Handle search focus changes
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };
  
  const handleSearchBlur = () => {
    setIsSearchFocused(false);
  };
  
  const searchBarStyle = useAnimatedStyle(() => ({
    width: searchBarWidth.value,
    opacity: searchBarOpacity.value
  }));
  
  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  
  // Pagination handlers
  const loadMore = () => {
    if (hasMore && !isPending) {
      setPage(prevPage => prevPage + 1);
    }
  };
  
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
      // Scroll to top when page changes
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  };

  // Render header with search functionality
  const renderHeader = () => (
    <Animated.View
      style={[styles.listHeader, isSearchFocused && styles.listHeaderFocused]}
      layout={Layout.springify()}
    >
      {/* <View style={[
        styles.titleSection,
        // Reduce title section width when search is visible on mobile
        !isWideScreen && isSearchVisible && { width: 'auto', flex: 0 }
      ]}>
        <MaterialIcons name="question-answer" size={20} color={colors.primary} />
        {(
          <Animated.Text 
            style={[styles.titleText, { color: colors.text }]}
            entering={FadeIn.duration(300)}
          >
            Past Questions
          </Animated.Text>
        )}
      </View> */}
      
      <Stack.Screen 
        options={{
          headerShown: true,
          title: course ? `Past Questions (${course?.code})` : 'Past Questions',
          headerSearchBarOptions: {
            placeholder: 'Search questions...',
            hideWhenScrolling: true,
            onChangeText: (e) => {
              setSearchQuery(e.nativeEvent.text);
              debouncedSearch(e.nativeEvent.text);
            },
            barTintColor: colors.background,
            textColor: colors.text,
            tintColor: colors.primary,
            headerIconColor: colors.text,
            onOpen: () => {
              setIsSearchVisible(true);
              searchBarWidth.value = withTiming(searchBarMaxWidth.value, { duration: 300 });
              searchBarOpacity.value = withTiming(1, { duration: 300 });
              setTimeout(() => {
                inputRef.current?.focus();
              }, 100);
            },
            hintTextColor: colors.secondaryText,
            shouldShowHintSearchIcon: false
          }
        }}
      />
    </Animated.View>
  );
  
  // Render count indicator
  const renderCount = () => {
    if (!totalCount || isSearchVisible) return null;
    
    return (
      <Animated.View 
        entering={FadeInDown.delay(300).duration(300)}
        style={styles.countContainer}
      >
        <Text style={{ color: colors.secondaryText }}>
          {totalCount} {totalCount === 1 ? 'question' : 'questions'} found
        </Text>
      </Animated.View>
    );
  };
  
  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity 
          style={[
            styles.paginationButton,
            page === 1 && styles.disabledButton
          ]}
          onPress={() => goToPage(page - 1)}
          disabled={page === 1}
        >
          <MaterialIcons 
            name="chevron-left" 
            size={24} 
            color={page === 1 ? colors.secondaryText : colors.text} 
          />
        </TouchableOpacity>
        
        <Text style={[styles.paginationText, { color: colors.text }]}>
          Page {page} of {totalPages}
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.paginationButton,
            page === totalPages && styles.disabledButton
          ]}
          onPress={() => goToPage(page + 1)}
          disabled={page === totalPages}
        >
          <MaterialIcons 
            name="chevron-right" 
            size={24}
            color={page === totalPages ? colors.secondaryText : colors.text}
          />
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render footer loader
  const renderFooter = () => {
    if (!isPending || page === 1) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerText, { color: colors.secondaryText }]}>
          Loading more questions...
        </Text>
      </View>
    );
  };
  
  // Render empty state
  const renderEmpty = () => {
    if (isPending && page === 1) {
      return (
        <Loader />
      );
    }

    if (isPending && page > 1) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    
    if (error) {
      return (
        <EmptyState
          icon="error-outline"
          title="Error loading questions"
          message="We encountered an issue fetching questions for this course."
          actionLabel="Try Again"
          onAction={refetch}
          color={colors.error}
        />
      );
    }
    
    if (questions.length === 0) {
      return (
        <EmptyState
          icon="help-outline"
          title="No questions found"
          message={searchQuery 
            ? "No questions match your search criteria. Try different keywords." 
            : "No past questions are currently available for this course."}
          actionLabel={searchQuery ? "Clear Search" : "Refresh"}
          onAction={searchQuery ? () => handleSearchChange('') : refetch}
          color={colors.primary}
        />
      );
    }
    
    return null;
  };
  
  return (
    <View style={styles.container}>
      {renderHeader()}
      {/* {renderCount()} */}
      
      {renderEmpty() || (
        <>
          <FlatList
            ref={listRef}
            data={questions}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <QuestionItem 
                question={item}
                index={index}
                number={(page - 1) * ITEMS_PER_PAGE + index + 1}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
          
          {renderPagination()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  listHeaderFocused: {
    marginBottom: SPACING.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    marginRight: SPACING.sm,
  },
  searchInputContainer: {
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    marginHorizontal: SPACING.xs,
  },
  loadingContainer: {
    paddingTop: SPACING.md,
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  separator: {
    height: SPACING.lg,
  },
  countContainer: {
    marginBottom: SPACING.md,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.lg,
  },
  paginationButton: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: 14,
  },
});

export default CourseQuestions;