import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';
import Animated, { 
  FadeIn,
} from 'react-native-reanimated';

import debounce from 'lodash.debounce';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import CourseCard from './CourseCard';
import EmptyState from './EmptyState';
import CourseSkeleton from './CourseSkeleton';
import FilterChips from './FilterChips';
import { useGetCourses } from '@/services/hooks/courses';
import Loader from '../Loader';

const CourseList = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { width } = useWindowDimensions();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.query?.toString() || '');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(searchParams.level?.toString() || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showCount, setShowCount] = useState(true);

  // Determine if we should use multiple columns based on screen width
  const isWideScreen = width >= 768; // Tablet/desktop breakpoint
  const numColumns = isWideScreen ? 2 : 1;
  
  // Calculate card width based on number of columns
  const CARD_WIDTH = useMemo(() => {
    if (numColumns === 1) {
      // Use full width minus padding for single column
      return width - (SPACING.lg * 2);
    } else {
      // Use half width minus padding and gap for two columns
      return (width - (SPACING.lg * 2) - SPACING.md) / 2;
    }
  }, [width, numColumns]);

  const { 
    data: _courses, 
    isPending: isLoading, 
    error, 
    refetch,
  } = useGetCourses({
    search: searchQuery,
    level: selectedLevel,
  });

  const courses = _courses?.data || []
  const totalCount = _courses?.count || 0

  const debouncedSearch = useCallback(debounce((text: string) => {
    router.setParams({ query: text || undefined });
  }, 500), []);

  const handleLevelSelect = (level: string | null) => {
    setSelectedLevel(level);
    router.setParams({ level: level || undefined });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <Loader />
      );
    }
    
    if (error) {
      return (
        <EmptyState
          icon="error-outline"
          title="Error loading courses"
          message="We encountered an issue while fetching the course data."
          actionLabel="Try Again"
          onAction={refetch}
          color={colors.error}
        />
      );
    }
    
    if (courses?.length === 0) {
      return (
        <EmptyState
          icon="school"
          title="No courses found"
          message={searchQuery ? "Try adjusting your search or filters" : "No courses are currently available"}
          actionLabel={searchQuery || selectedLevel ? "Clear Filters" : "Refresh"}
          onAction={searchQuery || selectedLevel ? 
            () => {
              setSearchQuery('');
              setSelectedLevel(null);
              router.setParams({});
            } : 
            refetch
          }
          color={colors.primary}
        />
      );
    }
    
    return null;
  };

  // Render item function for the FlatList
  const renderItem = ({ item, index }: any) => (
    <CourseCard 
      course={item}
      width={CARD_WIDTH}
      index={index}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <FilterChips 
        selectedLevel={selectedLevel}
        onLevelSelect={handleLevelSelect}
      />

      <Stack.Screen 
        options={{
          headerRight: () => (
            !!totalCount && (totalCount > 0) && showCount  ? (
              <Text style={{ color: colors.secondaryText }}>
                {totalCount} {totalCount === 1 ? 'course' : 'courses'}
              </Text>
            ): null
          ),
          headerSearchBarOptions: {
            placeholder: 'Search courses...',
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
              setShowCount(false);
            },
            hintTextColor: colors.secondaryText,
            shouldShowHintSearchIcon: false,
          }
        }}
      />
      
      <View style={styles.content}>
        {renderEmpty() || (
          <Animated.FlatList
            data={courses || []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            numColumns={numColumns}
            key={`courselist-${numColumns}`} // Important: key changes when numColumns changes
            columnWrapperStyle={isWideScreen ? styles.row : undefined} // Only use columnWrapperStyle when in wide mode
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={isRefreshing} 
                onRefresh={handleRefresh} 
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            onEndReachedThreshold={0.3}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.lg }} />}
            extraData={[searchQuery, selectedLevel, numColumns]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  titleContainer: {
    height: 42,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  searchContainer: {
    alignSelf: 'stretch',
    marginBottom: SPACING.md,
  },
  searchInputContainer: {
    height: 46,
    borderRadius: 23,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 46,
    marginHorizontal: SPACING.sm,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flexDirection: 'column', // Stack skeletons vertically for single column layout
    gap: SPACING.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },
  resultsInfo: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  footerLoader: {
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CourseList;