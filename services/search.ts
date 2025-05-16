import { StackResponse } from '@/@types/generics';
import { Course, Question, SearchResults } from '@/@types/db';
import { getInstitutions, Institution } from './institutions';
import { getCourses } from './courses';
import { stackbase } from '@/lib/stackbase'

// Define proper search parameter types
export interface SearchParams {
  query?: string;
  institution?: string;
  course?: string;
  year?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface SearchResultItem {
  id: string;
  type: 'course' | 'question' | 'resource';
  data: Course | Question | any; // Ideally replace 'any' with a Resource type
}

export interface FilterOptions {
  institutions: Array<{ id: string; name: string }>;
  courses: Array<{ id: string; name: string }>;
  years: string[];
  types: Array<{ id: string; name: string }>;
}

/**
 * Perform an advanced search across multiple content types
 */
export async function searchContent(filters: SearchParams): Promise<StackResponse<SearchResults>> {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Convert any value to string to fix the TypeScript error
        params.append(key, String(value));
    }
    });
    
    const { data } = await stackbase.get(`/search/`, { params });
    return data;
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: {
        past_questions: [],
        courses: [],
        institutions: [],
        count: 0,
        next: null,
        previous: null
      },
      status: error?.response?.status
    };
  }
}

/**
 * Fetch filter options for search form
 */
export async function getSearchFilterOptions(): Promise<StackResponse<FilterOptions>> {
  try {
    // Fetch real data from API endpoints
    const [institutionsResponse, coursesResponse] = await Promise.all([
      getInstitutions(),
      getCourses()
    ]);
    
    const schools = institutionsResponse.data || [];
    const courses = coursesResponse.data || [];
    
    // Generate years from current year back to 2010
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => String(currentYear - i));
    
    // Content types
    const contentTypes = [
      { id: 'course', name: 'Courses' },
      { id: 'question', name: 'Past Questions' },
      { id: 'resource', name: 'Resources' }
    ];
    
    return {
      data: {
        institutions: schools.map((school: Institution) => ({ id: school.id, name: school.name })),
        courses: courses.map((course: Course) => ({ id: course.id, name: course.name })),
        years,
        types: contentTypes,
      },
      message: 'Filter options retrieved successfully',
      error: false,
      status: 200
    };
  } catch (error: any) {
    console.error('Error fetching filter options:', error);
    return {
      message: error?.message || 'Failed to retrieve filter options',
      error: true,
      status: 400,
      data: {
        institutions: [],
        courses: [],
        years: [],
        types: []
      }
    };
  }
}