import type { Course, Question, SearchFilters } from '@/@types/db'
import { ThemedView } from '@/components/ThemedView'
import { Colors } from '@/constants/Colors'
import { SPACING } from '@/constants/Spacing'
import { debounce } from '@/lib/utils'
import { useSearch, useSearchFilterOptions } from '@/services/hooks/search'
import { MaterialIcons } from '@expo/vector-icons'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native'
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get('window')

const SearchScreen = () => {
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light']
  const isDark = colorScheme === 'dark'
  
  // Search filters state
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    institution: undefined,
    course: undefined,
    year: undefined,
    type: undefined,
    page: 1,
    limit: 20
  })
  
  // Active filter state
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  
  // Get search filter options
  const { 
    data: filterOptions, 
    isLoading: isLoadingFilters 
  } = useSearchFilterOptions()
  
  // Get search results
  const { 
    data: searchResults, 
    isLoading: isSearching, 
    refetch: refreshSearch 
  } = useSearch(filters)
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((text: string) => {
      setFilters(prev => ({ ...prev, query: text, page: 1 }))
    }, 500), 
    []
  )
  
  // Handle search input change
  const handleSearchChange = (text: string) => {
    debouncedSearch(text)
  }
  
  // Handle filter selection
  const handleFilterSelect = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value, page: 1 }))
    setActiveFilter(null)
  }
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({ 
      query: filters.query, 
      page: 1,
      limit: 20 
    })
  }
  
  // Determine if any filters are active
  const hasActiveFilters = !!(filters.institution || filters.course || filters.year || filters.type)
  
  // Navigate to detail screen based on item type
  const handleItemPress = (type: string, id: string) => {
    if (type === 'course') {
      router.push(`/courses/${id}`)
    } else if (type === 'question') {
      router.push(`/past-questions/${id}`)
    }
  }

  // Render empty state
  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeIn.duration(300)}
      style={styles.emptyStateContainer}
    >
      <MaterialIcons name="search-off" size={64} color={colors.secondaryText} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        No results found
      </Text>
      <Text style={[styles.emptyStateText, { color: colors.secondaryText }]}>
        Try adjusting your search or filters to find what you're looking for
      </Text>
      {hasActiveFilters && (
        <TouchableOpacity 
          style={[
            styles.clearFiltersButton,
            { backgroundColor: `${colors.primary}20` }
          ]}
          onPress={handleClearFilters}
        >
          <Text style={[styles.clearFiltersText, { color: colors.primary }]}>
            Clear Filters
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  )
  
  // Format total results count
  const formatResultsCount = () => {
    const count = searchResults?.data?.count || 0
    return `${count} ${count === 1 ? 'result' : 'results'} found`
  }

  return (
    <View
      style={{ flex: 1 }}
      // behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // keyboardVerticalOffset={100}
    >
      <ThemedView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header Section */}          <View style={styles.header}>
            <MaskedView
              style={{ height: 44 }}
              maskElement={
                <Text style={[styles.headerTitle, { color: 'black' }]}>
                  Search LawStack
                </Text>
              }
            >
              <LinearGradient
                colors={['#10B981', '#3B82F6', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              >
                <Text style={[styles.headerTitle, { opacity: 0 }]}>
                  Search LawStack
                </Text>
              </LinearGradient>
            </MaskedView>
          </View>
          
          {/* Search Input */}
          <Animated.View 
            entering={FadeInDown.duration(300).springify()}
            style={[
              styles.searchContainer, 
              { 
                backgroundColor: colors.secondaryBackground,
                borderWidth: 1,
                borderColor: isDark ? 'transparent' : colors.border,
                shadowColor: isDark ? 'transparent' : '#bbb',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: isDark ? 0 : 2,
              }
            ]}
          >
            <MaterialIcons 
              name="search" 
              size={24} 
              color={colors.secondaryText} 
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search courses, past questions, resources..."
              placeholderTextColor={colors.secondaryText}
              onChangeText={handleSearchChange}
              autoCapitalize="none"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {filters.query ? (
              <TouchableOpacity 
                onPress={() => {
                  setFilters(prev => ({ ...prev, query: '' }))
                }}
                style={styles.clearButton}
              >
                <View style={[styles.clearButtonInner, { backgroundColor: colors.secondaryText + '40' }]}>
                  <MaterialIcons 
                    name="close" 
                    size={16} 
                    color={isDark ? colors.text : colors.secondaryText} 
                  />
                </View>
              </TouchableOpacity>
            ) : null}
          </Animated.View>
            {/* Filters Section */}
          <View style={styles.filtersWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContainer}
            >
              {/* Filter by Institution */}
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: isDark ? 
                      (activeFilter === 'institution' ? `${colors.primary}30` : colors.secondaryBackground) : 
                      (activeFilter === 'institution' ? `${colors.primary}20` : colors.secondaryBackground),
                    borderColor: activeFilter === 'institution' ? colors.primary : 
                      (isDark ? colors.secondaryBackground : colors.border)
                  },
                  filters.institution && { 
                    backgroundColor: `${colors.primary}30`, 
                    borderColor: colors.primary
                  }
                ]}
                onPress={() => setActiveFilter(activeFilter === 'institution' ? null : 'institution')}
              >
                {filters.institution && (
                  <MaterialIcons 
                    name="check" 
                    size={14} 
                    color={colors.primary} 
                    style={styles.filterCheckIcon}
                  />
                )}
                <Text style={[
                  styles.filterChipText, 
                  { 
                    color: filters.institution || activeFilter === 'institution' ? 
                      colors.primary : 
                      colors.secondaryText 
                  },
                ]}>
                  {filters.institution 
                    ? filterOptions?.data?.institutions.find(i => i.id === filters.institution)?.name || 'Institution'
                    : 'Institution'
                  }
                </Text>
                <MaterialIcons 
                  name={activeFilter === 'institution' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                  size={16} 
                  color={filters.institution || activeFilter === 'institution' ? colors.primary : colors.secondaryText} 
                />
              </TouchableOpacity>
              
              {/* Filter by Course */}
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: isDark ? 
                      (activeFilter === 'course' ? `${colors.primary}30` : colors.secondaryBackground) : 
                      (activeFilter === 'course' ? `${colors.primary}20` : colors.secondaryBackground),
                    borderColor: activeFilter === 'course' ? colors.primary : 
                      (isDark ? colors.secondaryBackground : colors.border)
                  },
                  filters.course && { 
                    backgroundColor: `${colors.primary}30`,
                    borderColor: colors.primary
                  }
                ]}
                onPress={() => setActiveFilter(activeFilter === 'course' ? null : 'course')}
              >
                {filters.course && (
                  <MaterialIcons 
                    name="check" 
                    size={14} 
                    color={colors.primary} 
                    style={styles.filterCheckIcon}
                  />
                )}
                <Text style={[
                  styles.filterChipText, 
                  { 
                    color: filters.course || activeFilter === 'course' ? 
                      colors.primary : 
                      colors.secondaryText 
                  },
                ]}>
                  {filters.course 
                    ? filterOptions?.data?.courses.find(c => c.id === filters.course)?.name || 'Course'
                    : 'Course'
                  }
                </Text>
                <MaterialIcons 
                  name={activeFilter === 'course' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                  size={16} 
                  color={filters.course || activeFilter === 'course' ? colors.primary : colors.secondaryText} 
                />
              </TouchableOpacity>
              
              {/* Filter by Year */}
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: isDark ? 
                      (activeFilter === 'year' ? `${colors.primary}30` : colors.secondaryBackground) : 
                      (activeFilter === 'year' ? `${colors.primary}20` : colors.secondaryBackground),
                    borderColor: activeFilter === 'year' ? colors.primary : 
                      (isDark ? colors.secondaryBackground : colors.border)
                  },
                  filters.year && { 
                    backgroundColor: `${colors.primary}30`,
                    borderColor: colors.primary
                  }
                ]}
                onPress={() => setActiveFilter(activeFilter === 'year' ? null : 'year')}
              >
                {filters.year && (
                  <MaterialIcons 
                    name="check" 
                    size={14} 
                    color={colors.primary} 
                    style={styles.filterCheckIcon}
                  />
                )}
                <Text style={[
                  styles.filterChipText, 
                  { 
                    color: filters.year || activeFilter === 'year' ? 
                      colors.primary : 
                      colors.secondaryText 
                  },
                ]}>
                  {filters.year || 'Year'}
                </Text>
                <MaterialIcons 
                  name={activeFilter === 'year' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                  size={16} 
                  color={filters.year || activeFilter === 'year' ? colors.primary : colors.secondaryText} 
                />
              </TouchableOpacity>
              
              {/* Filter by Type */}
              <TouchableOpacity 
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: isDark ? 
                      (activeFilter === 'type' ? `${colors.primary}30` : colors.secondaryBackground) : 
                      (activeFilter === 'type' ? `${colors.primary}20` : colors.secondaryBackground),
                    borderColor: activeFilter === 'type' ? colors.primary : 
                      (isDark ? colors.secondaryBackground : colors.border)
                  },
                  filters.type && { 
                    backgroundColor: `${colors.primary}30`,
                    borderColor: colors.primary
                  }
                ]}
                onPress={() => setActiveFilter(activeFilter === 'type' ? null : 'type')}
              >
                {filters.type && (
                  <MaterialIcons 
                    name="check" 
                    size={14} 
                    color={colors.primary} 
                    style={styles.filterCheckIcon}
                  />
                )}
                <Text style={[
                  styles.filterChipText, 
                  { 
                    color: filters.type || activeFilter === 'type' ? 
                      colors.primary : 
                      colors.secondaryText 
                  },
                ]}>
                  {filters.type 
                    ? filterOptions?.data?.types.find(t => t.id === filters.type)?.name || 'Type'
                    : 'Type'
                  }
                </Text>
                <MaterialIcons 
                  name={activeFilter === 'type' ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                  size={16} 
                  color={filters.type || activeFilter === 'type' ? colors.primary : colors.secondaryText} 
                />
              </TouchableOpacity>
              
              {/* Clear Filters */}
              {hasActiveFilters && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <TouchableOpacity 
                    style={[
                      styles.clearFilterChip,
                      { 
                        backgroundColor: `${colors.error}30`,
                        borderColor: `${colors.error}50`
                      }
                    ]}
                    onPress={handleClearFilters}
                  >
                    <MaterialIcons 
                      name="close" 
                      size={14} 
                      color={colors.error} 
                      style={styles.filterCheckIcon}
                    />
                    <Text style={[
                      styles.filterChipText, 
                      { color: colors.error, fontWeight: '600' },
                    ]}>
                      Clear All
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </ScrollView>          </View>
          
          {/* Filter Dropdown */}
          {activeFilter && (
            <Animated.View 
              entering={FadeIn.duration(200)} 
              style={[
                styles.filterDropdown,
                { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border,
                  shadowColor: isDark ? '#000' : '#888',
                }
              ]}
              layout={Layout.duration(300)}
            >
              <View style={styles.filterDropdownHeader}>
                <Text style={[styles.filterDropdownTitle, { color: colors.text }]}>
                  Select {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
                </Text>
                <TouchableOpacity onPress={() => setActiveFilter(null)}>
                  <MaterialIcons name="close" size={20} color={colors.secondaryText} />
                </TouchableOpacity>
              </View>
              <ScrollView 
                style={{ maxHeight: 250 }} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.filterDropdownContent}
              >
                {activeFilter === 'institution' && filterOptions?.data?.institutions.map((institution, index) => (
                  <TouchableOpacity
                    key={institution.id}
                    style={[
                      styles.filterOption,
                      { borderBottomColor: isDark ? colors.border : '#F3F4F6' },
                      filters.institution === institution.id && {
                        backgroundColor: isDark ? `${colors.primary}30` : `${colors.primary}15`
                      },
                      index === filterOptions?.data?.institutions.length - 1 && styles.lastFilterOption
                    ]}
                    onPress={() => handleFilterSelect('institution', institution.id)}
                  >
                    <Text 
                      numberOfLines={1} 
                      style={[
                        styles.filterOptionText,
                        { color: filters.institution === institution.id ? colors.primary : colors.text }
                      ]}
                    >
                      {institution.name}
                    </Text>
                    {filters.institution === institution.id && (
                      <MaterialIcons name="check" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
                {activeFilter === 'course' && filterOptions?.data?.courses.map((course, index) => (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.filterOption,
                      { borderBottomColor: isDark ? colors.border : '#F3F4F6' },
                      filters.course === course.id && {
                        backgroundColor: isDark ? `${colors.primary}30` : `${colors.primary}15`
                      },
                      index === filterOptions?.data?.courses.length - 1 && styles.lastFilterOption
                    ]}
                    onPress={() => handleFilterSelect('course', course.id)}
                  >
                    <Text 
                      numberOfLines={1} 
                      style={[
                        styles.filterOptionText,
                        { color: filters.course === course.id ? colors.primary : colors.text }
                      ]}
                    >
                      {course.name}
                    </Text>
                    {filters.course === course.id && (
                      <MaterialIcons name="check" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
                {activeFilter === 'year' && filterOptions?.data?.years.map((year, index) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.filterOption,
                      { borderBottomColor: isDark ? colors.border : '#F3F4F6' },
                      filters.year === year && {
                        backgroundColor: isDark ? `${colors.primary}30` : `${colors.primary}15`
                      },
                      index === filterOptions?.data?.years.length - 1 && styles.lastFilterOption
                    ]}
                    onPress={() => handleFilterSelect('year', year)}
                  >
                    <Text 
                      style={[
                        styles.filterOptionText,
                        { color: filters.year === year ? colors.primary : colors.text }
                      ]}
                    >
                      {year}
                    </Text>
                    {filters.year === year && (
                      <MaterialIcons name="check" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
                {activeFilter === 'type' && filterOptions?.data?.types.map((type, index) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.filterOption,
                      { borderBottomColor: isDark ? colors.border : '#F3F4F6' },
                      filters.type === type.id && {
                        backgroundColor: isDark ? `${colors.primary}30` : `${colors.primary}15`
                      },
                      index === filterOptions?.data?.types.length - 1 && styles.lastFilterOption
                    ]}
                    onPress={() => handleFilterSelect('type', type.id)}
                  >
                    <Text 
                      style={[
                        styles.filterOptionText,
                        { color: filters.type === type.id ? colors.primary : colors.text }
                      ]}
                    >
                      {type.name}
                    </Text>
                    {filters.type === type.id && (
                      <MaterialIcons name="check" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          )}
          
          {/* Results Count */}
          {searchResults?.data && (filters.query || hasActiveFilters) && (
            <View style={styles.resultsCountContainer}>
              <Text style={[styles.resultsCount, { color: colors.secondaryText }]}>
                {formatResultsCount()}
              </Text>
            </View>
          )}
          
          {/* Results Section */}
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
                Searching...
              </Text>
            </View>
          ) : !(filters.query || hasActiveFilters) ? (
            <View style={styles.initialStateContainer}>
              <MaterialIcons name="search" size={64} color={`${colors.primary}80`} />
              <Text style={[styles.initialStateTitle, { color: colors.text }]}>
                Start Searching
              </Text>
              <Text style={[styles.initialStateText, { color: colors.secondaryText }]}>
                Search for courses, past questions, and resources by typing above or using filters
              </Text>
            </View>
          ) : (
            <FlatList
              data={[
                ...(searchResults?.data?.courses || []).map(item => ({ type: 'course', data: item })),
                ...(searchResults?.data?.past_questions || []).map(item => ({ type: 'question', data: item })),
              ]}
              keyExtractor={(item) => `${item.type}-${item.data.id}`}
              contentContainerStyle={styles.resultsList}
              ListEmptyComponent={renderEmptyState}
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={refreshSearch}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.delay(index * 50).duration(300)}
                  layout={Layout.duration(300)}
                >
                  <TouchableOpacity
                    style={[
                      styles.resultCard,
                      { backgroundColor: colors.card, borderColor: colors.border }
                    ]}
                    onPress={() => handleItemPress(item.type, item.data.id)}
                  >
                    <View style={[
                      styles.resultTypeIndicator,
                      { 
                        backgroundColor: item.type === 'course' 
                          ? '#10B98120' 
                          : item.type === 'question' ? '#3B82F620' : '#8B5CF620' 
                      }
                    ]}>
                      <MaterialIcons 
                        name={
                          item.type === 'course' 
                            ? 'school' 
                            : item.type === 'question' ? 'help-outline' : 'article'
                        } 
                        size={20} 
                        color={
                          item.type === 'course' 
                            ? '#10B981' 
                            : item.type === 'question' ? '#3B82F6' : '#8B5CF6'
                        } 
                      />
                    </View>
                    
                    <View style={styles.resultContent}>
                      <Text 
                        style={[styles.resultTitle, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {item.type === 'course' 
                          ? (item.data as Course).name 
                          : (item.data as Question).text_plain || (item.data as Question).text}
                      </Text>
                      
                      <View style={styles.resultMeta}>
                        {item.type === 'course' ? (
                          <>
                            <Text style={[styles.resultMetaText, { color: colors.secondaryText }]}>
                              {(item.data as Course).institution_name}
                            </Text>
                            <View style={styles.metaSeparator} />
                            <Text style={[styles.resultMetaText, { color: colors.secondaryText }]}>
                              {(item.data as Course).code}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text style={[styles.resultMetaText, { color: colors.secondaryText }]}>
                              {(item.data as Question).course_name}
                            </Text>
                            <View style={styles.metaSeparator} />
                            <Text style={[styles.resultMetaText, { color: colors.secondaryText }]}>
                              {(item.data as Question).year}
                            </Text>
                            {(item.data as Question).marks && (
                              <>
                                <View style={styles.metaSeparator} />
                                <Text style={[styles.resultMetaText, { color: colors.secondaryText }]}>
                                  {(item.data as Question).marks} marks
                                </Text>
                              </>
                            )}
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
            />
          )}
        </SafeAreaView>
      </ThemedView>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.xs,
    paddingLeft: SPACING.sm,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
  },
  filtersWrapper: {
    paddingBottom: SPACING.md,
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: SPACING.sm,
    height: 36,
  },
  filterCheckIcon: {
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 14,
    marginRight: 4,
    fontWeight: '500',
  },
  clearFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    marginRight: SPACING.sm,
    borderWidth: 1,
    height: 36,
  },
  filterDropdown: {
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
    overflow: 'hidden',
  },
  filterDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.primary,
  },
  filterDropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterDropdownContent: {
    paddingVertical: SPACING.xs,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    // borderBottomWidth: 1,
  },
  lastFilterOption: {
    borderBottomWidth: 0,
  },
  filterOptionText: {
    fontSize: 15,
    flex: 1,
  },
  resultsCountContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  resultsCount: {
    fontSize: 14,
  },
  resultsList: {
    padding: SPACING.lg,
    paddingTop: 0,
  },  resultCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTypeIndicator: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  resultMetaText: {
    fontSize: 12,
  },
  metaSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    marginHorizontal: SPACING.xs,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  clearFiltersButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  initialStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  initialStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },  initialStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonInner: {
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
})

export default SearchScreen