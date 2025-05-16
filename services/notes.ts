import { Note } from '@/@types/db'
import { PaginatedStackResponse, StackResponse } from '@/@types/generics'
import { stackbase } from '@/lib/stackbase'


interface NotePayload {
    params?: Record<string, string | number | boolean>
}

export const getNotes = async (payload?: NotePayload): Promise<PaginatedStackResponse<Note[]>> => {    
    try {
        const { data } = await stackbase.get('/notes/', { ...payload })
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

export const getNote = async (id: string): Promise<StackResponse<Note | null>> => {
    try {
        const { data } = await stackbase.get(`/notes/${id}/`)
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

export const createNote = async (payload: Partial<Note>): Promise<StackResponse<Note | null>> => {
    try {
        const { data } = await stackbase.post('/notes/', payload)
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

export const deleteNote = async (id: string): Promise<StackResponse<Note | null>> => {
    try {
        const { data } = await stackbase.delete(`/notes/${id}/`)
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