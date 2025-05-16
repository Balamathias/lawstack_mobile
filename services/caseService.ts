import { stackbase } from '../lib/stackbase';
import { Case, CaseTag, CaseHistory } from '../@types/cases';
import { StackResponse, PaginatedStackResponse } from '../@types/generics';

/**
 * Fetch all cases with optional filtering
 */
export const getCases = async (filters?: {
  status?: string;
  year?: number;
  tags?: string[];
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }
  
  const response = await stackbase.get<PaginatedStackResponse<Case[]>>(`/cases?${params.toString()}`);
  return response.data;
};

/**
 * Fetch a single case by ID
 */
export const getCaseById = async (id: string) => {
  const response = await stackbase.get<StackResponse<Case>>(`/cases/${id}`);
  return response.data;
};

/**
 * Create a new case
 */
export const createCase = async (caseData: Partial<Case>) => {
  const response = await stackbase.post<StackResponse<Case>>('/cases', caseData);
  return response.data;
};

/**
 * Update an existing case
 */
export const updateCase = async (id: string, caseData: Partial<Case>) => {
  const response = await stackbase.patch<StackResponse<Case>>(`/cases/${id}`, caseData);
  return response.data;
};

/**
 * Delete a case
 */
export const deleteCase = async (id: string) => {
  const response = await stackbase.delete<StackResponse<null>>(`/cases/${id}`);
  return response.data;
};

/**
 * Get case history
 */
export const getCaseHistory = async (id: string) => {
  const response = await stackbase.get<StackResponse<CaseHistory[]>>(`/cases/${id}/history`);
  return response.data;
};

/**
 * Fetch all case tags
 */
export const getCaseTags = async () => {
  const response = await stackbase.get<StackResponse<CaseTag[]>>('/case-tags');
  return response.data;
};
