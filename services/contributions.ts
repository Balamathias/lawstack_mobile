import { Contribution } from '@/@types/db'
import { PaginatedStackResponse, StackResponse } from '@/@types/generics'
import { stackbase } from '@/lib/stackbase'


interface BookmarkPayload {
    params?: Record<string, string | number | boolean>
}

export const getContributions = async (payload?: BookmarkPayload): Promise<PaginatedStackResponse<Contribution[]>> => {    
    try {
        const { data } = await stackbase.get('/contributions/', { ...payload })
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

export const getContribution = async (id: string): Promise<StackResponse<Contribution | null>> => {
    try {
        const { data } = await stackbase.get(`/contributions/${id}/`)
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

export const createContribution = async (payload: Partial<Contribution>): Promise<StackResponse<Contribution | null>> => {
    try {
        const { data } = await stackbase.post('/contributions/', payload)
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

export const updateContribution = async (id: string, payload: Partial<Contribution>): Promise<StackResponse<Contribution | null>> => {
    try {
        const { data } = await stackbase.put(`/contributions/${id}/`, payload)
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

export const deleteContribution = async (id: string): Promise<StackResponse<null>> => {
    try {
        const { data } = await stackbase.delete(`/contributions/${id}/`)
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