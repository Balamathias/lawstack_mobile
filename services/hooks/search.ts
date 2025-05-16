import { useQuery } from '@tanstack/react-query';
import { searchContent, getSearchFilterOptions } from '@/services/search';
import { QUERY_KEYS } from './query-keys';
import { SearchFilters } from '@/@types/db';

/**
 * Hook to fetch search results using React Query
 */
export function useSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH,  filters],
    queryFn: (data) => searchContent(filters),
    enabled: Boolean(filters.query || filters.institution || filters.course || filters.year || filters.type),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch search filter options
 */
export function useSearchFilterOptions() {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_FILTERS],
    queryFn: getSearchFilterOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
} 