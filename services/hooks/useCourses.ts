import { useState, useEffect } from 'react';
import { useGetCourses, useCourse } from './courses';

type CourseFilters = {
  query?: string;
  level?: string | null;
  page?: number;
  limit?: number;
};

const useCourses = (filters: CourseFilters = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  
  // Default limit per page
  const limit = filters.limit || 10;
  
  // Get courses with the current filters
  const { 
    data: coursesData, 
    isPending: isLoading,
    error,
    refetch
  } = useGetCourses({
    params: {
      page: currentPage,
      limit,
      query: filters.query,
      level: filters.level,
    }
  });
  
  // Update courses when data changes
  useEffect(() => {
    if (coursesData) {
      // Reset all courses if this is page 1 (new search or filter)
      if (currentPage === 1) {
        setAllCourses(coursesData.data || []);
      } else {
        // Append courses for pagination
        setAllCourses(prev => [...prev, ...(coursesData.data || [])]);
      }
      
      // Update total count
      setTotalCount(coursesData.count || 0);
      
      // Check if there are more pages
      const loadedCount = (currentPage * limit);
      setHasNextPage(loadedCount < (coursesData.count || 0));
    }
  }, [coursesData, currentPage, limit]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setAllCourses([]);
  }, [filters.query, filters.level]);
  
  // Function to fetch next page
  const fetchNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  return {
    courses: allCourses,
    isLoading,
    error,
    refetch,
    totalCount,
    currentPage,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage: isLoading && currentPage > 1
  };
};

export default useCourses;
