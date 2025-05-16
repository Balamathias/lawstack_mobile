// Course hooks
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Course } from "@/@types/db";
import { getCourses, getCourse, createCourse, updateCourse, deleteCourse } from "@/services/courses";
import { QUERY_KEYS } from "./query-keys";

// Get all courses with optional filtering
export const useCourses = (payload?: { params?: Record<string, string | number | boolean> }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.get_courses, payload],
    queryFn: async () => {
      return getCourses(payload);
    },
  });
};

// Get a single course by ID
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.get_course, id],
    queryFn: async () => {
      return getCourse(id);
    },
    enabled: !!id,
  });
};

// Create a new course
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: [QUERY_KEYS.create_course],
    mutationFn: (payload: Partial<Omit<Course, "id" | "created_at" | "updated_at">>) => {
      return createCourse(payload as Course);
    },
    onSuccess: (data) => {
      if (data?.data) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_courses] });
      } else {
      }
    },
    onError: (error: any) => {
    },
  });
};

// Update an existing course
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: [QUERY_KEYS.update_course],
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Course> }) => {
      return updateCourse(id, payload);
    },
    onSuccess: (data) => {
      if (data?.data) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_courses] });
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.get_course, data.data.id] 
        });
      } else {
      }
    },
    onError: (error: any) => {
    },
  });
};

// Delete a course
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: [QUERY_KEYS.delete_course],
    mutationFn: (id: string) => {
      return deleteCourse(id);
    },
    onSuccess: (data) => {
      if (data?.status === 204 || data?.data) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_courses] });
      } else {
      }
    },
    onError: (error: any) => {
    },
  });
};

// Hook for fetching courses with client-side data loading
export const useGetCourses = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      return getCourses({ params });
    }
  });
};
