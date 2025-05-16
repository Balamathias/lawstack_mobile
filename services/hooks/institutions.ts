import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Institution, createInstitution, deleteInstitution, getInstitution, getInstitutions, updateInstitution } from "@/services/institutions";
import { QUERY_KEYS } from "./query-keys";

// Get all institutions with optional filtering
export const useInstitutions = (payload?: { params?: Record<string, string | number | boolean> }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.get_institutions, payload],
    queryFn: async () => {
      return getInstitutions(payload);
    },
  });
};

// Get a single institution by ID
export const useInstitution = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.get_institution, id],
    queryFn: async () => {
      return getInstitution(id);
    },
    enabled: !!id,
  });
};

// Create a new institution
export const useCreateInstitution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: [QUERY_KEYS.create_institution],
    mutationFn: (payload: Omit<Institution, "id" | "created_at" | "updated_at">) => {
      return createInstitution(payload);
    },
    onSuccess: (data) => {
      if (data?.data) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_institutions] });
      } else {
      }
    },
    onError: (error: any) => {
    },
  });
};

// Update an existing institution
export const useUpdateInstitution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: [QUERY_KEYS.update_institution],
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Institution> }) => {
      return updateInstitution(id, payload);
    },
    onSuccess: (data) => {
      if (data?.data) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_institutions] });
        queryClient.invalidateQueries({ 
          queryKey: [QUERY_KEYS.get_institution, data.data.id] 
        });
      } else {
      }
    },
    onError: (error: any) => {
    },
  });
};

// Delete an institution
export const useDeleteInstitution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: [QUERY_KEYS.delete_institution],
    mutationFn: (id: string) => {
      return deleteInstitution(id);
    },
    onSuccess: (data) => {
      if (data?.status === 204 || data?.data) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_institutions] });
      } else {
      }
    },
    onError: (error: any) => {
    },
  });
};
