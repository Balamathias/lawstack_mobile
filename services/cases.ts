import { Case, CaseNote, CaseAttachment, CaseCitation, CaseAnalytics, CaseBulkStatusUpdate } from '@/@types/cases'
import { PaginatedStackResponse, StackResponse } from '@/@types/generics'
import { stackbase } from '@/lib/stackbase'

// List cases with optional params (filter, search, pagination)
export const getCases = async (payload?: { params?: Record<string, string | number | boolean> }): Promise<PaginatedStackResponse<Case[]>> => {
  try {
    const { data } = await stackbase.get('/cases/', { ...payload })
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: [],
      status: error?.response?.status,
      count: 0,
      next: '',
      previous: ''
    }
  }
}

// Get a single case by ID
export const getCase = async (id: string): Promise<StackResponse<Case | null>> => {
  try {
    const { data } = await stackbase.get(`/cases/${id}/`)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: null,
      status: error?.response?.status
    }
  }
}

// Create a new case
export const createCase = async (payload: Partial<Case>): Promise<StackResponse<Case | null>> => {
  try {
    const { data } = await stackbase.post('/cases/', payload)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: null,
      status: error?.response?.status
    }
  }
}

// Update a case
export const updateCase = async (id: string, payload: Partial<Case>): Promise<StackResponse<Case | null>> => {
  try {
    const { data } = await stackbase.put(`/cases/${id}/`, payload)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: null,
      status: error?.response?.status
    }
  }
}

// Delete a case
export const deleteCase = async (id: string): Promise<StackResponse<Case | null>> => {
  try {
    const { data } = await stackbase.delete(`/cases/${id}/`)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: null,
      status: error?.response?.status
    }
  }
}

// AI-powered endpoints
export const analyzeCase = async (id: string): Promise<StackResponse<{ analysis: string }>> => {
  try {
    const { data } = await stackbase.post(`/cases/${id}/analyze/`)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: { analysis: '' },
      status: error?.response?.status
    }
  }
}

export const summarizeCase = async (id: string): Promise<StackResponse<{ summary: string }>> => {
  try {
    const { data } = await stackbase.get(`/cases/${id}/summary/`)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: { summary: '' },
      status: error?.response?.status
    }
  }
}

export const recommendCases = async (payload: { case_id?: string; topic?: string }): Promise<StackResponse<{ recommendations: string }>> => {
  try {
    const { data } = await stackbase.post('/cases/recommend/', payload)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: { recommendations: '' },
      status: error?.response?.status
    }
  }
}

export const getSimilarCases = async (id: string): Promise<StackResponse<{ similar_cases: string }>> => {
  try {
    const { data } = await stackbase.get(`/cases/${id}/similar/`)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: { similar_cases: '' },
      status: error?.response?.status
    }
  }
}

// Versioning/history
export const rollbackCaseVersion = async (id: string): Promise<StackResponse<Case | null>> => {
  try {
    const { data } = await stackbase.post(`/cases/${id}/rollback_version/`)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: null,
      status: error?.response?.status
    }
  }
}

export const getCaseHistory = async (id: string): Promise<StackResponse<Case[]>> => {
  try {
    const { data } = await stackbase.get(`/cases/${id}/history/`)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: [],
      status: error?.response?.status
    }
  }
}

// Notes, attachments, evidence, citations
export const addCaseNote = async (id: string, payload: CaseNote): Promise<StackResponse<{ notes: string }>> => {
  try {
    const { data } = await stackbase.post(`/cases/${id}/add_note/`, payload)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: { notes: '' },
      status: error?.response?.status
    }
  }
}

export const addCaseAttachment = async (id: string, payload: CaseAttachment): Promise<StackResponse<{ attachments: string }>> => {
  try {
    const { data } = await stackbase.post(`/cases/${id}/add_attachment/`, payload)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: { attachments: '' },
      status: error?.response?.status
    }
  }
}

export const addCaseEvidence = async (id: string, payload: CaseAttachment): Promise<StackResponse<{ evidence: string }>> => {
  try {
    const { data } = await stackbase.post(`/cases/${id}/add_evidence/`, payload)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: { evidence: '' },
      status: error?.response?.status
    }
  }
}

export const addCaseCitation = async (id: string, payload: CaseCitation): Promise<StackResponse<{ citations: string }>> => {
  try {
    const { data } = await stackbase.post(`/cases/${id}/add_citation/`, payload)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: { citations: '' },
      status: error?.response?.status
    }
  }
}

export const getCaseAnalytics = async (id: string): Promise<StackResponse<CaseAnalytics>> => {
  try {
    const { data } = await stackbase.get(`/cases/${id}/analytics/`)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: { analytics: '' },
      status: error?.response?.status
    }
  }
}

// Bulk status update
export const bulkUpdateCaseStatus = async (payload: CaseBulkStatusUpdate): Promise<StackResponse<{ updated: number }>> => {
  try {
    const { data } = await stackbase.post('/cases/bulk_update_status/', payload)
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: { updated: 0 },
      status: error?.response?.status
    }
  }
}
