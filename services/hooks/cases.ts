import { useMutation, useQuery } from "@tanstack/react-query"
import {
  getCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
  analyzeCase,
  summarizeCase,
  recommendCases,
  getSimilarCases,
  rollbackCaseVersion,
  getCaseHistory,
  addCaseNote,
  addCaseAttachment,
  addCaseEvidence,
  addCaseCitation,
  getCaseAnalytics,
  bulkUpdateCaseStatus
} from "@/services/cases"
import { QUERY_KEYS } from "./query-keys"
import { Case, CaseNote, CaseAttachment, CaseCitation, CaseBulkStatusUpdate } from "@/@types/cases"

export const useCases = (payload?: { params?: Record<string, string | number | boolean> }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.get_cases, payload],
    queryFn: async () => getCases(payload),
  })
}

export const useCase = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.get_case, id],
    queryFn: async () => getCase(id),
    enabled: !!id,
  })
}

export const useCreateCase = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.create_case],
    mutationFn: (payload: Partial<Case>) => createCase(payload),
  })
}

export const useUpdateCase = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.update_case],
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Case> }) => updateCase(id, payload),
  })
}

export const useDeleteCase = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.delete_case],
    mutationFn: (id: string) => deleteCase(id),
  })
}

export const useAnalyzeCase = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.analyze_case],
    mutationFn: (id: string) => analyzeCase(id),
  })
}

export const useSummarizeCase = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.summarize_case],
    mutationFn: (id: string) => summarizeCase(id),
  })
}

export const useRecommendCases = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.recommend_cases],
    mutationFn: (payload: { case_id?: string; topic?: string }) => recommendCases(payload),
  })
}

export const useSimilarCases = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.similar_cases],
    mutationFn: (id: string) => getSimilarCases(id),
  })
}

export const useRollbackCaseVersion = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.rollback_case_version],
    mutationFn: (id: string) => rollbackCaseVersion(id),
  })
}

export const useCaseHistory = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.case_history, id],
    queryFn: async () => getCaseHistory(id),
    enabled: !!id,
  })
}

export const useAddCaseNote = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.add_case_note],
    mutationFn: ({ id, payload }: { id: string; payload: CaseNote }) => addCaseNote(id, payload),
  })
}

export const useAddCaseAttachment = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.add_case_attachment],
    mutationFn: ({ id, payload }: { id: string; payload: CaseAttachment }) => addCaseAttachment(id, payload),
  })
}

export const useAddCaseEvidence = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.add_case_evidence],
    mutationFn: ({ id, payload }: { id: string; payload: CaseAttachment }) => addCaseEvidence(id, payload),
  })
}

export const useAddCaseCitation = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.add_case_citation],
    mutationFn: ({ id, payload }: { id: string; payload: CaseCitation }) => addCaseCitation(id, payload),
  })
}

export const useCaseAnalytics = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.case_analytics, id],
    queryFn: async () => getCaseAnalytics(id),
    enabled: !!id,
  })
}

export const useBulkUpdateCaseStatus = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.bulk_update_case_status],
    mutationFn: (payload: CaseBulkStatusUpdate) => bulkUpdateCaseStatus(payload),
  })
}
