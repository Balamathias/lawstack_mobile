import { StackResponse, PaginatedStackResponse } from '@/@types/generics'
import { stackbase } from '@/lib/stackbase'

// We need to define an Institution type
export interface Institution {
    id: string,
    name: string,
    /** @deprecated: `short_name` would be removed in the future; use `alias` instead */
    short_name: string,
    alias: string,
    type: string,
    country: string,
    state: string,
    city: string,
    address: string,
    website?: string,
    email?: string,
    phone?: string,
    description?: string,
    created_at: string,
    updated_at: string | null,
}

interface InstitutionPayload {
    params?: Record<string, string | number | boolean>
}

export const getInstitutions = async (payload?: InstitutionPayload): Promise<PaginatedStackResponse<Institution[]>> => {
    try {
        const { data } = await stackbase.get('/institutions/', { ...payload })
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

export const getInstitution = async (id: string): Promise<StackResponse<Institution | null>> => {
    try {
        const { data } = await stackbase.get(`/institutions/${id}/`)
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

export const createInstitution = async (payload: Omit<Institution, 'id' | 'created_at' | 'updated_at'>): Promise<StackResponse<Institution | null>> => {
    try {
        const { data } = await stackbase.post('/institutions/', payload)
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

export const updateInstitution = async (id: string, payload: Partial<Institution>): Promise<StackResponse<Institution | null>> => {
    try {
        const { data } = await stackbase.put(`/institutions/${id}/`, payload)
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

export const deleteInstitution = async (id: string): Promise<StackResponse<Institution | null>> => {
    try {
        const { data } = await stackbase.delete(`/institutions/${id}`)
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
